package com.exam.seating.service.impl;

import com.exam.seating.entity.AuditLog;
import com.exam.seating.repository.AuditLogRepository;
import com.exam.seating.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public void log(String username, String userRole, String action, String targetEntity, String details) {
        try {
            AuditLog record = AuditLog.builder()
                    .username(username != null ? username : "SYSTEM")
                    .userRole(userRole)
                    .action(action)
                    .targetEntity(targetEntity)
                    .details(details)
                    .build();
            auditLogRepository.save(record);
            log.info("AUDIT: [{}] {} - {} on {}: {}", userRole, username, action, targetEntity, details);
        } catch (Exception e) {
            log.warn("Failed to persist audit log: {}", e.getMessage());
        }
    }

    @Override
    @Transactional
    public void logCurrentUser(String action, String targetEntity, String details) {
        String username = "SYSTEM";
        String role = "SYSTEM";

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            username = auth.getName();
            role = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.joining(","));
        }

        log(username, role, action, targetEntity, details);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> searchLogs(String query) {
        if (query == null || query.isBlank()) {
            return getAllLogs();
        }
        String q = query.trim();
        List<AuditLog> byAction = auditLogRepository.findByActionContainingIgnoreCaseOrderByTimestampDesc(q);
        if (!byAction.isEmpty()) {
            return byAction;
        }
        return auditLogRepository.findByUsernameContainingIgnoreCaseOrderByTimestampDesc(q);
    }
}
