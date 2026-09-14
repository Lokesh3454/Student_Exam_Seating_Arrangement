package com.exam.seating.service;

import com.exam.seating.dto.request.StudentRequestDto;
import com.exam.seating.dto.response.StudentResponseDto;

import java.util.List;

public interface StudentService {

    List<StudentResponseDto> getAllStudents();

    StudentResponseDto getStudentById(Long id);

    StudentResponseDto getStudentByRegisterNumber(String registerNumber);

    StudentResponseDto getMyProfile(String username);

    List<StudentResponseDto> searchStudents(String keyword);

    StudentResponseDto createStudent(StudentRequestDto dto);

    StudentResponseDto updateStudent(Long id, StudentRequestDto dto);

    void deleteStudent(Long id);

    com.exam.seating.dto.response.StudentImportSummaryDto importStudentsFromCsv(org.springframework.web.multipart.MultipartFile file);

    com.exam.seating.dto.response.StudentImportSummaryDto importStudentsFromCsv(org.springframework.web.multipart.MultipartFile file, Long examId);

    com.exam.seating.dto.response.ConcurrentBranchImportSummaryDto importConcurrentBranchStudents(
            List<org.springframework.web.multipart.MultipartFile> files,
            List<String> branches,
            java.time.LocalDate examDate,
            java.time.LocalTime startTime,
            java.time.LocalTime endTime,
            Boolean autoAllocateSeating
    );

    String getConcurrentBranchTemplate(String branch);
}
