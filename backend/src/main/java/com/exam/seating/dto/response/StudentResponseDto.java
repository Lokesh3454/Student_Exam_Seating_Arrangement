package com.exam.seating.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentResponseDto {

    private Long id;
    private String registerNumber;
    private String name;
    private String branch;
    private Integer year;
    private String section;
    private String email;
    private String phone;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
