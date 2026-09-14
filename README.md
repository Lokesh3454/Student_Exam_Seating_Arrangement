# 🎓 Smart Exam Seating Arrangement System

An enterprise-grade, automated examination seating allocation, faculty invigilation management, real-time hall attendance, and malpractice incident tracking system.

---

## 🌟 Key Features

### 1. 🧠 Intelligent Seating Arrangement Engine
- **Constraint-Satisfaction Algorithm**: Automatically arranges students across examination halls to prevent cheating.
- **Anti-Neighbor Logic**: Ensures adjacent seats (left, right, front, back) do not have students from the same department, branch, or semester.
- **Dynamic Hall Layouts**: Supports arbitrary hall grid configurations with customized rows, columns, and bench capacities.
- **Visual Seating Matrix**: Interactive grid display with color-coded branches, candidate metadata, and printable seating charts.

### 2. 👥 Candidate & Hall Management
- **Bulk CSV Import**: Import hundreds of students, hall definitions, and exam schedules with validation and rollback on error.
- **Branch & Department Isolation**: Supports CSE, ECE, MECH, CIVIL, IT, and more.
- **Seat Capacity Tracking**: Live calculation of available vs occupied desks per hall and campus block.

### 3. 👨‍🏫 Faculty Invigilation & Roster
- **Invigilator Allocation**: Assign faculty members to exam halls with automated double-booking and schedule conflict detection.
- **Faculty Dashboard**: Personalized duty roster showing upcoming exam duties, hall assignments, and enrolled student counts.

### 4. 📋 Hall View & Live Attendance
- **Desk-by-Desk Register**: Hall invigilators can toggle individual student attendance (`PRESENT` / `ABSENT`) with custom remarks.
- **Batch Actions**: Quick "Mark All Present" toggle and real-time attendance percentage counter.
- **Printable Hall Attendance Sheets**: Official format for signing and physical record-keeping.

### 5. ⚠️ Malpractice Incident Reporting
- **Incident Logging**: Record exam malpractice events with student details, invigilator notes, proof references, and timestamps.
- **Status Workflow**: Tracks incidents from reporting through review and disciplinary action.

### 6. 📊 Examination Intelligence & Reports
- **Exam-wise Reports**: Total candidates, hall utilization rate, and overall attendance statistics.
- **Hall-wise Reports**: Detailed desk occupancy breakdowns and invigilator logs.
- **Student-wise Reports**: Searchable candidate timetable, allocated hall, seat number, and historical attendance.
- **Export & Print**: Clean, formatted print layouts for all reports.

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.x (Java 17+)
- **Security**: Spring Security with JWT (JSON Web Tokens) & Role-Based Access Control (`ADMIN`, `FACULTY`, `STUDENT`)
- **Persistence**: Spring Data JPA / Hibernate
- **Database**: H2 in-memory database (pre-configured for instant setup and testing; compatible with MySQL / PostgreSQL)
- **Build Tool**: Maven (`mvnw`)

### Frontend
- **Framework**: Angular 17+ (Standalone Components, TypeScript)
- **Styling**: Vanilla CSS Design System with custom dark/light theme tokens, responsive layouts, glassmorphism, and micro-animations
- **Routing**: Angular Router with Auth & Role Guards
- **HTTP**: HttpClient with JWT Bearer Interceptor

---

## 🚀 Getting Started

### Prerequisites
- **Java**: JDK 17 or higher
- **Node.js**: v18 or higher (LTS recommended)
- **npm**: v9 or higher
- **Git**

---

### 1. Running the Backend

```bash
cd backend
# On Windows:
.\mvnw.cmd spring-boot:run

# On Linux/macOS:
./mvnw spring-boot:run
```
The Spring Boot backend will start on: **`http://localhost:8080`**  
H2 Console available at: **`http://localhost:8080/h2-console`**

---

### 2. Running the Frontend

```bash
cd frontend
npm install
npm start
# or: npx ng serve
```
The Angular web application will be accessible at: **`http://localhost:4200`**

---

## 📂 Project Structure

```text
smart-exam-seating-system/
├── backend/
│   ├── src/main/java/com/exam/seating/
│   │   ├── config/          # Security, JWT, CORS configuration
│   │   ├── controller/      # REST API endpoints (Auth, Exam, Hall, Seating, Faculty, Attendance, Reports, Incidents)
│   │   ├── dto/             # Request & Response Data Transfer Objects
│   │   ├── entity/          # JPA Entities (User, Student, Exam, Hall, SeatingArrangement, Attendance, FacultyAssignment, MalpracticeIncident)
│   │   ├── repository/      # Spring Data JPA Repositories
│   │   └── service/         # Business logic & seating algorithm implementations
│   ├── src/test/java/       # Comprehensive unit and integration tests
│   └── pom.xml              # Maven dependencies
├── frontend/
│   ├── src/app/
│   │   ├── attendance/      # Live Hall View & Attendance Register
│   │   ├── auth/            # Login, Registration & Auth Guards
│   │   ├── dashboard/       # Admin & Student Dashboards
│   │   ├── exams/           # Exam scheduling & management
│   │   ├── faculty/         # Faculty roster & duty assignments
│   │   ├── halls/           # Hall layout & capacity management
│   │   ├── malpractice/     # Malpractice incident reporting
│   │   ├── reports/         # 4-in-1 Examination Intelligence reports
│   │   ├── seating/         # Seating generation & interactive matrix grid
│   │   └── students/        # Student directory & bulk CSV import
│   └── package.json
├── sample_bulk_data/        # Sample CSV files for students, halls, and exams
└── README.md
```

---

## 📄 License
This project is licensed under the MIT License.
