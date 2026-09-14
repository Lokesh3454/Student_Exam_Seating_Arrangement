package com.exam.seating.service;

import com.exam.seating.dto.AttendanceStudentDto;
import com.exam.seating.dto.HallAttendanceResponse;
import com.exam.seating.dto.SaveAttendanceRequest;
import com.exam.seating.entity.enums.AttendanceStatus;

import java.util.Map;

public interface AttendanceService {

    HallAttendanceResponse getHallAttendance(Long examId, Long hallId);

    HallAttendanceResponse saveAttendance(SaveAttendanceRequest request);

    AttendanceStudentDto updateAttendanceStatus(Long id, AttendanceStatus status);

    Map<String, Object> getExamAttendanceSummary(Long examId);
}
