package com.exam.seating.service.impl;

import com.exam.seating.dto.request.FacultyRequestDto;
import com.exam.seating.dto.response.FacultyResponseDto;
import com.exam.seating.entity.Faculty;
import com.exam.seating.exception.DuplicateResourceException;
import com.exam.seating.exception.ResourceNotFoundException;
import com.exam.seating.repository.FacultyRepository;
import com.exam.seating.service.FacultyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FacultyServiceImpl implements FacultyService {

    private final FacultyRepository facultyRepository;

    @Override
    @Transactional(readOnly = true)
    public List<FacultyResponseDto> getAllFaculty() {
        return facultyRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FacultyResponseDto getFacultyById(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty", "id", id));
        return mapToDto(faculty);
    }

    @Override
    public FacultyResponseDto createFaculty(FacultyRequestDto dto) {
        if (facultyRepository.existsByEmployeeId(dto.getEmployeeId().trim())) {
            throw new DuplicateResourceException("Faculty", "employeeId", dto.getEmployeeId());
        }
        if (facultyRepository.existsByEmail(dto.getEmail().trim())) {
            throw new DuplicateResourceException("Faculty", "email", dto.getEmail());
        }

        Faculty faculty = Faculty.builder()
                .employeeId(dto.getEmployeeId().trim())
                .name(dto.getName().trim())
                .email(dto.getEmail().trim())
                .phone(dto.getPhone().trim())
                .build();

        Faculty saved = facultyRepository.save(faculty);
        return mapToDto(saved);
    }

    @Override
    public FacultyResponseDto updateFaculty(Long id, FacultyRequestDto dto) {
        Faculty existing = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty", "id", id));

        if (!existing.getEmployeeId().equalsIgnoreCase(dto.getEmployeeId().trim()) &&
                facultyRepository.existsByEmployeeId(dto.getEmployeeId().trim())) {
            throw new DuplicateResourceException("Faculty", "employeeId", dto.getEmployeeId());
        }

        if (!existing.getEmail().equalsIgnoreCase(dto.getEmail().trim()) &&
                facultyRepository.existsByEmail(dto.getEmail().trim())) {
            throw new DuplicateResourceException("Faculty", "email", dto.getEmail());
        }

        existing.setEmployeeId(dto.getEmployeeId().trim());
        existing.setName(dto.getName().trim());
        existing.setEmail(dto.getEmail().trim());
        existing.setPhone(dto.getPhone().trim());

        Faculty updated = facultyRepository.save(existing);
        return mapToDto(updated);
    }

    @Override
    public void deleteFaculty(Long id) {
        Faculty faculty = facultyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty", "id", id));
        facultyRepository.delete(faculty);
    }

    private FacultyResponseDto mapToDto(Faculty faculty) {
        return FacultyResponseDto.builder()
                .id(faculty.getId())
                .employeeId(faculty.getEmployeeId())
                .name(faculty.getName())
                .email(faculty.getEmail())
                .phone(faculty.getPhone())
                .userId(faculty.getUser() != null ? faculty.getUser().getId() : null)
                .createdAt(faculty.getCreatedAt())
                .updatedAt(faculty.getUpdatedAt())
                .build();
    }
}
