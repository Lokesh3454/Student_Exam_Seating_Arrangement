package com.exam.seating.dto;

import com.exam.seating.entity.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SaveAttendanceRequest {

    @NotNull(message = "Exam ID is required")
    private Long examId;

    @NotNull(message = "Hall ID is required")
    private Long hallId;

    private List<StudentStatusEntry> records;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StudentStatusEntry {
        @NotNull(message = "Student ID is required")
        private Long studentId;

        @NotNull(message = "Status is required")
        private AttendanceStatus status;
    }
}
