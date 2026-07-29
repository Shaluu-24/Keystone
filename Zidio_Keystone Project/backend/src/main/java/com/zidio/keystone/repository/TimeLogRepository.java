package com.zidio.keystone.repository;

import com.zidio.keystone.domain.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {
}
