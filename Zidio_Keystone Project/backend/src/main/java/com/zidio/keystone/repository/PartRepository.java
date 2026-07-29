package com.zidio.keystone.repository;

import com.zidio.keystone.domain.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import java.util.Optional;

public interface PartRepository extends JpaRepository<Part, Long> {

    // Pessimistic lock so concurrent "use parts" requests can't both read stale stock
    // and both succeed when only one should (stock must never go negative).
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select p from Part p where p.id = :id")
    Optional<Part> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") Long id);
}
