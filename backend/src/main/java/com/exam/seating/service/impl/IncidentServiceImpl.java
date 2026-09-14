package com.exam.seating.service.impl;

import com.exam.seating.dto.request.IncidentRequestDto;
import com.exam.seating.dto.response.IncidentResponseDto;
import com.exam.seating.entity.Exam;
import com.exam.seating.entity.Hall;
import com.exam.seating.entity.MalpracticeIncident;
import com.exam.seating.entity.Student;
import com.exam.seating.entity.enums.IncidentStatus;
import com.exam.seating.exception.ResourceNotFoundException;
import com.exam.seating.repository.ExamRepository;
import com.exam.seating.repository.HallRepository;
import com.exam.seating.repository.IncidentRepository;
import com.exam.seating.repository.StudentRepository;
import com.exam.seating.service.AuditLogService;
import com.exam.seating.service.IncidentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class IncidentServiceImpl implements IncidentService {

    private final IncidentRepository incidentRepository;
    private final ExamRepository examRepository;
    private final HallRepository hallRepository;
    private final StudentRepository studentRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public IncidentResponseDto reportIncident(IncidentRequestDto requestDto, String reportedBy) {
        Exam exam = examRepository.findById(requestDto.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", requestDto.getExamId()));
        Hall hall = hallRepository.findById(requestDto.getHallId())
                .orElseThrow(() -> new ResourceNotFoundException("Hall", "id", requestDto.getHallId()));
        Student student = studentRepository.findById(requestDto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", requestDto.getStudentId()));

        MalpracticeIncident incident = MalpracticeIncident.builder()
                .exam(exam)
                .hall(hall)
                .student(student)
                .reportedBy(reportedBy != null ? reportedBy : "FACULTY")
                .incidentType(requestDto.getIncidentType())
                .description(requestDto.getDescription())
                .confiscatedItems(requestDto.getConfiscatedItems())
                .actionTaken(requestDto.getActionTaken())
                .status(IncidentStatus.REPORTED)
                .build();

        MalpracticeIncident saved = incidentRepository.save(incident);

        auditLogService.logCurrentUser(
                "REPORT_INCIDENT",
                "MalpracticeIncident #" + saved.getId(),
                "Candidate " + student.getRegisterNumber() + " flagged for " + requestDto.getIncidentType() + " in Hall " + hall.getHallNumber()
        );

        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentResponseDto> getAllIncidents() {
        return incidentRepository.findAllWithDetails().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentResponseDto> getIncidentsByExam(Long examId) {
        return incidentRepository.findByExamId(examId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<IncidentResponseDto> getIncidentsByStudent(Long studentId) {
        return incidentRepository.findByStudentId(studentId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public IncidentResponseDto updateIncidentStatus(Long id, IncidentStatus status, String actionTaken) {
        MalpracticeIncident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MalpracticeIncident", "id", id));

        incident.setStatus(status);
        if (actionTaken != null && !actionTaken.isBlank()) {
            incident.setActionTaken(actionTaken);
        }

        MalpracticeIncident updated = incidentRepository.save(incident);

        auditLogService.logCurrentUser(
                "UPDATE_INCIDENT_STATUS",
                "MalpracticeIncident #" + id,
                "Status changed to " + status + (actionTaken != null ? ". Action: " + actionTaken : "")
        );

        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void deleteIncident(Long id) {
        MalpracticeIncident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MalpracticeIncident", "id", id));
        incidentRepository.delete(incident);

        auditLogService.logCurrentUser(
                "DELETE_INCIDENT",
                "MalpracticeIncident #" + id,
                "Incident deleted"
        );
    }

    private IncidentResponseDto mapToDto(MalpracticeIncident i) {
        return IncidentResponseDto.builder()
                .id(i.getId())
                .examId(i.getExam().getId())
                .examName(i.getExam().getExamName())
                .hallId(i.getHall().getId())
                .hallNumber(i.getHall().getHallNumber())
                .studentId(i.getStudent().getId())
                .studentName(i.getStudent().getName())
                .studentRegisterNumber(i.getStudent().getRegisterNumber())
                .studentBranch(i.getStudent().getBranch())
                .reportedBy(i.getReportedBy())
                .incidentType(i.getIncidentType())
                .description(i.getDescription())
                .confiscatedItems(i.getConfiscatedItems())
                .actionTaken(i.getActionTaken())
                .status(i.getStatus())
                .reportedAt(i.getReportedAt())
                .build();
    }
}
