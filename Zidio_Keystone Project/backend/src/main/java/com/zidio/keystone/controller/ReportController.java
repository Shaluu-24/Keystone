package com.zidio.keystone.controller;

import com.zidio.keystone.domain.WorkOrderStatus;
import com.zidio.keystone.repository.WorkOrderRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.EnumMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final WorkOrderRepository workOrderRepository;

    public ReportController(WorkOrderRepository workOrderRepository) {
        this.workOrderRepository = workOrderRepository;
    }

    public record SummaryResponse(Map<WorkOrderStatus, Long> countsByStatus,
                                   long overdueCount,
                                   long closedCount,
                                   long slaMetCount,
                                   double slaCompliancePct) {}

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public SummaryResponse summary() {
        Map<WorkOrderStatus, Long> counts = new EnumMap<>(WorkOrderStatus.class);
        for (WorkOrderStatus status : WorkOrderStatus.values()) {
            counts.put(status, workOrderRepository.countByStatus(status));
        }

        // "Overdue" = still open (not CLOSED/CANCELLED) and past its SLA due date.
        long overdue = workOrderRepository.findAll().stream()
                .filter(w -> w.getStatus() != WorkOrderStatus.CLOSED && w.getStatus() != WorkOrderStatus.CANCELLED)
                .filter(w -> w.getSlaDueAt() != null && w.getSlaDueAt().isBefore(Instant.now()))
                .count();

        long closed = counts.getOrDefault(WorkOrderStatus.CLOSED, 0L);
        // Of closed work orders, how many were closed before their SLA due date.
        long slaMet = workOrderRepository.findAll().stream()
                .filter(w -> w.getStatus() == WorkOrderStatus.CLOSED)
                .filter(w -> w.getSlaDueAt() != null && w.getUpdatedAt().isBefore(w.getSlaDueAt()))
                .count();

        double pct = closed == 0 ? 100.0 : (slaMet * 100.0 / closed);

        return new SummaryResponse(counts, overdue, closed, slaMet, Math.round(pct * 10.0) / 10.0);
    }
}
