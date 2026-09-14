package com.exam.seating.dto.request;

import com.exam.seating.entity.enums.SeatingStrategy;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerateSeatingRequestDto {

    @Builder.Default
    private SeatingStrategy strategy = SeatingStrategy.SEQUENTIAL;

    /**
     * Optional list of specific hall IDs to utilize.
     * If omitted or empty, all available halls with valid seats will be used.
     */
    private List<Long> hallIds;
}
