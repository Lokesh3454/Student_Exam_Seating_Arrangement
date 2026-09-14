package com.exam.seating.repository;

import com.exam.seating.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findAllByOrderByTimestampDesc();

    List<AuditLog> findByActionContainingIgnoreCaseOrderByTimestampDesc(String action);

    List<AuditLog> findByUsernameContainingIgnoreCaseOrderByTimestampDesc(String username);
}
