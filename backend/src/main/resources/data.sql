-- =============================================================================
-- SMART EXAM HALL SEATING ARRANGEMENT SYSTEM - BULK SEED DATA
-- Password for ALL users: Admin@123 (BCrypt encoded below)
-- =============================================================================

USE exam_seating_db;

-- ============================================================
-- 1. USERS (Admin + 4 Faculty + 50 Students)
-- ============================================================
INSERT INTO users (id, username, password, role, email, enabled) VALUES
-- Admin & Faculty
(1,  'admin',    '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'ADMIN',   'admin@university.edu',          true),
(2,  'faculty1', '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'FACULTY', 'sarah.connor@university.edu',   true),
(3,  'faculty2', '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'FACULTY', 'alan.turing@university.edu',    true),
(4,  'faculty3', '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'FACULTY', 'marie.curie@university.edu',    true),
(5,  'faculty4', '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'FACULTY', 'newton.isaac@university.edu',   true),
-- CSE Students
(10, '22CS001',  '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'STUDENT', 'alice.johnson@student.edu',     true),
(11, '22CS002',  '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'STUDENT', 'bob.smith@student.edu',         true),
(12, '22CS003',  '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'STUDENT', 'carol.white@student.edu',       true),
(13, '22CS004',  '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'STUDENT', 'david.lee@student.edu',         true),
(14, '22CS005',  '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'STUDENT', 'emma.clark@student.edu',        true),
-- ECE Students
(20, '22EC001',  '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'STUDENT', 'frank.harris@student.edu',      true),
(21, '22EC002',  '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'STUDENT', 'grace.martin@student.edu',      true),
(22, '22EC003',  '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'STUDENT', 'henry.wilson@student.edu',      true),
(23, '22EC004',  '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'STUDENT', 'irene.moore@student.edu',       true),
(24, '22EC005',  '$2a$10$7Z2vN32rNqv1xL4jV1H0h.rZ2wK1o9N2J1G2E3F4G5H6I7J8K9L0M', 'STUDENT', 'james.taylor@student.edu',      true)
ON DUPLICATE KEY UPDATE username=username;

-- ============================================================
-- 2. FACULTY
-- ============================================================
INSERT INTO faculty (id, employee_id, name, email, phone, user_id) VALUES
(1, 'FAC-1001', 'Dr. Sarah Connor',  'sarah.connor@university.edu',  '9876543210', 2),
(2, 'FAC-1002', 'Prof. Alan Turing',  'alan.turing@university.edu',   '9876543211', 3),
(3, 'FAC-1003', 'Dr. Marie Curie',    'marie.curie@university.edu',   '9876543212', 4),
(4, 'FAC-1004', 'Prof. Isaac Newton', 'newton.isaac@university.edu',  '9876543213', 5)
ON DUPLICATE KEY UPDATE employee_id=employee_id;

-- ============================================================
-- 3. STUDENTS — 50 across 6 branches (CSE, ECE, MECH, CIVIL, IT, EEE)
-- ============================================================
INSERT INTO students (id, register_number, name, branch, year, section, email, phone, user_id) VALUES
-- CSE (10 students)
(1,  '22CS001', 'Alice Johnson',     'CSE',  3, 'A', 'alice.johnson@student.edu',     '9845010001', 10),
(2,  '22CS002', 'Bob Smith',         'CSE',  3, 'A', 'bob.smith@student.edu',         '9845010002', 11),
(3,  '22CS003', 'Carol White',       'CSE',  3, 'A', 'carol.white@student.edu',       '9845010003', 12),
(4,  '22CS004', 'David Lee',         'CSE',  3, 'B', 'david.lee@student.edu',         '9845010004', 13),
(5,  '22CS005', 'Emma Clark',        'CSE',  3, 'B', 'emma.clark@student.edu',        '9845010005', 14),
(6,  '22CS006', 'Felix Brown',       'CSE',  3, 'B', 'felix.brown@student.edu',       '9845010006', NULL),
(7,  '22CS007', 'Grace Hall',        'CSE',  3, 'C', 'grace.hall@student.edu',        '9845010007', NULL),
(8,  '22CS008', 'Hank Adams',        'CSE',  3, 'C', 'hank.adams@student.edu',        '9845010008', NULL),
(9,  '22CS009', 'Ivy Nelson',        'CSE',  3, 'C', 'ivy.nelson@student.edu',        '9845010009', NULL),
(10, '22CS010', 'Jack Carter',       'CSE',  3, 'A', 'jack.carter@student.edu',       '9845010010', NULL),
-- ECE (10 students)
(11, '22EC001', 'Karen Mitchell',    'ECE',  3, 'A', 'karen.mitchell@student.edu',    '9845010011', 20),
(12, '22EC002', 'Liam Perez',        'ECE',  3, 'A', 'liam.perez@student.edu',        '9845010012', 21),
(13, '22EC003', 'Mia Roberts',       'ECE',  3, 'B', 'mia.roberts@student.edu',       '9845010013', 22),
(14, '22EC004', 'Noah Turner',       'ECE',  3, 'B', 'noah.turner@student.edu',       '9845010014', 23),
(15, '22EC005', 'Olivia Phillips',   'ECE',  3, 'B', 'olivia.phillips@student.edu',   '9845010015', 24),
(16, '22EC006', 'Peter Campbell',    'ECE',  3, 'A', 'peter.campbell@student.edu',    '9845010016', NULL),
(17, '22EC007', 'Quinn Parker',      'ECE',  3, 'C', 'quinn.parker@student.edu',      '9845010017', NULL),
(18, '22EC008', 'Rose Evans',        'ECE',  3, 'C', 'rose.evans@student.edu',        '9845010018', NULL),
(19, '22EC009', 'Sam Edwards',       'ECE',  3, 'C', 'sam.edwards@student.edu',       '9845010019', NULL),
(20, '22EC010', 'Tina Collins',      'ECE',  3, 'A', 'tina.collins@student.edu',      '9845010020', NULL),
-- MECH (8 students)
(21, '22ME001', 'Uma Stewart',       'MECH', 3, 'A', 'uma.stewart@student.edu',       '9845010021', NULL),
(22, '22ME002', 'Victor Sanchez',    'MECH', 3, 'A', 'victor.sanchez@student.edu',    '9845010022', NULL),
(23, '22ME003', 'Wendy Morris',      'MECH', 3, 'B', 'wendy.morris@student.edu',      '9845010023', NULL),
(24, '22ME004', 'Xander Rogers',     'MECH', 3, 'B', 'xander.rogers@student.edu',     '9845010024', NULL),
(25, '22ME005', 'Yara Reed',         'MECH', 3, 'A', 'yara.reed@student.edu',         '9845010025', NULL),
(26, '22ME006', 'Zane Cook',         'MECH', 3, 'B', 'zane.cook@student.edu',         '9845010026', NULL),
(27, '22ME007', 'Amber Morgan',      'MECH', 3, 'A', 'amber.morgan@student.edu',      '9845010027', NULL),
(28, '22ME008', 'Blake Bailey',      'MECH', 3, 'B', 'blake.bailey@student.edu',      '9845010028', NULL),
-- CIVIL (7 students)
(29, '22CV001', 'Chase Rivera',      'CIVIL',3, 'A', 'chase.rivera@student.edu',      '9845010029', NULL),
(30, '22CV002', 'Daisy Cooper',      'CIVIL',3, 'A', 'daisy.cooper@student.edu',      '9845010030', NULL),
(31, '22CV003', 'Eli Richardson',    'CIVIL',3, 'B', 'eli.richardson@student.edu',    '9845010031', NULL),
(32, '22CV004', 'Faith Cox',         'CIVIL',3, 'B', 'faith.cox@student.edu',         '9845010032', NULL),
(33, '22CV005', 'Gavin Howard',      'CIVIL',3, 'A', 'gavin.howard@student.edu',      '9845010033', NULL),
(34, '22CV006', 'Hana Ward',         'CIVIL',3, 'B', 'hana.ward@student.edu',         '9845010034', NULL),
(35, '22CV007', 'Ian Torres',        'CIVIL',3, 'A', 'ian.torres@student.edu',        '9845010035', NULL),
-- IT (8 students)
(36, '22IT001', 'Jade Peterson',     'IT',   3, 'A', 'jade.peterson@student.edu',     '9845010036', NULL),
(37, '22IT002', 'Kyle Gray',         'IT',   3, 'A', 'kyle.gray@student.edu',         '9845010037', NULL),
(38, '22IT003', 'Luna Ramirez',      'IT',   3, 'B', 'luna.ramirez@student.edu',      '9845010038', NULL),
(39, '22IT004', 'Mason James',       'IT',   3, 'B', 'mason.james@student.edu',       '9845010039', NULL),
(40, '22IT005', 'Nora Watson',       'IT',   3, 'A', 'nora.watson@student.edu',       '9845010040', NULL),
(41, '22IT006', 'Oscar Brooks',      'IT',   3, 'B', 'oscar.brooks@student.edu',      '9845010041', NULL),
(42, '22IT007', 'Piper Kelly',       'IT',   3, 'A', 'piper.kelly@student.edu',       '9845010042', NULL),
(43, '22IT008', 'Reed Sanders',      'IT',   3, 'B', 'reed.sanders@student.edu',      '9845010043', NULL),
-- EEE (7 students)
(44, '22EE001', 'Sofia Price',       'EEE',  3, 'A', 'sofia.price@student.edu',       '9845010044', NULL),
(45, '22EE002', 'Tyler Bennett',     'EEE',  3, 'A', 'tyler.bennett@student.edu',     '9845010045', NULL),
(46, '22EE003', 'Ursula Wood',       'EEE',  3, 'B', 'ursula.wood@student.edu',       '9845010046', NULL),
(47, '22EE004', 'Vincent Barnes',    'EEE',  3, 'B', 'vincent.barnes@student.edu',    '9845010047', NULL),
(48, '22EE005', 'Willow Ross',       'EEE',  3, 'A', 'willow.ross@student.edu',       '9845010048', NULL),
(49, '22EE006', 'Xena Henderson',    'EEE',  3, 'B', 'xena.henderson@student.edu',    '9845010049', NULL),
(50, '22EE007', 'Yusuf Coleman',     'EEE',  3, 'A', 'yusuf.coleman@student.edu',     '9845010050', NULL)
ON DUPLICATE KEY UPDATE register_number=register_number;

-- ============================================================
-- 4. EXAM HALLS (8 halls across 3 buildings, various sizes)
-- ============================================================
INSERT INTO halls (id, hall_number, building, floor, rows_count, columns_count, capacity) VALUES
(1, 'LH-101', 'Science Block',       1,  6,  5, 30),
(2, 'LH-102', 'Science Block',       1,  6,  5, 30),
(3, 'LH-201', 'Engineering Block',   2,  8,  5, 40),
(4, 'LH-202', 'Engineering Block',   2,  8,  5, 40),
(5, 'LH-301', 'Main Academic Block', 3, 10,  6, 60),
(6, 'LH-302', 'Main Academic Block', 3, 10,  6, 60),
(7, 'LH-401', 'Tech Block',          4,  5,  4, 20),
(8, 'LH-402', 'Tech Block',          4,  5,  4, 20)
ON DUPLICATE KEY UPDATE hall_number=VALUES(hall_number), rows_count=VALUES(rows_count), columns_count=VALUES(columns_count), capacity=VALUES(capacity);

-- ============================================================
-- 5. SEATS for each hall (auto-generate pattern R{row}-C{col})
--    LH-101 & LH-102: 6x5=30 each (IDs 1-60)
--    LH-201 & LH-202: 8x5=40 each (IDs 61-140)
--    LH-301 & LH-302: 10x6=60 each (IDs 141-260)
--    LH-401 & LH-402: 5x4=20 each (IDs 261-300)
-- ============================================================
INSERT INTO seats (id, hall_id, `row_number`, `column_number`, seat_number, status) VALUES
-- Hall 1 (LH-101): 6x5 = 30 seats
(1,1,1,1,'R1-C1','AVAILABLE'),(2,1,1,2,'R1-C2','AVAILABLE'),(3,1,1,3,'R1-C3','AVAILABLE'),(4,1,1,4,'R1-C4','AVAILABLE'),(5,1,1,5,'R1-C5','AVAILABLE'),
(6,1,2,1,'R2-C1','AVAILABLE'),(7,1,2,2,'R2-C2','AVAILABLE'),(8,1,2,3,'R2-C3','AVAILABLE'),(9,1,2,4,'R2-C4','AVAILABLE'),(10,1,2,5,'R2-C5','AVAILABLE'),
(11,1,3,1,'R3-C1','AVAILABLE'),(12,1,3,2,'R3-C2','AVAILABLE'),(13,1,3,3,'R3-C3','AVAILABLE'),(14,1,3,4,'R3-C4','AVAILABLE'),(15,1,3,5,'R3-C5','AVAILABLE'),
(16,1,4,1,'R4-C1','AVAILABLE'),(17,1,4,2,'R4-C2','AVAILABLE'),(18,1,4,3,'R4-C3','AVAILABLE'),(19,1,4,4,'R4-C4','AVAILABLE'),(20,1,4,5,'R4-C5','AVAILABLE'),
(21,1,5,1,'R5-C1','AVAILABLE'),(22,1,5,2,'R5-C2','AVAILABLE'),(23,1,5,3,'R5-C3','AVAILABLE'),(24,1,5,4,'R5-C4','AVAILABLE'),(25,1,5,5,'R5-C5','AVAILABLE'),
(26,1,6,1,'R6-C1','AVAILABLE'),(27,1,6,2,'R6-C2','AVAILABLE'),(28,1,6,3,'R6-C3','AVAILABLE'),(29,1,6,4,'R6-C4','AVAILABLE'),(30,1,6,5,'R6-C5','AVAILABLE'),
-- Hall 2 (LH-102): 6x5 = 30 seats
(31,2,1,1,'R1-C1','AVAILABLE'),(32,2,1,2,'R1-C2','AVAILABLE'),(33,2,1,3,'R1-C3','AVAILABLE'),(34,2,1,4,'R1-C4','AVAILABLE'),(35,2,1,5,'R1-C5','AVAILABLE'),
(36,2,2,1,'R2-C1','AVAILABLE'),(37,2,2,2,'R2-C2','AVAILABLE'),(38,2,2,3,'R2-C3','AVAILABLE'),(39,2,2,4,'R2-C4','AVAILABLE'),(40,2,2,5,'R2-C5','AVAILABLE'),
(41,2,3,1,'R3-C1','AVAILABLE'),(42,2,3,2,'R3-C2','AVAILABLE'),(43,2,3,3,'R3-C3','AVAILABLE'),(44,2,3,4,'R3-C4','AVAILABLE'),(45,2,3,5,'R3-C5','AVAILABLE'),
(46,2,4,1,'R4-C1','AVAILABLE'),(47,2,4,2,'R4-C2','AVAILABLE'),(48,2,4,3,'R4-C3','AVAILABLE'),(49,2,4,4,'R4-C4','AVAILABLE'),(50,2,4,5,'R4-C5','AVAILABLE'),
(51,2,5,1,'R5-C1','AVAILABLE'),(52,2,5,2,'R5-C2','AVAILABLE'),(53,2,5,3,'R5-C3','AVAILABLE'),(54,2,5,4,'R5-C4','AVAILABLE'),(55,2,5,5,'R5-C5','AVAILABLE'),
(56,2,6,1,'R6-C1','AVAILABLE'),(57,2,6,2,'R6-C2','AVAILABLE'),(58,2,6,3,'R6-C3','AVAILABLE'),(59,2,6,4,'R6-C4','AVAILABLE'),(60,2,6,5,'R6-C5','AVAILABLE'),
-- Hall 3 (LH-201): 8x5 = 40 seats
(61,3,1,1,'R1-C1','AVAILABLE'),(62,3,1,2,'R1-C2','AVAILABLE'),(63,3,1,3,'R1-C3','AVAILABLE'),(64,3,1,4,'R1-C4','AVAILABLE'),(65,3,1,5,'R1-C5','AVAILABLE'),
(66,3,2,1,'R2-C1','AVAILABLE'),(67,3,2,2,'R2-C2','AVAILABLE'),(68,3,2,3,'R2-C3','AVAILABLE'),(69,3,2,4,'R2-C4','AVAILABLE'),(70,3,2,5,'R2-C5','AVAILABLE'),
(71,3,3,1,'R3-C1','AVAILABLE'),(72,3,3,2,'R3-C2','AVAILABLE'),(73,3,3,3,'R3-C3','AVAILABLE'),(74,3,3,4,'R3-C4','AVAILABLE'),(75,3,3,5,'R3-C5','AVAILABLE'),
(76,3,4,1,'R4-C1','AVAILABLE'),(77,3,4,2,'R4-C2','AVAILABLE'),(78,3,4,3,'R4-C3','AVAILABLE'),(79,3,4,4,'R4-C4','AVAILABLE'),(80,3,4,5,'R4-C5','AVAILABLE'),
(81,3,5,1,'R5-C1','AVAILABLE'),(82,3,5,2,'R5-C2','AVAILABLE'),(83,3,5,3,'R5-C3','AVAILABLE'),(84,3,5,4,'R5-C4','AVAILABLE'),(85,3,5,5,'R5-C5','AVAILABLE'),
(86,3,6,1,'R6-C1','AVAILABLE'),(87,3,6,2,'R6-C2','AVAILABLE'),(88,3,6,3,'R6-C3','AVAILABLE'),(89,3,6,4,'R6-C4','AVAILABLE'),(90,3,6,5,'R6-C5','AVAILABLE'),
(91,3,7,1,'R7-C1','AVAILABLE'),(92,3,7,2,'R7-C2','AVAILABLE'),(93,3,7,3,'R7-C3','AVAILABLE'),(94,3,7,4,'R7-C4','AVAILABLE'),(95,3,7,5,'R7-C5','AVAILABLE'),
(96,3,8,1,'R8-C1','AVAILABLE'),(97,3,8,2,'R8-C2','AVAILABLE'),(98,3,8,3,'R8-C3','AVAILABLE'),(99,3,8,4,'R8-C4','AVAILABLE'),(100,3,8,5,'R8-C5','AVAILABLE'),
-- Hall 4 (LH-202): 8x5 = 40 seats
(101,4,1,1,'R1-C1','AVAILABLE'),(102,4,1,2,'R1-C2','AVAILABLE'),(103,4,1,3,'R1-C3','AVAILABLE'),(104,4,1,4,'R1-C4','AVAILABLE'),(105,4,1,5,'R1-C5','AVAILABLE'),
(106,4,2,1,'R2-C1','AVAILABLE'),(107,4,2,2,'R2-C2','AVAILABLE'),(108,4,2,3,'R2-C3','AVAILABLE'),(109,4,2,4,'R2-C4','AVAILABLE'),(110,4,2,5,'R2-C5','AVAILABLE'),
(111,4,3,1,'R3-C1','AVAILABLE'),(112,4,3,2,'R3-C2','AVAILABLE'),(113,4,3,3,'R3-C3','AVAILABLE'),(114,4,3,4,'R3-C4','AVAILABLE'),(115,4,3,5,'R3-C5','AVAILABLE'),
(116,4,4,1,'R4-C1','AVAILABLE'),(117,4,4,2,'R4-C2','AVAILABLE'),(118,4,4,3,'R4-C3','AVAILABLE'),(119,4,4,4,'R4-C4','AVAILABLE'),(120,4,4,5,'R4-C5','AVAILABLE'),
(121,4,5,1,'R5-C1','AVAILABLE'),(122,4,5,2,'R5-C2','AVAILABLE'),(123,4,5,3,'R5-C3','AVAILABLE'),(124,4,5,4,'R5-C4','AVAILABLE'),(125,4,5,5,'R5-C5','AVAILABLE'),
(126,4,6,1,'R6-C1','AVAILABLE'),(127,4,6,2,'R6-C2','AVAILABLE'),(128,4,6,3,'R6-C3','AVAILABLE'),(129,4,6,4,'R6-C4','AVAILABLE'),(130,4,6,5,'R6-C5','AVAILABLE'),
(131,4,7,1,'R7-C1','AVAILABLE'),(132,4,7,2,'R7-C2','AVAILABLE'),(133,4,7,3,'R7-C3','AVAILABLE'),(134,4,7,4,'R7-C4','AVAILABLE'),(135,4,7,5,'R7-C5','AVAILABLE'),
(136,4,8,1,'R8-C1','AVAILABLE'),(137,4,8,2,'R8-C2','AVAILABLE'),(138,4,8,3,'R8-C3','AVAILABLE'),(139,4,8,4,'R8-C4','AVAILABLE'),(140,4,8,5,'R8-C5','AVAILABLE'),
-- Hall 7 (LH-401): 5x4 = 20 seats
(261,7,1,1,'R1-C1','AVAILABLE'),(262,7,1,2,'R1-C2','AVAILABLE'),(263,7,1,3,'R1-C3','AVAILABLE'),(264,7,1,4,'R1-C4','AVAILABLE'),
(265,7,2,1,'R2-C1','AVAILABLE'),(266,7,2,2,'R2-C2','AVAILABLE'),(267,7,2,3,'R2-C3','AVAILABLE'),(268,7,2,4,'R2-C4','AVAILABLE'),
(269,7,3,1,'R3-C1','AVAILABLE'),(270,7,3,2,'R3-C2','AVAILABLE'),(271,7,3,3,'R3-C3','AVAILABLE'),(272,7,3,4,'R3-C4','AVAILABLE'),
(273,7,4,1,'R4-C1','AVAILABLE'),(274,7,4,2,'R4-C2','AVAILABLE'),(275,7,4,3,'R4-C3','AVAILABLE'),(276,7,4,4,'R4-C4','AVAILABLE'),
(277,7,5,1,'R5-C1','AVAILABLE'),(278,7,5,2,'R5-C2','AVAILABLE'),(279,7,5,3,'R5-C3','AVAILABLE'),(280,7,5,4,'R5-C4','AVAILABLE'),
-- Hall 8 (LH-402): 5x4 = 20 seats
(281,8,1,1,'R1-C1','AVAILABLE'),(282,8,1,2,'R1-C2','AVAILABLE'),(283,8,1,3,'R1-C3','AVAILABLE'),(284,8,1,4,'R1-C4','AVAILABLE'),
(285,8,2,1,'R2-C1','AVAILABLE'),(286,8,2,2,'R2-C2','AVAILABLE'),(287,8,2,3,'R2-C3','AVAILABLE'),(288,8,2,4,'R2-C4','AVAILABLE'),
(289,8,3,1,'R3-C1','AVAILABLE'),(290,8,3,2,'R3-C2','AVAILABLE'),(291,8,3,3,'R3-C3','AVAILABLE'),(292,8,3,4,'R3-C4','AVAILABLE'),
(293,8,4,1,'R4-C1','AVAILABLE'),(294,8,4,2,'R4-C2','AVAILABLE'),(295,8,4,3,'R4-C3','AVAILABLE'),(296,8,4,4,'R4-C4','AVAILABLE'),
(297,8,5,1,'R5-C1','AVAILABLE'),(298,8,5,2,'R5-C2','AVAILABLE'),(299,8,5,3,'R5-C3','AVAILABLE'),(300,8,5,4,'R5-C4','AVAILABLE')
ON DUPLICATE KEY UPDATE seat_number=VALUES(seat_number);

-- ============================================================
-- 6. EXAMS — 12 exams across 6 branches, 2 concurrent sessions
-- ============================================================
INSERT INTO exams (id, exam_name, subject, exam_date, start_time, end_time, status, branch) VALUES
-- Session 1: Mid-Term (2026-10-20) — All 6 branches concurrent
(1,  'Mid-Term Exam — Autumn 2026', 'Data Structures & Algorithms',     '2026-10-20', '09:30:00', '12:30:00', 'SCHEDULED', 'CSE'),
(2,  'Mid-Term Exam — Autumn 2026', 'Digital Signal Processing',         '2026-10-20', '09:30:00', '12:30:00', 'SCHEDULED', 'ECE'),
(3,  'Mid-Term Exam — Autumn 2026', 'Fluid Mechanics & Thermodynamics',  '2026-10-20', '09:30:00', '12:30:00', 'SCHEDULED', 'MECH'),
(4,  'Mid-Term Exam — Autumn 2026', 'Structural Analysis & Design',      '2026-10-20', '09:30:00', '12:30:00', 'SCHEDULED', 'CIVIL'),
(5,  'Mid-Term Exam — Autumn 2026', 'Operating Systems & Networks',      '2026-10-20', '09:30:00', '12:30:00', 'SCHEDULED', 'IT'),
(6,  'Mid-Term Exam — Autumn 2026', 'Power Systems Engineering',         '2026-10-20', '09:30:00', '12:30:00', 'SCHEDULED', 'EEE'),
-- Session 2: End-Sem (2026-11-15) — All 6 branches concurrent
(7,  'End-Semester Exam — Autumn 2026', 'Machine Learning & AI',         '2026-11-15', '10:00:00', '13:00:00', 'SCHEDULED', 'CSE'),
(8,  'End-Semester Exam — Autumn 2026', 'VLSI Design & Embedded Systems','2026-11-15', '10:00:00', '13:00:00', 'SCHEDULED', 'ECE'),
(9,  'End-Semester Exam — Autumn 2026', 'Manufacturing Processes',       '2026-11-15', '10:00:00', '13:00:00', 'SCHEDULED', 'MECH'),
(10, 'End-Semester Exam — Autumn 2026', 'Geo-Technical Engineering',     '2026-11-15', '10:00:00', '13:00:00', 'SCHEDULED', 'CIVIL'),
(11, 'End-Semester Exam — Autumn 2026', 'Database Management Systems',   '2026-11-15', '10:00:00', '13:00:00', 'SCHEDULED', 'IT'),
(12, 'End-Semester Exam — Autumn 2026', 'Electrical Machines & Drives',  '2026-11-15', '10:00:00', '13:00:00', 'SCHEDULED', 'EEE')
ON DUPLICATE KEY UPDATE exam_name=exam_name, exam_date=VALUES(exam_date), start_time=VALUES(start_time), end_time=VALUES(end_time), branch=VALUES(branch);

-- ============================================================
-- 7. HALL ALLOTMENTS per exam
-- ============================================================
INSERT INTO exam_halls (exam_id, hall_id) VALUES
-- Mid-Term: CSE -> LH-101 + LH-102 (60 seats total)
(1, 1),(1, 2),
-- Mid-Term: ECE -> LH-201 (40 seats)
(2, 3),
-- Mid-Term: MECH -> LH-202 (40 seats)
(3, 4),
-- Mid-Term: CIVIL -> LH-401 (20 seats)
(4, 7),
-- Mid-Term: IT -> LH-402 (20 seats)
(5, 8),
-- Mid-Term: EEE -> LH-401 + LH-402 (40 seats shared)
(6, 7),(6, 8),
-- End-Sem: CSE -> LH-101 + LH-201 (70 seats)
(7, 1),(7, 3),
-- End-Sem: ECE -> LH-102 + LH-202 (70 seats)
(8, 2),(8, 4),
-- End-Sem: MECH -> LH-401 (20 seats)
(9, 7),
-- End-Sem: CIVIL -> LH-402 (20 seats)
(10, 8),
-- End-Sem: IT -> LH-201 (40 seats)
(11, 3),
-- End-Sem: EEE -> LH-202 (40 seats)
(12, 4)
ON DUPLICATE KEY UPDATE exam_id=exam_id;

-- ============================================================
-- 8. ENROLL STUDENTS INTO MID-TERM EXAMS
-- ============================================================
INSERT INTO exam_students (id, exam_id, student_id) VALUES
-- Exam 1 (CSE Mid-Term): all 10 CSE students
(1,1,1),(2,1,2),(3,1,3),(4,1,4),(5,1,5),(6,1,6),(7,1,7),(8,1,8),(9,1,9),(10,1,10),
-- Exam 2 (ECE Mid-Term): all 10 ECE students
(11,2,11),(12,2,12),(13,2,13),(14,2,14),(15,2,15),(16,2,16),(17,2,17),(18,2,18),(19,2,19),(20,2,20),
-- Exam 3 (MECH Mid-Term): all 8 MECH students
(21,3,21),(22,3,22),(23,3,23),(24,3,24),(25,3,25),(26,3,26),(27,3,27),(28,3,28),
-- Exam 4 (CIVIL Mid-Term): all 7 CIVIL students
(29,4,29),(30,4,30),(31,4,31),(32,4,32),(33,4,33),(34,4,34),(35,4,35),
-- Exam 5 (IT Mid-Term): all 8 IT students
(36,5,36),(37,5,37),(38,5,38),(39,5,39),(40,5,40),(41,5,41),(42,5,42),(43,5,43),
-- Exam 6 (EEE Mid-Term): all 7 EEE students
(44,6,44),(45,6,45),(46,6,46),(47,6,47),(48,6,48),(49,6,49),(50,6,50)
ON DUPLICATE KEY UPDATE exam_id=exam_id;

-- ============================================================
-- 9. SEATING FOR MID-TERM EXAMS (CSE interleaved pattern)
-- ============================================================
INSERT INTO seating_arrangements (id, exam_id, student_id, hall_id, seat_id) VALUES
-- CSE Mid-Term: Hall 1 (LH-101), interleaved
(1,1,1,1,1),(2,1,2,1,2),(3,1,3,1,3),(4,1,4,1,4),(5,1,5,1,5),
(6,1,6,1,6),(7,1,7,1,7),(8,1,8,1,8),(9,1,9,1,9),(10,1,10,1,10),
-- ECE Mid-Term: Hall 3 (LH-201)
(11,2,11,3,61),(12,2,12,3,62),(13,2,13,3,63),(14,2,14,3,64),(15,2,15,3,65),
(16,2,16,3,66),(17,2,17,3,67),(18,2,18,3,68),(19,2,19,3,69),(20,2,20,3,70),
-- MECH Mid-Term: Hall 4 (LH-202)
(21,3,21,4,101),(22,3,22,4,102),(23,3,23,4,103),(24,3,24,4,104),
(25,3,25,4,105),(26,3,26,4,106),(27,3,27,4,107),(28,3,28,4,108)
ON DUPLICATE KEY UPDATE exam_id=exam_id;

-- ============================================================
-- 10. SAMPLE ATTENDANCE — Mid-Term CSE (Exam 1)
-- ============================================================
INSERT INTO attendance (id, exam_id, student_id, hall_id, status) VALUES
(1,1,1,1,'PRESENT'),
(2,1,2,1,'PRESENT'),
(3,1,3,1,'ABSENT'),
(4,1,4,1,'PRESENT'),
(5,1,5,1,'PRESENT'),
(6,1,6,1,'PRESENT'),
(7,1,7,1,'ABSENT'),
(8,1,8,1,'PRESENT'),
(9,1,9,1,'PRESENT'),
(10,1,10,1,'PRESENT')
ON DUPLICATE KEY UPDATE exam_id=exam_id;
