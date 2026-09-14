import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FacultyService } from '../../core/services/faculty.service';
import { ExamService } from '../../core/services/exam.service';
import { HallService } from '../../core/services/hall.service';
import { Faculty } from '../../core/models/faculty.model';
import { Exam } from '../../core/models/exam.model';
import { Hall } from '../../core/models/hall.model';
import { FacultyAssignment } from '../../core/models/faculty-assignment.model';

@Component({
  selector: 'app-faculty-assignments',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="fade-in">
      <!-- Header -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-1">
              <li class="breadcrumb-item"><a routerLink="/faculty" class="text-decoration-none">Faculty</a></li>
              <li class="breadcrumb-item active" aria-current="page">Hall Assignments</li>
            </ol>
          </nav>
          <h2 class="h4 fw-bold text-dark mb-1">Exam Hall Invigilation Assignments</h2>
          <p class="text-secondary small mb-0">Assign faculty invigilators to specific exam halls and duty schedules</p>
        </div>
        <div class="d-flex gap-2">
          <a routerLink="/faculty" class="btn btn-outline-secondary d-flex align-items-center gap-2">
            <i class="bi bi-people-fill"></i>
            <span>Faculty List</span>
          </a>
        </div>
      </div>

      <!-- Feedback Alerts -->
      <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show rounded-3 shadow-sm" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>

      <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show rounded-3 shadow-sm" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>{{ successMessage }}
        <button type="button" class="btn-close" (click)="successMessage = ''"></button>
      </div>

      <!-- Create Assignment Form Card -->
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-header bg-white py-3 border-0">
          <div class="d-flex align-items-center gap-2">
            <div class="bg-primary-subtle text-primary p-2 rounded-3">
              <i class="bi bi-person-plus-fill fs-5"></i>
            </div>
            <h5 class="mb-0 fw-bold">New Invigilation Duty Assignment</h5>
          </div>
        </div>
        <div class="card-body p-4 pt-2">
          <form (ngSubmit)="assignDuty()" class="row g-3">
            <div class="col-md-4">
              <label class="form-label small fw-semibold text-dark">Select Examination <span class="text-danger">*</span></label>
              <select class="form-select bg-light border-0 py-2" [(ngModel)]="selectedExamId" name="examId" required (change)="onExamSelected()">
                <option [ngValue]="null" disabled>-- Choose Exam --</option>
                <option *ngFor="let ex of exams" [ngValue]="ex.id">
                  {{ ex.examName }} ({{ ex.subject }} - {{ ex.examDate }})
                </option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label small fw-semibold text-dark">Select Hall <span class="text-danger">*</span></label>
              <select class="form-select bg-light border-0 py-2" [(ngModel)]="selectedHallId" name="hallId" required>
                <option [ngValue]="null" disabled>-- Choose Hall --</option>
                <option *ngFor="let h of halls" [ngValue]="h.id">
                  Hall {{ h.hallNumber }} ({{ h.building }} - Cap: {{ h.capacity }})
                </option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label small fw-semibold text-dark">Select Faculty Member <span class="text-danger">*</span></label>
              <select class="form-select bg-light border-0 py-2" [(ngModel)]="selectedFacultyId" name="facultyId" required>
                <option [ngValue]="null" disabled>-- Choose Faculty --</option>
                <option *ngFor="let f of facultyList" [ngValue]="f.id">
                  {{ f.name }} [{{ f.employeeId }}] ({{ f.email }})
                </option>
              </select>
            </div>

            <div class="col-12 text-end mt-4">
              <button type="submit" class="btn btn-primary px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2" [disabled]="isSubmitting || !selectedExamId || !selectedHallId || !selectedFacultyId">
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm"></span>
                <i *ngIf="!isSubmitting" class="bi bi-check2-circle fs-5"></i>
                <span>Assign Invigilator</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Filter and Duty Table -->
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div class="card-header bg-white py-3 border-0 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div class="d-flex align-items-center gap-2">
            <h5 class="mb-0 fw-bold">Active Hall Assignments</h5>
            <span class="badge bg-secondary-subtle text-secondary rounded-pill px-3">{{ assignments.length }} Assigned</span>
          </div>

          <div class="d-flex flex-wrap align-items-center gap-2">
            <div>
              <input type="date" class="form-control form-control-sm bg-light border-0" [(ngModel)]="filterDate" title="Filter by Exam Date" />
            </div>
            <div>
              <select class="form-select form-select-sm bg-light border-0" [(ngModel)]="filterExamId">
                <option [ngValue]="null">All Exams</option>
                <option *ngFor="let ex of exams" [ngValue]="ex.id">{{ ex.examName }}</option>
              </select>
            </div>
            <div>
              <select class="form-select form-select-sm bg-light border-0" [(ngModel)]="filterHallId">
                <option [ngValue]="null">All Halls</option>
                <option *ngFor="let h of halls" [ngValue]="h.id">Hall {{ h.hallNumber }}</option>
              </select>
            </div>
            <button class="btn btn-sm btn-outline-secondary" *ngIf="filterExamId || filterDate || filterHallId" (click)="resetFilters()">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>

        <div *ngIf="isLoading" class="p-5 text-center text-secondary">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 small mb-0">Loading invigilation duty roster...</p>
        </div>

        <div *ngIf="!isLoading && assignments.length === 0" class="p-5 text-center text-muted">
          <i class="bi bi-clipboard2-x fs-1 opacity-50 d-block mb-2 text-secondary"></i>
          <p class="mb-0">No faculty invigilators have been assigned yet.</p>
          <small class="text-secondary">Use the form above to assign a faculty member to an exam hall.</small>
        </div>

        <div *ngIf="!isLoading && assignments.length > 0" class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4">Faculty Invigilator</th>
                <th>Employee ID</th>
                <th>Examination</th>
                <th>Schedule</th>
                <th>Hall & Students</th>
                <th>Status</th>
                <th class="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of filteredAssignments">
                <td class="ps-4">
                  <div class="d-flex align-items-center gap-2">
                    <div class="avatar-circle bg-warning-subtle text-warning-emphasis fw-bold rounded-circle d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
                      {{ a.facultyName ? a.facultyName.charAt(0).toUpperCase() : 'F' }}
                    </div>
                    <div>
                      <div class="fw-bold text-dark">{{ a.facultyName }}</div>
                      <div class="small text-muted">{{ a.facultyEmail }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge bg-light text-dark border font-monospace">{{ a.employeeId }}</span>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ a.examName }}</div>
                  <small class="text-secondary">{{ a.subject }}</small>
                </td>
                <td>
                  <div class="small fw-semibold text-dark"><i class="bi bi-calendar3 me-1 text-primary"></i>{{ a.examDate }}</div>
                  <div class="small text-muted"><i class="bi bi-clock me-1 text-secondary"></i>{{ a.startTime }} - {{ a.endTime }}</div>
                </td>
                <td>
                  <div class="fw-bold text-dark"><i class="bi bi-building me-1 text-success"></i>Hall {{ a.hallNumber || a.hallCode }}</div>
                  <div class="small text-muted">{{ a.building }} &bull; <span class="badge bg-info-subtle text-info fw-normal">{{ a.assignedStudentsCount || a.totalStudents || 0 }} Candidates</span></div>
                </td>
                <td>
                  <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                    {{ a.status || 'ASSIGNED' }}
                  </span>
                </td>
                <td class="text-end pe-4">
                  <button class="btn btn-sm btn-outline-danger" (click)="removeDuty(a.id, a.facultyName, a.hallNumber || a.hallCode || '')" title="Remove duty assignment">
                    <i class="bi bi-trash3-fill me-1"></i> Remove
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class FacultyAssignmentsComponent implements OnInit {
  exams: Exam[] = [];
  halls: Hall[] = [];
  facultyList: Faculty[] = [];
  assignments: FacultyAssignment[] = [];

  selectedExamId: number | null = null;
  selectedHallId: number | null = null;
  selectedFacultyId: number | null = null;
  filterExamId: number | null = null;
  filterDate: string = '';
  filterHallId: number | null = null;

  get filteredAssignments(): FacultyAssignment[] {
    return this.assignments.filter(a => {
      const matchExam = !this.filterExamId || a.examId === this.filterExamId;
      const matchDate = !this.filterDate || a.examDate === this.filterDate;
      const matchHall = !this.filterHallId || a.hallId === this.filterHallId;
      return matchExam && matchDate && matchHall;
    });
  }

  resetFilters(): void {
    this.filterExamId = null;
    this.filterDate = '';
    this.filterHallId = null;
  }

  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private facultyService: FacultyService,
    private examService: ExamService,
    private hallService: HallService
  ) {}

  ngOnInit(): void {
    this.loadDropdownData();
    this.loadAssignments();
  }

  loadDropdownData(): void {
    this.examService.getAllExams().subscribe({
      next: (res) => this.exams = res.data || []
    });

    this.hallService.getAllHalls().subscribe({
      next: (res) => this.halls = res.data || []
    });

    this.facultyService.getAllFaculty().subscribe({
      next: (res) => this.facultyList = res.data || []
    });
  }

  loadAssignments(): void {
    this.isLoading = true;
    if (this.filterExamId) {
      this.facultyService.getAssignmentsByExam(this.filterExamId).subscribe({
        next: (res) => {
          this.assignments = res.data || [];
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to load assignments.';
          this.isLoading = false;
        }
      });
    } else {
      // Load all by fetching for first exam or aggregate
      if (this.exams.length > 0) {
        // Fetch for all exams or first
        this.fetchAggregateAssignments();
      } else {
        this.examService.getAllExams().subscribe(res => {
          this.exams = res.data || [];
          this.fetchAggregateAssignments();
        });
      }
    }
  }

  private fetchAggregateAssignments(): void {
    if (this.exams.length === 0) {
      this.assignments = [];
      this.isLoading = false;
      return;
    }
    // Fetch assignments for all exams
    let loadedCount = 0;
    const allAssignments: FacultyAssignment[] = [];
    this.exams.forEach(ex => {
      this.facultyService.getAssignmentsByExam(ex.id).subscribe({
        next: (res) => {
          if (res.data) allAssignments.push(...res.data);
          loadedCount++;
          if (loadedCount === this.exams.length) {
            this.assignments = allAssignments;
            this.isLoading = false;
          }
        },
        error: () => {
          loadedCount++;
          if (loadedCount === this.exams.length) {
            this.assignments = allAssignments;
            this.isLoading = false;
          }
        }
      });
    });
  }

  onExamSelected(): void {
    // Optional helper
  }

  assignDuty(): void {
    if (!this.selectedExamId || !this.selectedHallId || !this.selectedFacultyId) {
      this.errorMessage = 'Please select Exam, Hall, and Faculty.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.facultyService.assignFaculty({
      examId: this.selectedExamId,
      hallId: this.selectedHallId,
      facultyId: this.selectedFacultyId
    }).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.successMessage = res.message || 'Invigilation duty successfully assigned!';
        this.selectedFacultyId = null;
        this.loadAssignments();
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to assign invigilator. Ensure there is no schedule conflict.';
      }
    });
  }

  removeDuty(id: number, facultyName: string, hallCode: string): void {
    if (!confirm(`Are you sure you want to remove invigilation duty for ${facultyName} in Hall ${hallCode}?`)) {
      return;
    }

    this.facultyService.deleteAssignment(id).subscribe({
      next: () => {
        this.successMessage = 'Duty assignment removed successfully.';
        this.loadAssignments();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to remove assignment.';
      }
    });
  }
}
