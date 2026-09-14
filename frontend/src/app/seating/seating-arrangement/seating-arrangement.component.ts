import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ExamService } from '../../core/services/exam.service';
import { HallService } from '../../core/services/hall.service';
import { SeatingService } from '../../core/services/seating.service';
import { SeatService } from '../../core/services/seat.service';
import { ReportService } from '../../core/services/report.service';
import { Exam } from '../../core/models/exam.model';
import { Hall } from '../../core/models/hall.model';
import { SeatingArrangementDetail } from '../../core/models/seating.model';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

interface HallArrangementView {
  hallId: number;
  hallNumber: string;
  building: string;
  rowsCount: number;
  columnsCount: number;
  capacity: number;
  assignedCount: number;
  rows: {
    rowNumber: number;
    seats: {
      seatNumber: string;
      columnNumber: number;
      student?: SeatingArrangementDetail;
    }[];
  }[];
}

@Component({
  selector: 'app-seating-arrangement',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmationDialogComponent],
  template: `
    <div class="fade-in">
      <!-- Printable Page Header (Visible only when printing) -->
      <div class="d-none d-print-block text-center mb-4">
        <h3 class="fw-bold mb-1">SMART EXAM SEATING ARRANGEMENT SYSTEM</h3>
        <h5 class="text-secondary mb-1">Official Examination Hall Seating Chart</h5>
        <div class="small text-muted" *ngIf="getSelectedExam()">
          Exam: <strong>{{ getSelectedExam()?.examName }}</strong> ({{ getSelectedExam()?.subject }}) |
          Date: <strong>{{ getSelectedExam()?.examDate }}</strong> |
          Time: <strong>{{ getSelectedExam()?.startTime }} - {{ getSelectedExam()?.endTime }}</strong>
        </div>
        <hr class="my-2">
      </div>

      <!-- Action Bar (Hidden when printing) -->
      <div class="d-print-none d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 class="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i class="bi bi-grid-3x3-gap-fill text-primary"></i> Examination Seating Arrangement
          </h2>
          <p class="text-secondary small mb-0">Visual hall-by-hall seating matrix, PDF generation, and printable notice chart</p>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <!-- Print Button -->
          <button class="btn btn-outline-dark d-flex align-items-center gap-2 shadow-sm rounded-pill px-3"
                  (click)="printArrangement()"
                  [disabled]="hallViews.length === 0">
            <i class="bi bi-printer-fill"></i>
            <span>Print Seating Arrangement</span>
          </button>

          <!-- Download Exam PDF Button -->
          <button class="btn btn-outline-danger d-flex align-items-center gap-2 shadow-sm rounded-pill px-3"
                  (click)="downloadExamPdf()"
                  [disabled]="!selectedExamId || arrangements.length === 0 || isDownloadingPdf">
            <i class="bi bi-file-earmark-pdf-fill"></i>
            <span>Download PDF</span>
          </button>

          <a [routerLink]="['/seating/generate']" [queryParams]="{ examId: selectedExamId }"
             class="btn btn-primary shadow-sm d-flex align-items-center gap-2 rounded-pill px-3">
            <i class="bi bi-arrow-clockwise"></i>
            <span>Regenerate Seating</span>
          </a>

          <button
            class="btn btn-outline-danger d-flex align-items-center gap-2 rounded-pill px-3"
            *ngIf="selectedExamId && arrangements.length > 0"
            (click)="isDeleteDialogOpen = true"
          >
            <i class="bi bi-trash-fill"></i>
            <span>Clear Seating</span>
          </button>
        </div>
      </div>

      <!-- Filter Controls Bar (Hidden when printing) -->
      <div class="d-print-none card border-0 shadow-sm rounded-3 mb-4">
        <div class="card-body p-3">
          <div class="row g-3 align-items-center">
            <div class="col-md-4">
              <label class="form-label small fw-semibold text-dark mb-1">Select Exam</label>
              <select class="form-select bg-light border-0" [(ngModel)]="selectedExamId" (change)="onExamChanged()">
                <option [ngValue]="null" disabled>-- Choose an examination --</option>
                <option *ngFor="let ex of exams" [ngValue]="ex.id">
                  {{ ex.examName }} ({{ ex.subject }} - {{ ex.examDate }})
                </option>
              </select>
            </div>

            <div class="col-md-3">
              <label class="form-label small fw-semibold text-dark mb-1">Filter by Hall</label>
              <select class="form-select bg-light border-0" [(ngModel)]="selectedHallFilter" (change)="applyHallFilter()">
                <option value="ALL">All Utilized Halls</option>
                <option *ngFor="let h of availableHallsInArrangement" [value]="h.id">
                  Hall {{ h.hallNumber }} ({{ h.building }})
                </option>
              </select>
            </div>

            <div class="col-md-3">
              <label class="form-label small fw-semibold text-dark mb-1">Highlight Student</label>
              <input type="text" class="form-control bg-light border-0" placeholder="Type name or reg no..."
                     [(ngModel)]="highlightKeyword" />
            </div>

            <div class="col-md-2 text-end pt-3">
              <span class="badge bg-primary px-3 py-2 fs-7">
                Total Seated: <strong>{{ arrangements.length }}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerts (Hidden when printing) -->
      <div *ngIf="errorMessage" class="d-print-none alert alert-danger alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>

      <div *ngIf="successMessage" class="d-print-none alert alert-success alert-dismissible fade show" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>{{ successMessage }}
        <button type="button" class="btn-close" (click)="successMessage = ''"></button>
      </div>

      <!-- Loading State (Hidden when printing) -->
      <div *ngIf="isLoading" class="d-print-none text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2">Loading seating arrangement...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && selectedExamId && arrangements.length === 0" class="card border-0 shadow-sm rounded-4 py-5 text-center text-muted">
        <i class="bi bi-grid-3x3-gap fs-1 text-secondary opacity-50 d-block mb-3"></i>
        <h5 class="fw-bold text-dark">No Seating Generated for this Exam Yet</h5>
        <p class="text-secondary small mb-3">Enroll candidates and generate automatic seating arrangements with anti-cheating separation.</p>
        <div>
          <a [routerLink]="['/seating/generate']" [queryParams]="{ examId: selectedExamId }" class="btn btn-primary rounded-pill px-4">
            <i class="bi bi-cpu-fill me-1"></i> Generate Seating Now
          </a>
        </div>
      </div>

      <!-- Hall by Hall Arrangement Cards -->
      <div *ngIf="!isLoading && displayedHallViews.length > 0" class="d-flex flex-column gap-4 mb-5">
        <div *ngFor="let hv of displayedHallViews" class="card border-0 shadow-sm rounded-4 p-4 print-hall-card">
          <!-- Hall Header -->
          <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-3 border-bottom gap-2">
            <div>
              <span class="badge bg-primary fs-6 px-3 py-2 rounded-pill me-2">Hall {{ hv.hallNumber }}</span>
              <span class="text-secondary small">{{ hv.building }} | Capacity: {{ hv.capacity }} Seats</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="badge bg-light text-dark border px-3 py-2">
                Occupancy: <strong>{{ hv.assignedCount }} / {{ hv.capacity }}</strong> ({{ getOccupancyPercent(hv) }}%)
              </span>
              <!-- Hall PDF Download Button (Hidden when printing) -->
              <button class="d-print-none btn btn-sm btn-outline-danger rounded-pill px-3"
                      (click)="downloadHallPdf(hv.hallId)"
                      title="Download Door Notice PDF for this Hall">
                <i class="bi bi-file-earmark-pdf me-1"></i> Hall PDF
              </button>
            </div>
          </div>

          <!-- Front of Hall indicator -->
          <div class="text-center mb-4">
            <div class="d-inline-block px-4 py-1 bg-dark text-white rounded-pill small fw-semibold">
              <i class="bi bi-display me-1"></i> FRONT OF EXAMINATION HALL / WHITEBOARD
            </div>
          </div>

          <!-- Visual Matrix of Rows -->
          <div class="d-flex flex-column gap-3 overflow-auto pb-2">
            <div *ngFor="let row of hv.rows" class="d-flex align-items-center gap-3">
              <!-- Row Label -->
              <span class="badge bg-secondary-subtle text-secondary px-3 py-2 fw-bold text-nowrap" style="width: 75px;">
                Row {{ row.rowNumber }}
              </span>

              <!-- Seats in Row -->
              <div class="d-flex gap-2 flex-wrap flex-grow-1">
                <div
                  *ngFor="let seat of row.seats"
                  class="arrangement-seat-box rounded-3 p-2 d-flex flex-column align-items-center justify-content-center border transition"
                  [ngClass]="[
                    getSeatAssignmentClass(seat.student),
                    isHighlighted(seat.student) ? 'seat-highlighted' : ''
                  ]"
                  [title]="seat.student ? (seat.student.studentName + ' (' + seat.student.studentRegisterNumber + ') - ' + seat.student.studentBranch) : ('Seat ' + seat.seatNumber + ': Empty')"
                >
                  <div class="fw-bold text-truncate" style="font-size: 0.8rem;">
                    {{ seat.student ? seat.student.studentRegisterNumber : seat.seatNumber }}
                  </div>
                  <div class="small fw-semibold text-truncate" style="font-size: 0.68rem;">
                    <span *ngIf="seat.student">{{ seat.student.studentBranch }}</span>
                    <span *ngIf="!seat.student" class="text-muted">Empty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Concise Text Row Sequence Representation -->
          <div class="mt-4 pt-3 border-top bg-light p-3 rounded-3">
            <h6 class="fw-bold text-dark small mb-2 d-flex align-items-center gap-1">
              <i class="bi bi-list-columns-reverse text-primary"></i> Row-wise Desk Sequence (Door Notice):
            </h6>
            <div class="font-monospace small text-secondary d-flex flex-column gap-1">
              <div *ngFor="let row of hv.rows">
                <strong class="text-dark">R{{ row.rowNumber }}:</strong>
                <span *ngFor="let seat of row.seats" class="badge me-1 my-1"
                      [ngClass]="seat.student ? 'bg-white text-dark border' : 'bg-light text-muted border-0'">
                  [{{ seat.student ? (seat.student.studentRegisterNumber + ' ' + seat.student.studentBranch) : (seat.seatNumber + ' -') }}]
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Clear Modal -->
    <app-confirmation-dialog
      [isOpen]="isDeleteDialogOpen"
      title="Clear Seating Arrangement"
      message="Are you sure you want to delete all generated seat allocations for this exam? Students will become unassigned."
      (confirmed)="confirmClearArrangement()"
      (cancelled)="isDeleteDialogOpen = false"
    ></app-confirmation-dialog>
  `,
  styles: [`
    .arrangement-seat-box {
      min-width: 95px;
      min-height: 52px;
    }
    .seat-assigned-cse {
      background-color: #e0f2fe;
      border-color: #38bdf8 !important;
      color: #0369a1;
    }
    .seat-assigned-ece {
      background-color: #fef3c7;
      border-color: #fcd34d !important;
      color: #b45309;
    }
    .seat-assigned-mech {
      background-color: #f3e8ff;
      border-color: #d8b4fe !important;
      color: #7e22ce;
    }
    .seat-assigned-civil {
      background-color: #dcfce7;
      border-color: #86efac !important;
      color: #15803d;
    }
    .seat-assigned-it {
      background-color: #fee2e2;
      border-color: #fca5a5 !important;
      color: #b91c1c;
    }
    .seat-assigned-default {
      background-color: #f1f5f9;
      border-color: #cbd5e1 !important;
      color: #334155;
    }
    .seat-vacant {
      background-color: #fafafa;
      border-color: #e2e8f0 !important;
      color: #94a3b8;
    }
    .seat-highlighted {
      outline: 3px solid #dc2626 !important;
      transform: scale(1.06);
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
    }

    @media print {
      body {
        background: white !important;
        font-size: 11pt;
      }
      .d-print-none {
        display: none !important;
      }
      .d-print-block {
        display: block !important;
      }
      .print-hall-card {
        box-shadow: none !important;
        border: 1px solid #ccc !important;
        page-break-after: always;
        break-after: page;
        margin-bottom: 2rem !important;
      }
      .arrangement-seat-box {
        border: 1px solid #333 !important;
        background: white !important;
        color: black !important;
      }
    }
  `]
})
export class SeatingArrangementComponent implements OnInit {
  exams: Exam[] = [];
  selectedExamId: number | null = null;
  arrangements: SeatingArrangementDetail[] = [];
  hallViews: HallArrangementView[] = [];
  displayedHallViews: HallArrangementView[] = [];
  availableHallsInArrangement: { id: number; hallNumber: string; building: string }[] = [];
  selectedHallFilter = 'ALL';
  highlightKeyword = '';

