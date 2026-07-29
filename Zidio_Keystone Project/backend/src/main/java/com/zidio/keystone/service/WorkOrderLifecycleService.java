package com.zidio.keystone.service;

import com.zidio.keystone.domain.*;
import com.zidio.keystone.exception.ApiExceptions.ForbiddenException;
import com.zidio.keystone.exception.ApiExceptions.IllegalTransitionException;
import com.zidio.keystone.repository.WorkOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Enforces the KEYSTONE work-order lifecycle (brief section 07).
 * Illegal transitions are rejected; every legal transition writes an audit row.
 * This is deliberately the only place transition rules live — controllers must
 * never apply status changes directly to the entity.
 */
@Service
public class WorkOrderLifecycleService {

    private final WorkOrderRepository workOrderRepository;

    public WorkOrderLifecycleService(WorkOrderRepository workOrderRepository) {
        this.workOrderRepository = workOrderRepository;
    }

    // Allowed target states from each source state.
    private static final Map<WorkOrderStatus, Set<WorkOrderStatus>> ALLOWED_TRANSITIONS = new EnumMap<>(WorkOrderStatus.class);
    static {
        ALLOWED_TRANSITIONS.put(WorkOrderStatus.NEW, EnumSet.of(WorkOrderStatus.ASSIGNED, WorkOrderStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(WorkOrderStatus.ASSIGNED, EnumSet.of(WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.CANCELLED));
        ALLOWED_TRANSITIONS.put(WorkOrderStatus.IN_PROGRESS, EnumSet.of(WorkOrderStatus.ON_HOLD, WorkOrderStatus.COMPLETED));
        ALLOWED_TRANSITIONS.put(WorkOrderStatus.ON_HOLD, EnumSet.of(WorkOrderStatus.IN_PROGRESS));
        ALLOWED_TRANSITIONS.put(WorkOrderStatus.COMPLETED, EnumSet.of(WorkOrderStatus.CLOSED, WorkOrderStatus.IN_PROGRESS)); // IN_PROGRESS = reopen
        ALLOWED_TRANSITIONS.put(WorkOrderStatus.CLOSED, EnumSet.noneOf(WorkOrderStatus.class));     // terminal
        ALLOWED_TRANSITIONS.put(WorkOrderStatus.CANCELLED, EnumSet.noneOf(WorkOrderStatus.class));  // terminal
    }

    /**
     * Which roles may perform a given transition. CLOSE is manager-only; everything else
     * that acts on an assigned job is restricted to the assigned technician (checked separately),
     * dispatch-side transitions (assign/cancel) are dispatcher or manager.
     */
    private boolean roleAllowsTransition(Role role, WorkOrderStatus from, WorkOrderStatus to) {
        return switch (to) {
            case CLOSED -> role == Role.MANAGER;
            case CANCELLED -> role == Role.DISPATCHER || role == Role.MANAGER;
            case ASSIGNED -> role == Role.DISPATCHER || role == Role.MANAGER;
            case IN_PROGRESS, ON_HOLD, COMPLETED -> role == Role.TECHNICIAN || role == Role.MANAGER;
            case NEW -> false; // never a valid transition target
        };
    }

    @Transactional
    public WorkOrder transition(WorkOrder workOrder, WorkOrderStatus toStatus, User actor, String note) {
        WorkOrderStatus fromStatus = workOrder.getStatus();

        Set<WorkOrderStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(fromStatus, EnumSet.noneOf(WorkOrderStatus.class));
        if (!allowed.contains(toStatus)) {
            throw new IllegalTransitionException(
                    "Cannot transition work order from " + fromStatus + " to " + toStatus);
        }

        if (!roleAllowsTransition(actor.getRole(), fromStatus, toStatus)) {
            throw new ForbiddenException(actor.getRole() + " is not permitted to move a work order to " + toStatus);
        }

        // A technician may only act on jobs assigned to them.
        boolean technicianActingOnOwnJob = actor.getRole() == Role.TECHNICIAN
                && workOrder.getAssignedTo() != null
                && workOrder.getAssignedTo().getId().equals(actor.getId());
        if (actor.getRole() == Role.TECHNICIAN && !technicianActingOnOwnJob) {
            throw new ForbiddenException("Technicians may only update work orders assigned to them");
        }

        workOrder.setStatus(toStatus);

        WorkOrderStatusHistory historyRow = WorkOrderStatusHistory.builder()
                .workOrder(workOrder)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .changedBy(actor)
                .note(note)
                .build();
        workOrder.getStatusHistory().add(historyRow);

        return workOrderRepository.save(workOrder);
    }

    @Transactional
    public WorkOrder assign(WorkOrder workOrder, User technician, User actor, String note) {
        if (actor.getRole() != Role.DISPATCHER && actor.getRole() != Role.MANAGER) {
            throw new ForbiddenException("Only dispatchers or managers can assign work orders");
        }
        if (technician.getRole() != Role.TECHNICIAN) {
            throw new IllegalTransitionException("Work orders can only be assigned to a technician");
        }
        if (workOrder.getStatus() == WorkOrderStatus.CLOSED || workOrder.getStatus() == WorkOrderStatus.CANCELLED) {
            throw new IllegalTransitionException("Cannot assign a closed or cancelled work order");
        }

        boolean isReassignment = workOrder.getAssignedTo() != null;
        workOrder.setAssignedTo(technician);

        // First assignment also drives NEW -> ASSIGNED through the normal transition path.
        if (workOrder.getStatus() == WorkOrderStatus.NEW) {
            return transition(workOrder, WorkOrderStatus.ASSIGNED, actor, note);
        }

        // Reassignment while already open: keep current status, just record the change.
        WorkOrderStatusHistory historyRow = WorkOrderStatusHistory.builder()
                .workOrder(workOrder)
                .fromStatus(workOrder.getStatus())
                .toStatus(workOrder.getStatus())
                .changedBy(actor)
                .note((note == null ? "" : note + " ") + "Reassigned to " + technician.getName())
                .build();
        workOrder.getStatusHistory().add(historyRow);

        return workOrderRepository.save(workOrder);
    }
}
