-- =============================================================================
-- SMART EXAM HALL SEATING ARRANGEMENT SYSTEM - DATABASE DDL SCRIPT
-- Compatible with MySQL 8.x / 9.x
-- =============================================================================

CREATE DATABASE IF NOT EXISTS exam_seating_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE exam_seating_db;

-- -----------------------------------------------------------------------------
-- Table 1: users
-- Stores authentication credentials, system roles, and account status.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'FACULTY', 'STUDENT') NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_username (username),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 2: students
-- Academic details of students enrolled in the institution.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    register_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    year INT NOT NULL,
    section VARCHAR(10) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    user_id BIGINT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_students_reg_no (register_number),
    INDEX idx_students_branch_year (branch, year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 3: faculty
-- Academic and invigilation faculty records.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    user_id BIGINT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_faculty_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_faculty_emp_id (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 4: halls
-- Examination hall master with layout dimensions and capacity.
-- Note: 'rows_count' and 'columns_count' avoid SQL reserved words 'rows'/'columns'.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS halls (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hall_number VARCHAR(50) NOT NULL UNIQUE,
    building VARCHAR(100) NOT NULL,
    floor INT NOT NULL,
    rows_count INT NOT NULL,
    columns_count INT NOT NULL,
    capacity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_halls_number (hall_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 5: seats
-- Physical seat locations within a specific hall.
-- Constraint 1: (hall_id, row_number, column_number) ensures no two seats share the same grid position.
-- Constraint 2: (hall_id, seat_number) ensures unique seat labels per hall.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hall_id BIGINT NOT NULL,
    `row_number` INT NOT NULL,
    `column_number` INT NOT NULL,
    seat_number VARCHAR(20) NOT NULL,
    status ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
    CONSTRAINT fk_seats_hall FOREIGN KEY (hall_id) REFERENCES halls (id) ON DELETE CASCADE,
    CONSTRAINT uk_seat_hall_grid UNIQUE (hall_id, `row_number`, `column_number`),
    CONSTRAINT uk_seat_hall_number UNIQUE (hall_id, seat_number),
    INDEX idx_seats_hall (hall_id),
    INDEX idx_seats_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 6: exams
-- Scheduled examination sessions.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_name VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_exams_date (exam_date),
    INDEX idx_exams_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 7: exam_students
-- Junction table indicating which students are registered for which exam.
-- Constraint: Prevents duplicate student assignment to the same exam.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exam_students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    CONSTRAINT fk_exam_students_exam FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE,
    CONSTRAINT fk_exam_students_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
    CONSTRAINT uk_exam_student UNIQUE (exam_id, student_id),
    INDEX idx_exam_students_exam (exam_id),
    INDEX idx_exam_students_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 8: seating_arrangements
-- The core arrangement generated by the algorithm assigning a student to a seat in a hall for an exam.
-- Constraint 1: (exam_id, student_id) prevents duplicate student assignment in the same exam.
-- Constraint 2: (exam_id, seat_id) prevents duplicate seat assignment in the same exam.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seating_arrangements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    hall_id BIGINT NOT NULL,
    seat_id BIGINT NOT NULL,
    arrangement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_arrangement_exam FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE,
    CONSTRAINT fk_arrangement_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
    CONSTRAINT fk_arrangement_hall FOREIGN KEY (hall_id) REFERENCES halls (id) ON DELETE CASCADE,
    CONSTRAINT fk_arrangement_seat FOREIGN KEY (seat_id) REFERENCES seats (id) ON DELETE CASCADE,
    CONSTRAINT uk_arrangement_exam_student UNIQUE (exam_id, student_id),
    CONSTRAINT uk_arrangement_exam_seat UNIQUE (exam_id, seat_id),
    INDEX idx_arrangement_exam (exam_id),
    INDEX idx_arrangement_student (student_id),
    INDEX idx_arrangement_hall (hall_id),
    INDEX idx_arrangement_seat (seat_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table 9: attendance
-- Records student attendance for an examination in their allocated hall.
-- Constraint: Exactly one attendance record per student per exam.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS attendance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    hall_id BIGINT NOT NULL,
    status ENUM('PRESENT', 'ABSENT', 'MALPRACTICE') NOT NULL DEFAULT 'ABSENT',
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendance_exam FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_hall FOREIGN KEY (hall_id) REFERENCES halls (id) ON DELETE CASCADE,
    CONSTRAINT uk_attendance_exam_student UNIQUE (exam_id, student_id),
    INDEX idx_attendance_exam (exam_id),
    INDEX idx_attendance_student (student_id),
    INDEX idx_attendance_hall (hall_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
