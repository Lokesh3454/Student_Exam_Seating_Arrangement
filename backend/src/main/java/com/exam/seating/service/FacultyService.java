package com.exam.seating.service;

import com.exam.seating.dto.request.FacultyRequestDto;
import com.exam.seating.dto.response.FacultyResponseDto;

import java.util.List;

public interface FacultyService {

    List<FacultyResponseDto> getAllFaculty();

    FacultyResponseDto getFacultyById(Long id);

    FacultyResponseDto createFaculty(FacultyRequestDto dto);

    FacultyResponseDto updateFaculty(Long id, FacultyRequestDto dto);

    void deleteFaculty(Long id);
}
