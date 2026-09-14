package com.exam.seating.service;

import com.exam.seating.dto.response.ExamResponseDto;
import com.exam.seating.dto.response.HodDashboardDto;
import com.exam.seating.dto.response.StudentResponseDto;

import java.util.List;

public interface HodService {
    HodDashboardDto getDepartmentDashboard(String branch);
    List<StudentResponseDto> getDepartmentStudents(String branch);
    List<ExamResponseDto> getDepartmentExams(String branch);
}
