import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ExamService } from '../core/services/exam.service';
import { HallService } from '../core/services/hall.service';
import { AttendanceService } from '../core/services/attendance.service';
import { Exam } from '../core/models/exam.model';
import { Hall } from '../core/models/hall.model';
import { HallAttendanceResponse, AttendanceStudentDto, SaveAttendanceRequest } from '../core/models/attendance.model';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fade-in">
      <!-- Header -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3 d-print-none">
        <div>
          <h2 class="h4 fw-bold text-dark mb-1">Hall Attendance & Invigilation Register</h2>
          <p class="text-secondary small mb-0">Record and manage candidate attendance for examination halls in real time</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary d-flex align-items-center gap-2" (click)="printRoster()" [disabled]="!hallData || students.length === 0">
            <i class="bi bi-printer-fill"></i>
            <span>Print Roster</span>
          </button>
          <button class="btn btn-outline-success d-flex align-items-center gap-2" (click)="markAllPresent()" [disabled]="!hallData || students.length === 0">
            <i class="bi bi-check-all fs-5"></i>
            <span>Mark All Present</span>
          </button>
          <button class="btn btn-primary d-flex align-items-center gap-2 px-3 fw-semibold" (click)="saveAllAttendance()" [disabled]="!hallData || students.length === 0 || isSaving">
            <span *ngIf="isSaving" class="spinner-border spinner-border-sm"></span>
            <i *ngIf="!isSaving" class="bi bi-cloud-arrow-up-fill"></i>
            <span>Save Attendance</span>
          </button>
        </div>
      </div>

      <!-- Filter Controls (Hidden when printing) -->
      <div class="card border-0 shadow-sm rounded-4 mb-4 d-print-none">
        <div class="card-body p-3">
          <div class="row g-3 align-items-center">
            <div class="col-md-3">
              <label class="form-label small fw-semibold text-dark mb-1">Filter by Exam Date</label>
              <input type="date" class="form-control bg-light border-0" [(ngModel)]="filterDate" (change)="onDateChanged()" />
            </div>

            <div class="col-md-4">
              <label class="form-label small fw-semibold text-dark mb-1">Select Examination</label>
              <select class="form-select bg-light border-0" [(ngModel)]="selectedExamId" (change)="onFilterChanged()">
                <option [ngValue]="null" disabled>-- Select Exam --</option>
                <option *ngFor="let ex of displayedExams" [ngValue]="ex.id">
                  {{ ex.examName }} ({{ ex.subject }} - {{ ex.examDate }})
                </option>
              </select>
            </div>

            <div class="col-md-3">
              <label class="form-label small fw-semibold text-dark mb-1">Select Examination Hall</label>
              <select class="form-select bg-light border-0" [(ngModel)]="selectedHallId" (change)="onFilterChanged()">
                <option [ngValue]="null" disabled>-- Select Hall --</option>
                <option *ngFor="let h of halls" [ngValue]="h.id">
                  Hall {{ h.hallNumber }} ({{ h.building }})
                </option>
              </select>
            </div>

            <div class="col-md-2 text-end pt-3">
              <button class="btn btn-primary w-100 py-2 fw-semibold" (click)="loadHallStudents()" [disabled]="!selectedExamId || !selectedHallId || isLoading">
                <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-1"></span>
                <i *ngIf="!isLoading" class="bi bi-arrow-repeat me-1"></i>
                Load
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Feedback Messages -->
      <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show rounded-3 shadow-sm d-print-none" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>

      <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show rounded-3 shadow-sm d-print-none" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>{{ successMessage }}
        <button type="button" class="btn-close" (click)="successMessage = ''"></button>
      </div>

      <!-- Hall View Detailed Header Banner -->
      <div *ngIf="hallData" class="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden bg-primary text-white p-4">
        <div class="row align-items-center">
          <div class="col-md-7">
            <div class="d-flex align-items-center gap-2 mb-2">
              <span class="badge bg-white text-primary fw-bold font-monospace fs-6 px-3 py-2">
                Hall {{ hallData.hallNumber || hallData.hallCode }}
              </span>
              <span class="badge bg-white bg-opacity-25 text-white">
                {{ hallData.building }}
              </span>
            </div>
            <h3 class="fw-bold mb-1">Exam: {{ hallData.examName }}</h3>
            <p class="mb-2 text-white-50 fs-6">{{ hallData.subject }}</p>
            <div class="d-flex flex-wrap gap-4 text-white small">
              <div><i class="bi bi-calendar3 me-1"></i><strong>Date:</strong> {{ hallData.examDate }}</div>
              <div><i class="bi bi-clock me-1"></i><strong>Time:</strong> {{ hallData.startTime }} - {{ hallData.endTime }}</div>
            </div>
          </div>
          <div class="col-md-5 mt-3 mt-md-0 text-md-end">
            <div class="d-inline-block bg-white bg-opacity-10 p-3 rounded-3 text-start">
              <div class="small text-white-50 text-uppercase fw-semibold mb-1">Live Hall Stats</div>
              <div class="d-flex gap-3">
                <div>
                  <span class="small d-block text-white-50">Total</span>
                  <span class="fs-4 fw-bold">{{ students.length }}</span>
                </div>
                <div>
                  <span class="small d-block text-success-emphasis text-white">Present</span>
                  <span class="fs-4 fw-bold text-white">{{ getPresentCount() }}</span>
                </div>
                <div>
                  <span class="small d-block text-danger-emphasis text-white">Absent</span>
                  <span class="fs-4 fw-bold text-white">{{ getAbsentCount() }}</span>
                </div>
                <div>
                  <span class="small d-block text-white-50">Rate</span>
                  <span class="fs-4 fw-bold">{{ getAttendancePercentage() }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Metrics Strip -->
      <div *ngIf="hallData && students.length > 0" class="row g-3 mb-4 d-print-none">
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 text-center bg-white">
            <span class="text-secondary small fw-semibold">Total Students</span>
            <div class="fs-3 fw-bold text-dark">{{ students.length }}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 text-center bg-success-subtle text-success border border-success-subtle">
            <span class="small fw-semibold">Present Candidates</span>
            <div class="fs-3 fw-bold">{{ getPresentCount() }}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 text-center bg-danger-subtle text-danger border border-danger-subtle">
            <span class="small fw-semibold">Absent Candidates</span>
            <div class="fs-3 fw-bold">{{ getAbsentCount() }}</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 text-center bg-info-subtle text-info-emphasis border border-info-subtle">
            <span class="small fw-semibold">Attendance Rate</span>
            <div class="fs-3 fw-bold">{{ getAttendancePercentage() }}%</div>
          </div>
        </div>
      </div>

      <!-- Student Attendance Table -->
      <div *ngIf="hallData && students.length > 0" class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4">Seat</th>
                <th>Register Number</th>
                <th>Name</th>
                <th>Branch</th>
                <th class="text-center">Attendance</th>
                <th class="d-print-none">Remarks</th>
                <th class="d-print-none text-end pe-4">Status</th>
                <th class="d-none d-print-table-cell text-center" style="min-width: 150px;">Signature</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of students">
                <td class="ps-4">
                  <span class="badge bg-primary px-3 py-2 fw-bold font-monospace fs-6">
                    {{ s.seatNumber }}
                  </span>
                </td>
                <td>
                  <span class="badge bg-light text-primary border font-monospace px-2 py-1 fs-6">
                    {{ s.registerNumber }}
                  </span>
                </td>
                <td>
                  <div class="fw-bold text-dark">{{ s.name }}</div>
                  <small class="text-secondary">Year {{ s.year }} - Sec {{ s.section }}</small>
                </td>
                <td>
                  <span class="badge bg-secondary-subtle text-secondary">{{ s.branch }}</span>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm shadow-xs" role="group">
                    <button
                      type="button"
                      class="btn px-2 py-2 fw-semibold transition-all"
                      [ngClass]="s.status === 'PRESENT' ? 'btn-success text-white shadow-sm' : 'btn-outline-success'"
                      (click)="setStudentStatus(s, 'PRESENT')"
                    >
                      <i class="bi bi-check-circle-fill me-1" *ngIf="s.status === 'PRESENT'"></i>
                      PRESENT
                    </button>
                    <button
                      type="button"
                      class="btn px-2 py-2 fw-semibold transition-all"
                      [ngClass]="s.status === 'ABSENT' ? 'btn-danger text-white shadow-sm' : 'btn-outline-danger'"
                      (click)="setStudentStatus(s, 'ABSENT')"
                    >
                      <i class="bi bi-x-circle-fill me-1" *ngIf="s.status === 'ABSENT'"></i>
                      ABSENT
                    </button>
                    <button
                      type="button"
                      class="btn px-2 py-2 fw-semibold transition-all"
                      [ngClass]="s.status === 'MALPRACTICE' ? 'btn-warning text-dark shadow-sm' : 'btn-outline-warning'"
                      (click)="setStudentStatus(s, 'MALPRACTICE')"
                    >
                      <i class="bi bi-shield-exclamation me-1" *ngIf="s.status === 'MALPRACTICE'"></i>
                      MALPRACTICE
                    </button>
                  </div>
                </td>
                <td class="d-print-none">
                  <div class="d-flex align-items-center gap-1">
                    <input
                      type="text"
                      class="form-control form-control-sm bg-light border-0"
                      placeholder="Optional remarks"
                      [(ngModel)]="s.remarks"
                      (blur)="onRemarkBlur(s)"
                      style="max-width: 140px;"
                    />
                    <a routerLink="/incidents" *ngIf="s.status === 'MALPRACTICE'"
                       class="btn btn-xs btn-outline-danger rounded-pill px-2 py-1 text-nowrap"
                       title="Report Malpractice to Disciplinary Cell">
                      <i class="bi bi-shield-exclamation"></i> Log Incident
                    </a>
                  </div>
                </td>
                <td class="d-print-none text-end pe-4">
                  <span *ngIf="s.attendanceId" class="badge bg-light text-secondary border">
                    <i class="bi bi-check me-1 text-success"></i>Recorded
                  </span>
                  <span *ngIf="!s.attendanceId" class="badge bg-warning-subtle text-warning-emphasis">
                    Pending Save
                  </span>
                </td>
                <td class="d-none d-print-table-cell text-center text-muted small">
                  __________________________
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Action inside Card -->
        <div class="card-footer bg-white p-3 border-top d-flex justify-content-between align-items-center d-print-none">
          <small class="text-muted">
            <i class="bi bi-info-circle me-1"></i> Make individual selections or click "Mark All Present", then hit <strong>Save Attendance</strong> to record.
          </small>
          <button class="btn btn-primary px-4 py-2 fw-semibold d-flex align-items-center gap-2" (click)="saveAllAttendance()" [disabled]="isSaving">
            <span *ngIf="isSaving" class="spinner-border spinner-border-sm"></span>
            <i *ngIf="!isSaving" class="bi bi-cloud-arrow-up-fill"></i>
            <span>Save Attendance</span>
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && (!hallData || students.length === 0) && selectedExamId && selectedHallId" class="card border-0 shadow-sm rounded-4 py-5 text-center text-muted">
        <i class="bi bi-clipboard2-x fs-1 text-secondary opacity-50 d-block mb-2"></i>
        <h6 class="fw-bold text-dark">No Candidates Assigned</h6>
        <p class="small text-secondary mb-0">No students are currently seated in this hall for the chosen exam. Generate seating first if needed.</p>
      </div>
    </div>
  `,
  styles: [`
    .transition-all {
      transition: all 0.15s ease-in-out;
    }
    @media print {
      body {
        background-color: white !important;
      }
      .table {
        font-size: 11pt;
      }
    }
  `]
})
export class AttendanceComponent implements OnInit {
  exams: Exam[] = [];
  halls: Hall[] = [];
  selectedExamId: number | null = null;
  selectedHallId: number | null = null;
  filterDate: string = '';

  get displayedExams(): Exam[] {
    if (!this.filterDate) return this.exams;
    return this.exams.filter(e => e.examDate === this.filterDate);
  }

  onDateChanged(): void {
    if (this.filterDate) {
      const match = this.exams.find(e => e.examDate === this.filterDate);
      if (match) {
        this.selectedExamId = match.id;
      }
    }
    this.onFilterChanged();
  }

  hallData: HallAttendanceResponse | null = null;
  students: AttendanceStudentDto[] = [];

  isLoading = false;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private examService: ExamService,
    private hallService: HallService,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit(): void {
    // Check if examId & hallId passed in query params
    this.route.queryParams.subscribe(params => {
      const qExamId = params['examId'] ? Number(params['examId']) : null;
      const qHallId = params['hallId'] ? Number(params['hallId']) : null;

      this.loadFilters(qExamId, qHallId);
    });
  }

  loadFilters(initialExamId: number | null, initialHallId: number | null): void {
    this.examService.getAllExams().subscribe(exRes => {
      this.exams = exRes.data || [];
      if (initialExamId) {
        this.selectedExamId = initialExamId;
      } else if (this.exams.length > 0) {
        this.selectedExamId = this.exams[0].id;
      }

      this.hallService.getAllHalls().subscribe(hRes => {
        this.halls = hRes.data || [];
        if (initialHallId) {
          this.selectedHallId = initialHallId;
        } else if (this.halls.length > 0) {
          this.selectedHallId = this.halls[0].id;
        }

        if (this.selectedExamId && this.selectedHallId) {
          this.loadHallStudents();
        }
      });
    });
  }

  onFilterChanged(): void {
    this.hallData = null;
    this.students = [];
  }

  loadHallStudents(): void {
    if (!this.selectedExamId || !this.selectedHallId) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.attendanceService.getHallAttendance(this.selectedExamId, this.selectedHallId).subscribe({
      next: (res) => {
        this.hallData = res.data;
        this.students = (res.data?.students || []).map(s => ({
          ...s,
          // Default to PRESENT if unassigned/unmarked
          status: (s.status === 'UNMARKED' || !s.status) ? 'PRESENT' : s.status
        }));
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load hall attendance register.';
        this.isLoading = false;
      }
    });
  }

  setStudentStatus(student: AttendanceStudentDto, status: 'PRESENT' | 'ABSENT'): void {
    student.status = status;
    // If it already has an attendanceId, we can optionally trigger single update or batch save
    if (student.attendanceId) {
      this.attendanceService.updateSingleAttendance(student.attendanceId, {
        status: student.status,
        remarks: student.remarks
      }).subscribe({
        next: () => {
          // updated silently
        },
        error: () => {
          // ignore or record
        }
      });
    }
  }

  onRemarkBlur(student: AttendanceStudentDto): void {
    if (student.attendanceId) {
      this.attendanceService.updateSingleAttendance(student.attendanceId, {
        status: student.status,
        remarks: student.remarks
      }).subscribe();
    }
  }

  markAllPresent(): void {
    this.students.forEach(s => s.status = 'PRESENT');
    this.successMessage = 'All students marked as Present. Click "Save Attendance" to confirm.';
    setTimeout(() => this.successMessage = '', 4000);
  }

  saveAllAttendance(): void {
    if (!this.selectedExamId || !this.selectedHallId || this.students.length === 0) return;

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: SaveAttendanceRequest = {
      examId: this.selectedExamId,
      hallId: this.selectedHallId,
      records: this.students.map(s => ({
        studentId: s.studentId,
        status: s.status === 'ABSENT' ? 'ABSENT' : 'PRESENT',
        remarks: s.remarks
      }))
    };

    this.attendanceService.saveAttendance(payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.hallData = res.data;
        this.students = (res.data?.students || []).map(s => ({
          ...s,
          status: (s.status === 'UNMARKED' || !s.status) ? 'PRESENT' : s.status
        }));
        this.successMessage = 'Hall attendance saved and finalized successfully!';
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Failed to save attendance.';
      }
    });
  }

  getPresentCount(): number {
    return this.students.filter(s => s.status === 'PRESENT').length;
  }

  getAbsentCount(): number {
    return this.students.filter(s => s.status === 'ABSENT').length;
  }

  getAttendancePercentage(): number {
    if (this.students.length === 0) return 0;
    const pct = (this.getPresentCount() / this.students.length) * 100;
    return Math.round(pct * 10) / 10;
  }

  printRoster(): void {
    window.print();
  }
}
