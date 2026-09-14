package com.exam.seating.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacultyAssignmentRequest {

    @NotNull(message = "Faculty ID is required")
    private Long facultyId;

    @NotNull(message = "Exam ID is required")
    private Long examId;

    @NotNull(message = "Hall ID is required")
    private Long hallId;
}
