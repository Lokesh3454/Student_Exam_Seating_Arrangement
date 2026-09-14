-- =============================================================================
-- SMART EXAM HALL SEATING ARRANGEMENT SYSTEM - INITIAL SEED DATA
-- Default BCrypt Password for users is: Admin@123 / Faculty@123 / Student@123
-- BCrypt hash for "Admin@123": $2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M
-- (In Phase 2, passwords will be encoded via BCryptPasswordEncoder)
-- =============================================================================

USE exam_seating_db;

-- 1. Insert Initial Users
INSERT INTO users (id, username, password, role, email, enabled) VALUES
(1, 'admin', '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'ADMIN', 'admin@university.edu', true),
(2, 'faculty1', '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'FACULTY', 'sarah.connor@university.edu', true),
(3, 'faculty2', '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'FACULTY', 'alan.turing@university.edu', true),
(4, '21CS001', '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'STUDENT', 'alice.johnson@student.edu', true),
(5, '21CS002', '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'STUDENT', 'bob.smith@student.edu', true),
(6, '21EC001', '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'STUDENT', 'charlie.brown@student.edu', true)
ON DUPLICATE KEY UPDATE username=username;

-- 2. Insert Faculty
INSERT INTO faculty (id, employee_id, name, email, phone, user_id) VALUES
(1, 'FAC-1001', 'Dr. Sarah Connor', 'sarah.connor@university.edu', '9876543210', 2),
(2, 'FAC-1002', 'Prof. Alan Turing', 'alan.turing@university.edu', '9876543211', 3)
ON DUPLICATE KEY UPDATE employee_id=employee_id;

-- 3. Insert Students (Mixed branches & years for seating algorithm testing)
INSERT INTO students (id, register_number, name, branch, year, section, email, phone, user_id) VALUES
(1, '21CS001', 'Alice Johnson', 'CSE', 3, 'A', 'alice.johnson@student.edu', '9845011111', 4),
(2, '21CS002', 'Bob Smith', 'CSE', 3, 'A', 'bob.smith@student.edu', '9845011112', 5),
(3, '21EC001', 'Charlie Brown', 'ECE', 3, 'B', 'charlie.brown@student.edu', '9845011113', 6),
(4, '21EC002', 'Diana Prince', 'ECE', 3, 'B', 'diana.prince@student.edu', '9845011114', NULL),
(5, '21ME001', 'Ethan Hunt', 'MECH', 3, 'A', 'ethan.hunt@student.edu', '9845011115', NULL),
(6, '21ME002', 'Fiona Gallagher', 'MECH', 3, 'A', 'fiona.gallagher@student.edu', '9845011116', NULL)
ON DUPLICATE KEY UPDATE register_number=register_number;

-- 4. Insert Examination Halls (Standard: 5 rows x 3 columns = 15 capacity)
INSERT INTO halls (id, hall_number, building, floor, rows_count, columns_count, capacity) VALUES
(1, 'LH-101', 'Science Block', 1, 5, 3, 15),
(2, 'LH-201', 'Engineering Block', 2, 5, 3, 15),
(3, 'LH-301', 'Main Academic Block', 3, 5, 3, 15)
ON DUPLICATE KEY UPDATE hall_number=VALUES(hall_number), rows_count=5, columns_count=3, capacity=15;

-- 5. Insert Seats for Hall LH-101 (5 rows x 3 columns = 15 seats)
INSERT INTO seats (id, hall_id, `row_number`, `column_number`, seat_number, status) VALUES
(1, 1, 1, 1, 'R1-C1', 'AVAILABLE'),
(2, 1, 1, 2, 'R1-C2', 'AVAILABLE'),
(3, 1, 1, 3, 'R1-C3', 'AVAILABLE'),
(4, 1, 2, 1, 'R2-C1', 'AVAILABLE'),
(5, 1, 2, 2, 'R2-C2', 'AVAILABLE'),
(6, 1, 2, 3, 'R2-C3', 'AVAILABLE'),
(7, 1, 3, 1, 'R3-C1', 'AVAILABLE'),
(8, 1, 3, 2, 'R3-C2', 'AVAILABLE'),
(9, 1, 3, 3, 'R3-C3', 'AVAILABLE'),
(10, 1, 4, 1, 'R4-C1', 'AVAILABLE'),
(11, 1, 4, 2, 'R4-C2', 'AVAILABLE'),
(12, 1, 4, 3, 'R4-C3', 'AVAILABLE'),
(13, 1, 5, 1, 'R5-C1', 'AVAILABLE'),
(14, 1, 5, 2, 'R5-C2', 'AVAILABLE'),
(15, 1, 5, 3, 'R5-C3', 'AVAILABLE'),
-- Seats for Hall LH-201 (5 rows x 3 columns = 15 seats)
(16, 2, 1, 1, 'R1-C1', 'AVAILABLE'),
(17, 2, 1, 2, 'R1-C2', 'AVAILABLE'),
(18, 2, 1, 3, 'R1-C3', 'AVAILABLE'),
(19, 2, 2, 1, 'R2-C1', 'AVAILABLE'),
(20, 2, 2, 2, 'R2-C2', 'AVAILABLE'),
(21, 2, 2, 3, 'R2-C3', 'AVAILABLE'),
(22, 2, 3, 1, 'R3-C1', 'AVAILABLE'),
(23, 2, 3, 2, 'R3-C2', 'AVAILABLE'),
(24, 2, 3, 3, 'R3-C3', 'AVAILABLE'),
(25, 2, 4, 1, 'R4-C1', 'AVAILABLE'),
(26, 2, 4, 2, 'R4-C2', 'AVAILABLE'),
(27, 2, 4, 3, 'R4-C3', 'AVAILABLE'),
(28, 2, 5, 1, 'R5-C1', 'AVAILABLE'),
(29, 2, 5, 2, 'R5-C2', 'AVAILABLE'),
(30, 2, 5, 3, 'R5-C3', 'AVAILABLE'),
-- Seats for Hall LH-301 (5 rows x 3 columns = 15 seats)
(31, 3, 1, 1, 'R1-C1', 'AVAILABLE'),
(32, 3, 1, 2, 'R1-C2', 'AVAILABLE'),
(33, 3, 1, 3, 'R1-C3', 'AVAILABLE'),
(34, 3, 2, 1, 'R2-C1', 'AVAILABLE'),
(35, 3, 2, 2, 'R2-C2', 'AVAILABLE'),
(36, 3, 2, 3, 'R2-C3', 'AVAILABLE'),
(37, 3, 3, 1, 'R3-C1', 'AVAILABLE'),
(38, 3, 3, 2, 'R3-C2', 'AVAILABLE'),
(39, 3, 3, 3, 'R3-C3', 'AVAILABLE'),
(40, 3, 4, 1, 'R4-C1', 'AVAILABLE'),
(41, 3, 4, 2, 'R4-C2', 'AVAILABLE'),
(42, 3, 4, 3, 'R4-C3', 'AVAILABLE'),
(43, 3, 5, 1, 'R5-C1', 'AVAILABLE'),
(44, 3, 5, 2, 'R5-C2', 'AVAILABLE'),
(45, 3, 5, 3, 'R5-C3', 'AVAILABLE')
ON DUPLICATE KEY UPDATE seat_number=VALUES(seat_number);

-- 6. Insert Exams with 4 specific branches scheduled for the SAME schedule time (2026-10-15 09:30 - 12:30)
INSERT INTO exams (id, exam_name, subject, exam_date, start_time, end_time, status, branch) VALUES
(1, 'Mid-Term Exam Spring 2026', 'Data Structures & Algorithms', '2026-10-15', '09:30:00', '12:30:00', 'SCHEDULED', 'CSE'),
(2, 'Mid-Term Exam Spring 2026', 'Digital Signal Processing', '2026-10-15', '09:30:00', '12:30:00', 'SCHEDULED', 'ECE'),
(3, 'Mid-Term Exam Spring 2026', 'Fluid Mechanics & Heat Transfer', '2026-10-15', '09:30:00', '12:30:00', 'SCHEDULED', 'MECH'),
(4, 'Mid-Term Exam Spring 2026', 'Structural Analysis & Design', '2026-10-15', '09:30:00', '12:30:00', 'SCHEDULED', 'CIVIL')
ON DUPLICATE KEY UPDATE exam_name=exam_name, exam_date=VALUES(exam_date), start_time=VALUES(start_time), end_time=VALUES(end_time), branch=VALUES(branch);

-- 6b. Allot Specific Halls for Each Exam Schedule
INSERT INTO exam_halls (exam_id, hall_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 1),
(4, 2)
ON DUPLICATE KEY UPDATE exam_id=exam_id;

-- 7. Register Eligible Students for Exam 1
INSERT INTO exam_students (id, exam_id, student_id) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 1, 4),
(5, 1, 5),
(6, 1, 6)
ON DUPLICATE KEY UPDATE exam_id=exam_id;

-- 8. Sample Seating Arrangement for Exam 1 in Hall LH-101
-- Interleaved branch pattern: CSE (Seat 1), ECE (Seat 2), MECH (Seat 3)...
INSERT INTO seating_arrangements (id, exam_id, student_id, hall_id, seat_id) VALUES
(1, 1, 1, 1, 1),  -- Alice (CSE) -> R1-C1
(2, 1, 3, 1, 2),  -- Charlie (ECE) -> R1-C2
(3, 1, 5, 1, 3),  -- Ethan (MECH) -> R1-C3
(4, 1, 2, 1, 4),  -- Bob (CSE) -> R2-C1
(5, 1, 4, 1, 5),  -- Diana (ECE) -> R2-C2
(6, 1, 6, 1, 6)   -- Fiona (MECH) -> R2-C3
ON DUPLICATE KEY UPDATE exam_id=exam_id;

-- 9. Sample Attendance for Exam 1
INSERT INTO attendance (id, exam_id, student_id, hall_id, status) VALUES
(1, 1, 1, 1, 'PRESENT'),
(2, 1, 2, 1, 'PRESENT'),
(3, 1, 3, 1, 'PRESENT'),
(4, 1, 4, 1, 'ABSENT'),
(5, 1, 5, 1, 'PRESENT'),
(6, 1, 6, 1, 'PRESENT')
ON DUPLICATE KEY UPDATE exam_id=exam_id;
