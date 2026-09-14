package com.exam.seating.controller;

import com.exam.seating.dto.response.ApiResponse;
import com.exam.seating.dto.response.ExamResponseDto;
import com.exam.seating.dto.response.HodDashboardDto;
import com.exam.seating.dto.response.StudentResponseDto;
import com.exam.seating.entity.User;
import com.exam.seating.repository.UserRepository;
import com.exam.seating.service.HodService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hod")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class HodController {

    private final HodService hodService;
    private final UserRepository userRepository;

    private String resolveDepartment(Authentication authentication, String branchParam) {
        if (authentication == null) {
            return branchParam != null && !branchParam.isBlank() ? branchParam.toUpperCase() : "CSE";
        }

        boolean isHod = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_HOD") || a.equals("HOD"));

        if (isHod) {
            String dept = userRepository.findByUsername(authentication.getName())
                    .map(User::getDepartment)
                    .orElse(null);
            if (dept != null && !dept.isBlank()) {
                return dept.toUpperCase();
            }
        }

        // Admin or fallback
        if (branchParam != null && !branchParam.isBlank()) {
            return branchParam.toUpperCase();
        }
        return "CSE";
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<HodDashboardDto>> getDashboard(
            @RequestParam(value = "branch", required = false) String branch,
            Authentication authentication) {
        String dept = resolveDepartment(authentication, branch);
        log.info("Fetching HOD dashboard for branch: {} (requested by {})", dept, authentication != null ? authentication.getName() : "anonymous");
        HodDashboardDto dashboard = hodService.getDepartmentDashboard(dept);
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<StudentResponseDto>>> getStudents(
            @RequestParam(value = "branch", required = false) String branch,
            Authentication authentication) {
        String dept = resolveDepartment(authentication, branch);
        log.info("Fetching HOD students for branch: {}", dept);
        List<StudentResponseDto> students = hodService.getDepartmentStudents(dept);
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    @GetMapping("/exams")
    public ResponseEntity<ApiResponse<List<ExamResponseDto>>> getExams(
            @RequestParam(value = "branch", required = false) String branch,
            Authentication authentication) {
        String dept = resolveDepartment(authentication, branch);
        log.info("Fetching HOD exams for branch: {}", dept);
        List<ExamResponseDto> exams = hodService.getDepartmentExams(dept);
        return ResponseEntity.ok(ApiResponse.success(exams));
    }
}
