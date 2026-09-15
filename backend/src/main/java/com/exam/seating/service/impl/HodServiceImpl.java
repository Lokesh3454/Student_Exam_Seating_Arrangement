package com.exam.seating.service.impl;

import com.exam.seating.dto.response.*;
import com.exam.seating.entity.*;
import com.exam.seating.repository.*;
import com.exam.seating.service.ExamService;
import com.exam.seating.service.HodService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class HodServiceImpl implements HodService {

    private final StudentRepository studentRepository;
    private final ExamService examService;
    private final SeatingArrangementRepository seatingArrangementRepository;
    private final IncidentRepository incidentRepository;

    @Override
    @Transactional(readOnly = true)
    public HodDashboardDto getDepartmentDashboard(String branch) {
        String b = (branch != null && !branch.trim().isEmpty()) ? branch.trim().toUpperCase() : "CSE";
        log.info("Generating HOD department dashboard for branch: {}", b);

        // 1. Department name
        String deptName = getDepartmentFullName(b);

        // 2. Total Students in branch
        List<Student> branchStudents = studentRepository.findByBranch(b);
        long totalStudents = branchStudents.size();

        // 3. Branch exams
        List<ExamResponseDto> upcomingExams = examService.getExamsByBranch(b);
        long totalExams = upcomingExams.size();

        // 4. Allotted halls & total capacity
        Set<Long> processedHallIds = new HashSet<>();
        List<HodDashboardDto.DepartmentHallMetricDto> hallMetrics = new ArrayList<>();
        int totalAllottedSeats = 0;

        for (ExamResponseDto examDto : upcomingExams) {
            if (examDto.getAllottedHalls() != null) {
                for (HallResponseDto h : examDto.getAllottedHalls()) {
                    if (processedHallIds.add(h.getId())) {
                        int cap = h.getCapacity() != null ? h.getCapacity() : 15;
                        totalAllottedSeats += cap;

                        hallMetrics.add(HodDashboardDto.DepartmentHallMetricDto.builder()
                                .hallId(h.getId())
                                .hallNumber(h.getHallNumber())
                                .building(h.getBuilding())
                                .capacity(cap)
                                .assignedCount(0)
                                .filled(false)
                                .build());
                    }
                }
            }
        }

        // 5. Total Enrolled candidates and seating arrangements across branch exams
        int totalEnrolledStudents = 0;
        int seatingAllocatedCount = 0;
        Map<Long, Integer> hallSeatedCount = new HashMap<>();

        for (ExamResponseDto examDto : upcomingExams) {
            totalEnrolledStudents += (examDto.getRegisteredStudentsCount() != null ? examDto.getRegisteredStudentsCount() : 0);
            List<SeatingArrangement> arrangements = seatingArrangementRepository.findFullArrangementByExamId(examDto.getId());
            seatingAllocatedCount += arrangements.size();
            for (SeatingArrangement sa : arrangements) {
                if (sa.getHall() != null) {
                    hallSeatedCount.merge(sa.getHall().getId(), 1, Integer::sum);
                }
            }
        }

        for (HodDashboardDto.DepartmentHallMetricDto hm : hallMetrics) {
            int seated = hallSeatedCount.getOrDefault(hm.getHallId(), 0);
            hm.setAssignedCount(seated);
            hm.setFilled(seated >= hm.getCapacity());
        }

        // 6. Incidents for this department
        List<MalpracticeIncident> incidents = incidentRepository.findByBranch(b);
        List<IncidentResponseDto> recentIncidents = incidents.stream()
                .limit(5)
                .map(i -> IncidentResponseDto.builder()
                        .id(i.getId())
                        .examId(i.getExam().getId())
                        .examName(i.getExam().getExamName())
                        .studentId(i.getStudent().getId())
                        .studentName(i.getStudent().getName())
                        .studentRegisterNumber(i.getStudent().getRegisterNumber())
                        .studentBranch(i.getStudent().getBranch())
                        .hallId(i.getHall().getId())
                        .hallNumber(i.getHall().getHallNumber())
                        .incidentType(i.getIncidentType())
                        .status(i.getStatus())
                        .description(i.getDescription())
                        .confiscatedItems(i.getConfiscatedItems())
                        .reportedBy(i.getReportedBy())
                        .reportedAt(i.getReportedAt())
                        .actionTaken(i.getActionTaken())
                        .build())
                .collect(Collectors.toList());

        return HodDashboardDto.builder()
                .branch(b)
                .departmentName(deptName)
                .totalStudents(totalStudents)
                .totalExams(totalExams)
                .totalAllottedSeats(totalAllottedSeats)
                .totalEnrolledStudents(totalEnrolledStudents)
                .seatingAllocatedCount(seatingAllocatedCount)
                .incidentsCount(incidents.size())
                .upcomingExams(upcomingExams)
                .allottedHalls(hallMetrics)
                .recentIncidents(recentIncidents)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponseDto> getDepartmentStudents(String branch) {
        String b = (branch != null && !branch.trim().isEmpty()) ? branch.trim().toUpperCase() : "CSE";
        return studentRepository.findByBranch(b).stream()
                .map(s -> StudentResponseDto.builder()
                        .id(s.getId())
                        .registerNumber(s.getRegisterNumber())
                        .name(s.getName())
                        .branch(s.getBranch())
                        .year(s.getYear())
                        .section(s.getSection())
                        .email(s.getEmail())
                        .phone(s.getPhone())
                        .userId(s.getUser() != null ? s.getUser().getId() : null)
                        .createdAt(s.getCreatedAt())
                        .updatedAt(s.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExamResponseDto> getDepartmentExams(String branch) {
        String b = (branch != null && !branch.trim().isEmpty()) ? branch.trim().toUpperCase() : "CSE";
        return examService.getExamsByBranch(b);
    }

    private String getDepartmentFullName(String branch) {
        switch (branch.toUpperCase()) {
            case "CSE": return "Department of Computer Science & Engineering";
            case "ECE": return "Department of Electronics & Communication Engineering";
            case "MECH": return "Department of Mechanical Engineering";
            case "CIVIL": return "Department of Civil Engineering";
            case "IT": return "Department of Information Technology";
            case "EEE": return "Department of Electrical & Electronics Engineering";
            case "AERO": return "Department of Aeronautical Engineering";
            default: return "Department of " + branch;
        }
    }
}
