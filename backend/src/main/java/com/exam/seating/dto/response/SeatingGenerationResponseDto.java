package com.exam.seating.dto.response;

import com.exam.seating.entity.enums.SeatingStrategy;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatingGenerationResponseDto {

    private Long examId;
    private String examName;
    private Integer totalStudents;
    private Integer totalSeatsUsed;
    private Integer hallsUsed;
    private SeatingStrategy strategy;
}
