import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SeatingService } from '../../core/services/seating.service';
import { ExamService } from '../../core/services/exam.service';
import { StudentService } from '../../core/services/student.service';
import { ReportService } from '../../core/services/report.service';
import { Exam } from '../../core/models/exam.model';
import { StudentSeatSearchResponse } from '../../core/models/seating.model';

@Component({
  selector: 'app-student-seat-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="fade-in max-w-75 mx-auto">
      <div class="text-center mb-4">
        <span class="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-semibold mb-2">
          <i class="bi bi-search me-1"></i> Public Student Portal
        </span>
        <h2 class="h3 fw-bold text-dark mb-1">Examination Hall & Seat Locator</h2>
        <p class="text-secondary small">Enter your official Register Number to find your assigned hall, row, and desk</p>
      </div>

      <!-- Search Card -->
      <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
        <form (ngSubmit)="onSearch()">
          <div class="row g-3 align-items-end">
            <div class="col-md-5">
              <label class="form-label fw-semibold text-dark small">Target Examination <span class="text-danger">*</span></label>
              <select class="form-select bg-light" [(ngModel)]="selectedExamId" name="examId" required>
                <option [ngValue]="null" disabled>-- Choose Examination --</option>
                <option *ngFor="let ex of exams" [ngValue]="ex.id">
                  {{ ex.examName }} ({{ ex.subject }})
                </option>
              </select>
            </div>

            <div class="col-md-5">
              <label class="form-label fw-semibold text-dark small">Student Register Number <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0"><i class="bi bi-person-badge"></i></span>
                <input
                  type="text"
                  class="form-control bg-light border-start-0"
                  name="registerNumber"
                  [(ngModel)]="registerNumber"
                  placeholder="e.g. 21CS001"
                  required
                />
              </div>
            </div>

            <div class="col-md-2">
              <button
                type="submit"
                class="btn btn-primary w-100 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                [disabled]="!selectedExamId || !registerNumber.trim() || isSearching"
              >
                <span *ngIf="isSearching" class="spinner-border spinner-border-sm"></span>
                <i *ngIf="!isSearching" class="bi bi-search"></i>
                <span>Find Seat</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Alerts -->
      <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <div>{{ errorMessage }}</div>
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>

      <!-- Result: Printable Admission Card / Hall Ticket -->
      <div *ngIf="searchResult" class="card border-0 shadow-lg rounded-4 overflow-hidden mb-4 print-card">
        <div class="bg-primary text-white p-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <span class="badge bg-white text-primary px-3 py-1 fw-bold rounded-pill mb-1">OFFICIAL ADMISSION PASS</span>
            <h4 class="fw-bold mb-0 text-white">Smart Examination Hall Ticket</h4>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn btn-light rounded-pill px-3 shadow-sm d-flex align-items-center gap-2"
                    (click)="downloadAdmitCard()" [disabled]="isDownloadingAdmitCard">
              <span *ngIf="isDownloadingAdmitCard" class="spinner-border spinner-border-sm text-danger"></span>
              <i *ngIf="!isDownloadingAdmitCard" class="bi bi-file-earmark-pdf-fill text-danger"></i>
              <span class="text-danger fw-semibold">
                {{ isDownloadingAdmitCard ? 'Generating...' : 'Download Admit Card (PDF)' }}
              </span>
            </button>
            <button class="btn btn-light rounded-pill px-3 shadow-sm d-flex align-items-center gap-2" (click)="printSlip()">
              <i class="bi bi-printer-fill text-primary"></i>
              <span class="text-primary fw-semibold">Print Slip</span>
            </button>
          </div>
        </div>

        <div class="card-body p-4 p-md-5">
          <div class="row g-4 mb-4">
            <div class="col-md-6 border-end">
              <span class="text-muted small text-uppercase fw-semibold">Student Name</span>
              <h4 class="fw-bold text-dark mt-1 mb-3">{{ searchResult.studentName }}</h4>

              <div class="d-flex align-items-center gap-2 mb-2">
                <span class="text-secondary small">Register Number:</span>
                <span class="badge bg-primary-subtle text-primary fs-6 px-3 py-1">{{ searchResult.registerNumber }}</span>
              </div>

              <div class="d-flex align-items-center gap-2">
                <span class="text-secondary small">Examination:</span>
                <span class="fw-semibold text-dark">{{ searchResult.exam }}</span>
              </div>
            </div>

            <div class="col-md-6 ps-md-4">
              <div class="p-3 bg-light rounded-4 text-center border">
                <span class="text-muted small text-uppercase fw-semibold d-block mb-1">Assigned Hall & Desk</span>
                <div class="display-6 fw-bold text-primary mb-2">
                  Hall {{ searchResult.hall }}
                </div>
                <div class="d-flex justify-content-center gap-3">
                  <div class="badge bg-white text-dark border px-3 py-2 shadow-sm fs-7">
                    Seat: <strong>{{ searchResult.seat }}</strong>
                  </div>
                  <div class="badge bg-white text-dark border px-3 py-2 shadow-sm fs-7">
                    Row: <strong>{{ searchResult.row }}</strong>
                  </div>
                  <div class="badge bg-white text-dark border px-3 py-2 shadow-sm fs-7">
                    Column: <strong>{{ searchResult.column }}</strong>
                  </div>
                </div>
              </div>

              <div class="mt-3 text-center text-muted small">
                <i class="bi bi-calendar-check text-success me-1"></i> Exam Date: <strong>{{ searchResult.date }}</strong>
              </div>
            </div>
          </div>

          <!-- Interactive 2D Hall Floor Map & Desk Locator -->
          <div class="mt-4 pt-4 border-top">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <i class="bi bi-map-fill text-primary"></i> 2D Hall Floor Plan &amp; Desk Locator
                </h6>
                <span class="small text-muted">Classroom desk arrangement • Board orientation</span>
              </div>
              <span class="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-semibold">
                <i class="bi bi-geo-alt-fill me-1"></i> Row {{ searchResult.row }}, Column {{ searchResult.column }}
              </span>
            </div>

            <div class="bg-white rounded-4 p-4 border shadow-sm">
              <div class="text-center mb-4">
                <div class="d-inline-block px-5 py-2 bg-dark text-white rounded-pill small fw-bold shadow-sm">
                  <i class="bi bi-easel2-fill me-2 text-warning"></i> FRONT OF HALL / INSTRUCTOR DESK
                </div>
              </div>

              <div class="d-flex flex-column gap-3 align-items-center overflow-auto pb-2">
                <div *ngFor="let row of getHallGridRows()" class="d-flex align-items-center gap-3">
                  <span class="badge bg-light text-secondary border px-2 py-2 small fw-bold text-nowrap" style="width: 60px;">
                    Row {{ row.rowNumber }}
                  </span>
                  <div class="d-flex gap-3 flex-wrap justify-content-center">
                    <div *ngFor="let desk of row.cols"
                         class="floor-desk-box rounded-3 p-2 d-flex flex-column align-items-center justify-content-center border"
                         [ngClass]="desk.isUserSeat ? 'user-desk-glow' : 'standard-desk'">
                      <div class="d-flex align-items-center gap-1">
                        <i *ngIf="desk.isUserSeat" class="bi bi-person-fill text-white fs-6 animate-bounce"></i>
                        <span class="fw-bold" [style.font-size]="'0.82rem'">{{ desk.seatNumber }}</span>
                      </div>
                      <span *ngIf="desk.isUserSeat" class="badge bg-white text-success px-2 py-0 fw-bold mt-1 shadow-sm" style="font-size: 0.65rem;">
                        YOU ARE HERE
                      </span>
                      <span *ngIf="!desk.isUserSeat" class="text-muted" style="font-size: 0.65rem;">
                        Desk
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="d-flex flex-wrap justify-content-between align-items-center mt-4 pt-3 border-top small text-secondary gap-2">
                <div class="d-flex align-items-center gap-2">
                  <span class="badge bg-secondary px-3 py-1 rounded-pill"><i class="bi bi-door-open-fill me-1"></i> ENTRANCE</span>
                  <span>Hall {{ searchResult.hall }} Main Entry Door</span>
                </div>
                <div class="d-flex align-items-center gap-3">
                  <span><span class="legend-dot bg-success"></span> Your Assigned Seat</span>
                  <span><span class="legend-dot bg-secondary-subtle"></span> Other Seat</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Instructions notice -->
          <div class="alert alert-warning border-0 rounded-3 small mb-0 mt-4">
            <strong>Candidate Instructions:</strong>
            <ul class="mb-0 ps-3 mt-1">
              <li>Please carry a physical copy of this slip and your valid college photo identity card.</li>
              <li>Report to <strong>Hall {{ searchResult.hall }}</strong> at least 20 minutes prior to the exam commencement.</li>
              <li>Calculators and electronic devices are strictly prohibited unless permitted by the subject instructor.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .max-w-75 {
      max-width: 860px;
    }
    .floor-desk-box {
      min-width: 96px;
      min-height: 60px;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 2px 5px rgba(0,0,0,0.03);
    }
    .floor-desk-box:hover:not(.user-desk-glow) {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0,0,0,0.08);
      border-color: #cbd5e1 !important;
    }
    .user-desk-glow {
      background: linear-gradient(135deg, #0d9488 0%, #059669 100%) !important;
      color: white !important;
      border: 2px solid #0f766e !important;
      box-shadow: 0 0 20px rgba(13, 148, 136, 0.6), 0 0 40px rgba(16, 185, 129, 0.35);
      animation: pulseDeskGlow 2s infinite alternate;
      transform: scale(1.08);
      z-index: 5;
    }
    @keyframes pulseDeskGlow {
      0% {
        box-shadow: 0 0 14px rgba(13, 148, 136, 0.5), 0 0 24px rgba(16, 185, 129, 0.25);
        transform: scale(1.06);
      }
      100% {
        box-shadow: 0 0 26px rgba(13, 148, 136, 0.85), 0 0 48px rgba(16, 185, 129, 0.45);
        transform: scale(1.09);
      }
    }
    .standard-desk {
      background: #ffffff;
      border-color: #e2e8f0 !important;
      color: #64748b;
    }
    .legend-dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 4px;
    }
    .animate-bounce {
      animation: bounce 1.5s infinite;
    }
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
  `]
})
export class StudentSeatSearchComponent implements OnInit {
  exams: Exam[] = [];
  selectedExamId: number | null = null;
  registerNumber = '';
  searchResult: StudentSeatSearchResponse | null = null;
  isSearching = false;
  isDownloadingAdmitCard = false;
  errorMessage = '';
  studentId: number | null = null;

  constructor(
    private seatingService: SeatingService,
    private examService: ExamService,
    private studentService: StudentService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    this.examService.getAllExams().subscribe(res => {
      this.exams = res.data || [];
      if (this.exams.length > 0) {
        this.selectedExamId = this.exams[0].id;
      }
    });
  }

  onSearch(): void {
    if (!this.selectedExamId || !this.registerNumber.trim()) return;

    this.isSearching = true;
    this.errorMessage = '';
    this.searchResult = null;
    this.studentId = null;

    const reg = this.registerNumber.trim();
    this.seatingService.searchStudentSeat(reg, this.selectedExamId).subscribe({
      next: (res) => {
        this.isSearching = false;
        this.searchResult = res.data || null;
        // Resolve student ID for PDF Admit card download
        this.studentService.getStudentByRegisterNumber(reg).subscribe({
          next: (stRes) => {
            this.studentId = stRes.data?.id || null;
          }
        });
      },
      error: (err) => {
        this.isSearching = false;
        this.errorMessage = err.error?.message || `No seating record found for Register No "${this.registerNumber.trim()}" in the selected exam.`;
      }
    });
  }

  downloadAdmitCard(): void {
    if (!this.selectedExamId || !this.studentId) return;
    this.isDownloadingAdmitCard = true;
    this.reportService.downloadAdmitCardPdf(this.selectedExamId, this.studentId).subscribe({
      next: (blob) => {
        this.isDownloadingAdmitCard = false;
        this.reportService.triggerFileDownload(blob, `admit-card-${this.registerNumber.trim()}-exam-${this.selectedExamId}.pdf`);
      },
      error: () => {
        this.isDownloadingAdmitCard = false;
      }
    });
  }

  getHallGridRows(): { rowNumber: number; cols: { colNumber: number; seatNumber: string; isUserSeat: boolean }[] }[] {
    if (!this.searchResult) return [];
    const numRows = Math.max(Number(this.searchResult.hallRows) || Number(this.searchResult.row) || 5, 5);
    const numCols = Math.max(Number(this.searchResult.hallColumns) || Number(this.searchResult.column) || 3, 3);

    const rows = [];
    for (let r = 1; r <= numRows; r++) {
      const cols = [];
      for (let c = 1; c <= numCols; c++) {
        const seatNum = `R${r}-C${c}`;
        const isUserSeat = (r === Number(this.searchResult.row) && c === Number(this.searchResult.column)) ||
                           (this.searchResult.seat === seatNum);
        cols.push({ colNumber: c, seatNumber: seatNum, isUserSeat });
      }
      rows.push({ rowNumber: r, cols });
    }
    return rows;
  }

  printSlip(): void {
    window.print();
  }
}
