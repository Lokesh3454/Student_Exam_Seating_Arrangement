package com.exam.seating.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyAssignmentResponse {

    private Long id;
    private Long facultyId;
    private String facultyName;
    private String employeeId;
    private String facultyEmail;
    private String facultyPhone;

    private Long examId;
    private String examName;
    private String subject;
    private LocalDate examDate;
    private LocalTime startTime;
    private LocalTime endTime;

    private Long hallId;
    private String hallNumber;
    private String building;
    private Integer floor;
    private Integer hallCapacity;
    private Integer assignedStudentsCount;

    private LocalDateTime assignedAt;
}