  isLoading = false;
  isDownloadingPdf = false;
  errorMessage = '';
  successMessage = '';
  isDeleteDialogOpen = false;

  constructor(
    private route: ActivatedRoute,
    private examService: ExamService,
    private hallService: HallService,
    private seatService: SeatService,
    private seatingService: SeatingService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.examService.getAllExams().subscribe(res => {
      this.exams = res.data || [];
      const routeExamId = this.route.snapshot.paramMap.get('examId');
      const queryExamId = this.route.snapshot.queryParams['examId'];
      const queryHallId = this.route.snapshot.queryParams['hallId'];

      if (routeExamId) {
        this.selectedExamId = Number(routeExamId);
      } else if (queryExamId) {
        this.selectedExamId = Number(queryExamId);
      } else if (this.exams.length > 0) {
        this.selectedExamId = this.exams[0].id;
      }

      if (queryHallId) {
        this.selectedHallFilter = queryHallId.toString();
      }

      if (this.selectedExamId) {
        this.loadArrangement();
      }
    });
  }

  getSelectedExam(): Exam | undefined {
    return this.exams.find(e => e.id === Number(this.selectedExamId));
  }

  onExamChanged(): void {
    this.selectedHallFilter = 'ALL';
    this.loadArrangement();
  }

  loadArrangement(): void {
    if (!this.selectedExamId) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.seatingService.getArrangementByExamId(this.selectedExamId).subscribe({
      next: (res) => {
        this.arrangements = res.data || [];
        this.buildHallViews();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load seating arrangements.';
        this.isLoading = false;
      }
    });
  }

