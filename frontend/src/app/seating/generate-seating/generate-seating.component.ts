import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ExamService } from '../../core/services/exam.service';
import { HallService } from '../../core/services/hall.service';
import { SeatingService } from '../../core/services/seating.service';
import { Exam } from '../../core/models/exam.model';
import { Hall } from '../../core/models/hall.model';
import { SeatingStrategy, SeatingGenerationResponse, ConflictCheckResponse } from '../../core/models/seating.model';

@Component({
  selector: 'app-generate-seating',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="fade-in">
      <div class="mb-4">
        <h2 class="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
          <i class="bi bi-magic text-primary"></i> Examination Seating Arrangement Generator
        </h2>
        <p class="text-secondary small mb-0">Pre-generation conflict detection, configurable branch separation, and seating regeneration</p>
      </div>

      <!-- Alerts -->
      <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
        <i class="bi bi-exclamation-octagon-fill"></i>
        <div>{{ errorMessage }}</div>
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>

      <!-- Generation Success Card -->
      <div *ngIf="generationResult" class="alert alert-success alert-dismissible fade show p-4 rounded-4 shadow-sm" role="alert">
        <div class="d-flex align-items-start gap-3">
          <i class="bi bi-check-circle-fill text-success fs-2"></i>
          <div class="flex-grow-1">
            <h5 class="fw-bold mb-1">Seating Arrangement Generated Successfully!</h5>
            <p class="mb-2 text-secondary">
              Exam: <strong>{{ generationResult.examName }}</strong> | Strategy: <span class="badge bg-success">{{ generationResult.strategy }}</span>
            </p>
            <div class="row g-3 py-2 bg-white rounded-3 shadow-sm border mb-3">
              <div class="col-4 text-center">
                <span class="text-muted small">Total Students</span>
                <div class="fs-5 fw-bold text-dark">{{ generationResult.totalStudents }}</div>
              </div>
              <div class="col-4 text-center border-start">
                <span class="text-muted small">Seats Assigned</span>
                <div class="fs-5 fw-bold text-primary">{{ generationResult.totalSeatsUsed }}</div>
              </div>
              <div class="col-4 text-center border-start">
                <span class="text-muted small">Halls Utilized</span>
                <div class="fs-5 fw-bold text-success">{{ generationResult.hallsUsed }}</div>
              </div>
            </div>
            <div class="d-flex gap-2">
              <a [routerLink]="['/seating/arrangement']" [queryParams]="{ examId: selectedExamId }" class="btn btn-success rounded-pill px-4">
                <i class="bi bi-grid-3x3-gap-fill me-1"></i> View Seating Grid
              </a>
              <a routerLink="/seating/search" class="btn btn-outline-secondary rounded-pill px-4">
                <i class="bi bi-search me-1"></i> Student Seat Search
              </a>
            </div>
          </div>
          <button type="button" class="btn-close" (click)="generationResult = null"></button>
        </div>
      </div>

      <div class="row g-4">
        <!-- Configuration Form -->
        <div class="col-lg-7">
          <div class="card border-0 shadow-sm rounded-4 p-4">
            <h5 class="fw-bold text-dark mb-3">1. Select Exam & Strategy</h5>

            <div class="mb-3">
              <label class="form-label fw-semibold text-dark">Target Examination <span class="text-danger">*</span></label>
              <select class="form-select" [(ngModel)]="selectedExamId" (change)="onExamSelected()">
                <option [ngValue]="null" disabled>-- Choose an examination --</option>
                <option *ngFor="let ex of exams" [ngValue]="ex.id">
                  {{ ex.examName }} ({{ ex.subject }} - {{ ex.examDate }})
                </option>
              </select>
            </div>

            <!-- Strategy Selection Cards -->
            <div class="mb-4">
              <label class="form-label fw-semibold text-dark">Seating Algorithm Strategy <span class="text-danger">*</span></label>
              <div class="row g-2">
                <div class="col-md-6" *ngFor="let strat of strategies">
                  <div
                    class="card p-3 border-2 h-100 cursor-pointer rounded-3 transition"
                    [ngClass]="selectedStrategy === strat.id ? 'border-primary bg-primary-subtle' : 'border-light bg-light'"
                    (click)="selectedStrategy = strat.id"
                  >
                    <div class="d-flex align-items-center justify-content-between mb-1">
                      <span class="fw-bold text-dark">{{ strat.name }}</span>
                      <i class="bi" [ngClass]="selectedStrategy === strat.id ? 'bi-check-circle-fill text-primary' : 'bi-circle text-muted'"></i>
                    </div>
                    <p class="text-secondary small mb-0">{{ strat.desc }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Halls Selection -->
            <div class="mb-4">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <label class="form-label fw-semibold text-dark mb-0">Select Examination Halls</label>
                <button type="button" class="btn btn-sm btn-link text-decoration-none" (click)="toggleAllHalls()">
                  {{ selectedHallIds.size === halls.length ? 'Deselect All' : 'Select All Halls' }}
                </button>
              </div>

              <div *ngIf="selectedExam?.allottedHalls && selectedExam!.allottedHalls!.length > 0" class="alert alert-info py-2 px-3 mb-2 rounded-3 small d-flex align-items-center gap-2">
                <i class="bi bi-building-fill-check text-primary fs-6"></i>
                <div>
                  <strong>Admin-Allotted Halls Pre-Selected:</strong>
                  This schedule is configured for:
                  <span *ngFor="let h of selectedExam!.allottedHalls!" class="badge bg-primary-subtle text-primary border border-primary-subtle ms-1">{{ h.hallNumber }}</span>
                  ({{ selectedExam?.allottedCapacity }} Seats)
                </div>
              </div>

              <div class="row g-2">
                <div class="col-md-6" *ngFor="let hall of halls">
                  <div class="form-check p-2 bg-light rounded-3 border d-flex align-items-center gap-2">
                    <input
                      class="form-check-input ms-1"
                      type="checkbox"
                      [id]="'hall-' + hall.id"
                      [checked]="selectedHallIds.has(hall.id)"
                      (change)="toggleHall(hall.id)"
                    />
                    <label class="form-check-label w-100 cursor-pointer small" [for]="'hall-' + hall.id">
                      <strong>Hall {{ hall.hallNumber }}</strong> ({{ hall.building }})
                      <span class="badge bg-white text-secondary border float-end">{{ hall.capacity }} Seats</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex flex-wrap gap-2 pt-3 border-top">
              <button
                class="btn btn-outline-info rounded-pill px-3"
                [disabled]="!selectedExamId || isCheckingConflicts"
                (click)="runConflictCheck()"
              >
                <span *ngIf="isCheckingConflicts" class="spinner-border spinner-border-sm me-1"></span>
                <i class="bi bi-shield-check me-1"></i> Validate Conflicts & Capacity
              </button>

              <button
                class="btn btn-primary rounded-pill px-4 flex-grow-1"
                [disabled]="!canGenerate() || isGenerating"
                (click)="generateSeating(false)"
              >
                <span *ngIf="isGenerating && !isRegenerating" class="spinner-border spinner-border-sm me-1"></span>
                <i class="bi bi-play-circle-fill me-1"></i> Generate Seating
              </button>

              <button
                class="btn btn-warning rounded-pill px-3"
                [disabled]="!canGenerate() || isGenerating"
                (click)="promptRegenerate()"
                title="Clears existing seating and attendance allocations and re-runs generation"
              >
                <span *ngIf="isGenerating && isRegenerating" class="spinner-border spinner-border-sm me-1"></span>
                <i class="bi bi-arrow-clockwise me-1"></i> Regenerate Seating
              </button>
            </div>
          </div>
        </div>

        <!-- Validation & Diagnostics Panel -->
        <div class="col-lg-5">
          <div class="card border-0 shadow-sm rounded-4 p-4 bg-light h-100">
            <h5 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i class="bi bi-clipboard-pulse text-primary"></i> Conflict & Capacity Diagnostics
            </h5>

            <div *ngIf="!selectedExam" class="alert alert-secondary border-0 rounded-3 small">
              Please choose an exam from the dropdown to diagnose conflicts and check hall capacity.
            </div>

            <div *ngIf="selectedExam">
              <!-- Live Metrics Card -->
              <div class="p-3 bg-white rounded-3 shadow-sm mb-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-secondary">Enrolled Candidates</span>
                  <span class="fw-bold fs-5 text-dark">{{ enrolledCount }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="text-secondary">Selected Hall Seats</span>
                  <span class="fw-bold fs-5 text-primary">{{ calculateSelectedCapacity() }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center pt-2 border-top">
                  <span class="text-secondary">Capacity Margin</span>
                  <span class="fw-bold" [ngClass]="calculateSelectedCapacity() >= enrolledCount ? 'text-success' : 'text-danger'">
                    {{ calculateSelectedCapacity() - enrolledCount }} seats
                  </span>
                </div>
              </div>

              <!-- Live Conflict Diagnostic Results -->
              <div *ngIf="conflictReport" class="mb-3">
                <div class="card border-0 shadow-sm p-3 mb-2" [ngClass]="conflictReport.hasConflicts ? 'bg-danger bg-opacity-10' : 'bg-success bg-opacity-10'">
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi fs-4" [ngClass]="conflictReport.hasConflicts ? 'bi-x-circle-fill text-danger' : 'bi-check-circle-fill text-success'"></i>
                    <div>
                      <strong [ngClass]="conflictReport.hasConflicts ? 'text-danger' : 'text-success'">
                        {{ conflictReport.hasConflicts ? 'Conflicts Detected' : 'All Pre-checks Passed' }}
                      </strong>
                      <small class="d-block text-muted">
                        {{ conflictReport.hasConflicts ? 'Resolve blocking errors before generating' : 'Ready for automatic seat distribution' }}
                      </small>
                    </div>
                  </div>
                </div>

                <div *ngFor="let c of conflictReport.conflicts" class="alert py-2 px-3 mb-2 rounded-3 small d-flex align-items-start gap-2"
                     [ngClass]="{
                       'alert-danger': c.severity === 'ERROR',
                       'alert-warning': c.severity === 'WARNING',
                       'alert-info': c.severity === 'INFO'
                     }">
                  <i class="bi mt-1"
                     [ngClass]="{
                       'bi-x-circle-fill': c.severity === 'ERROR',
                       'bi-exclamation-triangle-fill': c.severity === 'WARNING',
                       'bi-info-circle-fill': c.severity === 'INFO'
                     }">
                  </i>
                  <div class="flex-grow-1">
                    <strong>[{{ c.type }}]:</strong> {{ c.message }}
                  </div>
                </div>
              </div>

              <!-- Default quick status -->
              <div *ngIf="!conflictReport">
                <div *ngIf="enrolledCount > calculateSelectedCapacity()" class="alert alert-danger border-0 rounded-3 small mb-3">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i>
                  <strong>Seat Shortage:</strong> Required: {{ enrolledCount }}, Selected: {{ calculateSelectedCapacity() }}.
                </div>

                <div *ngIf="enrolledCount === 0" class="alert alert-warning border-0 rounded-3 small mb-3">
                  <i class="bi bi-exclamation-circle-fill me-1"></i>
                  No candidates enrolled in this exam yet.
                </div>

                <div *ngIf="enrolledCount > 0 && calculateSelectedCapacity() >= enrolledCount" class="alert alert-success border-0 rounded-3 small mb-3">
                  <i class="bi bi-check-circle-fill me-1"></i>
                  Sufficient capacity selected! Click "Validate Conflicts & Capacity" for complete pre-generation diagnosis.
                </div>
              </div>
            </div>

            <div class="mt-auto">
              <h6 class="fw-bold text-dark small mb-2">Configurable Seating Separation Rules:</h6>
              <ul class="text-muted small ps-3 mb-0">
                <li><strong>Adjacent Branch Separation:</strong> Avoids candidates from the same branch sitting directly beside each other.</li>
                <li><strong>Conflict Verification:</strong> Detects seat shortages, double bookings, and time slot overlaps before assignment.</li>
                <li><strong>Safe Regeneration:</strong> Cleanly resets existing seating and attendance records without orphaned data.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal for Seating Regeneration -->
    <div *ngIf="showRegenerateModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4">
          <div class="modal-header bg-warning bg-opacity-10">
            <h5 class="modal-title fw-bold text-dark d-flex align-items-center gap-2">
              <i class="bi bi-arrow-clockwise text-warning"></i> Confirm Seating Regeneration
            </h5>
            <button type="button" class="btn-close" (click)="showRegenerateModal = false"></button>
          </div>
          <div class="modal-body p-4">
            <p class="mb-2 text-dark">
              Are you sure you want to regenerate seating for <strong>{{ selectedExam?.examName }}</strong>?
            </p>
            <div class="alert alert-warning small mb-0">
              <i class="bi bi-exclamation-triangle-fill me-1"></i>
              <strong>Notice:</strong> This action will delete any previous seat allocations and marked attendance records for this exam, then redistribute students using the <strong>{{ selectedStrategy }}</strong> rule.
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary rounded-pill px-3" (click)="showRegenerateModal = false">Cancel</button>
            <button type="button" class="btn btn-warning rounded-pill px-4" (click)="executeRegenerate()">
              Proceed with Regeneration
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cursor-pointer {
      cursor: pointer;
    }
  `]
})
export class GenerateSeatingComponent implements OnInit {
  exams: Exam[] = [];
  halls: Hall[] = [];
  selectedExamId: number | null = null;
  selectedExam: Exam | null = null;
  selectedStrategy: SeatingStrategy = 'ADJACENT_BRANCH_SEPARATION';
  selectedHallIds = new Set<number>();
  enrolledCount = 0;

  isGenerating = false;
  isRegenerating = false;
  isCheckingConflicts = false;
  errorMessage = '';
  generationResult: SeatingGenerationResponse | null = null;
  conflictReport: ConflictCheckResponse | null = null;
  showRegenerateModal = false;

  strategies: { id: SeatingStrategy; name: string; desc: string }[] = [
    {
      id: 'ADJACENT_BRANCH_SEPARATION',
      name: 'Adjacent Branch Separation (Recommended)',
      desc: 'Avoids candidates from the same branch sitting directly beside each other in contiguous desks.'
    },
    {
      id: 'BRANCH_ALTERNATION',
      name: 'Branch Alternation',
      desc: 'Interleaves students across multiple branches in round-robin order.'
    },
    {
      id: 'SECTION_ALTERNATION',
      name: 'Section Alternation',
      desc: 'Alternates students from different sections (e.g. Sec A, Sec B, Sec C) across neighboring desks.'
    },
    {
      id: 'SEQUENTIAL',
      name: 'Sequential Order',
      desc: 'Assigns students strictly in order of their register numbers row-by-row.'
    },
    {
      id: 'RANDOM',
      name: 'Random Shuffling',
      desc: 'Completely randomizes student seat distribution across selected halls.'
    }
  ];

  constructor(
    private examService: ExamService,
    private hallService: HallService,
    private seatingService: SeatingService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.examService.getAllExams().subscribe(res => {
      this.exams = res.data || [];
      const queryExamId = this.route.snapshot.queryParams['examId'];
      if (queryExamId) {
        this.selectedExamId = Number(queryExamId);
        this.onExamSelected();
      }
    });

    this.hallService.getAllHalls().subscribe(res => {
      this.halls = res.data || [];
      this.halls.forEach(h => this.selectedHallIds.add(h.id));
    });
  }

  onExamSelected(): void {
    this.generationResult = null;
    this.conflictReport = null;
    this.errorMessage = '';
    this.selectedExam = this.exams.find(e => e.id === Number(this.selectedExamId)) || null;

    if (this.selectedExam && this.selectedExam.allottedHallIds && this.selectedExam.allottedHallIds.length > 0) {
      this.selectedHallIds = new Set(this.selectedExam.allottedHallIds);
    } else {
      this.selectedHallIds.clear();
      this.halls.forEach(h => this.selectedHallIds.add(h.id));
    }

    if (this.selectedExamId) {
      this.examService.getStudentsByExamId(this.selectedExamId).subscribe({
        next: (res) => {
          this.enrolledCount = res.data?.length || 0;
          this.runConflictCheck();
        },
        error: () => {
          this.enrolledCount = 0;
        }
      });
    } else {
      this.enrolledCount = 0;
    }
  }

  toggleHall(hallId: number): void {
    if (this.selectedHallIds.has(hallId)) {
      this.selectedHallIds.delete(hallId);
    } else {
      this.selectedHallIds.add(hallId);
    }
    if (this.selectedExamId) {
      this.runConflictCheck();
    }
  }

  toggleAllHalls(): void {
    if (this.selectedHallIds.size === this.halls.length) {
      this.selectedHallIds.clear();
    } else {
      this.halls.forEach(h => this.selectedHallIds.add(h.id));
    }
    if (this.selectedExamId) {
      this.runConflictCheck();
    }
  }

  calculateSelectedCapacity(): number {
    return this.halls
      .filter(h => this.selectedHallIds.has(h.id))
      .reduce((sum, h) => sum + (h.capacity || 0), 0);
  }

  canGenerate(): boolean {
    if (!this.selectedExamId || this.enrolledCount === 0) return false;
    if (this.selectedHallIds.size === 0) return false;
    return this.calculateSelectedCapacity() >= this.enrolledCount;
  }

  runConflictCheck(): void {
    if (!this.selectedExamId) return;
    this.isCheckingConflicts = true;
    const req = {
      strategy: this.selectedStrategy,
      hallIds: Array.from(this.selectedHallIds)
    };

    this.seatingService.validateConflicts(this.selectedExamId, req).subscribe({
      next: (res) => {
        this.conflictReport = res.data;
        this.isCheckingConflicts = false;
      },
      error: () => {
        this.isCheckingConflicts = false;
      }
    });
  }

  promptRegenerate(): void {
    this.showRegenerateModal = true;
  }

  executeRegenerate(): void {
    this.showRegenerateModal = false;
    this.generateSeating(true);
  }

  generateSeating(isRegenerate = false): void {
    if (!this.selectedExamId) return;

    this.isGenerating = true;
    this.isRegenerating = isRegenerate;
    this.errorMessage = '';
    this.generationResult = null;

    const req = {
      strategy: this.selectedStrategy,
      hallIds: Array.from(this.selectedHallIds)
    };

    const call$ = isRegenerate
      ? this.seatingService.regenerateSeating(this.selectedExamId, req)
      : this.seatingService.generateSeating(this.selectedExamId, req);

    call$.subscribe({
      next: (res) => {
        this.isGenerating = false;
        this.isRegenerating = false;
        this.generationResult = res.data || null;
        this.runConflictCheck();
      },
      error: (err) => {
        this.isGenerating = false;
        this.isRegenerating = false;
        this.errorMessage = err.error?.message || 'Failed to generate seating arrangement.';
      }
    });
  }
}
