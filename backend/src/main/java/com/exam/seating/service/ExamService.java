package com.exam.seating.service;

import com.exam.seating.dto.request.AssignStudentsRequestDto;
import com.exam.seating.dto.request.ExamRequestDto;
import com.exam.seating.dto.response.ExamResponseDto;
import com.exam.seating.dto.response.StudentResponseDto;

import java.util.List;

public interface ExamService {

    List<ExamResponseDto> getAllExams();

    ExamResponseDto getExamById(Long id);

    ExamResponseDto createExam(ExamRequestDto dto);

    ExamResponseDto updateExam(Long id, ExamRequestDto dto);

    void deleteExam(Long id);

    List<StudentResponseDto> assignStudentsToExam(Long examId, AssignStudentsRequestDto dto);

    void removeStudentFromExam(Long examId, Long studentId);

    List<StudentResponseDto> getStudentsByExamId(Long examId);

    List<ExamResponseDto> getExamsByBranch(String branch);

    ExamResponseDto updateAllottedHalls(Long examId, List<Long> hallIds);

    List<StudentResponseDto> autoEnrollStudentsByBranch(Long examId);

    com.exam.seating.dto.response.ExamImportSummaryDto importExamsFromCsv(org.springframework.web.multipart.MultipartFile file);

    String getExamCsvTemplate();

    List<com.exam.seating.dto.response.ConcurrentExamSessionDto> getConcurrentExamSessions();
}
