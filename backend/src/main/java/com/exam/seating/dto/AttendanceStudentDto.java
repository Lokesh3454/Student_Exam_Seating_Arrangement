package com.exam.seating.dto;

import com.exam.seating.entity.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceStudentDto {

    private Long attendanceId;
    private Long studentId;
    private String registerNumber;
    private String studentName;
    private String branch;
    private Integer year;
    private String section;
    private String seatNumber;
    private Integer rowNumber;
    private Integer columnNumber;
    private AttendanceStatus status;
    private LocalDateTime markedAt;
}
