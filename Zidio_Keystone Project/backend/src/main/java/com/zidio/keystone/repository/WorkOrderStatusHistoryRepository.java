package com.zidio.keystone.repository;

import com.zidio.keystone.domain.WorkOrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkOrderStatusHistoryRepository extends JpaRepository<WorkOrderStatusHistory, Long> {
}
