package com.exam.seating.service;

import com.exam.seating.dto.AttendanceReportResponse;
import com.exam.seating.dto.ExamWiseReportResponse;
import com.exam.seating.dto.HallWiseReportResponse;
import com.exam.seating.dto.StudentWiseReportResponse;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {

    List<ExamWiseReportResponse> getExamWiseReport();

    List<HallWiseReportResponse> getHallWiseReport(Long examId, Long hallId);

    List<StudentWiseReportResponse> getStudentWiseReport(Long examId, String keyword);

    List<AttendanceReportResponse> getAttendanceReport(Long examId, LocalDate date);

    com.exam.seating.dto.response.DashboardStatsResponseDto getDashboardStats();
}
