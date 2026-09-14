package com.exam.seating.dto.response;

import com.exam.seating.entity.enums.ExamStatus;
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
public class ExamResponseDto {

    private Long id;
    private String examName;
    private String subject;
    private LocalDate examDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private ExamStatus status;
    private String branch;
    private java.util.List<Long> allottedHallIds;
    private java.util.List<HallResponseDto> allottedHalls;
    private Integer allottedCapacity;
    private Long registeredStudentsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
