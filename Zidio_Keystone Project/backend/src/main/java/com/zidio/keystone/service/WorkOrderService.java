package com.zidio.keystone.service;

import com.zidio.keystone.domain.*;
import com.zidio.keystone.dto.WorkOrderCreateRequest;
import com.zidio.keystone.exception.ApiExceptions.NotFoundException;
import com.zidio.keystone.repository.CustomerRepository;
import com.zidio.keystone.repository.SiteRepository;
import com.zidio.keystone.repository.WorkOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;

@Service
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;

    public WorkOrderService(WorkOrderRepository workOrderRepository,
                             CustomerRepository customerRepository,
                             SiteRepository siteRepository) {
        this.workOrderRepository = workOrderRepository;
        this.customerRepository = customerRepository;
        this.siteRepository = siteRepository;
    }

    private Duration slaWindowFor(Priority priority) {
        return switch (priority) {
            case CRITICAL -> Duration.ofHours(4);
            case HIGH -> Duration.ofHours(24);
            case MEDIUM -> Duration.ofDays(3);
            case LOW -> Duration.ofDays(7);
        };
    }

    @Transactional
    public WorkOrder create(WorkOrderCreateRequest req) {
        Customer customer = customerRepository.findById(req.customerId())
                .orElseThrow(() -> new NotFoundException("Customer not found: " + req.customerId()));
        Site site = siteRepository.findById(req.siteId())
                .orElseThrow(() -> new NotFoundException("Site not found: " + req.siteId()));
        if (!site.getCustomer().getId().equals(customer.getId())) {
            throw new NotFoundException("Site does not belong to the given customer");
        }

        WorkOrder wo = WorkOrder.builder()
                .code("TEMP-" + java.util.UUID.randomUUID())
                .title(req.title())
                .description(req.description())
                .priority(req.priority())
                .status(WorkOrderStatus.NEW)
                .customer(customer)
                .site(site)
                .slaDueAt(Instant.now().plus(slaWindowFor(req.priority())))
                .build();

        wo = workOrderRepository.save(wo);
        wo.setCode("WO-" + String.format("%05d", wo.getId()));
        return workOrderRepository.save(wo);
    }
}