
package com.zidio.keystone.controller;

import com.zidio.keystone.domain.Priority;
import com.zidio.keystone.domain.ServiceRequest;
import com.zidio.keystone.domain.User;
import com.zidio.keystone.dto.ServiceRequestCreateRequest;
import com.zidio.keystone.repository.UserRepository;
import com.zidio.keystone.service.ServiceRequestService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/service-requests")
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;
    private final UserRepository userRepository;

    public ServiceRequestController(
            ServiceRequestService serviceRequestService,
            UserRepository userRepository
    ) {
        this.serviceRequestService = serviceRequestService;
        this.userRepository = userRepository;
    }

    /*
     * CUSTOMER creates a service request using multipart/form-data.
     *
     * Form fields:
     * - siteId
     * - serviceType
     * - description
     * - priority
     * - photo (optional)
     */
    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ServiceRequest createRequest(
            @RequestParam Long siteId,
            @RequestParam String serviceType,
            @RequestParam String description,
            @RequestParam Priority priority,
            @RequestPart(required = false) MultipartFile photo,
            Authentication authentication
    ) {
        ServiceRequestCreateRequest request =
                new ServiceRequestCreateRequest(
                        siteId,
                        serviceType,
                        description,
                        priority
                );

        return serviceRequestService.create(
                authentication.getName(),
                request,
                photo
        );
    }

    /*
     * CUSTOMER can view only their own service requests.
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public Page<ServiceRequest> getMyRequests(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        if (user.getCustomer() == null) {
            throw new IllegalArgumentException(
                    "Customer account is not linked to a customer organisation"
            );
        }

        return serviceRequestService.getMyRequests(
                user.getCustomer().getId(),
                PageRequest.of(page, size)
        );
    }

    /*
     * MANAGER and DISPATCHER can view all service requests.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    public Page<ServiceRequest> getAllRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return serviceRequestService.getAllRequests(
                PageRequest.of(page, size)
        );
    }
}
