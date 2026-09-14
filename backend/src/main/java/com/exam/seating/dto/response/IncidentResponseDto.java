package com.exam.seating.dto.response;

import com.exam.seating.entity.enums.IncidentStatus;
import com.exam.seating.entity.enums.IncidentType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentResponseDto {

    private Long id;
    private Long examId;
    private String examName;
    private Long hallId;
    private String hallNumber;
    private Long studentId;
    private String studentName;
    private String studentRegisterNumber;
    private String studentBranch;
    private String reportedBy;
    private IncidentType incidentType;
    private String description;
    private String confiscatedItems;
    private String actionTaken;
    private IncidentStatus status;
    private LocalDateTime reportedAt;
}
