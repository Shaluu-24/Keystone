package com.zidio.keystone.service;

import com.zidio.keystone.domain.*;
import com.zidio.keystone.exception.ApiExceptions.ForbiddenException;
import com.zidio.keystone.exception.ApiExceptions.NotFoundException;
import com.zidio.keystone.exception.ApiExceptions.ValidationException;
import com.zidio.keystone.repository.PartRepository;
import com.zidio.keystone.repository.PartUsageRepository;
import com.zidio.keystone.repository.TimeLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PartsTimeService {

    private final PartRepository partRepository;
    private final PartUsageRepository partUsageRepository;
    private final TimeLogRepository timeLogRepository;

    public PartsTimeService(PartRepository partRepository,
                             PartUsageRepository partUsageRepository,
                             TimeLogRepository timeLogRepository) {
        this.partRepository = partRepository;
        this.partUsageRepository = partUsageRepository;
        this.timeLogRepository = timeLogRepository;
    }

    /**
     * Logs parts used on a work order and decrements stock in the SAME transaction.
     * Uses a pessimistic row lock on the Part so concurrent requests can't both
     * pass a stale stock check (F6: "stock cannot go negative").
     */
    @Transactional
    public PartUsage logPartUsage(WorkOrder workOrder, Long partId, int qtyUsed, User actor) {
        if (qtyUsed <= 0) {
            throw new ValidationException("Quantity used must be positive");
        }
        assertTechnicianOwnsJobOrIsPrivileged(workOrder, actor);

        Part part = partRepository.findByIdForUpdate(partId)
                .orElseThrow(() -> new NotFoundException("Part not found: " + partId));

        if (part.getStockQty() < qtyUsed) {
            throw new ValidationException("Insufficient stock for part " + part.getSku()
                    + " (have " + part.getStockQty() + ", need " + qtyUsed + ")");
        }

        part.setStockQty(part.getStockQty() - qtyUsed);
        partRepository.save(part);

        PartUsage usage = PartUsage.builder()
                .workOrder(workOrder)
                .part(part)
                .qtyUsed(qtyUsed)
                .build();
        return partUsageRepository.save(usage);
    }

    @Transactional
    public TimeLog logTime(WorkOrder workOrder, int minutes, String note, User actor) {
        if (minutes <= 0) {
            throw new ValidationException("Minutes must be positive");
        }
        assertTechnicianOwnsJobOrIsPrivileged(workOrder, actor);

        TimeLog log = TimeLog.builder()
                .workOrder(workOrder)
                .technician(actor.getRole() == Role.TECHNICIAN ? actor : workOrder.getAssignedTo())
                .minutes(minutes)
                .note(note)
                .build();
        return timeLogRepository.save(log);
    }

    private void assertTechnicianOwnsJobOrIsPrivileged(WorkOrder workOrder, User actor) {
        boolean privileged = actor.getRole() == Role.MANAGER || actor.getRole() == Role.DISPATCHER;
        boolean ownsJob = workOrder.getAssignedTo() != null && workOrder.getAssignedTo().getId().equals(actor.getId());
        if (!privileged && !ownsJob) {
            throw new ForbiddenException("Only the assigned technician (or a manager) can log parts/time on this job");
        }
    }
}
