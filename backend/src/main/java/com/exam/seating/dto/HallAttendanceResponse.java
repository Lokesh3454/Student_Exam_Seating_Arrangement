package com.exam.seating.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HallAttendanceResponse {

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
    private Integer capacity;

    private int totalStudents;
    private int presentCount;
    private int absentCount;
    private double attendancePercentage;

    private List<AttendanceStudentDto> students;
}
