package com.exam.seating.service;

import com.exam.seating.dto.FacultyAssignmentRequest;
import com.exam.seating.dto.FacultyAssignmentResponse;

import java.util.List;

public interface FacultyAssignmentService {

    FacultyAssignmentResponse assignFacultyToHall(FacultyAssignmentRequest request);

    List<FacultyAssignmentResponse> getAllAssignments(Long examId, Long hallId, Long facultyId);

    List<FacultyAssignmentResponse> getMyAssignedDuties(String username);

    void deleteAssignment(Long id);
}
