import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ExamService } from '../../core/services/exam.service';
import { StudentService } from '../../core/services/student.service';
import { Exam } from '../../core/models/exam.model';
import { Student, StudentImportSummary } from '../../core/models/student.model';

@Component({
  selector: 'app-exam-students',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="fade-in">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <a routerLink="/exams" class="text-decoration-none text-muted small d-inline-flex align-items-center gap-1 mb-2">
            <i class="bi bi-arrow-left"></i> Back to Exams
          </a>
          <h2 class="h4 fw-bold text-dark mb-1">
            Enrolled Candidates: {{ exam?.examName }}
          </h2>
          <p class="text-secondary small mb-1">
            Subject: <strong>{{ exam?.subject }}</strong> | Date: <strong>{{ exam?.examDate }}</strong> | {{ enrolledStudents.length }} Student(s) Enrolled
          </p>
          <div class="d-flex flex-wrap align-items-center gap-2">
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
              <i class="bi bi-mortarboard-fill me-1"></i> Branch: {{ exam?.branch || 'ALL' }}
            </span>
            <span *ngIf="exam?.allottedHalls && exam.allottedHalls.length > 0" class="badge bg-info-subtle text-info-emphasis border border-info-subtle px-2 py-1">
              <i class="bi bi-building-check me-1"></i> Allotted Halls:
              <span *ngFor="let h of exam?.allottedHalls; let last = last">{{ h.hallNumber }}{{ !last ? ', ' : '' }}</span>
              ({{ exam?.allottedCapacity }} Seats)
            </span>
          </div>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <a [routerLink]="['/exams/edit', examId]" class="btn btn-outline-primary shadow-sm d-flex align-items-center gap-2" title="Edit or Update Examination Details">
            <i class="bi bi-pencil-square"></i>
            <span>Edit / Update Exam</span>
          </a>
          <button class="btn btn-outline-primary shadow-sm d-flex align-items-center gap-2"
                  [disabled]="isAutoEnrolling"
                  (click)="autoEnrollBranchStudents()">
            <span *ngIf="isAutoEnrolling" class="spinner-border spinner-border-sm"></span>
            <i *ngIf="!isAutoEnrolling" class="bi bi-person-plus-fill"></i>
            <span>Auto-Enroll {{ exam?.branch || 'All' }} Students</span>
          </button>
          <button class="btn btn-outline-success shadow-sm d-flex align-items-center gap-2" (click)="openImportModal()">
            <i class="bi bi-file-earmark-spreadsheet-fill"></i>
            <span>Import {{ exam?.branch || 'Branch' }} Students CSV</span>
          </button>
          <a [routerLink]="['/seating/generate']" [queryParams]="{ examId: examId }" class="btn btn-success shadow-sm d-flex align-items-center gap-2">
            <i class="bi bi-cpu-fill"></i>
            <span>Generate Seating</span>
          </a>
        </div>
      </div>

      <!-- Alerts -->
      <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>

      <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="bi bi-check-circle-fill me-2"></i>{{ successMessage }}
        <button type="button" class="btn-close" (click)="successMessage = ''"></button>
      </div>

      <div class="row g-4">
        <!-- Enrolled Students Column -->
        <div class="col-lg-7">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-header bg-white border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold text-dark mb-0">Enrolled Students ({{ enrolledStudents.length }})</h5>
              <span class="badge bg-primary-subtle text-primary fs-7">Eligible for Seating</span>
            </div>
            <div class="card-body p-4">
              <div *ngIf="isLoading" class="text-center py-4">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="text-muted mt-2 small">Loading enrolled students...</p>
              </div>

              <div *ngIf="!isLoading && enrolledStudents.length === 0" class="text-center py-5 text-muted">
                <i class="bi bi-people fs-1 text-secondary opacity-50 d-block mb-2"></i>
                No students enrolled in this exam yet.<br/>
                Use the right panel to enroll students from registered departments.
              </div>

              <div *ngIf="!isLoading && enrolledStudents.length > 0" class="table-responsive" style="max-height: 520px; overflow-y: auto;">
                <table class="table table-hover align-middle mb-0">
                  <thead class="table-light sticky-top">
                    <tr>
                      <th>Reg. No</th>
                      <th>Name</th>
                      <th>Branch & Year</th>
                      <th class="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let s of enrolledStudents">
                      <td><span class="badge bg-light text-primary border">{{ s.registerNumber }}</span></td>
                      <td class="fw-semibold text-dark">{{ s.name }}</td>
                      <td>{{ s.branch }} (Yr {{ s.year }} - {{ s.section }})</td>
                      <td class="text-end">
                        <button class="btn btn-sm btn-outline-danger" (click)="removeStudent(s.id)" title="Remove from exam">
                          <i class="bi bi-x-lg"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Available / Bulk Enroll Column -->
        <div class="col-lg-5">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-header bg-white border-0 pt-4 px-4 pb-0">
              <h5 class="fw-bold text-dark mb-1">Enroll Students</h5>
              <p class="text-secondary small mb-0">Filter and assign available students to this exam</p>
            </div>
            <div class="card-body p-4">
              <!-- Filters -->
              <div class="row g-2 mb-3">
                <div class="col-6">
                  <select class="form-select form-select-sm bg-light" [(ngModel)]="filterBranch" (change)="filterAvailableStudents()">
                    <option value="">All Branches</option>
                    <option *ngFor="let b of branches" [value]="b">{{ b }}</option>
                  </select>
                </div>
                <div class="col-6">
                  <select class="form-select form-select-sm bg-light" [(ngModel)]="filterYear" (change)="filterAvailableStudents()">
                    <option value="0">All Years</option>
                    <option value="1">Year 1</option>
                    <option value="2">Year 2</option>
                    <option value="3">Year 3</option>
                    <option value="4">Year 4</option>
                  </select>
                </div>
              </div>

              <!-- Select All / Count Bar -->
              <div class="d-flex justify-content-between align-items-center p-2 bg-light rounded-3 mb-2">
                <div class="form-check mb-0 ms-1">
                  <input class="form-check-input" type="checkbox" id="selectAll" [checked]="isAllSelected()" (change)="toggleSelectAll($event)">
                  <label class="form-check-label small fw-semibold" for="selectAll">Select All</label>
                </div>
                <span class="small text-muted">Selected: <strong>{{ selectedStudentIds.size }}</strong></span>
              </div>

              <!-- List of available students -->
              <div class="border rounded-3 p-2 overflow-auto mb-3" style="max-height: 380px;">
                <div *ngFor="let student of availableStudents" class="form-check py-1 px-3 border-bottom d-flex align-items-center gap-2">
                  <input
                    class="form-check-input mt-0"
                    type="checkbox"
                    [id]="'student-' + student.id"
                    [checked]="selectedStudentIds.has(student.id)"
                    (change)="toggleStudentSelection(student.id)"
                  />
                  <label class="form-check-label small w-100 cursor-pointer" [for]="'student-' + student.id">
                    <div class="d-flex justify-content-between">
                      <span class="fw-semibold text-dark">{{ student.name }}</span>
                      <span class="badge bg-light text-secondary">{{ student.branch }}</span>
                    </div>
                    <span class="text-muted" style="font-size: 0.75rem;">{{ student.registerNumber }} | Yr {{ student.year }}-{{ student.section }}</span>
                  </label>
                </div>

                <div *ngIf="availableStudents.length === 0" class="text-center py-4 text-muted small">
                  No unassigned students match your filter.
                </div>
              </div>

              <!-- Enroll Action Button -->
              <button
                class="btn btn-primary w-100 rounded-pill shadow-sm"
                [disabled]="selectedStudentIds.size === 0 || isEnrolling"
                (click)="enrollSelectedStudents()"
              >
                <span *ngIf="isEnrolling" class="spinner-border spinner-border-sm me-1" role="status"></span>
                Enroll Selected ({{ selectedStudentIds.size }})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CSV Import Modal Backdrop -->
    <div *ngIf="isImportModalOpen" class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-light border-0 py-3 px-4">
            <h5 class="modal-title fw-bold text-dark d-flex align-items-center gap-2">
              <i class="bi bi-file-earmark-arrow-up-fill text-success"></i>
              Import Individual Students CSV for Branch:
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
                {{ exam?.branch || 'ALL' }}
              </span>
            </h5>
            <button type="button" class="btn-close" (click)="closeImportModal()"></button>
          </div>
          <div class="modal-body p-4">
            <!-- Instructions & Sample Download -->
            <div class="alert alert-info border-0 rounded-3 d-flex flex-wrap justify-content-between align-items-center py-2 px-3 mb-3 bg-opacity-10 text-primary-emphasis gap-2">
              <div class="small">
                <strong>Expected CSV Format:</strong><br>
                <code>registerNumber, name, branch, year (1-4), section, email, phone</code>
              </div>
              <button class="btn btn-sm btn-outline-primary bg-white shadow-sm d-flex align-items-center gap-1" (click)="downloadSampleCsv()">
                <i class="bi bi-download"></i>
                <span>Sample CSV</span>
              </button>
            </div>

            <!-- Hall Capacity Notice -->
            <div class="alert alert-warning border-0 rounded-3 small py-2 px-3 mb-3 d-flex align-items-center gap-2">
              <i class="bi bi-info-circle-fill text-warning fs-5"></i>
              <div>
                <strong>Automatic 5×3 Hall Overflow:</strong> Halls are configured with <strong>5 rows × 3 columns (15 seats)</strong>.
                When Hall 1 reaches 15 candidates, remaining students automatically overflow into Hall 2, Hall 3, etc.
              </div>
            </div>

            <!-- File Upload Area -->
            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small text-uppercase">Choose CSV File</label>
              <div class="p-3 border border-2 border-dashed rounded-3 text-center bg-light bg-opacity-50">
                <i class="bi bi-cloud-arrow-up fs-2 text-primary opacity-75 mb-2 d-block"></i>
                <input type="file" class="form-control form-control-sm mx-auto" style="max-width: 360px;" accept=".csv" (change)="onFileSelected($event)" />
                <div class="text-muted small mt-2">Upload any standard UTF-8 CSV with student records.</div>
                <div *ngIf="selectedFile" class="mt-2 badge bg-primary-subtle text-primary p-2">
                  <i class="bi bi-filetype-csv me-1"></i> {{ selectedFile.name }} ({{ (selectedFile.size / 1024).toFixed(1) }} KB)
                </div>
              </div>
            </div>

            <!-- Uploading spinner -->
            <div *ngIf="isImporting" class="text-center py-3">
              <div class="spinner-border text-success" role="status"></div>
              <p class="text-muted small mt-2 mb-0">Enrolling students and allocating seats across 5x3 halls with overflow...</p>
            </div>

            <!-- Import Summary Report -->
            <div *ngIf="importSummary" class="mt-3">
              <h6 class="fw-bold text-dark mb-2">Import Summary</h6>
              <div class="row g-2 mb-3">
                <div class="col-3">
                  <div class="p-2 border rounded-3 text-center bg-light">
                    <small class="text-muted d-block">Total Rows</small>
                    <strong class="fs-5 text-dark">{{ importSummary.totalRows }}</strong>
                  </div>
                </div>
                <div class="col-3">
                  <div class="p-2 border rounded-3 text-center bg-success bg-opacity-10 text-success border-success-subtle">
                    <small class="d-block">Imported</small>
                    <strong class="fs-5">{{ importSummary.successfullyImported }}</strong>
                  </div>
                </div>
                <div class="col-3">
                  <div class="p-2 border rounded-3 text-center bg-warning bg-opacity-10 text-warning-emphasis border-warning-subtle">
                    <small class="d-block">Duplicates</small>
                    <strong class="fs-5">{{ importSummary.duplicateRows }}</strong>
                  </div>
                </div>
                <div class="col-3">
                  <div class="p-2 border rounded-3 text-center bg-danger bg-opacity-10 text-danger border-danger-subtle">
                    <small class="d-block">Failed</small>
                    <strong class="fs-5">{{ importSummary.failedRows }}</strong>
                  </div>
                </div>
              </div>

              <!-- Multi-Hall Overflow Allocation Card -->
              <div *ngIf="importSummary.hallAllocations && importSummary.hallAllocations.length > 0" class="mt-3 p-3 bg-white rounded-3 border shadow-sm">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h6 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <i class="bi bi-buildings-fill text-primary"></i> Hall Seating &amp; Overflow Distribution
                  </h6>
                  <span class="badge bg-success-subtle text-success">Seating Generated</span>
                </div>
                <p class="small text-secondary mb-3">
                  Each hall accommodates 15 students (5 rows × 3 columns). Filled halls automatically spilled over:
                </p>
                <div class="row g-2">
                  <div class="col-md-6" *ngFor="let alloc of importSummary.hallAllocations; let idx = index">
                    <div class="p-2 border rounded-3 d-flex justify-content-between align-items-center"
                         [ngClass]="alloc.filled ? 'bg-success bg-opacity-10 border-success-subtle' : 'bg-primary bg-opacity-10 border-primary-subtle'">
                      <div>
                        <div class="fw-bold text-dark small d-flex align-items-center gap-1">
                          <i class="bi bi-door-closed-fill" [ngClass]="alloc.filled ? 'text-success' : 'text-primary'"></i>
                          Hall {{ alloc.hallNumber }}
                          <span *ngIf="idx > 0" class="badge bg-secondary-subtle text-secondary fs-8 ms-1">Overflow</span>
                        </div>
                        <span class="text-muted" style="font-size: 0.75rem;">{{ alloc.building }} (5x3 Grid)</span>
                      </div>
                      <div class="text-end">
                        <span class="badge fs-7 px-2 py-1" [ngClass]="alloc.filled ? 'bg-success text-white' : 'bg-primary text-white'">
                          {{ alloc.assignedCount }} / {{ alloc.capacity }} Seats
                        </span>
                        <small class="d-block text-muted" style="font-size: 0.7rem;">
                          {{ alloc.filled ? '100% Full' : (alloc.capacity - alloc.assignedCount) + ' seats remaining' }}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-3 pt-2 border-top d-flex justify-content-end">
                  <a [routerLink]="['/seating/arrangement']" [queryParams]="{ examId: examId }" class="btn btn-sm btn-primary rounded-pill px-3 shadow-sm">
                    <i class="bi bi-grid-3x3-gap me-1"></i> View Seating Grid &amp; Overflow Details
                  </a>
                </div>
              </div>

              <!-- Error details list -->
              <div *ngIf="importSummary.errors && importSummary.errors.length > 0" class="border rounded-3 p-3 bg-danger bg-opacity-10 mt-3" style="max-height: 200px; overflow-y: auto;">
                <h6 class="small fw-bold text-danger mb-2">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i> Row Errors ({{ importSummary.errors.length }}):
                </h6>
                <ul class="list-unstyled mb-0 small">
                  <li *ngFor="let err of importSummary.errors" class="text-danger mb-1 border-bottom border-danger-subtle pb-1">
                    <strong>Row {{ err.rowNumber }}</strong> [{{ err.registerNumber }}]: {{ err.reason }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light border-0 py-3 px-4">
            <button type="button" class="btn btn-secondary rounded-pill px-3" (click)="closeImportModal()">Close</button>
            <button
              type="button"
              class="btn btn-success rounded-pill px-4 shadow-sm"
              [disabled]="!selectedFile || isImporting"
              (click)="uploadCsv()"
            >
              <i class="bi bi-upload me-1"></i>
              <span>Upload, Enroll &amp; Allocate Seating</span>
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
export class ExamStudentsComponent implements OnInit {
  examId!: number;
  exam: Exam | null = null;
  enrolledStudents: Student[] = [];
  allStudents: Student[] = [];
  availableStudents: Student[] = [];

  selectedStudentIds = new Set<number>();
  branches: string[] = [];
  filterBranch = '';
  filterYear = 0;

  isLoading = true;
  isEnrolling = false;
  isAutoEnrolling = false;
  errorMessage = '';
  successMessage = '';

  autoEnrollBranchStudents(): void {
    if (!this.examId) return;
    this.isAutoEnrolling = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.examService.autoEnrollByBranch(this.examId).subscribe({
      next: (res) => {
        this.isAutoEnrolling = false;
        this.successMessage = `Successfully enrolled all eligible ${this.exam?.branch || 'registered'} candidates for this examination!`;
        this.loadEnrolledAndAllStudents();
      },
      error: (err) => {
        this.isAutoEnrolling = false;
        this.errorMessage = err.error?.message || 'Failed to auto-enroll branch students.';
      }
    });
  }

  constructor(
    private route: ActivatedRoute,
    private examService: ExamService,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.examId = Number(idParam);
      this.loadExamData();
    }
  }

  loadExamData(): void {
    this.isLoading = true;
    this.examService.getExamById(this.examId).subscribe({
      next: (res) => {
        this.exam = res.data || null;
        this.loadEnrolledAndAllStudents();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load exam details.';
        this.isLoading = false;
      }
    });
  }

  loadEnrolledAndAllStudents(): void {
    this.examService.getStudentsByExamId(this.examId).subscribe({
      next: (enrolledRes) => {
        this.enrolledStudents = enrolledRes.data || [];
        this.loadAllSystemStudents();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load enrolled students.';
        this.isLoading = false;
      }
    });
  }

  loadAllSystemStudents(): void {
    this.studentService.getAllStudents().subscribe({
      next: (allRes) => {
        this.allStudents = allRes.data || [];
        this.extractBranches();
        this.filterAvailableStudents();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load all registered students.';
        this.isLoading = false;
      }
    });
  }

  extractBranches(): void {
    const set = new Set<string>();
    this.allStudents.forEach(s => {
      if (s.branch) set.add(s.branch);
    });
    this.branches = Array.from(set).sort();
  }

  filterAvailableStudents(): void {
    const enrolledIds = new Set(this.enrolledStudents.map(s => s.id));
    this.availableStudents = this.allStudents.filter(s => {
      if (enrolledIds.has(s.id)) return false;
      const matchBranch = !this.filterBranch || s.branch === this.filterBranch;
      const matchYear = !this.filterYear || s.year === Number(this.filterYear);
      return matchBranch && matchYear;
    });
    // clean up selections not in available list
    const availIds = new Set(this.availableStudents.map(s => s.id));
    this.selectedStudentIds.forEach(id => {
      if (!availIds.has(id)) this.selectedStudentIds.delete(id);
    });
  }

  toggleStudentSelection(studentId: number): void {
    if (this.selectedStudentIds.has(studentId)) {
      this.selectedStudentIds.delete(studentId);
    } else {
      this.selectedStudentIds.add(studentId);
    }
  }

  isAllSelected(): boolean {
    return this.availableStudents.length > 0 && this.selectedStudentIds.size === this.availableStudents.length;
  }

  toggleSelectAll(event: any): void {
    if (event.target.checked) {
      this.availableStudents.forEach(s => this.selectedStudentIds.add(s.id));
    } else {
      this.selectedStudentIds.clear();
    }
  }

  enrollSelectedStudents(): void {
    if (this.selectedStudentIds.size === 0) return;
    this.isEnrolling = true;
    this.errorMessage = '';
    const idsToAssign = Array.from(this.selectedStudentIds);

    this.examService.assignStudentsToExam(this.examId, idsToAssign).subscribe({
      next: (res) => {
        this.enrolledStudents = res.data || [];
        this.selectedStudentIds.clear();
        this.filterAvailableStudents();
        this.isEnrolling = false;
        this.successMessage = `Successfully enrolled ${idsToAssign.length} student(s) to this exam!`;
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to assign students.';
        this.isEnrolling = false;
      }
    });
  }

  removeStudent(studentId: number): void {
    this.examService.removeStudentFromExam(this.examId, studentId).subscribe({
      next: () => {
        this.enrolledStudents = this.enrolledStudents.filter(s => s.id !== studentId);
        this.filterAvailableStudents();
        this.successMessage = 'Student removed from this exam.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to remove student from exam.';
      }
    });
  }

  // --- CSV Import with 5x3 Multi-Hall Overflow ---
  isImportModalOpen = false;
  selectedFile: File | null = null;
  isImporting = false;
  importSummary: StudentImportSummary | null = null;

  openImportModal(): void {
    this.isImportModalOpen = true;
    this.selectedFile = null;
    this.importSummary = null;
  }

  closeImportModal(): void {
    this.isImportModalOpen = false;
    this.selectedFile = null;
    this.importSummary = null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadCsv(): void {
    if (!this.selectedFile) return;

    this.isImporting = true;
    this.importSummary = null;

    this.studentService.importStudents(this.selectedFile, this.examId).subscribe({
      next: (res) => {
        this.importSummary = res.data;
        this.isImporting = false;
        if (this.importSummary && this.importSummary.successfullyImported > 0) {
          let msg = `Successfully imported and enrolled ${this.importSummary.successfullyImported} student(s).`;
          if (this.importSummary.hallAllocations && this.importSummary.hallAllocations.length > 0) {
            msg += ` Seating generated across ${this.importSummary.hallAllocations.length} hall(s) with 5x3 capacity overflow.`;
          }
          this.successMessage = msg;
          this.loadExamData();
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'CSV Import failed. Check CSV format and values.';
        this.isImporting = false;
      }
    });
  }

  downloadSampleCsv(): void {
    const branch = this.exam?.branch || 'CSE';
    this.studentService.downloadConcurrentTemplate(branch).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `students_${branch.toLowerCase()}_template.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        const csvContent = 'registerNumber,name,branch,year,section,email,phone\n' +
          `21${branch}001,Student One,${branch},3,A,student1@univ.edu,9845011111\n` +
          `21${branch}002,Student Two,${branch},3,A,student2@univ.edu,9845011112\n`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `students_${branch.toLowerCase()}_template.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    });
  }
}
