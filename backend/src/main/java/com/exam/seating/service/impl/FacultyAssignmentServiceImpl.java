package com.exam.seating.service.impl;

import com.exam.seating.dto.FacultyAssignmentRequest;
import com.exam.seating.dto.FacultyAssignmentResponse;
import com.exam.seating.entity.Exam;
import com.exam.seating.entity.Faculty;
import com.exam.seating.entity.FacultyAssignment;
import com.exam.seating.entity.Hall;
import com.exam.seating.entity.User;
import com.exam.seating.exception.BadRequestException;
import com.exam.seating.exception.DuplicateResourceException;
import com.exam.seating.exception.ResourceNotFoundException;
import com.exam.seating.repository.*;
import com.exam.seating.service.FacultyAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FacultyAssignmentServiceImpl implements FacultyAssignmentService {

    private final FacultyAssignmentRepository assignmentRepository;
    private final FacultyRepository facultyRepository;
    private final ExamRepository examRepository;
    private final HallRepository hallRepository;
    private final UserRepository userRepository;
    private final SeatingArrangementRepository seatingArrangementRepository;

    @Override
    public FacultyAssignmentResponse assignFacultyToHall(FacultyAssignmentRequest request) {
        log.info("Assigning faculty ID {} to exam ID {} in hall ID {}",
                request.getFacultyId(), request.getExamId(), request.getHallId());

        Faculty faculty = facultyRepository.findById(request.getFacultyId())
                .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + request.getFacultyId()));

        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + request.getExamId()));

        Hall hall = hallRepository.findById(request.getHallId())
                .orElseThrow(() -> new ResourceNotFoundException("Hall not found with id: " + request.getHallId()));

        // Check for duplicate duty assignment
        if (assignmentRepository.existsByExamIdAndHallIdAndFacultyId(exam.getId(), hall.getId(), faculty.getId())) {
            throw new DuplicateResourceException("This faculty member is already assigned to this hall for this exam");
        }

        // Check for conflict: faculty already scheduled in another hall for the same exam
        if (assignmentRepository.existsByExamIdAndFacultyIdAndHallIdNot(exam.getId(), faculty.getId(), hall.getId())) {
            throw new BadRequestException("Faculty " + faculty.getName() + " is already assigned to another hall for this exam timetable");
        }

        FacultyAssignment assignment = FacultyAssignment.builder()
                .faculty(faculty)
                .exam(exam)
                .hall(hall)
                .build();

        FacultyAssignment saved = assignmentRepository.save(assignment);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyAssignmentResponse> getAllAssignments(Long examId, Long hallId, Long facultyId) {
        List<FacultyAssignment> list;
        if (examId != null && hallId != null) {
            list = assignmentRepository.findByExamIdAndHallId(examId, hallId);
        } else if (examId != null) {
            list = assignmentRepository.findByExamId(examId);
        } else if (hallId != null) {
            list = assignmentRepository.findByHallId(hallId);
        } else if (facultyId != null) {
            list = assignmentRepository.findByFacultyId(facultyId);
        } else {
            list = assignmentRepository.findAll();
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FacultyAssignmentResponse> getMyAssignedDuties(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        List<FacultyAssignment> assignments = assignmentRepository.findByFaculty_User_Id(user.getId());
        if (assignments.isEmpty()) {
            // Fallback: look up faculty by email or employee ID
            facultyRepository.findByEmail(user.getEmail())
                    .ifPresent(f -> assignments.addAll(assignmentRepository.findByFacultyId(f.getId())));
        }

        return assignments.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public void deleteAssignment(Long id) {
        if (!assignmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Assignment not found with id: " + id);
        }
        assignmentRepository.deleteById(id);
    }

    private FacultyAssignmentResponse mapToResponse(FacultyAssignment fa) {
        int studentCount = (int) seatingArrangementRepository.countByExamIdAndHallId(
                fa.getExam().getId(), fa.getHall().getId());

        return FacultyAssignmentResponse.builder()
                .id(fa.getId())
                .facultyId(fa.getFaculty().getId())
                .facultyName(fa.getFaculty().getName())
                .employeeId(fa.getFaculty().getEmployeeId())
                .facultyEmail(fa.getFaculty().getEmail())
                .facultyPhone(fa.getFaculty().getPhone())
                .examId(fa.getExam().getId())
                .examName(fa.getExam().getExamName())
                .subject(fa.getExam().getSubject())
                .examDate(fa.getExam().getExamDate())
                .startTime(fa.getExam().getStartTime())
                .endTime(fa.getExam().getEndTime())
                .hallId(fa.getHall().getId())
                .hallNumber(fa.getHall().getHallNumber())
                .building(fa.getHall().getBuilding())
                .floor(fa.getHall().getFloor())
                .hallCapacity(fa.getHall().getCapacity())
                .assignedStudentsCount(studentCount)
                .assignedAt(fa.getAssignedAt())
                .build();
    }
}
