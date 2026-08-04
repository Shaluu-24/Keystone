package com.zidio.keystone.dto;

import com.zidio.keystone.domain.*;

import java.time.Instant;
import java.util.List;

public record WorkOrderResponse(
        Long id,
        String code,
        String title,
        String description,
        Priority priority,
        WorkOrderStatus status,
        Instant slaDueAt,
        Long customerId,
        String customerName,
        Long siteId,
        String siteName,
        Long assignedToId,
        String assignedToName,
        Instant createdAt,
        Instant updatedAt,
        List<HistoryEntry> statusHistory
) {

    public record HistoryEntry(
            WorkOrderStatus fromStatus,
            WorkOrderStatus toStatus,
            String changedBy,
            Instant changedAt,
            String note
    ) {}

    public static WorkOrderResponse from(WorkOrder w) {

        List<HistoryEntry> history =
                w.getStatusHistory() == null
                        ? List.of()
                        : w.getStatusHistory()
                        .stream()
                        .map(h -> new HistoryEntry(
                                h.getFromStatus(),
                                h.getToStatus(),
                                h.getChangedBy() != null
                                        ? h.getChangedBy().getName()
                                        : "SYSTEM",
                                h.getChangedAt(),
                                h.getNote()
                        ))
                        .toList();


        return new WorkOrderResponse(
                w.getId(),
                w.getCode(),
                w.getTitle(),
                w.getDescription(),
                w.getPriority(),
                w.getStatus(),

                w.getSlaDueAt(),

                w.getCustomer().getId(),
                w.getCustomer().getName(),

                w.getSite().getId(),
                w.getSite().getName(),

                w.getAssignedTo() != null
                        ? w.getAssignedTo().getId()
                        : null,

                w.getAssignedTo() != null
                        ? w.getAssignedTo().getName()
                        : null,

                w.getCreatedAt(),
                w.getUpdatedAt(),

                history
        );
    }
}