
package com.zidio.keystone.repository;

import com.zidio.keystone.domain.ServiceRequest;
import com.zidio.keystone.domain.ServiceRequestStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRequestRepository
        extends JpaRepository<ServiceRequest, Long> {

    Page<ServiceRequest> findByCustomerIdOrderByCreatedAtDesc(
            Long customerId,
            Pageable pageable
    );

    Page<ServiceRequest> findAllByOrderByCreatedAtDesc(
            Pageable pageable
    );

    Page<ServiceRequest> findByStatusOrderByCreatedAtDesc(
            ServiceRequestStatus status,
            Pageable pageable
    );
}
