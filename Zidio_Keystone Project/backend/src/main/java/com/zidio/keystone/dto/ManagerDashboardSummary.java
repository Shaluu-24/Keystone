package com.zidio.keystone.dto;

public record ManagerDashboardSummary(
        long total,
        long newOrders,
        long assigned,
        long inProgress,
        long onHold,
        long completed,
        long closed,
        long cancelled
) {
}