  buildHallViews(): void {
    if (this.arrangements.length === 0) {
      this.hallViews = [];
      this.displayedHallViews = [];
      this.availableHallsInArrangement = [];
      return;
    }

    const hallMap = new Map<number, SeatingArrangementDetail[]>();
    this.arrangements.forEach(arr => {
      if (!hallMap.has(arr.hallId)) {
        hallMap.set(arr.hallId, []);
      }
      hallMap.get(arr.hallId)!.push(arr);
    });

    this.hallService.getAllHalls().subscribe(hallsRes => {
      const allHalls = hallsRes.data || [];
      const views: HallArrangementView[] = [];
      const availHalls: { id: number; hallNumber: string; building: string }[] = [];

      hallMap.forEach((details, hallId) => {
        const hallObj = allHalls.find(h => h.id === hallId);
        const hallNumber = hallObj?.hallNumber || details[0]?.hallNumber || `Hall ${hallId}`;
        const building = hallObj?.building || details[0]?.building || '';
        const rowsCount = hallObj?.rowsCount || 5;
        const columnsCount = hallObj?.columnsCount || 6;
        const capacity = hallObj?.capacity || (rowsCount * columnsCount);

        availHalls.push({ id: hallId, hallNumber, building });

        const studentByRowCol = new Map<string, SeatingArrangementDetail>();
        details.forEach(d => {
          studentByRowCol.set(`${d.rowNumber}-${d.columnNumber}`, d);
        });

        let maxRow = rowsCount;
        let maxCol = columnsCount;
        details.forEach(d => {
          if (d.rowNumber > maxRow) maxRow = d.rowNumber;
          if (d.columnNumber > maxCol) maxCol = d.columnNumber;
        });

        const rows: HallArrangementView['rows'] = [];
        for (let r = 1; r <= maxRow; r++) {
          const seatsInRow = [];
          for (let c = 1; c <= maxCol; c++) {
            const student = studentByRowCol.get(`${r}-${c}`);
            const seatNumber = student?.seatNumber || `R${r}C${c}`;
            seatsInRow.push({
              seatNumber,
              columnNumber: c,
              student
            });
          }
          rows.push({ rowNumber: r, seats: seatsInRow });
        }

        views.push({
          hallId,
          hallNumber,
          building,
          rowsCount: maxRow,
          columnsCount: maxCol,
          capacity,
          assignedCount: details.length,
          rows
        });
      });

      this.hallViews = views;
      this.availableHallsInArrangement = availHalls;
      this.applyHallFilter();
    });
  }

