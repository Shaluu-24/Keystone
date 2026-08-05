package com.zidio.keystone.repository;

import com.zidio.keystone.domain.WorkOrder;
import com.zidio.keystone.domain.WorkOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

    @EntityGraph(attributePaths = {
            "customer",
            "site",
            "assignedTo"
    })
    @Query("""
           select w from WorkOrder w
           where (:status is null or w.status = :status)
           and (:customerId is null or w.customer.id = :customerId)
           and (:technicianId is null or w.assignedTo.id = :technicianId)
           """)
    Page<WorkOrder> search(
            @Param("status") WorkOrderStatus status,
            @Param("customerId") Long customerId,
            @Param("technicianId") Long technicianId,
            Pageable pageable
    );


    @EntityGraph(attributePaths = {
            "customer",
            "site",
            "assignedTo"
    })
    @Query("""
           select w from WorkOrder w
           where w.id = :id
           """)
    WorkOrder findByIdWithDetails(
            @Param("id") Long id
    );


    Page<WorkOrder> findByStatus(
            WorkOrderStatus status,
            Pageable pageable
    );


    Page<WorkOrder> findByAssignedToId(
            Long technicianId,
            Pageable pageable
    );


    Page<WorkOrder> findByCustomerId(
            Long customerId,
            Pageable pageable
    );


    long countByStatus(
            WorkOrderStatus status
    );
}