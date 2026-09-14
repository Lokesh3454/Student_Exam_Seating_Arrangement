import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../core/services/report.service';
import { ExamService } from '../core/services/exam.service';
import { HallService } from '../core/services/hall.service';
import { Exam } from '../core/models/exam.model';
import { Hall } from '../core/models/hall.model';
import {
  ExamWiseReport,
  HallWiseReport,
  StudentWiseReport,
  AttendanceReport
} from '../core/models/report.model';

type ReportTab = 'exam' | 'hall' | 'student' | 'attendance';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fade-in">
      <!-- Header -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3 d-print-none">
        <div>
          <h2 class="h4 fw-bold text-dark mb-1">Examination Reports & Audit Analytics</h2>
          <p class="text-secondary small mb-0">Auditable intelligence across examinations, hall capacities, student seating allocations, and attendance rates</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-danger d-flex align-items-center gap-2" (click)="downloadCurrentTabPdf()">
            <i class="bi bi-file-earmark-pdf-fill"></i>
            <span>Export Current Report PDF</span>
          </button>
          <button class="btn btn-outline-secondary d-flex align-items-center gap-2" (click)="printReport()">
            <i class="bi bi-printer-fill"></i>
            <span>Print Current Report</span>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="card border-0 shadow-sm rounded-4 mb-4 d-print-none">
        <div class="card-body p-2">
          <ul class="nav nav-pills nav-fill gap-2">
            <li class="nav-item">
              <button
                class="nav-link fw-semibold d-flex align-items-center justify-content-center gap-2 py-2"
                [class.active]="activeTab === 'exam'"
                (click)="switchTab('exam')"
              >
                <i class="bi bi-journal-bookmark-fill fs-5"></i>
                <span>1. Exam-wise Report</span>
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link fw-semibold d-flex align-items-center justify-content-center gap-2 py-2"
                [class.active]="activeTab === 'hall'"
                (click)="switchTab('hall')"
              >
                <i class="bi bi-building-fill fs-5"></i>
                <span>2. Hall-wise Report</span>
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link fw-semibold d-flex align-items-center justify-content-center gap-2 py-2"
                [class.active]="activeTab === 'student'"
                (click)="switchTab('student')"
              >
                <i class="bi bi-person-lines-fill fs-5"></i>
                <span>3. Student-wise Report</span>
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link fw-semibold d-flex align-items-center justify-content-center gap-2 py-2"
                [class.active]="activeTab === 'attendance'"
                (click)="switchTab('attendance')"
              >
                <i class="bi bi-pie-chart-fill fs-5"></i>
                <span>4. Attendance Report</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Universal Filters Bar: Exam, Date, Hall (Always Available) -->
      <div class="card border-0 shadow-sm rounded-4 mb-4 d-print-none">
        <div class="card-header bg-white py-3 border-0">
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <div class="bg-primary-subtle text-primary p-2 rounded-3">
                <i class="bi bi-funnel-fill"></i>
              </div>
              <div>
                <h6 class="mb-0 fw-bold">Filters (Exam &bull; Date &bull; Hall)</h6>
                <small class="text-secondary">Refine data across all reports</small>
              </div>
            </div>
            <button class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" *ngIf="filterExamId || filterDate || filterHallId" (click)="resetFilters()">
              <i class="bi bi-x-circle"></i>
              <span>Clear Filters</span>
            </button>
          </div>
        </div>
        <div class="card-body p-3 pt-0">
          <div class="row g-3 align-items-center">
            <!-- 1. Filter by Exam -->
            <div class="col-md-4">
              <label class="form-label small fw-semibold text-dark mb-1">Filter by Exam</label>
              <select class="form-select bg-light border-0 py-2" [(ngModel)]="filterExamId" (change)="onFilterChange()">
                <option [ngValue]="null">All Examinations</option>
                <option *ngFor="let ex of exams" [ngValue]="ex.id">
                  {{ ex.examName }} ({{ ex.subject }} - {{ ex.examDate }})
                </option>
              </select>
            </div>

            <!-- 2. Filter by Date -->
            <div class="col-md-4">
              <label class="form-label small fw-semibold text-dark mb-1">Filter by Date</label>
              <input type="date" class="form-control bg-light border-0 py-2" [(ngModel)]="filterDate" (change)="onFilterChange()" />
            </div>

            <!-- 3. Filter by Hall -->
            <div class="col-md-4">
              <label class="form-label small fw-semibold text-dark mb-1">Filter by Hall</label>
              <select class="form-select bg-light border-0 py-2" [(ngModel)]="filterHallId" (change)="onFilterChange()">
                <option [ngValue]="null">All Halls</option>
                <option *ngFor="let h of halls" [ngValue]="h.id">
                  Hall {{ h.hallNumber }} ({{ h.building }} - Cap: {{ h.capacity }})
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Feedback Alerts -->
      <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show rounded-3 shadow-sm d-print-none" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="p-5 text-center text-secondary">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 small mb-0">Generating report analytics...</p>
      </div>

      <!-- ========================================== -->
      <!-- TAB 1: EXAM-WISE REPORT                   -->
      <!-- ========================================== -->
      <div *ngIf="!isLoading && activeTab === 'exam'">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold text-dark mb-0">1. Exam-wise Summary Report</h5>
          <span class="badge bg-primary-subtle text-primary px-3 py-2 fs-6">
            {{ filteredExamReports.length }} Records Found
          </span>
        </div>

        <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="ps-4">Examination</th>
                  <th>Date & Time Slot</th>
                  <th class="text-center">Enrolled</th>
                  <th class="text-center">Seats Assigned</th>
                  <th class="text-center">Halls Used</th>
                  <th class="text-center">Attendance %</th>
                  <th class="text-end pe-4">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of filteredExamReports">
                  <td class="ps-4">
                    <div class="fw-bold text-dark">{{ r.examName }}</div>
                    <span class="badge bg-light text-dark border">{{ r.subject }}</span>
                  </td>
                  <td>
                    <div class="small fw-semibold text-dark"><i class="bi bi-calendar3 me-1 text-primary"></i>{{ r.examDate }}</div>
                    <div class="small text-muted"><i class="bi bi-clock me-1 text-secondary"></i>{{ r.timeSlot || (r.startTime + ' - ' + r.endTime) }}</div>
                  </td>
                  <td class="text-center">
                    <span class="badge bg-secondary-subtle text-secondary px-2 py-1 fs-6">{{ r.enrolledStudentsCount ?? r.totalEligibleStudents ?? 0 }}</span>
                  </td>
                  <td class="text-center">
                    <span class="badge bg-success-subtle text-success px-2 py-1 fs-6 fw-bold">{{ r.totalSeatsAssigned ?? r.totalAllocatedSeats ?? 0 }}</span>
                  </td>
                  <td class="text-center">
                    <span class="badge bg-info-subtle text-info-emphasis px-2 py-1 fs-6">{{ r.hallsUsedCount ?? r.totalHallsUsed ?? 0 }}</span>
                  </td>
                  <td class="text-center">
                    <span class="badge px-3 py-2 fw-semibold" [ngClass]="(r.attendancePercentage || 0) > 75 ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'">
                      {{ r.attendancePercentage || 0 }}%
                    </span>
                  </td>
                  <td class="text-end pe-4">
                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                      {{ r.status || 'SCHEDULED' }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="filteredExamReports.length === 0">
                  <td colspan="7" class="text-center py-4 text-muted">No exams match the current filter criteria.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 2: HALL-WISE REPORT                   -->
      <!-- Hall, Exam, Student count, Seat assignments -->
      <!-- ========================================== -->
      <div *ngIf="!isLoading && activeTab === 'hall'">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold text-dark mb-0">2. Hall-wise Seating Report</h5>
          <span class="badge bg-primary-subtle text-primary px-3 py-2 fs-6">
            {{ filteredHallReports.length }} Hall(s)
          </span>
        </div>

        <div *ngFor="let hr of filteredHallReports" class="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
          <div class="card-header bg-light py-3 border-0 d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-primary fs-6 px-3 py-2 font-monospace">Hall {{ hr.hallNumber }}</span>
              <span class="badge bg-secondary-subtle text-secondary">{{ hr.building }}</span>
              <span *ngIf="hr.examName" class="badge bg-light text-primary border">Exam: {{ hr.examName }}</span>
            </div>
            <div class="d-flex gap-2">
              <span class="badge bg-success-subtle text-success fs-6">Capacity: {{ hr.capacity }}</span>
              <span class="badge bg-info-subtle text-info fs-6">Student Count: {{ hr.studentCount ?? hr.totalSeatsOccupied ?? 0 }} ({{ hr.occupancyPercentage || 0 }}%)</span>
            </div>
          </div>

          <div class="card-body p-4">
            <!-- Assigned Invigilator -->
            <div class="mb-3" *ngIf="hr.assignedFacultyName">
              <span class="text-muted small fw-semibold d-block">Assigned Faculty:</span>
              <span class="fw-bold text-dark">
                <i class="bi bi-person-badge-fill me-1 text-warning"></i>
                {{ hr.assignedFacultyName }} <span class="badge bg-light text-secondary border ms-1">{{ hr.assignedFacultyEmpId }}</span>
              </span>
            </div>

            <!-- Seat Assignments: Hall, Exam, Student count, Seat assignments -->
            <h6 class="fw-bold text-dark mb-2 small text-uppercase" style="letter-spacing: 0.05em;">Seat Assignments</h6>
            <div *ngIf="hr.seatAssignments && hr.seatAssignments.length > 0" class="table-responsive">
              <table class="table table-sm table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Seat Number</th>
                    <th>Register Number</th>
                    <th>Student Name</th>
                    <th>Branch</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let s of hr.seatAssignments">
                    <td><span class="badge bg-primary font-monospace">{{ s.seatNumber }}</span></td>
                    <td><span class="badge bg-light text-primary border">{{ s.studentRegisterNumber }}</span></td>
                    <td class="fw-semibold text-dark">{{ s.studentName }}</td>
                    <td><span class="badge bg-secondary-subtle text-secondary">{{ s.branch }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p *ngIf="!hr.seatAssignments || hr.seatAssignments.length === 0" class="text-muted small mb-0">No active seat assignments in this hall.</p>
          </div>
        </div>

        <div *ngIf="filteredHallReports.length === 0" class="card border-0 shadow-sm rounded-4 py-5 text-center text-muted">
          <i class="bi bi-building-slash fs-1 opacity-50 d-block mb-2 text-secondary"></i>
          <p class="mb-0">No hall reports match the selected filters.</p>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 3: STUDENT-WISE REPORT                 -->
      <!-- Register Number, Name, Exam, Hall, Seat   -->
      <!-- ========================================== -->
      <div *ngIf="!isLoading && activeTab === 'student'">
        <!-- Keyword Search & Count -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <h5 class="fw-bold text-dark mb-0">3. Student-wise Allocation Report</h5>
          <div class="d-flex align-items-center gap-2">
            <div class="input-group input-group-sm" style="max-width: 280px;">
              <span class="input-group-text bg-light border-0"><i class="bi bi-search"></i></span>
              <input
                type="text"
                class="form-control bg-light border-0"
                placeholder="Search Reg No or Name..."
                [(ngModel)]="searchKeyword"
                (keyup)="onFilterChange()"
              />
            </div>
            <span class="badge bg-primary-subtle text-primary px-3 py-2 fs-6">
              {{ filteredStudentReports.length }} Records
            </span>
          </div>
        </div>

        <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th class="ps-4">Register Number</th>
                  <th>Name</th>
                  <th>Branch</th>
                  <th>Exam</th>
                  <th>Hall</th>
                  <th>Seat</th>
                  <th class="text-end pe-4">Attendance</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let sr of filteredStudentReports">
                  <td class="ps-4">
                    <span class="badge bg-light text-primary border font-monospace px-2 py-1 fs-6">{{ sr.registerNumber }}</span>
                  </td>
                  <td class="fw-bold text-dark">{{ sr.studentName }}</td>
                  <td>
                    <span class="badge bg-secondary-subtle text-secondary">{{ sr.branch }} (Yr {{ sr.year }})</span>
                  </td>
                  <td>
                    <div class="fw-semibold text-dark">{{ sr.examName }}</div>
                    <small class="text-muted">{{ sr.subject }} &bull; {{ sr.examDate }}</small>
                  </td>
                  <td>
                    <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle font-monospace">
                      Hall {{ sr.hallNumber }}
                    </span>
                    <small class="text-muted d-block">{{ sr.building }}</small>
                  </td>
                  <td>
                    <span class="badge bg-primary px-3 py-2 fw-bold font-monospace fs-6">
                      {{ sr.seatNumber || '-' }}
                    </span>
                  </td>
                  <td class="text-end pe-4">
                    <span class="badge px-3 py-2 fw-semibold" [ngClass]="sr.attendanceStatus === 'PRESENT' ? 'bg-success-subtle text-success border border-success-subtle' : (sr.attendanceStatus === 'ABSENT' ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle')">
                      {{ sr.attendanceStatus || 'PENDING' }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="filteredStudentReports.length === 0">
                  <td colspan="7" class="text-center py-4 text-muted">No student allocations match the current filters.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- TAB 4: ATTENDANCE REPORT                   -->
      <!-- Total students, Present, Absent, %        -->
      <!-- ========================================== -->
      <div *ngIf="!isLoading && activeTab === 'attendance'">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-bold text-dark mb-0">4. Attendance Analytics Report</h5>
          <span class="badge bg-primary-subtle text-primary px-3 py-2 fs-6">
            {{ filteredAttendanceReports.length }} Hall Session(s)
          </span>
        </div>

        <div *ngFor="let ar of filteredAttendanceReports" class="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
          <!-- Header and Attendance Percentage Highlight -->
          <div class="card-header bg-white py-3 border-0 d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="badge bg-primary px-3 py-1 font-monospace fs-6">Hall {{ ar.hallNumber }}</span>
                <span class="badge bg-light text-dark border">{{ ar.building }}</span>
                <span class="badge bg-secondary-subtle text-secondary">{{ ar.examDate }}</span>
              </div>
              <h5 class="mb-0 fw-bold text-dark">{{ ar.examName }} <small class="text-secondary fw-normal">({{ ar.subject }})</small></h5>
            </div>

            <!-- Attendance Rate Badge / Stat -->
            <div class="d-flex align-items-center gap-3">
              <div class="text-end">
                <span class="small text-muted d-block fw-semibold">Attendance Rate</span>
                <span class="fs-3 fw-bold text-success">{{ ar.attendancePercentage }}%</span>
              </div>
              <div class="progress" style="width: 120px; height: 14px; border-radius: 7px;">
                <div class="progress-bar bg-success" role="progressbar" [style.width.%]="ar.attendancePercentage" [aria-valuenow]="ar.attendancePercentage" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
            </div>
          </div>

          <!-- Key Metrics Strip: Total students, Present, Absent, Attendance percentage -->
          <div class="card-body p-4 pt-2">
            <div class="row g-3">
              <div class="col-sm-3">
                <div class="card border-0 bg-light p-3 text-center rounded-3">
                  <span class="small text-secondary fw-semibold">Total Students</span>
                  <div class="fs-4 fw-bold text-dark">{{ ar.totalStudents }}</div>
                </div>
              </div>
              <div class="col-sm-3">
                <div class="card border-0 bg-success-subtle p-3 text-center rounded-3 border border-success-subtle">
                  <span class="small text-success fw-semibold">Present</span>
                  <div class="fs-4 fw-bold text-success">{{ ar.present ?? ar.presentCount ?? 0 }}</div>
                </div>
              </div>
              <div class="col-sm-3">
                <div class="card border-0 bg-danger-subtle p-3 text-center rounded-3 border border-danger-subtle">
                  <span class="small text-danger fw-semibold">Absent</span>
                  <div class="fs-4 fw-bold text-danger">{{ ar.absent ?? ar.absentCount ?? 0 }}</div>
                </div>
              </div>
              <div class="col-sm-3">
                <div class="card border-0 bg-info-subtle p-3 text-center rounded-3 border border-info-subtle">
                  <span class="small text-info-emphasis fw-semibold">Attendance %</span>
                  <div class="fs-4 fw-bold text-info-emphasis">{{ ar.attendancePercentage }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="filteredAttendanceReports.length === 0" class="card border-0 shadow-sm rounded-4 py-5 text-center text-muted">
          <i class="bi bi-clipboard2-x fs-1 opacity-50 d-block mb-2 text-secondary"></i>
          <p class="mb-0">No attendance reports found matching the selected filters.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nav-pills .nav-link {
      color: #475569;
      border-radius: 0.5rem;
    }
    .nav-pills .nav-link.active {
      background-color: #4f46e5;
      color: #ffffff;
    }
    @media print {
      body {
        background-color: white !important;
      }
      .card {
        box-shadow: none !important;
        border: 1px solid #e2e8f0 !important;
      }
    }
  `]
})
export class ReportsComponent implements OnInit {
  activeTab: ReportTab = 'exam';
  isLoading = false;
  errorMessage = '';

  exams: Exam[] = [];
  halls: Hall[] = [];

  // Global Filter Properties: Exam, Date, Hall
  filterExamId: number | null = null;
  filterDate: string = '';
  filterHallId: number | null = null;
  searchKeyword: string = '';

  // Raw dataset arrays
  examReports: ExamWiseReport[] = [];
  hallReports: HallWiseReport[] = [];
  studentReports: StudentWiseReport[] = [];
  attendanceReports: AttendanceReport[] = [];

  constructor(
    private reportService: ReportService,
    private examService: ExamService,
    private hallService: HallService
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
    this.switchTab('exam');
  }

  loadDropdowns(): void {
    this.examService.getAllExams().subscribe(res => this.exams = res.data || []);
    this.hallService.getAllHalls().subscribe(res => this.halls = res.data || []);
  }

  switchTab(tab: ReportTab): void {
    this.activeTab = tab;
    this.errorMessage = '';
    switch (tab) {
      case 'exam':
        this.loadExamWiseReport();
        break;
      case 'hall':
        this.loadHallWiseReport();
        break;
      case 'student':
        this.loadStudentWiseReport();
        break;
      case 'attendance':
        this.loadAttendanceReport();
        break;
    }
  }

  onFilterChange(): void {
    this.switchTab(this.activeTab);
  }

  resetFilters(): void {
    this.filterExamId = null;
    this.filterDate = '';
    this.filterHallId = null;
    this.searchKeyword = '';
    this.onFilterChange();
  }

  loadExamWiseReport(): void {
    this.isLoading = true;
    this.reportService.getExamWiseReport(this.filterExamId || undefined).subscribe({
      next: (res) => {
        this.examReports = res.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load exam-wise report.';
        this.isLoading = false;
      }
    });
  }

  loadHallWiseReport(): void {
    this.isLoading = true;
    this.reportService.getHallWiseReport(this.filterExamId || undefined, this.filterHallId || undefined).subscribe({
      next: (res) => {
        this.hallReports = res.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load hall-wise report.';
        this.isLoading = false;
      }
    });
  }

  loadStudentWiseReport(): void {
    this.isLoading = true;
    this.reportService.getStudentWiseReport(this.filterExamId || undefined, this.searchKeyword || undefined).subscribe({
      next: (res) => {
        this.studentReports = res.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load student-wise report.';
        this.isLoading = false;
      }
    });
  }

  loadAttendanceReport(): void {
    this.isLoading = true;
    this.reportService.getAttendanceReport(this.filterExamId || undefined, this.filterDate || undefined).subscribe({
      next: (res) => {
        this.attendanceReports = res.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load attendance report.';
        this.isLoading = false;
      }
    });
  }

  // Filtered Getters for Client-Side Date and Hall Filtering
  get filteredExamReports(): ExamWiseReport[] {
    return this.examReports.filter(r => {
      const matchDate = !this.filterDate || r.examDate === this.filterDate;
      return matchDate;
    });
  }

  get filteredHallReports(): HallWiseReport[] {
    return this.hallReports.filter(hr => {
      const matchHall = !this.filterHallId || hr.hallId === this.filterHallId;
      return matchHall;
    });
  }

  get filteredStudentReports(): StudentWiseReport[] {
    return this.studentReports.filter(sr => {
      const matchHall = !this.filterHallId || (this.halls.find(h => h.id === this.filterHallId)?.hallNumber === sr.hallNumber);
      const matchDate = !this.filterDate || sr.examDate === this.filterDate;
      return matchHall && matchDate;
    });
  }

  get filteredAttendanceReports(): AttendanceReport[] {
    return this.attendanceReports.filter(ar => {
      const matchHall = !this.filterHallId || (this.halls.find(h => h.id === this.filterHallId)?.hallNumber === ar.hallNumber);
      const matchDate = !this.filterDate || ar.examDate === this.filterDate;
      return matchHall && matchDate;
    });
  }

  printReport(): void {
    window.print();
  }

  downloadCurrentTabPdf(): void {
    const examId = this.filterExamId || (this.exams.length > 0 ? this.exams[0].id : null);

    switch (this.activeTab) {
      case 'exam':
        if (examId) {
          this.reportService.downloadExamSeatingPdf(examId).subscribe({
            next: (blob) => this.reportService.triggerFileDownload(blob, `exam-wise-report-${examId}.pdf`),
            error: () => this.errorMessage = 'Failed to download Exam Seating PDF.'
          });
        } else {
          this.errorMessage = 'Please select an examination to export the PDF report.';
        }
        break;
      case 'hall':
        if (examId) {
          const hallId = this.filterHallId || (this.halls.length > 0 ? this.halls[0].id : 1);
          this.reportService.downloadHallChartPdf(hallId, examId).subscribe({
            next: (blob) => this.reportService.triggerFileDownload(blob, `hall-${hallId}-chart-exam-${examId}.pdf`),
            error: () => this.errorMessage = 'Failed to download Hall Chart PDF.'
          });
        } else {
          this.errorMessage = 'Please select an examination to export Hall Chart PDF.';
        }
        break;
      case 'student':
        this.reportService.downloadStudentReportPdf(examId || undefined, this.searchKeyword || undefined).subscribe({
          next: (blob) => this.reportService.triggerFileDownload(blob, `student-wise-roster.pdf`),
          error: () => this.errorMessage = 'Failed to download Student Report PDF.'
        });
        break;
      case 'attendance':
        if (examId) {
          this.reportService.downloadAttendanceReportPdf(examId, this.filterHallId || undefined).subscribe({
            next: (blob) => this.reportService.triggerFileDownload(blob, `attendance-register-exam-${examId}.pdf`),
            error: () => this.errorMessage = 'Failed to download Attendance Report PDF.'
          });
        } else {
          this.errorMessage = 'Please select an examination to export Attendance Register PDF.';
        }
        break;
    }
  }
}