  applyHallFilter(): void {
    if (this.selectedHallFilter === 'ALL') {
      this.displayedHallViews = [...this.hallViews];
    } else {
      const targetId = Number(this.selectedHallFilter);
      this.displayedHallViews = this.hallViews.filter(v => v.hallId === targetId);
    }
  }

  getOccupancyPercent(hv: HallArrangementView): number {
    if (!hv.capacity) return 0;
    return Math.round((hv.assignedCount / hv.capacity) * 100);
  }

  getSeatAssignmentClass(student?: SeatingArrangementDetail): string {
    if (!student) return 'seat-vacant';
    const b = (student.studentBranch || '').toUpperCase();
    if (b.includes('CSE') || b.includes('CS')) return 'seat-assigned-cse';
    if (b.includes('ECE')) return 'seat-assigned-ece';
    if (b.includes('MECH')) return 'seat-assigned-mech';
    if (b.includes('CIVIL')) return 'seat-assigned-civil';
    if (b.includes('IT')) return 'seat-assigned-it';
    return 'seat-assigned-default';
  }

  isHighlighted(student?: SeatingArrangementDetail): boolean {
    if (!student || !this.highlightKeyword.trim()) return false;
    const kw = this.highlightKeyword.trim().toLowerCase();
    return (
      (student.studentName && student.studentName.toLowerCase().includes(kw)) ||
      (student.studentRegisterNumber && student.studentRegisterNumber.toLowerCase().includes(kw)) ||
      (student.studentBranch && student.studentBranch.toLowerCase().includes(kw))
    );
  }

