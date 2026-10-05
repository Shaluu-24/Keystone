
package com.zidio.keystone.service;

import com.zidio.keystone.domain.Customer;
import com.zidio.keystone.domain.ServiceRequest;
import com.zidio.keystone.domain.Site;
import com.zidio.keystone.domain.User;
import com.zidio.keystone.domain.Role;
import com.zidio.keystone.dto.ServiceRequestCreateRequest;
import com.zidio.keystone.repository.CustomerRepository;
import com.zidio.keystone.repository.ServiceRequestRepository;
import com.zidio.keystone.repository.SiteRepository;
import com.zidio.keystone.repository.UserRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class ServiceRequestService {

    private final ServiceRequestRepository serviceRequestRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;
    private final ServiceRequestPhotoService photoService;
    private final NotificationService notificationService;

    public ServiceRequestService(
            ServiceRequestRepository serviceRequestRepository,
            UserRepository userRepository,
            CustomerRepository customerRepository,
            SiteRepository siteRepository,
            ServiceRequestPhotoService photoService,
            NotificationService notificationService
    ) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.siteRepository = siteRepository;
        this.photoService = photoService;
        this.notificationService = notificationService;
    }

    @Transactional
    public ServiceRequest create(
            String email,
            ServiceRequestCreateRequest request
    ) {
        return create(email, request, null);
    }

    @Transactional
    public ServiceRequest create(
            String email,
            ServiceRequestCreateRequest request,
            MultipartFile photo
    ) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found")
                );

        if (user.getCustomer() == null) {
            throw new IllegalArgumentException(
                    "Customer account is not linked to a customer organisation"
            );
        }

        Customer customer = customerRepository.findById(
                user.getCustomer().getId()
        ).orElseThrow(() ->
                new IllegalArgumentException("Customer not found")
        );

        Site site = siteRepository.findById(request.siteId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Site not found")
                );

        if (!site.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalArgumentException(
                    "You cannot create a request for this site"
            );
        }

        String photoUrl = photoService.savePhoto(photo);

        ServiceRequest serviceRequest = ServiceRequest.builder()
                .customer(customer)
                .site(site)
                .serviceType(request.serviceType())
                .description(request.description())
                .priority(request.priority())
                .photoUrl(photoUrl)
                .build();

        ServiceRequest savedRequest =
                serviceRequestRepository.save(serviceRequest);

        /*
         * Notify all managers and dispatchers that a new
         * service request has been submitted.
         */
        List<User> managersAndDispatchers =
                userRepository.findAll()
                        .stream()
                        .filter(u ->
                                u.getRole() == Role.MANAGER
                                        || u.getRole() == Role.DISPATCHER
                        )
                        .toList();

        String notificationTitle = "New Service Request";

        String notificationMessage =
                "New service request from "
                        + customer.getName()
                        + " for "
                        + request.serviceType()
                        + " at "
                        + site.getName()
                        + ".";

        for (User recipient : managersAndDispatchers) {
            notificationService.create(
                    recipient,
                    null,
                    notificationTitle,
                    notificationMessage,
                    "SERVICE_REQUEST_CREATED"
            );
        }

        return savedRequest;
    }

    @Transactional(readOnly = true)
    public Page<ServiceRequest> getMyRequests(
            Long customerId,
            Pageable pageable
    ) {
        return serviceRequestRepository
                .findByCustomerIdOrderByCreatedAtDesc(
                        customerId,
                        pageable
                );
    }

    @Transactional(readOnly = true)
    public Page<ServiceRequest> getAllRequests(
            Pageable pageable
    ) {
        return serviceRequestRepository
                .findAllByOrderByCreatedAtDesc(pageable);
    }
}
