import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StudentService } from '../../core/services/student.service';
import { ExamService } from '../../core/services/exam.service';
import { Student, StudentImportSummary } from '../../core/models/student.model';
import { Exam } from '../../core/models/exam.model';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmationDialogComponent],
  template: `
    <div class="fade-in">
      <!-- Header -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 class="h4 fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <i class="bi bi-people-fill text-primary"></i> Student Management
          </h2>
          <p class="text-secondary mb-0 small">Import CSV, search, filter, paginate, and manage student rosters</p>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <a routerLink="/exams" class="btn btn-outline-info shadow-sm d-flex align-items-center gap-2">
            <i class="bi bi-layers-half"></i>
            <span>Concurrent Branch CSVs</span>
          </a>
          <button class="btn btn-outline-success shadow-sm d-flex align-items-center gap-2" (click)="openImportModal()">
            <i class="bi bi-file-earmark-spreadsheet-fill"></i>
            <span>Import CSV</span>
          </button>
          <a routerLink="/students/new" class="btn btn-primary shadow-sm d-flex align-items-center gap-2">
            <i class="bi bi-person-plus-fill"></i>
            <span>Add Student</span>
          </a>
        </div>
      </div>

      <!-- Search & Filters Card -->
      <div class="card border-0 shadow-sm rounded-3 mb-4">
        <div class="card-body p-3">
          <div class="row g-3">
            <!-- Search -->
            <div class="col-md-4">
              <div class="input-group">
                <span class="input-group-text bg-light border-0"><i class="bi bi-search text-muted"></i></span>
                <input
                  type="text"
                  class="form-control border-0 bg-light"
                  placeholder="Search by name, reg no, email..."
                  [(ngModel)]="searchTerm"
                  (keyup)="applyFilterAndSort()"
                />
                <button *ngIf="searchTerm" class="btn btn-outline-secondary" type="button" (click)="searchTerm = ''; applyFilterAndSort()">
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>

            <!-- Branch Filter -->
            <div class="col-md-2">
              <select class="form-select bg-light border-0" [(ngModel)]="selectedBranch" (change)="applyFilterAndSort()">
                <option value="">All Branches</option>
                <option *ngFor="let branch of branches" [value]="branch">{{ branch }}</option>
              </select>
            </div>

            <!-- Year Filter -->
            <div class="col-md-2">
              <select class="form-select bg-light border-0" [(ngModel)]="selectedYear" (change)="applyFilterAndSort()">
                <option value="0">All Years</option>
                <option value="1">Year 1</option>
                <option value="2">Year 2</option>
                <option value="3">Year 3</option>
                <option value="4">Year 4</option>
              </select>
            </div>

            <!-- Section Filter -->
            <div class="col-md-2">
              <select class="form-select bg-light border-0" [(ngModel)]="selectedSection" (change)="applyFilterAndSort()">
                <option value="">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>

            <!-- Total Badge & Page Size -->
            <div class="col-md-2 d-flex align-items-center justify-content-end gap-2">
              <select class="form-select form-select-sm w-auto bg-light border-0" [(ngModel)]="pageSize" (change)="onPageSizeChange()">
                <option [value]="10">10 / page</option>
                <option [value]="25">25 / page</option>
                <option [value]="50">50 / page</option>
              </select>
              <span class="badge bg-light text-secondary border px-2 py-1 small">
                {{ filteredStudents.length }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerts -->
      <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
        <i class="bi bi-exclamation-circle-fill"></i>
        <div>{{ errorMessage }}</div>
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>

      <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
        <i class="bi bi-check-circle-fill"></i>
        <div>{{ successMessage }}</div>
        <button type="button" class="btn-close" (click)="successMessage = ''"></button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted mt-2">Loading students...</p>
      </div>

      <!-- Students Table -->
      <div *ngIf="!isLoading" class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4 cursor-pointer" (click)="setSort('registerNumber')">
                  Reg. Number
                  <span *ngIf="sortField === 'registerNumber'">{{ sortAsc ? '▲' : '▼' }}</span>
                </th>
                <th class="cursor-pointer" (click)="setSort('name')">
                  Full Name
                  <span *ngIf="sortField === 'name'">{{ sortAsc ? '▲' : '▼' }}</span>
                </th>
                <th class="cursor-pointer" (click)="setSort('branch')">
                  Branch
                  <span *ngIf="sortField === 'branch'">{{ sortAsc ? '▲' : '▼' }}</span>
                </th>
                <th class="cursor-pointer" (click)="setSort('year')">
                  Year & Sec
                  <span *ngIf="sortField === 'year'">{{ sortAsc ? '▲' : '▼' }}</span>
                </th>
                <th>Email</th>
                <th>Phone</th>
                <th class="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let student of pagedStudents">
                <td class="ps-4">
                  <span class="badge bg-primary-subtle text-primary fw-semibold px-2 py-1">
                    {{ student.registerNumber }}
                  </span>
                </td>
                <td>
                  <div class="fw-bold text-dark">{{ student.name }}</div>
                </td>
                <td>
                  <span class="badge bg-secondary-subtle text-secondary">{{ student.branch }}</span>
                </td>
                <td>
                  Year {{ student.year }} - Sec {{ student.section }}
                </td>
                <td class="text-muted small">
                  <i class="bi bi-envelope me-1"></i>{{ student.email }}
                </td>
                <td class="text-muted small">
                  <i class="bi bi-telephone me-1"></i>{{ student.phone }}
                </td>
                <td class="text-end pe-4">
                  <div class="btn-group btn-group-sm">
                    <a [routerLink]="['/students/edit', student.id]" class="btn btn-outline-primary" title="Edit Student">
                      <i class="bi bi-pencil"></i>
                    </a>
                    <button class="btn btn-outline-danger" (click)="promptDelete(student)" title="Delete Student">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredStudents.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                  <i class="bi bi-people fs-1 text-secondary opacity-50 d-block mb-2"></i>
                  No students found matching your criteria.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div *ngIf="filteredStudents.length > 0" class="d-flex flex-wrap justify-content-between align-items-center p-3 border-top bg-light bg-opacity-50">
          <small class="text-muted">
            Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredStudents.length) }} of {{ filteredStudents.length }} students
          </small>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" [class.disabled]="currentPage === 1">
              <button class="page-link" (click)="goToPage(currentPage - 1)">Previous</button>
            </li>
            <li *ngFor="let page of getPageNumbers()" class="page-item" [class.active]="page === currentPage">
              <button class="page-link" (click)="goToPage(page)">{{ page }}</button>
            </li>
            <li class="page-item" [class.disabled]="currentPage === totalPages">
              <button class="page-link" (click)="goToPage(currentPage + 1)">Next</button>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- CSV Import Modal Backdrop -->
    <div *ngIf="isImportModalOpen" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow rounded-4">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold text-dark d-flex align-items-center gap-2">
              <i class="bi bi-file-earmark-arrow-up-fill text-success"></i> Import Students from CSV
            </h5>
            <button type="button" class="btn-close" (click)="closeImportModal()"></button>
          </div>
          <div class="modal-body p-4">
            <!-- Instructions & Individual Branch Sample Downloads -->
            <div class="alert alert-info d-flex flex-wrap justify-content-between align-items-center py-2 px-3 mb-3 gap-2">
              <div class="small">
                <strong>Format:</strong> <code>registerNumber, name, branch, year (1-4), section, email, phone</code>
              </div>
              <div class="d-flex align-items-center gap-1">
                <span class="small text-muted me-1">Sample files:</span>
                <div class="btn-group btn-group-sm">
                  <button type="button" class="btn btn-sm btn-outline-primary bg-white" (click)="downloadBranchTemplate('CSE')">CSE</button>
                  <button type="button" class="btn btn-sm btn-outline-info bg-white" (click)="downloadBranchTemplate('ECE')">ECE</button>
                  <button type="button" class="btn btn-sm btn-outline-warning bg-white" (click)="downloadBranchTemplate('MECH')">MECH</button>
                  <button type="button" class="btn btn-sm btn-outline-success bg-white" (click)="downloadBranchTemplate('CIVIL')">CIVIL</button>
                </div>
              </div>
            </div>

            <!-- File Upload Input -->
            <div class="mb-3">
              <label class="form-label fw-semibold text-dark small text-uppercase">Choose CSV File</label>
              <input type="file" class="form-control" accept=".csv" (change)="onFileSelected($event)" />
              <small class="text-muted">Select a comma-separated values (.csv) file exported from Excel or student database.</small>
            </div>

            <!-- Auto-Assign Exam & Overflow Configuration -->
            <div class="mb-3 p-3 bg-light rounded-3 border">
              <div class="form-check form-switch mb-2">
                <input class="form-check-input" type="checkbox" id="autoAssignExam" [(ngModel)]="autoAssignExam" />
                <label class="form-check-label fw-semibold text-dark" for="autoAssignExam">
                  <i class="bi bi-magic text-primary me-1"></i> Auto-Assign to Examination &amp; Allocate Seating Across Halls
                </label>
              </div>
              <div *ngIf="autoAssignExam" class="ps-4 pt-1">
                <label class="form-label small text-secondary fw-semibold mb-1">Target Examination <span class="text-danger">*</span></label>
                <select class="form-select form-select-sm" [(ngModel)]="selectedExamId">
                  <option [ngValue]="null" disabled>-- Choose an examination --</option>
                  <option *ngFor="let ex of availableExams" [ngValue]="ex.id">
                    {{ ex.examName }} ({{ ex.subject }} - {{ ex.examDate }})
                  </option>
                </select>
                <div class="small text-muted mt-2 d-flex align-items-center gap-1">
                  <i class="bi bi-info-circle text-primary"></i>
                  <span>Each hall accommodates <strong>15 students (5 rows × 3 columns)</strong>. When Hall 1 is full, students automatically spill over into Hall 2, Hall 3, etc.</span>
                </div>
              </div>
            </div>

            <!-- Uploading spinner -->
            <div *ngIf="isImporting" class="text-center py-3">
              <div class="spinner-border text-success" role="status"></div>
              <p class="text-muted small mt-2 mb-0">Validating rows, enrolling candidates, and auto-allocating seating across 5x3 halls...</p>
            </div>

            <!-- Import Summary Report -->
            <div *ngIf="importSummary" class="mt-4">
              <h6 class="fw-bold text-dark mb-3">Import Summary</h6>
              <div class="row g-2 mb-3">
                <div class="col-3">
                  <div class="p-2 border rounded text-center bg-light">
                    <small class="text-muted d-block">Total Rows</small>
                    <strong class="fs-5">{{ importSummary.totalRows }}</strong>
                  </div>
                </div>
                <div class="col-3">
                  <div class="p-2 border rounded text-center bg-success bg-opacity-10 text-success">
                    <small class="d-block">Imported</small>
                    <strong class="fs-5">{{ importSummary.successfullyImported }}</strong>
                  </div>
                </div>
                <div class="col-3">
                  <div class="p-2 border rounded text-center bg-warning bg-opacity-10 text-warning">
                    <small class="d-block">Duplicates</small>
                    <strong class="fs-5">{{ importSummary.duplicateRows }}</strong>
                  </div>
                </div>
                <div class="col-3">
                  <div class="p-2 border rounded text-center bg-danger bg-opacity-10 text-danger">
                    <small class="d-block">Failed</small>
                    <strong class="fs-5">{{ importSummary.failedRows }}</strong>
                  </div>
                </div>
              </div>

              <!-- Multi-Hall Overflow Allocation Card -->
              <div *ngIf="importSummary.hallAllocations && importSummary.hallAllocations.length > 0" class="mt-3 p-3 bg-white rounded-3 border shadow-sm">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h6 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <i class="bi bi-buildings-fill text-primary"></i> Multi-Hall Seating &amp; Overflow Distribution
                  </h6>
                  <span class="badge bg-primary-subtle text-primary">Exam #{{ importSummary.examId }}</span>
                </div>
                <p class="small text-secondary mb-3">
                  Standardized 5 rows × 3 columns (15 seats) per hall. Filled halls automatically spilled into next hall:
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
                  <a [routerLink]="['/seating/arrangement']" [queryParams]="{ examId: importSummary.examId }" class="btn btn-sm btn-outline-primary rounded-pill px-3">
                    <i class="bi bi-grid-3x3-gap me-1"></i> View Seating Grid &amp; Overflow Details
                  </a>
                </div>
              </div>

              <!-- Error details list -->
              <div *ngIf="importSummary.errors.length > 0" class="border rounded p-3 bg-light mt-3" style="max-height: 200px; overflow-y: auto;">
                <h6 class="small fw-bold text-danger mb-2">Error Details ({{ importSummary.errors.length }} issues):</h6>
                <ul class="list-unstyled mb-0 small">
                  <li *ngFor="let err of importSummary.errors" class="text-danger mb-1">
                    <i class="bi bi-x-circle me-1"></i> Row {{ err.rowNumber }} [{{ err.registerNumber }}]: {{ err.reason }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary rounded-pill px-3" (click)="closeImportModal()">Close</button>
            <button
              type="button"
              class="btn btn-success rounded-pill px-4"
              [disabled]="!selectedFile || isImporting"
              (click)="uploadCsv()"
            >
              Upload & Import
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Dialog -->
    <app-confirmation-dialog
      [isOpen]="isDeleteDialogOpen"
      title="Delete Student"
      [message]="'Are you sure you want to delete ' + (studentToDelete?.name || '') + ' (' + (studentToDelete?.registerNumber || '') + ')? This action cannot be undone.'"
      (confirmed)="confirmDelete()"
      (cancelled)="cancelDelete()"
    ></app-confirmation-dialog>
  `
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  pagedStudents: Student[] = [];
  branches: string[] = [];

  // Filter & Search state
  searchTerm = '';
  selectedBranch = '';
  selectedYear = 0;
  selectedSection = '';

  // Sorting state
  sortField: keyof Student = 'registerNumber';
  sortAsc = true;

  // Pagination state
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  Math = Math;

  // Loading and Alert states
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  // Delete modal state
  isDeleteDialogOpen = false;
  studentToDelete: Student | null = null;

  // CSV Import state
  isImportModalOpen = false;
  selectedFile: File | null = null;
  isImporting = false;
  importSummary: StudentImportSummary | null = null;
  availableExams: Exam[] = [];
  autoAssignExam = true;
  selectedExamId: number | null = null;

  constructor(
    private studentService: StudentService,
    private examService: ExamService
  ) {}

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.studentService.getAllStudents().subscribe({
      next: (res) => {
        this.students = res.data || [];
        this.extractBranches();
        this.applyFilterAndSort();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load students. Ensure backend is running.';
        this.isLoading = false;
      }
    });
  }

  extractBranches(): void {
    const branchSet = new Set<string>();
    this.students.forEach(s => {
      if (s.branch) branchSet.add(s.branch);
    });
    this.branches = Array.from(branchSet).sort();
  }

  applyFilterAndSort(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredStudents = this.students.filter(s => {
      const matchBranch = !this.selectedBranch || s.branch === this.selectedBranch;
      const matchYear = !this.selectedYear || s.year === Number(this.selectedYear);
      const matchSection = !this.selectedSection || s.section === this.selectedSection;
      const matchSearch = !term ||
        (s.name && s.name.toLowerCase().includes(term)) ||
        (s.registerNumber && s.registerNumber.toLowerCase().includes(term)) ||
        (s.email && s.email.toLowerCase().includes(term)) ||
        (s.branch && s.branch.toLowerCase().includes(term));
      return matchBranch && matchYear && matchSection && matchSearch;
    });

    // Sort
    this.filteredStudents.sort((a, b) => {
      let valA: any = a[this.sortField] || '';
      let valB: any = b[this.sortField] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return this.sortAsc ? -1 : 1;
      if (valA > valB) return this.sortAsc ? 1 : -1;
      return 0;
    });

    this.totalPages = Math.max(1, Math.ceil(this.filteredStudents.length / this.pageSize));
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    this.updatePagedStudents();
  }

  setSort(field: keyof Student): void {
    if (this.sortField === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortField = field;
      this.sortAsc = true;
    }
    this.applyFilterAndSort();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.applyFilterAndSort();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedStudents();
    }
  }

  updatePagedStudents(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedStudents = this.filteredStudents.slice(start, start + this.pageSize);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  promptDelete(student: Student): void {
    this.studentToDelete = student;
    this.isDeleteDialogOpen = true;
  }

  confirmDelete(): void {
    if (!this.studentToDelete) return;
    const id = this.studentToDelete.id;
    this.studentService.deleteStudent(id).subscribe({
      next: () => {
        this.successMessage = `Student ${this.studentToDelete?.name} was deleted successfully.`;
        this.isDeleteDialogOpen = false;
        this.studentToDelete = null;
        this.loadStudents();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to delete student.';
        this.isDeleteDialogOpen = false;
        this.studentToDelete = null;
      }
    });
  }

  cancelDelete(): void {
    this.isDeleteDialogOpen = false;
    this.studentToDelete = null;
  }

  // --- CSV Import ---
  openImportModal(): void {
    this.isImportModalOpen = true;
    this.selectedFile = null;
    this.importSummary = null;
    this.examService.getAllExams().subscribe({
      next: (res) => {
        this.availableExams = res.data || [];
        if (this.availableExams.length > 0 && !this.selectedExamId) {
          this.selectedExamId = this.availableExams[0].id;
        }
      }
    });
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

    const targetExamId = (this.autoAssignExam && this.selectedExamId) ? this.selectedExamId : undefined;
    this.studentService.importStudents(this.selectedFile, targetExamId).subscribe({
      next: (res) => {
        this.importSummary = res.data;
        this.isImporting = false;
        if (this.importSummary && this.importSummary.successfullyImported > 0) {
          let msg = `Successfully imported ${this.importSummary.successfullyImported} students.`;
          if (this.importSummary.hallAllocations && this.importSummary.hallAllocations.length > 0) {
            msg += ` Seating allocated across ${this.importSummary.hallAllocations.length} hall(s) with 5x3 capacity overflow.`;
          }
          this.successMessage = msg;
          this.loadStudents();
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'CSV Import failed. Check format and required fields.';
        this.isImporting = false;
      }
    });
  }

  downloadBranchTemplate(branch: string): void {
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
      }
    });
  }

  downloadSampleCsv(): void {
    const csvContent = 'registerNumber,name,branch,year,section,email,phone\n' +
      '21CS001,Aarav Patel,CSE,3,A,aarav.patel@cse.university.edu,9845010001\n' +
      '21CS002,Aditi Sharma,CSE,3,A,aditi.sharma@cse.university.edu,9845010002\n' +
      '21CS003,Akash Verma,CSE,3,A,akash.verma@cse.university.edu,9845010003\n' +
      '21CS004,Ananya Iyer,CSE,3,A,ananya.iyer@cse.university.edu,9845010004\n' +
      '21CS005,Arjun Nair,CSE,3,B,arjun.nair@cse.university.edu,9845010005\n' +
      '21CS006,Bhavya Reddy,CSE,3,B,bhavya.reddy@cse.university.edu,9845010006\n' +
      '21CS007,Chetan Kumar,CSE,3,B,chetan.kumar@cse.university.edu,9845010007\n' +
      '21CS008,Deepa Menon,CSE,3,B,deepa.menon@cse.university.edu,9845010008\n' +
      '21EC001,Aakanksha Roy,ECE,3,A,aakanksha.roy@ece.university.edu,9845020001\n' +
      '21EC002,Abhishek Sen,ECE,3,A,abhishek.sen@ece.university.edu,9845020002\n' +
      '21EC003,Ajay Raghavan,ECE,3,A,ajay.raghavan@ece.university.edu,9845020003\n' +
      '21EC004,Akhil Venkatesh,ECE,3,A,akhil.venkatesh@ece.university.edu,9845020004\n' +
      '21EC005,Alok Ranjan,ECE,3,B,alok.ranjan@ece.university.edu,9845020005\n' +
      '21EC006,Amita Ghosh,ECE,3,B,amita.ghosh@ece.university.edu,9845020006\n' +
      '21EC007,Anand Kumar,ECE,3,B,anand.kumar@ece.university.edu,9845020007\n' +
      '21EC008,Anjali Nair,ECE,3,B,anjali.nair@ece.university.edu,9845020008\n' +
      '21ME001,Abhay Singhania,MECH,3,A,abhay.singhania@mech.university.edu,9845030001\n' +
      '21ME002,Adarsh Gowda,MECH,3,A,adarsh.gowda@mech.university.edu,9845030002\n' +
      '21ME003,Amitabh Roy,MECH,3,A,amitabh.roy@mech.university.edu,9845030003\n' +
      '21ME004,Ankit Saxena,MECH,3,A,ankit.saxena@mech.university.edu,9845030004\n' +
      '21ME005,Balram Yadav,MECH,3,B,balram.yadav@mech.university.edu,9845030005\n' +
      '21ME006,Bharath Simha,MECH,3,B,bharath.simha@mech.university.edu,9845030006\n' +
      '21ME007,Chirag Paswan,MECH,3,B,chirag.paswan@mech.university.edu,9845030007\n' +
      '21ME008,Dhanush Kumar,MECH,3,B,dhanush.kumar@mech.university.edu,9845030008\n' +
      '21CE001,Aniruddh Roy,CIVIL,3,A,aniruddh.roy@civil.university.edu,9845040001\n' +
      '21CE002,Aparna Sen,CIVIL,3,A,aparna.sen@civil.university.edu,9845040002\n' +
      '21CE003,Balaji Sundaram,CIVIL,3,A,balaji.sundaram@civil.university.edu,9845040003\n' +
      '21CE004,Bhaskar Rao,CIVIL,3,A,bhaskar.rao@civil.university.edu,9845040004\n' +
      '21CE005,Chitra Soundar,CIVIL,3,B,chitra.soundar@civil.university.edu,9845040005\n' +
      '21CE006,Damodar Prasad,CIVIL,3,B,damodar.prasad@civil.university.edu,9845040006\n' +
      '21CE007,Eshwar Murthy,CIVIL,3,B,eshwar.murthy@civil.university.edu,9845040007\n' +
      '21CE008,Gita Govind,CIVIL,3,B,gita.govind@civil.university.edu,9845040008\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_students_import.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
