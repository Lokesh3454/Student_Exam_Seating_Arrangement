import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExamService } from '../../core/services/exam.service';
import { HallService } from '../../core/services/hall.service';
import { ExamRequest } from '../../core/models/exam.model';
import { Hall } from '../../core/models/hall.model';

@Component({
  selector: 'app-exam-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="fade-in">
      <div class="mb-4">
        <a routerLink="/exams" class="text-decoration-none text-muted small d-inline-flex align-items-center gap-1 mb-2">
          <i class="bi bi-arrow-left"></i> Back to Exams
        </a>
        <h2 class="h4 fw-bold text-dark mb-1">{{ isEditMode ? 'Edit Examination' : 'Schedule New Examination' }}</h2>
        <p class="text-secondary small mb-0">{{ isEditMode ? 'Modify exam timing, branch or allotted halls' : 'Specify timetable, target branch, and allotted halls to enable seating with overflow' }}</p>
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>

      <div class="card border-0 shadow-sm rounded-4 p-4">
        <form #examForm="ngForm" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold text-dark">Exam Title <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control"
                name="examName"
                [(ngModel)]="exam.examName"
                placeholder="e.g. Mid Term Exam 2026"
                required
              />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold text-dark">Subject / Course Code <span class="text-danger">*</span></label>
              <input
                type="text"
                class="form-control"
                name="subject"
                [(ngModel)]="exam.subject"
                placeholder="e.g. CS101 - Data Structures"
                required
              />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold text-dark">Target Academic Branch <span class="text-danger">*</span></label>
              <select class="form-select" name="branch" [(ngModel)]="exam.branch" required>
                <option value="ALL">ALL (Common / All Branches)</option>
                <option value="CSE">CSE (Computer Science & Engineering)</option>
                <option value="ECE">ECE (Electronics & Communication Engineering)</option>
                <option value="MECH">MECH (Mechanical Engineering)</option>
                <option value="CIVIL">CIVIL (Civil Engineering)</option>
                <option value="IT">IT (Information Technology)</option>
                <option value="EEE">EEE (Electrical & Electronics Engineering)</option>
              </select>
              <small class="text-muted" style="font-size: 0.78rem;">Different branches have separate exam schedules.</small>
            </div>

            <div class="col-md-6" *ngIf="isEditMode">
              <label class="form-label fw-semibold text-dark">Status</label>
              <select class="form-select" name="status" [(ngModel)]="exam.status">
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold text-dark">Exam Date <span class="text-danger">*</span></label>
              <input
                type="date"
                class="form-control"
                name="examDate"
                [(ngModel)]="exam.examDate"
                required
              />
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold text-dark">Start Time <span class="text-danger">*</span></label>
              <input
                type="time"
                class="form-control"
                name="startTime"
                [(ngModel)]="exam.startTime"
                required
              />
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold text-dark">End Time <span class="text-danger">*</span></label>
              <input
                type="time"
                class="form-control"
                name="endTime"
                [(ngModel)]="exam.endTime"
                required
              />
            </div>

            <!-- Admin-Controlled Allotted Examination Halls -->
            <div class="col-12 mt-4">
              <div class="card border rounded-3 p-3 bg-light">
                <div class="d-flex flex-wrap justify-content-between align-items-center mb-2 gap-2">
                  <div>
                    <h6 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <i class="bi bi-building-fill-check text-primary"></i> Allotted Examination Halls
                    </h6>
                    <small class="text-secondary">Admin controls which halls are allotted for this schedule. Seating will strictly fill these halls sequentially with overflow.</small>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-3" (click)="selectAllHalls()">Select All</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3" (click)="clearAllHalls()">Clear</button>
                  </div>
                </div>

                <!-- Hall Grid Picker -->
                <div class="row g-2 mt-1">
                  <div class="col-md-4" *ngFor="let hall of availableHalls">
                    <div class="p-2 border rounded-3 bg-white d-flex align-items-center justify-content-between cursor-pointer transition"
                         [ngClass]="{'border-primary bg-primary-subtle': selectedHallIds.has(hall.id)}"
                         (click)="toggleHall(hall.id)">
                      <div class="d-flex align-items-center gap-2">
                        <input type="checkbox" class="form-check-input mt-0" [checked]="selectedHallIds.has(hall.id)" (click)="$event.stopPropagation()" (change)="toggleHall(hall.id)">
                        <div>
                          <strong class="text-dark small d-block">Hall {{ hall.hallNumber }}</strong>
                          <span class="text-muted" style="font-size: 0.75rem;">{{ hall.building }}</span>
                        </div>
                      </div>
                      <span class="badge" [ngClass]="selectedHallIds.has(hall.id) ? 'bg-primary text-white' : 'bg-light text-secondary border'">
                        {{ hall.capacity }} Seats ({{ hall.rowsCount }}x{{ hall.columnsCount }})
                      </span>
                    </div>
                  </div>
                  <div *ngIf="availableHalls.length === 0" class="col-12 text-center py-3 text-muted small">
                    Loading examination halls...
                  </div>
                </div>

                <!-- Total Allotted Capacity Banner -->
                <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-2 border-top gap-2">
                  <div class="small text-secondary">
                    Allotted: <strong>{{ selectedHallIds.size }} Hall(s)</strong> selected for this examination.
                  </div>
                  <div class="badge px-3 py-2 fw-semibold" [ngClass]="selectedHallIds.size > 0 ? 'bg-success-subtle text-success border border-success' : 'bg-secondary-subtle text-secondary'">
                    <i class="bi bi-person-check-fill me-1"></i> Total Allotted Capacity: {{ calculateTotalCapacity() }} Seats
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12 mt-4 pt-3 border-top d-flex gap-2 justify-content-end">
              <a routerLink="/exams" class="btn btn-light rounded-pill px-4">Cancel</a>
              <button
                type="submit"
                class="btn btn-primary rounded-pill px-4"
                [disabled]="!examForm.form.valid || isSubmitting"
              >
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
                {{ isEditMode ? 'Update Exam' : 'Schedule Exam' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ExamFormComponent implements OnInit {
  isEditMode = false;
  examId: number | null = null;
  isSubmitting = false;
  errorMessage = '';

  availableHalls: Hall[] = [];
  selectedHallIds: Set<number> = new Set<number>();

  exam: ExamRequest = {
    examName: '',
    subject: '',
    branch: 'ALL',
    examDate: new Date().toISOString().split('T')[0],
    startTime: '09:30',
    endTime: '12:30',
    status: 'SCHEDULED',
    hallIds: []
  };

  constructor(
    private examService: ExamService,
    private hallService: HallService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHalls();
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.isEditMode = true;
      this.examId = Number(idParam);
      this.loadExam(this.examId);
    }
  }

  loadHalls(): void {
    this.hallService.getAllHalls().subscribe({
      next: (res) => {
        if (res.data) {
          this.availableHalls = res.data;
        }
      },
      error: () => {}
    });
  }

  loadExam(id: number): void {
    this.examService.getExamById(id).subscribe({
      next: (res) => {
        if (res.data) {
          const e = res.data;
          this.exam = {
            examName: e.examName,
            subject: e.subject,
            branch: e.branch || 'ALL',
            examDate: e.examDate,
            startTime: e.startTime ? e.startTime.substring(0, 5) : '09:30',
            endTime: e.endTime ? e.endTime.substring(0, 5) : '12:30',
            status: e.status,
            hallIds: e.allottedHallIds || []
          };
          this.selectedHallIds = new Set(e.allottedHallIds || []);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load exam details.';
      }
    });
  }

  toggleHall(hallId: number): void {
    if (this.selectedHallIds.has(hallId)) {
      this.selectedHallIds.delete(hallId);
    } else {
      this.selectedHallIds.add(hallId);
    }
  }

  selectAllHalls(): void {
    this.availableHalls.forEach(h => this.selectedHallIds.add(h.id));
  }

  clearAllHalls(): void {
    this.selectedHallIds.clear();
  }

  calculateTotalCapacity(): number {
    return this.availableHalls
      .filter(h => this.selectedHallIds.has(h.id))
      .reduce((sum, h) => sum + (h.capacity || 0), 0);
  }

  onSubmit(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    const payload: ExamRequest = {
      ...this.exam,
      startTime: this.exam.startTime.length === 5 ? `${this.exam.startTime}:00` : this.exam.startTime,
      endTime: this.exam.endTime.length === 5 ? `${this.exam.endTime}:00` : this.exam.endTime,
      hallIds: Array.from(this.selectedHallIds)
    };

    if (this.isEditMode && this.examId) {
      this.examService.updateExam(this.examId, payload).subscribe({
        next: () => {
          this.router.navigate(['/exams']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to update exam.';
          this.isSubmitting = false;
        }
      });
    } else {
      this.examService.createExam(payload).subscribe({
        next: () => {
          this.router.navigate(['/exams']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Failed to schedule exam.';
          this.isSubmitting = false;
        }
      });
    }
  }
}
