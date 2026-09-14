package com.exam.seating.service.impl;

import com.exam.seating.dto.request.StudentRequestDto;
import com.exam.seating.dto.response.StudentResponseDto;
import com.exam.seating.entity.Student;
import com.exam.seating.exception.DuplicateResourceException;
import com.exam.seating.exception.ResourceNotFoundException;
import com.exam.seating.repository.StudentRepository;
import com.exam.seating.repository.UserRepository;
import com.exam.seating.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final com.exam.seating.service.AuditLogService auditLogService;
    private final com.exam.seating.repository.ExamRepository examRepository;
    private final com.exam.seating.repository.ExamStudentRepository examStudentRepository;
    private final com.exam.seating.repository.SeatingArrangementRepository seatingArrangementRepository;
    private final com.exam.seating.service.SeatingArrangementService seatingArrangementService;

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponseDto> getAllStudents() {
        return studentRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponseDto getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        return mapToDto(student);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponseDto getStudentByRegisterNumber(String registerNumber) {
        Student student = studentRepository.findByRegisterNumber(registerNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "registerNumber", registerNumber));
        return mapToDto(student);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponseDto getMyProfile(String username) {
        com.exam.seating.entity.User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        Student student = studentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student profile", "username", username));
        return mapToDto(student);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponseDto> searchStudents(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllStudents();
        }
        return studentRepository.searchStudents(keyword.trim()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public StudentResponseDto createStudent(StudentRequestDto dto) {
        // Validate uniqueness of register number
        if (studentRepository.existsByRegisterNumber(dto.getRegisterNumber())) {
            throw new DuplicateResourceException("Student", "registerNumber", dto.getRegisterNumber());
        }

        // Validate uniqueness of email
        if (studentRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("Student", "email", dto.getEmail());
        }

        Student student = Student.builder()
                .registerNumber(dto.getRegisterNumber().trim())
                .name(dto.getName().trim())
                .branch(dto.getBranch().trim().toUpperCase())
                .year(dto.getYear())
                .section(dto.getSection().trim().toUpperCase())
                .email(dto.getEmail().trim())
                .phone(dto.getPhone().trim())
                .build();

        Student savedStudent = studentRepository.save(student);
        return mapToDto(savedStudent);
    }

    @Override
    public StudentResponseDto updateStudent(Long id, StudentRequestDto dto) {
        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));

        // Check if new register number conflicts with another student
        if (!existingStudent.getRegisterNumber().equalsIgnoreCase(dto.getRegisterNumber().trim()) &&
                studentRepository.existsByRegisterNumber(dto.getRegisterNumber().trim())) {
            throw new DuplicateResourceException("Student", "registerNumber", dto.getRegisterNumber());
        }

        // Check if new email conflicts with another student
        if (!existingStudent.getEmail().equalsIgnoreCase(dto.getEmail().trim()) &&
                studentRepository.existsByEmail(dto.getEmail().trim())) {
            throw new DuplicateResourceException("Student", "email", dto.getEmail());
        }

        existingStudent.setRegisterNumber(dto.getRegisterNumber().trim());
        existingStudent.setName(dto.getName().trim());
        existingStudent.setBranch(dto.getBranch().trim().toUpperCase());
        existingStudent.setYear(dto.getYear());
        existingStudent.setSection(dto.getSection().trim().toUpperCase());
        existingStudent.setEmail(dto.getEmail().trim());
        existingStudent.setPhone(dto.getPhone().trim());

        Student updatedStudent = studentRepository.save(existingStudent);
        return mapToDto(updatedStudent);
    }

    @Override
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student", "id", id));
        studentRepository.delete(student);
    }

    @Override
    public com.exam.seating.dto.response.StudentImportSummaryDto importStudentsFromCsv(org.springframework.web.multipart.MultipartFile file) {
        return importStudentsFromCsv(file, null);
    }

    @Override
    public com.exam.seating.dto.response.StudentImportSummaryDto importStudentsFromCsv(org.springframework.web.multipart.MultipartFile file, Long examId) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("The uploaded CSV file cannot be empty.");
        }

        com.exam.seating.dto.response.StudentImportSummaryDto summary = new com.exam.seating.dto.response.StudentImportSummaryDto();
        java.util.Set<String> seenRegisterNumbers = new java.util.HashSet<>();
        java.util.Set<String> seenEmails = new java.util.HashSet<>();
        List<Student> studentsForExam = new ArrayList<>();
        int rowNumber = 0;

        try (java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(file.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
            String line;
            boolean firstLine = true;

            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) {
                    continue;
                }

                rowNumber++;
                // Skip header line if present
                if (firstLine) {
                    firstLine = false;
                    String lower = line.toLowerCase();
                    if (lower.contains("register") || lower.contains("registernumber") || lower.contains("reg_no")) {
                        continue;
                    }
                }

                summary.setTotalRows(summary.getTotalRows() + 1);

                // Parse CSV columns, supporting simple quotes
                String[] tokens = parseCsvLine(line);
                if (tokens.length < 6) {
                    summary.setFailedRows(summary.getFailedRows() + 1);
                    summary.getErrors().add(new com.exam.seating.dto.response.StudentImportSummaryDto.ImportRowErrorDto(
                            rowNumber,
                            tokens.length > 0 ? tokens[0] : "UNKNOWN",
                            "Insufficient columns. Expected at least 6 fields (registerNumber, name, branch, year, section, email[, phone])"
                    ));
                    continue;
                }

                String regNo = tokens[0].trim();
                String name = tokens[1].trim();
                String branch = tokens[2].trim().toUpperCase();
                String yearStr = tokens[3].trim();
                String section = tokens[4].trim().toUpperCase();
                String email = tokens[5].trim().toLowerCase();
                String phone = tokens.length > 6 ? tokens[6].trim() : "";

                // 1. Missing required fields
                if (regNo.isEmpty() || name.isEmpty() || branch.isEmpty() || yearStr.isEmpty() || section.isEmpty() || email.isEmpty()) {
                    summary.setFailedRows(summary.getFailedRows() + 1);
                    summary.getErrors().add(new com.exam.seating.dto.response.StudentImportSummaryDto.ImportRowErrorDto(
                            rowNumber, regNo, "Missing required fields (registerNumber, name, branch, year, section, and email are required)."
                    ));
                    continue;
                }

                // 2. Validate Year
                int year;
                try {
                    year = Integer.parseInt(yearStr);
                    if (year < 1 || year > 4) {
                        summary.setFailedRows(summary.getFailedRows() + 1);
                        summary.getErrors().add(new com.exam.seating.dto.response.StudentImportSummaryDto.ImportRowErrorDto(
                                rowNumber, regNo, "Invalid year: " + yearStr + ". Year must be an integer between 1 and 4."
                        ));
                        continue;
                    }
                } catch (NumberFormatException e) {
                    summary.setFailedRows(summary.getFailedRows() + 1);
                    summary.getErrors().add(new com.exam.seating.dto.response.StudentImportSummaryDto.ImportRowErrorDto(
                            rowNumber, regNo, "Invalid year format: '" + yearStr + "'. Expected integer 1-4."
                    ));
                    continue;
                }

                // 3. Validate Email format
                if (!email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$")) {
                    summary.setFailedRows(summary.getFailedRows() + 1);
                    summary.getErrors().add(new com.exam.seating.dto.response.StudentImportSummaryDto.ImportRowErrorDto(
                            rowNumber, regNo, "Invalid email format: '" + email + "'."
                    ));
                    continue;
                }

                // 4. Duplicate Check (File & DB)
                String regUpper = regNo.toUpperCase();
                if (seenRegisterNumbers.contains(regUpper)) {
                    summary.setDuplicateRows(summary.getDuplicateRows() + 1);
                    summary.getErrors().add(new com.exam.seating.dto.response.StudentImportSummaryDto.ImportRowErrorDto(
                            rowNumber, regNo, "Duplicate register number within CSV file."
                    ));
                    continue;
                }
                if (studentRepository.existsByRegisterNumber(regNo)) {
                    summary.setDuplicateRows(summary.getDuplicateRows() + 1);
                    studentRepository.findByRegisterNumber(regNo).ifPresent(studentsForExam::add);
                    continue;
                }

                if (seenEmails.contains(email)) {
                    summary.setDuplicateRows(summary.getDuplicateRows() + 1);
                    summary.getErrors().add(new com.exam.seating.dto.response.StudentImportSummaryDto.ImportRowErrorDto(
                            rowNumber, regNo, "Duplicate email address within CSV file."
                    ));
                    continue;
                }
                if (studentRepository.existsByEmail(email)) {
                    summary.setDuplicateRows(summary.getDuplicateRows() + 1);
                    summary.getErrors().add(new com.exam.seating.dto.response.StudentImportSummaryDto.ImportRowErrorDto(
                            rowNumber, regNo, "Email address already exists in database."
                    ));
                    continue;
                }

                // All validations passed -> Persist student
                seenRegisterNumbers.add(regUpper);
                seenEmails.add(email);

                Student student = Student.builder()
                        .registerNumber(regNo)
                        .name(name)
                        .branch(branch)
                        .year(year)
                        .section(section)
                        .email(email)
                        .phone(phone)
                        .build();

                Student saved = studentRepository.save(student);
                studentsForExam.add(saved);
                summary.setSuccessfullyImported(summary.getSuccessfullyImported() + 1);
            }
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to read CSV input stream: " + e.getMessage(), e);
        }

        // Auto-assign to exam & generate multi-hall seating with overflow if examId is provided
        if (examId != null && !studentsForExam.isEmpty()) {
            com.exam.seating.entity.Exam exam = examRepository.findById(examId)
                    .orElseThrow(() -> new ResourceNotFoundException("Exam", "id", examId));

            summary.setExamId(exam.getId());
            summary.setExamName(exam.getExamName());

            // 1. Enroll students into exam
            for (Student s : studentsForExam) {
                if (!examStudentRepository.existsByExamIdAndStudentId(examId, s.getId())) {
                    com.exam.seating.entity.ExamStudent es = com.exam.seating.entity.ExamStudent.builder()
                            .exam(exam)
                            .student(s)
                            .build();
                    examStudentRepository.save(es);
                }
            }

            // 2. Generate seating arrangement across halls (5 rows x 3 columns) with sequential overflow
            com.exam.seating.dto.request.GenerateSeatingRequestDto genRequest =
                    com.exam.seating.dto.request.GenerateSeatingRequestDto.builder()
                            .strategy(com.exam.seating.entity.enums.SeatingStrategy.ADJACENT_BRANCH_SEPARATION)
                            .build();
            seatingArrangementService.regenerateSeatingArrangement(examId, genRequest);

            // 3. Compute hall allocation metrics
            List<com.exam.seating.entity.SeatingArrangement> arrangements =
                    seatingArrangementRepository.findFullArrangementByExamId(examId);

            Map<Long, List<com.exam.seating.entity.SeatingArrangement>> byHall = arrangements.stream()
                    .collect(Collectors.groupingBy(a -> a.getHall().getId(), LinkedHashMap::new, Collectors.toList()));

            List<com.exam.seating.dto.response.StudentImportSummaryDto.HallAllocationDto> allocations = new ArrayList<>();
            for (Map.Entry<Long, List<com.exam.seating.entity.SeatingArrangement>> entry : byHall.entrySet()) {
                com.exam.seating.entity.Hall h = entry.getValue().get(0).getHall();
                int count = entry.getValue().size();
                int cap = (h.getCapacity() != null && h.getCapacity() > 0)
                        ? h.getCapacity()
                        : ((h.getRowsCount() != null ? h.getRowsCount() : 5) * (h.getColumnsCount() != null ? h.getColumnsCount() : 3));

                allocations.add(com.exam.seating.dto.response.StudentImportSummaryDto.HallAllocationDto.builder()
                        .hallId(h.getId())
                        .hallNumber(h.getHallNumber())
                        .building(h.getBuilding())
                        .capacity(cap)
                        .assignedCount(count)
                        .filled(count >= cap)
                        .build());
            }
            summary.setHallAllocations(allocations);

            if (auditLogService != null) {
                auditLogService.logCurrentUser(
                        "BULK_IMPORT_STUDENTS_AND_SEATING",
                        "Exam #" + exam.getId() + " (" + exam.getExamName() + ")",
                        "Bulk imported " + summary.getSuccessfullyImported() + " students and allocated seating across " + allocations.size() + " hall(s) with 5x3 capacity overflow."
                );
            }
        } else {
            if (auditLogService != null) {
                auditLogService.logCurrentUser(
                        "BULK_IMPORT_STUDENTS",
                        "Students (" + summary.getSuccessfullyImported() + " imported)",
                        "Bulk import completed. Success: " + summary.getSuccessfullyImported() + ", Failed: " + summary.getFailedRows()
                );
            }
        }

        return summary;
    }

    @Override
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.NOT_SUPPORTED)
    public com.exam.seating.dto.response.ConcurrentBranchImportSummaryDto importConcurrentBranchStudents(
            List<org.springframework.web.multipart.MultipartFile> files,
            List<String> branches,
            java.time.LocalDate examDate,
            java.time.LocalTime startTime,
            java.time.LocalTime endTime,
            Boolean autoAllocateSeating) {

        if (files == null || files.isEmpty()) {
            throw new com.exam.seating.exception.BadRequestException("At least one branch CSV file must be provided for import.");
        }
        if (examDate == null || startTime == null || endTime == null) {
            throw new com.exam.seating.exception.BadRequestException("Schedule date, start time, and end time are required to identify the concurrent exam session.");
        }

        boolean doAutoAllocate = autoAllocateSeating == null || autoAllocateSeating;

        // 1. Fetch all exams scheduled for this concurrent session
        List<com.exam.seating.entity.Exam> concurrentExams = examRepository.findByExamDateAndStartTimeAndEndTime(examDate, startTime, endTime);
        if (concurrentExams.isEmpty()) {
            throw new com.exam.seating.exception.BadRequestException(String.format(
                    "No scheduled examinations found for date %s between %s and %s.",
                    examDate, startTime, endTime));
        }

        Map<String, com.exam.seating.entity.Exam> branchExamMap = new HashMap<>();
        for (com.exam.seating.entity.Exam ex : concurrentExams) {
            String b = ex.getBranch() != null ? ex.getBranch().trim().toUpperCase() : "ALL";
            branchExamMap.put(b, ex);
        }

        com.exam.seating.dto.response.ConcurrentBranchImportSummaryDto sessionSummary =
                new com.exam.seating.dto.response.ConcurrentBranchImportSummaryDto();
        sessionSummary.setSessionDate(examDate);
        sessionSummary.setStartTime(startTime);
        sessionSummary.setEndTime(endTime);

        int totalImportedAcrossSession = 0;
        int totalDuplicatesAcrossSession = 0;
        int totalFailedAcrossSession = 0;

        // 2. Process each file
        for (int fIdx = 0; fIdx < files.size(); fIdx++) {
            org.springframework.web.multipart.MultipartFile file = files.get(fIdx);
            if (file == null || file.isEmpty()) continue;

            String designatedBranch = (branches != null && fIdx < branches.size() && branches.get(fIdx) != null && !branches.get(fIdx).trim().isEmpty())
                    ? branches.get(fIdx).trim().toUpperCase()
                    : null;

            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "branch_data.csv";
            String detectedBranchFromFile = designatedBranch != null ? designatedBranch : detectBranchFromFilename(originalFilename, branchExamMap.keySet());

            // Read rows from this file
            List<String[]> fileRows = new ArrayList<>();
            try (java.io.BufferedReader reader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(file.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
                String line;
                boolean firstLine = true;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.isEmpty()) continue;
                    if (firstLine) {
                        firstLine = false;
                        String lower = line.toLowerCase();
                        if (lower.contains("register") || lower.contains("registernumber") || lower.contains("reg_no")) {
                            continue;
                        }
                    }
                    fileRows.add(parseCsvLine(line));
                }
            } catch (java.io.IOException e) {
                throw new RuntimeException("Failed to read CSV input stream for " + originalFilename + ": " + e.getMessage(), e);
            }

            // Group rows by branch (using designatedBranch if set, or column 2, or fallback to detected branch from filename)
            Map<String, List<String[]>> rowsByBranch = new LinkedHashMap<>();
            for (String[] tokens : fileRows) {
                String rowBranch;
                if (designatedBranch != null) {
                    rowBranch = designatedBranch;
                } else if (tokens.length > 2 && !tokens[2].trim().isEmpty()) {
                    rowBranch = tokens[2].trim().toUpperCase();
                } else {
                    rowBranch = (detectedBranchFromFile != null ? detectedBranchFromFile : "GENERAL");
                }
                if (designatedBranch != null && tokens.length > 2) {
                    tokens[2] = designatedBranch;
                }
                rowsByBranch.computeIfAbsent(rowBranch, k -> new ArrayList<>()).add(tokens);
            }

            // Process each branch group
            for (Map.Entry<String, List<String[]>> branchEntry : rowsByBranch.entrySet()) {
                String branchKey = branchEntry.getKey();
                List<String[]> rows = branchEntry.getValue();

                // Find matching exam for this branch
                com.exam.seating.entity.Exam targetExam = branchExamMap.get(branchKey);
                if (targetExam == null && branchExamMap.containsKey("ALL")) {
                    targetExam = branchExamMap.get("ALL");
                }

                com.exam.seating.dto.response.ConcurrentBranchImportSummaryDto.BranchImportResultDto branchResult =
                        new com.exam.seating.dto.response.ConcurrentBranchImportSummaryDto.BranchImportResultDto();
                branchResult.setBranch(branchKey);
                branchResult.setFileName(originalFilename);
                branchResult.setTotalRows(rows.size());

                if (targetExam != null) {
                    branchResult.setExamId(targetExam.getId());
                    branchResult.setExamName(targetExam.getExamName());
                    branchResult.setSubject(targetExam.getSubject());
                }

                Set<String> seenRegisterNumbers = new HashSet<>();
                Set<String> seenEmails = new HashSet<>();
                List<Student> studentsForBranch = new ArrayList<>();
                int rowIdx = 0;

                for (String[] tokens : rows) {
                    rowIdx++;
                    if (tokens.length < 6) {
                        branchResult.setFailedRows(branchResult.getFailedRows() + 1);
                        branchResult.getErrors().add(new com.exam.seating.dto.response.StudentImportSummaryDto.ImportRowErrorDto(
                                rowIdx, tokens.length > 0 ? tokens[0] : "UNKNOWN",
                                "Insufficient columns. Expected: registerNumber, name, branch, year, section, email[, phone]"
                        ));
                        continue;
                    }

                    String regNo = tokens[0].trim();
                    String name = tokens[1].trim();
                    String studentBranch = tokens[2].trim().toUpperCase();
                    String yearStr = tokens[3].trim();
                    String section = tokens[4].trim().toUpperCase();
                    String email = tokens[5].trim().toLowerCase();
                    String phone = tokens.length > 6 ? tokens[6].trim() : "";

                    if (regNo.isEmpty() || name.isEmpty() || yearStr.isEmpty() || section.isEmpty() || email.isEmpty()) {
                        branchResult.setFailedRows(branchResult.getFailedRows() + 1);
                        branchResult.getErrors().add(new com.exam.seating.dto.response.StudentImportSummaryDto.ImportRowErrorDto(
                                rowIdx, regNo, "Missing required fields"
                        ));
                        continue;
                    }

                    int year;
                    try {
                        year = Integer.parseInt(yearStr);
                        if (year < 1 || year > 4) {
                            branchResult.setFailedRows(branchResult.getFailedRows() + 1);
                            branchResult.getErrors().add(new com.exam.seating.dto.response.StudentImportSummaryDto.ImportRowErrorDto(
                                    rowIdx, regNo, "Invalid year (expected 1-4)"
                            ));
                            continue;
                        }
                    } catch (NumberFormatException e) {
                        branchResult.setFailedRows(branchResult.getFailedRows() + 1);
                        branchResult.getErrors().add(new com.exam.seating.dto.response.StudentImportSummaryDto.ImportRowErrorDto(
                                rowIdx, regNo, "Invalid year format"
                        ));
                        continue;
                    }

                    if (!email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$")) {
                        branchResult.setFailedRows(branchResult.getFailedRows() + 1);
                        branchResult.getErrors().add(new com.exam.seating.dto.response.StudentImportSummaryDto.ImportRowErrorDto(
                                rowIdx, regNo, "Invalid email format"
                        ));
                        continue;
                    }

                    String regUpper = regNo.toUpperCase();
                    if (seenRegisterNumbers.contains(regUpper)) {
                        branchResult.setDuplicateRows(branchResult.getDuplicateRows() + 1);
                        continue;
                    }
                    if (studentRepository.existsByRegisterNumber(regNo)) {
                        branchResult.setDuplicateRows(branchResult.getDuplicateRows() + 1);
                        studentRepository.findByRegisterNumber(regNo).ifPresent(studentsForBranch::add);
                        continue;
                    }

                    if (seenEmails.contains(email) || studentRepository.existsByEmail(email)) {
                        branchResult.setDuplicateRows(branchResult.getDuplicateRows() + 1);
                        continue;
                    }

                    seenRegisterNumbers.add(regUpper);
                    seenEmails.add(email);

                    Student student = Student.builder()
                            .registerNumber(regNo)
                            .name(name)
                            .branch(!studentBranch.isEmpty() ? studentBranch : branchKey)
                            .year(year)
                            .section(section)
                            .email(email)
                            .phone(phone)
                            .build();

                    Student saved = studentRepository.save(student);
                    studentsForBranch.add(saved);
                    branchResult.setSuccessfullyImported(branchResult.getSuccessfullyImported() + 1);
                }

                // Auto-enroll students into target exam
                if (targetExam != null && !studentsForBranch.isEmpty()) {
                    for (Student s : studentsForBranch) {
                        if (!examStudentRepository.existsByExamIdAndStudentId(targetExam.getId(), s.getId())) {
                            com.exam.seating.entity.ExamStudent es = com.exam.seating.entity.ExamStudent.builder()
                                    .exam(targetExam)
                                    .student(s)
                                    .build();
                            examStudentRepository.save(es);
                        }
                    }

                    // Seating allocation with 5x3 multi-hall overflow across allotted halls
                    if (doAutoAllocate) {
                        try {
                            com.exam.seating.dto.request.GenerateSeatingRequestDto genRequest =
                                    com.exam.seating.dto.request.GenerateSeatingRequestDto.builder()
                                            .strategy(com.exam.seating.entity.enums.SeatingStrategy.ADJACENT_BRANCH_SEPARATION)
                                            .build();
                            seatingArrangementService.regenerateSeatingArrangement(targetExam.getId(), genRequest);

                            List<com.exam.seating.entity.SeatingArrangement> arrangements =
                                    seatingArrangementRepository.findFullArrangementByExamId(targetExam.getId());

                            Map<Long, List<com.exam.seating.entity.SeatingArrangement>> byHall = arrangements.stream()
                                    .collect(Collectors.groupingBy(a -> a.getHall().getId(), LinkedHashMap::new, Collectors.toList()));

                            List<com.exam.seating.dto.response.StudentImportSummaryDto.HallAllocationDto> allocations = new ArrayList<>();
                            for (Map.Entry<Long, List<com.exam.seating.entity.SeatingArrangement>> hEntry : byHall.entrySet()) {
                                com.exam.seating.entity.Hall h = hEntry.getValue().get(0).getHall();
                                int count = hEntry.getValue().size();
                                int cap = (h.getCapacity() != null && h.getCapacity() > 0)
                                        ? h.getCapacity()
                                        : ((h.getRowsCount() != null ? h.getRowsCount() : 5) * (h.getColumnsCount() != null ? h.getColumnsCount() : 3));

                                allocations.add(com.exam.seating.dto.response.StudentImportSummaryDto.HallAllocationDto.builder()
                                        .hallId(h.getId())
                                        .hallNumber(h.getHallNumber())
                                        .building(h.getBuilding())
                                        .capacity(cap)
                                        .assignedCount(count)
                                        .filled(count >= cap)
                                        .build());
                            }
                            branchResult.setHallAllocations(allocations);
                        } catch (Exception ex) {
                            branchResult.getErrors().add(new com.exam.seating.dto.response.StudentImportSummaryDto.ImportRowErrorDto(
                                    0, "SEATING_GENERATION", "Seating generation notice: " + ex.getMessage()
                            ));
                        }
                    }
                } else if (targetExam == null) {
                    branchResult.getErrors().add(new com.exam.seating.dto.response.StudentImportSummaryDto.ImportRowErrorDto(
                            0, branchKey, "No exam scheduled for branch " + branchKey + " in session " + examDate + " " + startTime + "-" + endTime
                    ));
                }

                sessionSummary.getBranchResults().add(branchResult);
                totalImportedAcrossSession += branchResult.getSuccessfullyImported();
                totalDuplicatesAcrossSession += branchResult.getDuplicateRows();
                totalFailedAcrossSession += branchResult.getFailedRows();
            }
        }

        sessionSummary.setTotalBranchesProcessed(sessionSummary.getBranchResults().size());
        sessionSummary.setTotalStudentsImported(totalImportedAcrossSession);
        sessionSummary.setTotalDuplicates(totalDuplicatesAcrossSession);
        sessionSummary.setTotalFailed(totalFailedAcrossSession);
        sessionSummary.setOverallStatus(totalFailedAcrossSession == 0 ? "COMPLETED" : "PARTIAL");

        auditLogService.logCurrentUser(
                "BULK_IMPORT_CONCURRENT_BRANCHES",
                "Session: " + examDate + " (" + startTime + " - " + endTime + ")",
                "Concurrent branch import completed. Processed " + sessionSummary.getTotalBranchesProcessed()
                        + " branches with " + totalImportedAcrossSession + " students enrolled & seated."
        );

        return sessionSummary;
    }

    private String detectBranchFromFilename(String filename, Set<String> knownBranches) {
        if (filename == null) return null;
        String upper = filename.toUpperCase();
        for (String b : knownBranches) {
            if (upper.contains(b)) {
                return b;
            }
        }
        for (String stdBranch : List.of("CSE", "ECE", "MECH", "CIVIL", "IT", "EEE", "AERO")) {
            if (upper.contains(stdBranch)) {
                return stdBranch;
            }
        }
        return null;
    }

    @Override
    public String getConcurrentBranchTemplate(String branch) {
        String b = (branch != null && !branch.trim().isEmpty()) ? branch.trim().toUpperCase() : "CSE";
        String code = b;
        if ("CSE".equalsIgnoreCase(b)) code = "CS";
        else if ("ECE".equalsIgnoreCase(b)) code = "EC";
        else if ("MECH".equalsIgnoreCase(b)) code = "ME";
        else if ("CIVIL".equalsIgnoreCase(b)) code = "CE";

        String[] firstNames = {
            "Aarav", "Aditi", "Akash", "Ananya", "Arjun",
            "Bhavya", "Chetan", "Deepa", "Devendra", "Divya",
            "Gautam", "Harish", "Ishaan", "Janani", "Karan",
            "Kavya", "Lakshmi", "Madhav", "Meera", "Mohit",
            "Nandini", "Nikhil", "Pooja", "Pranav", "Preeti",
            "Rahul", "Rajeshwari", "Rishi", "Ritu", "Rohan"
        };
        String[] lastNames = {
            "Patel", "Sharma", "Verma", "Iyer", "Nair",
            "Reddy", "Kumar", "Menon", "Joshi", "Pillai",
            "Das", "Rao", "Kulkarni", "Sundaram", "Malhotra",
            "Hegde", "Narayanan", "Bhat", "Sen", "Agarwal",
            "Chawla", "Deshmukh", "Shetty", "Venkatesh", "Nambiar",
            "Saxena", "Murthy", "Kapoor", "Sengupta", "Mehta"
        };

        StringBuilder sb = new StringBuilder("registerNumber,name,branch,year,section,email,phone\n");
        for (int i = 0; i < firstNames.length; i++) {
            int seq = i + 1;
            String regNo = String.format("21%s%03d", code, seq);
            String fullName = firstNames[i] + " " + lastNames[i];
            String section = seq <= 15 ? "A" : "B";
            String email = String.format("%s.%s@%s.university.edu",
                    firstNames[i].toLowerCase(), lastNames[i].toLowerCase(), b.toLowerCase());
            String phone = String.format("98450%05d", 10000 + seq);
            sb.append(regNo).append(",")
              .append(fullName).append(",")
              .append(b).append(",3,")
              .append(section).append(",")
              .append(email).append(",")
              .append(phone).append("\n");
        }
        return sb.toString();
    }

    private String[] parseCsvLine(String line) {
        java.util.List<String> tokens = new java.util.ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '\"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                tokens.add(sb.toString().trim());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        tokens.add(sb.toString().trim());
        return tokens.toArray(new String[0]);
    }

    private StudentResponseDto mapToDto(Student student) {
        return StudentResponseDto.builder()
                .id(student.getId())
                .registerNumber(student.getRegisterNumber())
                .name(student.getName())
                .branch(student.getBranch())
                .year(student.getYear())
                .section(student.getSection())
                .email(student.getEmail())
                .phone(student.getPhone())
                .userId(student.getUser() != null ? student.getUser().getId() : null)
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .build();
    }
}
