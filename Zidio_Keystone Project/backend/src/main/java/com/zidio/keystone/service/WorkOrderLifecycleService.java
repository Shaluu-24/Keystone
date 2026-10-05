
package com.zidio.keystone.service;

import com.zidio.keystone.domain.*;
import com.zidio.keystone.exception.ApiExceptions.ForbiddenException;
import com.zidio.keystone.exception.ApiExceptions.IllegalTransitionException;
import com.zidio.keystone.repository.UserRepository;
import com.zidio.keystone.repository.WorkOrderRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class WorkOrderLifecycleService {

    private final WorkOrderRepository workOrderRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public WorkOrderLifecycleService(
            WorkOrderRepository workOrderRepository,
            NotificationService notificationService,
            UserRepository userRepository) {

        this.workOrderRepository = workOrderRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    private static final Map<WorkOrderStatus, Set<WorkOrderStatus>> ALLOWED_TRANSITIONS =
            new EnumMap<>(WorkOrderStatus.class);

    static {
        ALLOWED_TRANSITIONS.put(
                WorkOrderStatus.NEW,
                EnumSet.of(
                        WorkOrderStatus.ASSIGNED,
                        WorkOrderStatus.CANCELLED
                )
        );

        ALLOWED_TRANSITIONS.put(
                WorkOrderStatus.ASSIGNED,
                EnumSet.of(
                        WorkOrderStatus.IN_PROGRESS,
                        WorkOrderStatus.CANCELLED
                )
        );

        ALLOWED_TRANSITIONS.put(
                WorkOrderStatus.IN_PROGRESS,
                EnumSet.of(
                        WorkOrderStatus.ON_HOLD,
                        WorkOrderStatus.COMPLETED
                )
        );

        ALLOWED_TRANSITIONS.put(
                WorkOrderStatus.ON_HOLD,
                EnumSet.of(
                        WorkOrderStatus.IN_PROGRESS
                )
        );

        ALLOWED_TRANSITIONS.put(
                WorkOrderStatus.COMPLETED,
                EnumSet.of(
                        WorkOrderStatus.CLOSED,
                        WorkOrderStatus.IN_PROGRESS
                )
        );

        ALLOWED_TRANSITIONS.put(
                WorkOrderStatus.CLOSED,
                EnumSet.noneOf(WorkOrderStatus.class)
        );

        ALLOWED_TRANSITIONS.put(
                WorkOrderStatus.CANCELLED,
                EnumSet.noneOf(WorkOrderStatus.class)
        );
    }

    private boolean roleAllowsTransition(
            Role role,
            WorkOrderStatus from,
            WorkOrderStatus to) {

        return switch (to) {
            case CLOSED -> role == Role.MANAGER;

            case CANCELLED ->
                    role == Role.DISPATCHER || role == Role.MANAGER;

            case ASSIGNED ->
                    role == Role.DISPATCHER || role == Role.MANAGER;

            case IN_PROGRESS, ON_HOLD, COMPLETED ->
                    role == Role.TECHNICIAN || role == Role.MANAGER;

            case NEW -> false;
        };
    }

    @Transactional
    public WorkOrder transition(
            WorkOrder workOrder,
            WorkOrderStatus toStatus,
            User actor,
            String note) {

        WorkOrderStatus fromStatus = workOrder.getStatus();

        Set<WorkOrderStatus> allowed =
                ALLOWED_TRANSITIONS.getOrDefault(
                        fromStatus,
                        EnumSet.noneOf(WorkOrderStatus.class)
                );

        if (!allowed.contains(toStatus)) {
            throw new IllegalTransitionException(
                    "Cannot transition work order from "
                            + fromStatus
                            + " to "
                            + toStatus
            );
        }

        if (!roleAllowsTransition(
                actor.getRole(),
                fromStatus,
                toStatus)) {

            throw new ForbiddenException(
                    actor.getRole()
                            + " is not permitted to move a work order to "
                            + toStatus
            );
        }

        boolean technicianActingOnOwnJob =
                actor.getRole() == Role.TECHNICIAN
                        && workOrder.getAssignedTo() != null
                        && workOrder.getAssignedTo()
                                .getId()
                                .equals(actor.getId());

        if (actor.getRole() == Role.TECHNICIAN
                && !technicianActingOnOwnJob) {

            throw new ForbiddenException(
                    "Technicians may only update work orders assigned to them"
            );
        }

        workOrder.setStatus(toStatus);

        /*
         * Notify all relevant users about the status change.
         */
        notifyStatusChange(
                workOrder,
                fromStatus,
                toStatus
        );

        WorkOrderStatusHistory historyRow =
                WorkOrderStatusHistory.builder()
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
    public WorkOrder assign(
            WorkOrder workOrder,
            User technician,
            User actor,
            String note) {

        if (actor.getRole() != Role.DISPATCHER
                && actor.getRole() != Role.MANAGER) {

            throw new ForbiddenException(
                    "Only dispatchers or managers can assign work orders"
            );
        }

        if (technician.getRole() != Role.TECHNICIAN) {
            throw new IllegalTransitionException(
                    "Work orders can only be assigned to a technician"
            );
        }

        if (workOrder.getStatus() == WorkOrderStatus.CLOSED
                || workOrder.getStatus() == WorkOrderStatus.CANCELLED) {

            throw new IllegalTransitionException(
                    "Cannot assign a closed or cancelled work order"
            );
        }

        boolean isReassignment =
                workOrder.getAssignedTo() != null;

        workOrder.setAssignedTo(technician);

        /*
         * Notify the selected technician.
         */
        notificationService.create(
                technician,
                workOrder,
                isReassignment
                        ? "Work Order Reassigned"
                        : "Work Order Assigned",
                workOrder.getCode()
                        + " has been "
                        + (isReassignment
                                ? "reassigned"
                                : "assigned")
                        + " to you.",
                isReassignment
                        ? "WORK_ORDER_REASSIGNED"
                        : "WORK_ORDER_ASSIGNED"
        );

        /*
         * Notify managers and dispatchers about the assignment.
         */
        List<User> managers =
                userRepository.findByRole(Role.MANAGER);

        List<User> dispatchers =
                userRepository.findByRole(Role.DISPATCHER);

        List<User> internalUsers = new ArrayList<>();

        internalUsers.addAll(managers);
        internalUsers.addAll(dispatchers);

        if (!internalUsers.isEmpty()) {
            notificationService.createForUsers(
                    internalUsers,
                    workOrder,
                    isReassignment
                            ? "Work Order Reassigned"
                            : "Work Order Assigned",
                    workOrder.getCode()
                            + " has been "
                            + (isReassignment
                                    ? "reassigned"
                                    : "assigned")
                            + " to "
                            + technician.getName()
                            + ".",
                    isReassignment
                            ? "WORK_ORDER_REASSIGNED"
                            : "WORK_ORDER_ASSIGNED"
            );
        }

        /*
         * Notify the customer about technician assignment.
         */
        notifyCustomer(
                workOrder,
                isReassignment
                        ? "Technician Reassigned"
                        : "Technician Assigned",
                workOrder.getCode()
                        + " has been assigned to technician "
                        + technician.getName()
                        + ".",
                isReassignment
                        ? "TECHNICIAN_REASSIGNED"
                        : "TECHNICIAN_ASSIGNED"
        );

        /*
         * First assignment drives NEW -> ASSIGNED.
         *
         * We intentionally skip the duplicate technician notification
         * that the transition method would otherwise create by using
         * a dedicated internal transition path.
         */
        if (workOrder.getStatus() == WorkOrderStatus.NEW) {

            WorkOrderStatus fromStatus = workOrder.getStatus();

            workOrder.setStatus(WorkOrderStatus.ASSIGNED);

            WorkOrderStatusHistory historyRow =
                    WorkOrderStatusHistory.builder()
                            .workOrder(workOrder)
                            .fromStatus(fromStatus)
                            .toStatus(WorkOrderStatus.ASSIGNED)
                            .changedBy(actor)
                            .note(note)
                            .build();

            workOrder.getStatusHistory().add(historyRow);

            notifyStatusChangeExceptTechnician(
                    workOrder,
                    fromStatus,
                    WorkOrderStatus.ASSIGNED
            );

            return workOrderRepository.save(workOrder);
        }

        /*
         * Reassignment while already open:
         * keep current status and record the assignment change.
         */
        WorkOrderStatusHistory historyRow =
                WorkOrderStatusHistory.builder()
                        .workOrder(workOrder)
                        .fromStatus(workOrder.getStatus())
                        .toStatus(workOrder.getStatus())
                        .changedBy(actor)
                        .note(
                                (note == null ? "" : note + " ")
                                        + "Reassigned to "
                                        + technician.getName()
                        )
                        .build();

        workOrder.getStatusHistory().add(historyRow);

        return workOrderRepository.save(workOrder);
    }

    private void notifyStatusChange(
            WorkOrder workOrder,
            WorkOrderStatus fromStatus,
            WorkOrderStatus toStatus) {

        String title = "Work Order Status Updated";

        String message =
                workOrder.getCode()
                        + " status changed from "
                        + fromStatus
                        + " to "
                        + toStatus
                        + ".";

        /*
         * Technician
         */
        if (workOrder.getAssignedTo() != null) {

            notificationService.create(
                    workOrder.getAssignedTo(),
                    workOrder,
                    title,
                    message,
                    "WORK_ORDER_STATUS_UPDATED"
            );
        }

        /*
         * Managers
         */
        List<User> managers =
                userRepository.findByRole(Role.MANAGER);

        if (!managers.isEmpty()) {
            notificationService.createForUsers(
                    managers,
                    workOrder,
                    title,
                    message,
                    "WORK_ORDER_STATUS_UPDATED"
            );
        }

        /*
         * Dispatchers
         */
        List<User> dispatchers =
                userRepository.findByRole(Role.DISPATCHER);

        if (!dispatchers.isEmpty()) {
            notificationService.createForUsers(
                    dispatchers,
                    workOrder,
                    title,
                    message,
                    "WORK_ORDER_STATUS_UPDATED"
            );
        }

        /*
         * Customer
         */
        notifyCustomer(
                workOrder,
                title,
                message,
                "WORK_ORDER_STATUS_UPDATED"
        );
    }

    private void notifyStatusChangeExceptTechnician(
            WorkOrder workOrder,
            WorkOrderStatus fromStatus,
            WorkOrderStatus toStatus) {

        String title = "Work Order Status Updated";

        String message =
                workOrder.getCode()
                        + " status changed from "
                        + fromStatus
                        + " to "
                        + toStatus
                        + ".";

        /*
         * Managers
         */
        List<User> managers =
                userRepository.findByRole(Role.MANAGER);

        if (!managers.isEmpty()) {
            notificationService.createForUsers(
                    managers,
                    workOrder,
                    title,
                    message,
                    "WORK_ORDER_STATUS_UPDATED"
            );
        }

        /*
         * Dispatchers
         */
        List<User> dispatchers =
                userRepository.findByRole(Role.DISPATCHER);

        if (!dispatchers.isEmpty()) {
            notificationService.createForUsers(
                    dispatchers,
                    workOrder,
                    title,
                    message,
                    "WORK_ORDER_STATUS_UPDATED"
            );
        }

        /*
         * Customer
         */
        notifyCustomer(
                workOrder,
                title,
                message,
                "WORK_ORDER_STATUS_UPDATED"
        );
    }

    private void notifyCustomer(
            WorkOrder workOrder,
            String title,
            String message,
            String type) {

        if (workOrder.getCustomer() == null) {
            return;
        }

        List<User> customerUsers =
                userRepository.findByCustomerId(
                        workOrder.getCustomer().getId()
                );

        if (!customerUsers.isEmpty()) {
            notificationService.createForUsers(
                    customerUsers,
                    workOrder,
                    title,
                    message,
                    type
            );
        }
    }
}