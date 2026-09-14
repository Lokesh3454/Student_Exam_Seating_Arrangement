package com.exam.seating.dto.request;

import com.exam.seating.entity.enums.ExamStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamRequestDto {

    @NotBlank(message = "Exam name is required")
    @Size(min = 3, max = 100, message = "Exam name must be between 3 and 100 characters")
    private String examName;

    @NotBlank(message = "Subject is required")
    @Size(min = 2, max = 100, message = "Subject must be between 2 and 100 characters")
    private String subject;

    @NotNull(message = "Exam date is required")
    @FutureOrPresent(message = "Exam date must be today or in the future")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate examDate;

    @NotNull(message = "Start time is required")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;

    @Builder.Default
    private ExamStatus status = ExamStatus.SCHEDULED;

    @Size(max = 50, message = "Branch must be at most 50 characters")
    @Builder.Default
    private String branch = "ALL";

    private java.util.List<Long> hallIds;
}
