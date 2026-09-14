package com.exam.seating.config;

import com.exam.seating.entity.Faculty;
import com.exam.seating.entity.Student;
import com.exam.seating.entity.User;
import com.exam.seating.entity.enums.Role;
import com.exam.seating.repository.FacultyRepository;
import com.exam.seating.repository.StudentRepository;
import com.exam.seating.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SecurityDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.exam.seating.repository.HallRepository hallRepository;
    private final com.exam.seating.repository.SeatRepository seatRepository;
    private final com.exam.seating.repository.ExamRepository examRepository;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void run(String... args) {
        log.info("Initializing security accounts and verifying BCrypt passwords...");

        // 1. Seed Admin Account
        createOrUpdateUser("admin", "admin123", Role.ADMIN, "admin@university.edu");

        // 2. Seed Faculty Account
        User facultyUser = createOrUpdateUser("faculty", "faculty123", Role.FACULTY, "faculty@university.edu");
        if (facultyRepository.findByEmployeeId("FAC-1000").isEmpty()) {
            facultyRepository.save(Faculty.builder()
                    .employeeId("FAC-1000")
                    .name("Prof. Alex Vance")
                    .email("faculty@university.edu")
                    .phone("9876500001")
                    .user(facultyUser)
                    .build());
            log.info("Created default Faculty profile linked to 'faculty' user");
        }

        // 3. Seed Student Account
        User studentUser = createOrUpdateUser("student", "student123", Role.STUDENT, "student@student.edu");
        if (studentRepository.findByRegisterNumber("21STD001").isEmpty()) {
            studentRepository.save(Student.builder()
                    .registerNumber("21STD001")
                    .name("Sam Student")
                    .branch("CSE")
                    .year(3)
                    .section("A")
                    .email("student@student.edu")
                    .phone("9845099999")
                    .user(studentUser)
                    .build());
            log.info("Created default Student profile linked to 'student' user");
        }

        // 4. Ensure sample existing student '21CS001' has working password 'student123'
        createOrUpdateUser("21CS001", "student123", Role.STUDENT, "alice.johnson@student.edu");

        // 4b. Seed HOD Accounts for each department
        createOrUpdateUser("hod_cse", "hod123", Role.HOD, "hod.cse@university.edu", "CSE");
        createOrUpdateUser("hod_ece", "hod123", Role.HOD, "hod.ece@university.edu", "ECE");
        createOrUpdateUser("hod_mech", "hod123", Role.HOD, "hod.mech@university.edu", "MECH");
        createOrUpdateUser("hod_civil", "hod123", Role.HOD, "hod.civil@university.edu", "CIVIL");

        // 5. Standardize Examination Halls to 5 rows x 3 columns = 15 seats
        ensureStandardHallsConfiguration();

        // 6. Ensure standard exams have distinct branches and allotted halls
        ensureStandardExamsConfiguration();

        log.info("Security accounts, standard 5x3 halls, and branch exam initialization complete.");
    }

    private void ensureStandardExamsConfiguration() {
        log.info("Verifying branch assignments and allotted halls for standard exams...");
        java.time.LocalDate concurrentDate = java.time.LocalDate.of(2026, 10, 15);
        java.time.LocalTime concurrentStart = java.time.LocalTime.of(9, 30);
        java.time.LocalTime concurrentEnd = java.time.LocalTime.of(12, 30);

        // 1. CSE Exam
        examRepository.findById(1L).ifPresent(e1 -> {
            boolean changed = false;
            if (!concurrentDate.equals(e1.getExamDate()) || !concurrentStart.equals(e1.getStartTime())) {
                e1.setExamDate(concurrentDate);
                e1.setStartTime(concurrentStart);
                e1.setEndTime(concurrentEnd);
                changed = true;
            }
            if (e1.getBranch() == null || !"CSE".equalsIgnoreCase(e1.getBranch())) {
                e1.setBranch("CSE");
                changed = true;
            }
            if (e1.getAllottedHalls() == null || e1.getAllottedHalls().isEmpty()) {
                java.util.Set<com.exam.seating.entity.Hall> halls = new java.util.HashSet<>();
                hallRepository.findByHallNumber("LH-101").ifPresent(halls::add);
                e1.setAllottedHalls(halls);
                changed = true;
            }
            if (changed) {
                examRepository.save(e1);
                log.info("Exam 1 updated with Branch=CSE and allotted halls [LH-101] for concurrent session");
            }
        });

        // 2. ECE Exam
        examRepository.findById(2L).ifPresent(e2 -> {
            boolean changed = false;
            if (!concurrentDate.equals(e2.getExamDate()) || !concurrentStart.equals(e2.getStartTime())) {
                e2.setExamDate(concurrentDate);
                e2.setStartTime(concurrentStart);
                e2.setEndTime(concurrentEnd);
                changed = true;
            }
            if (e2.getBranch() == null || !"ECE".equalsIgnoreCase(e2.getBranch())) {
                e2.setBranch("ECE");
                changed = true;
            }
            if (e2.getAllottedHalls() == null || e2.getAllottedHalls().isEmpty()) {
                java.util.Set<com.exam.seating.entity.Hall> halls = new java.util.HashSet<>();
                hallRepository.findByHallNumber("LH-201").ifPresent(halls::add);
                e2.setAllottedHalls(halls);
                changed = true;
            }
            if (changed) {
                examRepository.save(e2);
                log.info("Exam 2 updated with Branch=ECE and allotted hall [LH-201] for concurrent session");
            }
        });

        // 3. MECH Exam
        examRepository.findById(3L).ifPresent(e3 -> {
            boolean changed = false;
            if (!concurrentDate.equals(e3.getExamDate()) || !concurrentStart.equals(e3.getStartTime())) {
                e3.setExamDate(concurrentDate);
                e3.setStartTime(concurrentStart);
                e3.setEndTime(concurrentEnd);
                changed = true;
            }
            if (e3.getBranch() == null || !"MECH".equalsIgnoreCase(e3.getBranch())) {
                e3.setBranch("MECH");
                changed = true;
            }
            if (e3.getAllottedHalls() == null || e3.getAllottedHalls().isEmpty()) {
                java.util.Set<com.exam.seating.entity.Hall> halls = new java.util.HashSet<>();
                hallRepository.findByHallNumber("LH-301").ifPresent(halls::add);
                e3.setAllottedHalls(halls);
                changed = true;
            }
            if (changed) {
                examRepository.save(e3);
                log.info("Exam 3 updated with Branch=MECH and allotted hall [LH-301] for concurrent session");
            }
        });

        // 4. CIVIL Exam (Update if existing or create)
        examRepository.findById(4L).ifPresentOrElse(e4 -> {
            boolean changed = false;
            if (!concurrentDate.equals(e4.getExamDate()) || !concurrentStart.equals(e4.getStartTime())) {
                e4.setExamDate(concurrentDate);
                e4.setStartTime(concurrentStart);
                e4.setEndTime(concurrentEnd);
                changed = true;
            }
            if (e4.getBranch() == null || !"CIVIL".equalsIgnoreCase(e4.getBranch())) {
                e4.setBranch("CIVIL");
                changed = true;
            }
            if (e4.getAllottedHalls() == null || e4.getAllottedHalls().isEmpty()) {
                java.util.Set<com.exam.seating.entity.Hall> civilHalls = new java.util.HashSet<>();
                hallRepository.findByHallNumber("LH-101").ifPresent(civilHalls::add);
                hallRepository.findByHallNumber("LH-201").ifPresent(civilHalls::add);
                e4.setAllottedHalls(civilHalls);
                changed = true;
            }
            if (changed) {
                examRepository.save(e4);
                log.info("Exam 4 updated with Branch=CIVIL for concurrent session 2026-10-15 09:30-12:30");
            }
        }, () -> {
            java.util.Set<com.exam.seating.entity.Hall> civilHalls = new java.util.HashSet<>();
            hallRepository.findByHallNumber("LH-101").ifPresent(civilHalls::add);
            hallRepository.findByHallNumber("LH-201").ifPresent(civilHalls::add);

            com.exam.seating.entity.Exam e4 = com.exam.seating.entity.Exam.builder()
                    .id(4L)
                    .examName("Mid-Term Exam Spring 2026")
                    .subject("Structural Analysis & Design")
                    .examDate(concurrentDate)
                    .startTime(concurrentStart)
                    .endTime(concurrentEnd)
                    .status(com.exam.seating.entity.enums.ExamStatus.SCHEDULED)
                    .branch("CIVIL")
                    .allottedHalls(civilHalls)
                    .build();
            examRepository.save(e4);
            log.info("Exam 4 created with Branch=CIVIL for concurrent session 2026-10-15 09:30-12:30");
        });
    }

    private void ensureStandardHallsConfiguration() {
        log.info("Standardizing examination halls to 5 rows x 3 columns (15 capacity)...");
        standardizeHall("LH-101", "Science Block", 1);
        standardizeHall("LH-102", "Science Block", 1);
        standardizeHall("LH-201", "Engineering Block", 2);
        standardizeHall("LH-202", "Engineering Block", 2);
        standardizeHall("LH-301", "Main Academic Block", 3);
    }

    private void standardizeHall(String hallNumber, String building, int floor) {
        com.exam.seating.entity.Hall hall = hallRepository.findByHallNumber(hallNumber).orElseGet(() -> {
            com.exam.seating.entity.Hall newHall = com.exam.seating.entity.Hall.builder()
                    .hallNumber(hallNumber)
                    .building(building)
                    .floor(floor)
                    .rowsCount(5)
                    .columnsCount(3)
                    .capacity(15)
                    .build();
            return hallRepository.save(newHall);
        });

        boolean dimensionsChanged = hall.getRowsCount() == null || hall.getRowsCount() != 5
                || hall.getColumnsCount() == null || hall.getColumnsCount() != 3
                || hall.getCapacity() == null || hall.getCapacity() != 15;

        if (dimensionsChanged) {
            hall.setRowsCount(5);
            hall.setColumnsCount(3);
            hall.setCapacity(15);
            hall = hallRepository.save(hall);
        }

        long seatCount = seatRepository.countByHallId(hall.getId());
        if (seatCount != 15 || dimensionsChanged) {
            seatRepository.deleteByHallId(hall.getId());
            for (int r = 1; r <= 5; r++) {
                for (int c = 1; c <= 3; c++) {
                    com.exam.seating.entity.Seat seat = com.exam.seating.entity.Seat.builder()
                            .hall(hall)
                            .rowNumber(r)
                            .columnNumber(c)
                            .seatNumber(String.format("R%d-C%d", r, c))
                            .status(com.exam.seating.entity.enums.SeatStatus.AVAILABLE)
                            .build();
                    seatRepository.save(seat);
                }
            }
        }
    }

    private User createOrUpdateUser(String username, String rawPassword, Role role, String email) {
        return createOrUpdateUser(username, rawPassword, role, email, null);
    }

    private User createOrUpdateUser(String username, String rawPassword, Role role, String email, String department) {
        return userRepository.findByUsername(username).map(existing -> {
            // Update password to ensure valid BCrypt hash
            existing.setPassword(passwordEncoder.encode(rawPassword));
            existing.setRole(role);
            existing.setEnabled(true);
            if (department != null) {
                existing.setDepartment(department);
            }
            return userRepository.save(existing);
        }).orElseGet(() -> {
            User newUser = User.builder()
                    .username(username)
                    .password(passwordEncoder.encode(rawPassword))
                    .role(role)
                    .email(email)
                    .department(department)
                    .enabled(true)
                    .build();
            log.info("Seeded new security account: {} with role: {} and department: {}", username, role, department);
            return userRepository.save(newUser);
        });
    }
}
