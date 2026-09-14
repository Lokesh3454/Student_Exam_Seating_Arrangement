package com.exam.seating.dto;

import com.exam.seating.entity.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceUpdateRequest {

    @NotNull(message = "Status is required")
    private AttendanceStatus status;
}