  confirmClearArrangement(): void {
    if (!this.selectedExamId) return;
    this.seatingService.deleteArrangementByExam(this.selectedExamId).subscribe({
      next: () => {
        this.isDeleteDialogOpen = false;
        this.arrangements = [];
        this.hallViews = [];
        this.displayedHallViews = [];
        this.successMessage = 'Seating arrangement cleared successfully.';
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        this.isDeleteDialogOpen = false;
        this.errorMessage = err.error?.message || 'Failed to clear seating arrangement.';
      }
    });
  }

  printArrangement(): void {
    window.print();
  }

  downloadExamPdf(): void {
    if (!this.selectedExamId) return;
    this.isDownloadingPdf = true;
    this.reportService.downloadExamSeatingPdf(this.selectedExamId).subscribe({
      next: (blob) => {
        this.isDownloadingPdf = false;
        this.reportService.triggerFileDownload(blob, `exam-seating-arrangement-${this.selectedExamId}.pdf`);
      },
      error: () => {
        this.isDownloadingPdf = false;
        this.errorMessage = 'Failed to generate Exam Seating PDF.';
      }
    });
  }

  downloadHallPdf(hallId: number): void {
    if (!this.selectedExamId) return;
    this.reportService.downloadHallChartPdf(hallId, this.selectedExamId).subscribe({
      next: (blob) => {
        this.reportService.triggerFileDownload(blob, `hall-${hallId}-seating-chart-${this.selectedExamId}.pdf`);
      },
      error: () => {
        this.errorMessage = 'Failed to generate Hall Seating Chart PDF.';
      }
    });
  }
}
