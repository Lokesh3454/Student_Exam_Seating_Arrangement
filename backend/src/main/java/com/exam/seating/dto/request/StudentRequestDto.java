package com.exam.seating.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentRequestDto {

    @NotBlank(message = "Register number is required")
    @Size(min = 3, max = 50, message = "Register number must be between 3 and 50 characters")
    private String registerNumber;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Branch is required")
    private String branch;

    @NotNull(message = "Year is required")
    @Min(value = 1, message = "Year must be at least 1")
    @Max(value = 5, message = "Year cannot be greater than 5")
    private Integer year;

    @NotBlank(message = "Section is required")
    private String section;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9+()\\-\\s]{7,20}$", message = "Invalid phone number format")
    private String phone;
}
