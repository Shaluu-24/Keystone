package com.zidio.keystone.controller;

import com.zidio.keystone.domain.*;
import com.zidio.keystone.dto.*;
import com.zidio.keystone.exception.ApiExceptions.ForbiddenException;
import com.zidio.keystone.exception.ApiExceptions.NotFoundException;
import com.zidio.keystone.repository.UserRepository;
import com.zidio.keystone.repository.WorkOrderRepository;
import com.zidio.keystone.security.UserPrincipal;
import com.zidio.keystone.service.PartsTimeService;
import com.zidio.keystone.service.WorkOrderLifecycleService;
import com.zidio.keystone.service.WorkOrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/work-orders")
public class WorkOrderController {

    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderService workOrderService;
    private final WorkOrderLifecycleService lifecycleService;
    private final PartsTimeService partsTimeService;
    private final UserRepository userRepository;

    public WorkOrderController(
            WorkOrderRepository workOrderRepository,
            WorkOrderService workOrderService,
            WorkOrderLifecycleService lifecycleService,
            PartsTimeService partsTimeService,
            UserRepository userRepository
    ) {
        this.workOrderRepository = workOrderRepository;
        this.workOrderService = workOrderService;
        this.lifecycleService = lifecycleService;
        this.partsTimeService = partsTimeService;
        this.userRepository = userRepository;
    }


    @GetMapping
    public Page<WorkOrderResponse> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) WorkOrderStatus status,
            @RequestParam(required = false) Long technicianId,
            Pageable pageable
    ) {

        User actor = principal.getUser();

        Page<WorkOrder> page = switch (actor.getRole()) {

            case CUSTOMER ->
                    workOrderRepository.search(
                            status,
                            actor.getCustomer().getId(),
                            null,
                            pageable
                    );

            case TECHNICIAN ->
                    workOrderRepository.search(
                            status,
                            null,
                            actor.getId(),
                            pageable
                    );

            case DISPATCHER, MANAGER ->
                    workOrderRepository.search(
                            status,
                            null,
                            technicianId,
                            pageable
                    );
        };

        return page.map(WorkOrderResponse::from);
    }


    @GetMapping("/{id}")
    public WorkOrderResponse get(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {

        WorkOrder wo = fetchAndAuthorizeRead(
                principal.getUser(),
                id
        );

        wo.getStatusHistory().size();

        return WorkOrderResponse.from(wo);
    }


    @PostMapping
    @PreAuthorize("hasAnyRole('DISPATCHER','MANAGER')")
    public ResponseEntity<WorkOrderResponse> create(
            @Valid @RequestBody WorkOrderCreateRequest request
    ) {

        WorkOrder wo = workOrderService.create(request);

        return ResponseEntity.ok(
                WorkOrderResponse.from(wo)
        );
    }


    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('DISPATCHER','MANAGER')")
    public WorkOrderResponse assign(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody AssignRequest request
    ) {

        WorkOrder wo = findOrThrow(id);


        User technician = userRepository.findById(
                request.technicianId()
        ).orElseThrow(() ->
                new NotFoundException(
                        "Technician not found: " + request.technicianId()
                )
        );


        WorkOrder updated = lifecycleService.assign(
                wo,
                technician,
                principal.getUser(),
                request.note()
        );


        // Fix Hibernate LazyInitializationException
        updated.getStatusHistory().size();


        return WorkOrderResponse.from(updated);
    }



    @PostMapping("/{id}/status")
    public WorkOrderResponse changeStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody StatusChangeRequest request
    ) {

        WorkOrder wo = findOrThrow(id);


        WorkOrder updated =
                lifecycleService.transition(
                        wo,
                        request.toStatus(),
                        principal.getUser(),
                        request.note()
                );


        updated.getStatusHistory().size();


        return WorkOrderResponse.from(updated);
    }



    @PostMapping("/{id}/parts")
    public ResponseEntity<Void> logParts(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody PartUsageRequest request
    ) {

        WorkOrder wo = findOrThrow(id);

        partsTimeService.logPartUsage(
                wo,
                request.partId(),
                request.qtyUsed(),
                principal.getUser()
        );

        return ResponseEntity.ok().build();
    }



    @PostMapping("/{id}/time")
    public ResponseEntity<Void> logTime(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody TimeLogRequest request
    ) {

        WorkOrder wo = findOrThrow(id);

        partsTimeService.logTime(
                wo,
                request.minutes(),
                request.note(),
                principal.getUser()
        );

        return ResponseEntity.ok().build();
    }



    private WorkOrder findOrThrow(Long id) {

        return workOrderRepository.findById(id)
                .orElseThrow(() ->
                        new NotFoundException(
                                "Work order not found: " + id
                        )
                );
    }



    private WorkOrder fetchAndAuthorizeRead(
            User actor,
            Long id
    ) {

        WorkOrder wo = findOrThrow(id);


        boolean allowed = switch(actor.getRole()) {

            case MANAGER, DISPATCHER ->
                    true;


            case CUSTOMER ->
                    wo.getCustomer()
                            .getId()
                            .equals(actor.getCustomer().getId());


            case TECHNICIAN ->
                    wo.getAssignedTo() != null
                    &&
                    wo.getAssignedTo()
                            .getId()
                            .equals(actor.getId());
        };


        if(!allowed){
            throw new ForbiddenException(
                    "You do not have access to this work order"
            );
        }


        return wo;
    }
}