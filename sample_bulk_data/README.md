# Sample Bulk Data for Smart Examination Seating System

This directory contains realistic bulk CSV datasets prepared for testing large-scale imports, 5&times;3 hall capacity overflow, multi-branch concurrent exam sessions, and HOD departmental rosters.

---

## 1. Bulk Student Rosters (Individual Branches & Multi-Branch)

Every examination hall in the system uses a standard grid of **5 rows &times; 3 columns = 15 seats capacity**. When importing student batches exceeding 15 candidates, the seating engine automatically cascades candidates across multiple halls.

| File Name | Branch | Records | Target Capacity & Hall Cascade (15 seats/hall) |
| :--- | :---: | :---: | :--- |
| [`bulk_cse_candidates_50.csv`](./bulk_cse_candidates_50.csv) | **CSE** | **50 students** | Fills **LH-101** (15), **LH-102** (15), **LH-201** (15), and **LH-202** (5 overflow) |
| [`bulk_ece_candidates_45.csv`](./bulk_ece_candidates_45.csv) | **ECE** | **45 students** | Fills **LH-101** (15), **LH-201** (15), and **LH-301** (15) across 3 halls |
| [`bulk_mech_candidates_40.csv`](./bulk_mech_candidates_40.csv) | **MECH** | **40 students** | Fills **LH-201** (15), **LH-202** (15), and **LH-301** (10 overflow) across 3 halls |
| [`bulk_civil_candidates_35.csv`](./bulk_civil_candidates_35.csv) | **CIVIL** | **35 students** | Fills **LH-101** (15), **LH-102** (15), and **LH-301** (5 overflow) across 3 halls |
| [`bulk_multi_branch_all_branches_120.csv`](./bulk_multi_branch_all_branches_120.csv) | **ALL (CSE/ECE/MECH/CIVIL)** | **120 students** | 30 students per branch across 4 branches for concurrent session tests |

### Columns Format:
`registerNumber,name,branch,year,section,email,phone`

---

## 2. Bulk Examination Schedules

| File Name | Records | Description |
| :--- | :---: | :--- |
| [`bulk_upcoming_exams_schedule.csv`](./bulk_upcoming_exams_schedule.csv) | **12 exams** | 12 examinations across CSE, ECE, MECH, CIVIL scheduled across upcoming dates with allotted 5&times;3 halls. |

### Columns Format:
`examName,subject,examDate,startTime,endTime,status,branch,allottedHalls`

---

## 3. Bulk Examination Halls Configuration

| File Name | Records | Description |
| :--- | :---: | :--- |
| [`bulk_halls_configuration.csv`](./bulk_halls_configuration.csv) | **8 halls** | Halls LH-101, LH-102, LH-201, LH-202, LH-301, LH-302, LH-401, LH-402 (5 rows &times; 3 columns = 15 capacity each). |

### Columns Format:
`hallNumber,building,floor,rowsCount,columnsCount`

---

## Where to Import in the UI

1. **HOD Portal (`/hod/dashboard`)**:
   - Log in as any HOD (`hod_cse`, `hod_ece`, `hod_mech`, `hod_civil` / `hod123`).
   - Click **Import Department CSV** &rarr; Select your branch's file (e.g. `bulk_cse_candidates_50.csv`).
   - Watch the KPI counters (Total Students, Seating Allocated) update in real-time, inspect the 2D floor plans, and verify seating across cascading halls.

2. **Exam Students Page (`/exams/:id/students`)**:
   - Select an exam &rarr; Click **Import Branch Students CSV** &rarr; Select the branch roster.
   - The system validates branch alignment, registers candidates, and auto-generates seating across allotted halls with 5&times;3 capacity overflow.

3. **Concurrent Multi-Branch Import (`/exams` &rarr; Concurrent Tab)**:
   - Upload multiple branch files concurrently for a simultaneous session.

4. **Master Student Roster (`/students`)**:
   - Click **Import CSV** &rarr; Upload `bulk_multi_branch_all_branches_120.csv` to bulk-populate the entire university student directory.
