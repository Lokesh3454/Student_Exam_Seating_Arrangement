package com.exam.seating.dto.request;

import com.exam.seating.entity.enums.IncidentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentRequestDto {

    @NotNull(message = "Exam ID is mandatory")
    private Long examId;

    @NotNull(message = "Hall ID is mandatory")
    private Long hallId;

    @NotNull(message = "Student ID is mandatory")
    private Long studentId;

    @NotNull(message = "Incident type is mandatory")
    private IncidentType incidentType;

    @NotBlank(message = "Incident description is required")
    private String description;

    private String confiscatedItems;

    private String actionTaken;
}
