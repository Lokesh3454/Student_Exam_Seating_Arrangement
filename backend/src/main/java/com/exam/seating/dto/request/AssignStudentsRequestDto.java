package com.exam.seating.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignStudentsRequestDto {

    @NotEmpty(message = "Student IDs list cannot be empty")
    private List<Long> studentIds;
}
