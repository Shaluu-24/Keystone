package com.zidio.keystone.controller;

import com.zidio.keystone.domain.WorkOrderStatus;
import com.zidio.keystone.dto.ManagerDashboardSummary;
import com.zidio.keystone.repository.WorkOrderRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/manager/dashboard")
@PreAuthorize("hasRole('MANAGER')")
public class ManagerDashboardController {

    private final WorkOrderRepository workOrderRepository;

    public ManagerDashboardController(
            WorkOrderRepository workOrderRepository
    ) {
        this.workOrderRepository = workOrderRepository;
    }

    @GetMapping("/summary")
    public ManagerDashboardSummary summary() {

        long newOrders =
                workOrderRepository.countByStatus(WorkOrderStatus.NEW);

        long assigned =
                workOrderRepository.countByStatus(WorkOrderStatus.ASSIGNED);

        long inProgress =
                workOrderRepository.countByStatus(WorkOrderStatus.IN_PROGRESS);

        long onHold =
                workOrderRepository.countByStatus(WorkOrderStatus.ON_HOLD);

        long completed =
                workOrderRepository.countByStatus(WorkOrderStatus.COMPLETED);

        long closed =
                workOrderRepository.countByStatus(WorkOrderStatus.CLOSED);

        long cancelled =
                workOrderRepository.countByStatus(WorkOrderStatus.CANCELLED);

        long total =
                newOrders
                + assigned
                + inProgress
                + onHold
                + completed
                + closed
                + cancelled;

        return new ManagerDashboardSummary(
                total,
                newOrders,
                assigned,
                inProgress,
                onHold,
                completed,
                closed,
                cancelled
        );
    }
}