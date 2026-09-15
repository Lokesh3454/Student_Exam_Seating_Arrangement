import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ExamService } from '../../core/services/exam.service';
import { StudentService } from '../../core/services/student.service';
import { Exam, ExamImportSummary, ConcurrentExamSession } from '../../core/models/exam.model';
import { ConcurrentBranchImportSummary, StudentImportSummary } from '../../core/models/student.model';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmationDialogComponent],
  template: `
    <div class="fade-in">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 class="h4 fw-bold text-dark mb-1">Examinations Management</h2>
          <p class="text-secondary mb-0 small">Schedule exams, enroll eligible students, and prepare seating plans</p>
        </div>
        <div class="d-flex flex-wrap gap-2">
          <button class="btn btn-outline-info shadow-sm d-flex align-items-center gap-2" (click)="openConcurrentModal()">
            <i class="bi bi-layers-half"></i>
            <span>Import Concurrent Branch CSVs</span>
          </button>
          <button class="btn btn-outline-success shadow-sm d-flex align-items-center gap-2" (click)="openImportModal()">
            <i class="bi bi-file-earmark-spreadsheet-fill"></i>
            <span>Import Exams CSV</span>
          </button>
          <a routerLink="/exams/new" class="btn btn-primary shadow-sm d-flex align-items-center gap-2">
            <i class="bi bi-calendar-plus-fill"></i>
            <span>Schedule Exam</span>
          </a>
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

      <!-- Concurrent Session Highlight Banner -->
      <div *ngIf="multiBranchSessions.length > 0" class="card border-0 shadow-sm rounded-4 p-3 mb-3 bg-light border-start border-4 border-info">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
              <span class="badge bg-info text-dark fw-bold px-2 py-1"><i class="bi bi-clock-history me-1"></i> Same Schedule Time Slot</span>
              <span class="fw-bold text-dark">{{ multiBranchSessions[0].sessionLabel }}</span>
              <span class="badge bg-primary rounded-pill px-2">{{ multiBranchSessions[0].totalBranches }} Branches Concurrent</span>
            </div>
            <div class="text-secondary small">
              Examinations scheduled simultaneously:
              <span *ngFor="let be of multiBranchSessions[0].branchExams; let last = last" class="fw-semibold text-dark">
                {{ be.branch || 'ALL' }} ({{ be.examName }}){{ !last ? ' • ' : '' }}
              </span>
            </div>
          </div>
          <button class="btn btn-sm btn-info text-white shadow-sm d-flex align-items-center gap-2 rounded-pill px-3" (click)="openConcurrentModal(multiBranchSessions[0])">
            <i class="bi bi-file-earmark-spreadsheet-fill"></i>
            <span>Import {{ multiBranchSessions[0].totalBranches }} Branch CSVs</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted mt-2">Loading scheduled exams...</p>
      </div>

      <!-- Branch Filter Tabs & Search Bar -->
      <div class="card border-0 shadow-sm rounded-4 p-3 mb-3 bg-white">
        <!-- Search, Status Filter, and Stats Row -->
        <div class="row g-2 align-items-center mb-3">
          <div class="col-md-6 col-lg-5">
            <div class="input-group input-group-sm">
              <span class="input-group-text bg-light border-end-0 text-muted">
                <i class="bi bi-search"></i>
              </span>
              <input
                type="text"
                class="form-control bg-light border-start-0 ps-0"
                placeholder="Search by exam name, subject, branch, hall, date..."
                [(ngModel)]="searchTerm"
              />
              <button
                *ngIf="searchTerm"
                class="btn btn-outline-secondary border-start-0 bg-light"
                type="button"
                (click)="searchTerm = ''"
                title="Clear search"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          <div class="col-sm-6 col-md-3 col-lg-3">
            <div class="d-flex align-items-center gap-1">
              <label class="small text-muted text-nowrap fw-semibold me-1"><i class="bi bi-flag me-1"></i>Status:</label>
              <select class="form-select form-select-sm bg-light" [(ngModel)]="selectedStatus">
                <option value="ALL">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <div class="col-sm-6 col-md-3 col-lg-4 text-sm-end">
            <div class="d-inline-flex align-items-center gap-2">
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 small">
                Showing <strong>{{ filteredExams.length }}</strong> of {{ exams.length }} schedules
              </span>
              <button
                *ngIf="searchTerm || selectedBranch !== 'ALL_BRANCHES' || selectedStatus !== 'ALL'"
                class="btn btn-sm btn-link text-danger p-0 text-decoration-none small"
                (click)="clearFilters()"
                title="Reset all filters"
              >
                <i class="bi bi-arrow-counterclockwise me-1"></i>Reset
              </button>
            </div>
          </div>
        </div>

        <!-- Branch Pills Row -->
        <div class="d-flex flex-wrap align-items-center gap-1 pt-2 border-top">
          <span class="text-secondary small fw-semibold me-2"><i class="bi bi-funnel-fill text-primary"></i> Branch:</span>
          <button
            class="btn btn-sm rounded-pill px-3 transition branch-tab-btn"
            [ngClass]="selectedBranch === 'ALL_BRANCHES' ? 'btn-primary shadow-sm' : 'btn-light border text-secondary'"
            (click)="selectedBranch = 'ALL_BRANCHES'"
          >
            All ({{ exams.length }})
          </button>
          <button
            *ngFor="let b of ['CSE', 'ECE', 'MECH', 'CIVIL', 'IT', 'EEE', 'ALL']"
            class="btn btn-sm rounded-pill px-3 transition branch-tab-btn"
            [ngClass]="selectedBranch === b ? 'btn-primary shadow-sm' : 'btn-light border text-secondary'"
            (click)="selectedBranch = b"
          >
            {{ b }} ({{ countExamsByBranch(b) }})
          </button>
        </div>
      </div>

      <!-- Exams Table Card -->
      <div *ngIf="!isLoading" class="card border-0 overflow-hidden exams-table-card shadow-sm rounded-4">

        <!-- Table Meta / Summary Bar -->
        <div class="table-meta-bar d-flex flex-wrap align-items-center justify-content-between px-3 px-md-4 py-2 gap-2">
          <div class="d-flex flex-wrap align-items-center gap-2">
            <span class="table-meta-label"><i class="bi bi-table me-1"></i><strong>{{ filteredExams.length }}</strong> Exams Found</span>
            <span *ngIf="selectedBranch !== 'ALL_BRANCHES'" class="badge bg-primary rounded-pill">{{ selectedBranch }}</span>
            <span *ngIf="selectedStatus !== 'ALL'" class="badge bg-secondary rounded-pill">{{ selectedStatus }}</span>
            <span *ngIf="searchTerm" class="badge bg-info text-dark rounded-pill">"{{ searchTerm }}"</span>
          </div>
          <span class="table-meta-sub text-muted small"><i class="bi bi-info-circle me-1"></i>All columns fit view. Click row action icons to manage</span>
        </div>

        <div class="table-responsive">
          <table class="table align-middle mb-0 exams-table">
            <thead>
              <tr>
                <th class="th-exam-name">
                  <div class="th-inner"><i class="bi bi-journal-bookmark-fill text-primary me-1"></i>Exam & Subject</div>
                </th>
                <th class="th-branch">
                  <div class="th-inner"><i class="bi bi-diagram-3-fill text-info me-1"></i>Branch</div>
                </th>
                <th class="th-schedule">
                  <div class="th-inner"><i class="bi bi-calendar3 text-primary me-1"></i>Schedule</div>
                </th>
                <th class="th-halls">
                  <div class="th-inner"><i class="bi bi-building text-success me-1"></i>Halls & Capacity</div>
                </th>
                <th class="th-candidates">
                  <div class="th-inner"><i class="bi bi-people-fill text-primary me-1"></i>Candidates</div>
                </th>
                <th class="th-status">
                  <div class="th-inner"><i class="bi bi-flag-fill text-secondary me-1"></i>Status</div>
                </th>
                <th class="th-actions text-end pe-3 sticky-action-col">
                  <div class="th-inner justify-content-end"><i class="bi bi-gear-fill text-muted me-1"></i>Actions</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let exam of filteredExams; let i = index" class="exam-row">
                <!-- Exam & Subject Column -->
                <td class="ps-3 col-exam-name">
                  <div class="exam-row-accent" [ngClass]="'row-accent-' + (i % 5)"></div>
                  <div class="exam-name-cell">
                    <a [routerLink]="['/exams/edit', exam.id]"
                       class="exam-row-title text-truncate text-dark text-decoration-none d-flex align-items-center gap-1 hover-primary"
                       [title]="'Click to Edit / Update ' + exam.examName">
                      <span>{{ exam.examName }}</span>
                      <i class="bi bi-pencil-fill text-primary ms-1 opacity-50 small"></i>
                    </a>
                    <div class="exam-row-meta small text-muted text-truncate d-flex align-items-center gap-1 mt-1">
                      <span class="text-secondary fw-semibold" [title]="exam.subject">{{ exam.subject }}</span>
                      <span class="text-muted">•</span>
                      <span class="badge bg-light text-muted border px-1 font-monospace">ID #{{ exam.id }}</span>
                    </div>
                  </div>
                </td>

                <!-- Branch Column -->
                <td>
                  <span class="branch-pill" [ngClass]="getBranchBadge(exam.branch)">
                    <i class="bi bi-mortarboard-fill me-1"></i>{{ exam.branch || 'ALL' }}
                  </span>
                </td>

                <!-- Schedule Column (Date + Time) -->
                <td>
                  <div class="schedule-cell">
                    <div class="schedule-date fw-semibold text-dark">
                      <i class="bi bi-calendar-event text-primary me-1"></i>{{ exam.examDate }}
                    </div>
                    <div class="schedule-time small text-muted">
                      <i class="bi bi-clock text-warning me-1"></i>{{ exam.startTime }} – {{ exam.endTime }}
                    </div>
                  </div>
                </td>

                <!-- Halls & Capacity Column -->
                <td>
                  <div *ngIf="exam.allottedHalls && exam.allottedHalls.length > 0" class="halls-cell">
                    <div class="d-flex flex-wrap align-items-center gap-1 mb-1">
                      <span *ngFor="let h of exam.allottedHalls.slice(0, 2)" class="hall-tag">
                        {{ h.hallNumber }}
                      </span>
                      <span *ngIf="exam.allottedHalls.length > 2" class="hall-more-tag" [title]="getAllHallsTooltip(exam.allottedHalls)">
                        +{{ exam.allottedHalls.length - 2 }}
                      </span>
                    </div>
                    <span class="seats-tag">
                      <i class="bi bi-grid-3x3 me-1"></i>{{ exam.allottedCapacity || 0 }} seats
                    </span>
                  </div>
                  <span *ngIf="!exam.allottedHalls || exam.allottedHalls.length === 0" class="text-muted small">
                    <i class="bi bi-building me-1 opacity-50"></i>All Halls
                  </span>
                </td>

                <!-- Candidates Column -->
                <td>
                  <div class="candidates-cell">
                    <a [routerLink]="['/exams', exam.id, 'students']"
                       class="candidates-link"
                       title="Click to view & enroll candidate roster">
                      <i class="bi bi-people-fill me-1 text-primary"></i>
                      <strong>{{ exam.registeredStudentsCount || 0 }}</strong>
                      <span class="ms-1 text-muted small">enrolled</span>
                    </a>
                  </div>
                </td>

                <!-- Status Column -->
                <td>
                  <span class="status-pill" [ngClass]="getStatusBadge(exam.status)">
                    <i class="bi bi-circle-fill me-1 status-dot"></i>
                    {{ exam.status }}
                  </span>
                </td>

                <!-- Actions Column (Sticky on right edge) -->
                <td class="text-end pe-3 td-actions sticky-action-col">
                  <div class="action-btns">
                    <!-- Prominent Edit / Update Button -->
                    <a [routerLink]="['/exams/edit', exam.id]"
                       class="btn btn-sm btn-primary rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1 shadow-sm edit-update-btn"
                       title="Edit / Update Examination Details">
                      <i class="bi bi-pencil-square"></i>
                      <span class="fw-bold">Edit / Update</span>
                    </a>

                    <!-- Seating Arrangement Button -->
                    <a [routerLink]="['/seating/arrangement']" [queryParams]="{ examId: exam.id }"
                       class="act-btn act-view" title="View Seating Arrangement">
                      <i class="bi bi-grid-3x3-gap-fill"></i>
                    </a>

                    <!-- Generate Seating Button -->
                    <a [routerLink]="['/seating/generate']" [queryParams]="{ examId: exam.id }"
                       class="act-btn act-generate" title="Generate Seating Arrangement">
                      <i class="bi bi-cpu-fill"></i>
                    </a>

                    <!-- Import Students CSV -->
                    <button class="act-btn act-import" (click)="openSingleBranchImportModal(exam)" title="Import Students CSV for {{ exam.branch || 'Exam' }}">
                      <i class="bi bi-person-plus-fill"></i>
                    </button>

                    <!-- Delete Exam -->
                    <button class="act-btn act-delete" (click)="promptDelete(exam)" title="Delete Exam">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty state -->
              <tr *ngIf="filteredExams.length === 0">
                <td colspan="7">
                  <div class="empty-state py-5 text-center">
                    <i class="bi bi-calendar-x fs-1 text-muted opacity-40"></i>
                    <div class="empty-state-title fw-bold text-dark mt-2">No exams found</div>
                    <div class="empty-state-sub text-muted small mt-1">
                      {{ (searchTerm || selectedStatus !== 'ALL' || selectedBranch !== 'ALL_BRANCHES') ? 'No exams match your active search and filter criteria.' : 'No examinations scheduled yet.' }}
                    </div>
                    <div class="d-flex justify-content-center gap-2 mt-3">
                      <button *ngIf="searchTerm || selectedStatus !== 'ALL' || selectedBranch !== 'ALL_BRANCHES'"
                              class="btn btn-sm btn-outline-secondary rounded-pill px-3"
                              (click)="clearFilters()">
                        <i class="bi bi-arrow-counterclockwise me-1"></i>Reset Filters
                      </button>
                      <a routerLink="/exams/new" class="btn btn-sm btn-primary rounded-pill px-3 shadow-sm">
                        <i class="bi bi-calendar-plus-fill me-1"></i>Schedule New Exam
                      </a>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- CSV Import Modal Backdrop -->
    <div *ngIf="isImportModalOpen" class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-light border-0 py-3 px-4">
            <h5 class="modal-title fw-bold text-dark d-flex align-items-center gap-2">
              <i class="bi bi-file-earmark-arrow-up-fill text-success"></i> Import Exams & Schedules from CSV
            </h5>
            <button type="button" class="btn-close" (click)="closeImportModal()"></button>
          </div>
          <div class="modal-body p-4">
            <!-- Instructions & Sample Download -->
            <div class="alert alert-info border-0 rounded-3 d-flex flex-wrap justify-content-between align-items-center py-2 px-3 mb-3 bg-opacity-10 text-primary-emphasis gap-2">
              <div class="small">
                <strong>Expected CSV Headers:</strong><br>
                <code>examName, subject, examDate (YYYY-MM-DD), startTime (HH:mm), endTime (HH:mm), status, branch, allottedHalls</code>
                <div class="text-muted mt-1" style="font-size: 0.75rem;">
                  Example branch: <code>CSE</code>, <code>ECE</code>, <code>MECH</code>, or <code>ALL</code> | Allotted halls: <code>LH-101;LH-201</code>
                </div>
              </div>
              <button class="btn btn-sm btn-outline-primary bg-white shadow-sm d-flex align-items-center gap-1" (click)="downloadSampleCsv()">
                <i class="bi bi-download"></i>
                <span>Download Template</span>
              </button>
            </div>

            <!-- File Upload Area -->
            <div class="mb-3">
              <label class="form-label fw-semibold text-secondary small text-uppercase">Select CSV File</label>
              <div class="p-3 border border-2 border-dashed rounded-3 text-center bg-light bg-opacity-50">
                <i class="bi bi-cloud-arrow-up fs-2 text-primary opacity-75 mb-2 d-block"></i>
                <input type="file" class="form-control form-control-sm mx-auto" style="max-width: 360px;" accept=".csv" (change)="onFileSelected($event)" />
                <div class="text-muted small mt-2">Upload any standard CSV file containing exam timetable and schedule rows.</div>
                <div *ngIf="selectedFile" class="mt-2 badge bg-primary-subtle text-primary p-2">
                  <i class="bi bi-filetype-csv me-1"></i> {{ selectedFile.name }} ({{ (selectedFile.size / 1024).toFixed(1) }} KB)
                </div>
              </div>
            </div>

            <!-- Uploading spinner -->
            <div *ngIf="isImporting" class="text-center py-3">
              <div class="spinner-border text-success" role="status"></div>
              <p class="text-muted small mt-2 mb-0">Parsing schedule, checking duplicates, and saving exams...</p>
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

              <!-- Error details list -->
              <div *ngIf="importSummary.errors && importSummary.errors.length > 0" class="border rounded-3 p-3 bg-danger bg-opacity-10" style="max-height: 200px; overflow-y: auto;">
                <h6 class="small fw-bold text-danger mb-2">
                  <i class="bi bi-exclamation-triangle-fill me-1"></i> Row Conflicts & Errors ({{ importSummary.errors.length }}):
                </h6>
                <ul class="list-unstyled mb-0 small">
                  <li *ngFor="let err of importSummary.errors" class="text-danger mb-1 border-bottom border-danger-subtle pb-1">
                    <strong>Row {{ err.rowNumber }}</strong>
                    <span *ngIf="err.examName"> [{{ err.examName }}]</span>: {{ err.reason }}
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
              <span>Upload & Import</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Concurrent Multi-Branch Import Modal -->
    <div *ngIf="isConcurrentModalOpen" class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(8px);">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-gradient text-white py-3 px-4" style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0369a1 100%);">
            <div>
              <h5 class="modal-title fw-bold d-flex align-items-center gap-2 mb-1">
                <i class="bi bi-layers-half text-info"></i> Concurrent Multi-Branch Student CSV Import
              </h5>
              <p class="text-white-50 small mb-0">Import student roster CSV files for multiple branches scheduled at the exact same examination time slot</p>
            </div>
            <button type="button" class="btn-close btn-close-white" (click)="closeConcurrentModal()"></button>
          </div>
          <div class="modal-body p-4 bg-light bg-opacity-25">
            <!-- Schedule Session Selector Banner -->
            <div class="card border-0 shadow-sm rounded-3 p-3 mb-4 bg-white">
              <div class="row g-3 align-items-center">
                <div class="col-md-7">
                  <label class="form-label fw-bold text-dark small text-uppercase mb-1">
                    <i class="bi bi-clock-fill text-primary me-1"></i> Select Examination Schedule Slot:
                  </label>
                  <select class="form-select" [(ngModel)]="selectedSessionKey" (change)="onSessionSelectChange()">
                    <option *ngFor="let s of concurrentSessions" [value]="s.sessionDate + '_' + s.startTime + '_' + s.endTime">
                      {{ s.sessionLabel }} — ({{ s.totalBranches }} Branch{{ s.totalBranches > 1 ? 'es' : '' }} Scheduled)
                    </option>
                  </select>
                </div>
                <div class="col-md-5">
                  <div class="p-2 border rounded-3 bg-light text-center">
                    <small class="text-muted d-block">Allotted Capacity in Selected Time Slot</small>
                    <strong class="text-dark fs-6">{{ selectedSession?.totalAllottedCapacity || 0 }} Total Seats</strong>
                    <span class="badge bg-info-subtle text-info-emphasis ms-2">{{ selectedSession?.totalBranches || 0 }} Branches</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notice Banner explaining Individual Branch Files -->
            <div class="alert alert-info border-0 rounded-3 d-flex align-items-start gap-3 mb-4 shadow-sm">
              <i class="bi bi-info-circle-fill fs-4 text-info mt-1"></i>
              <div class="flex-grow-1 small">
                <strong>Individual Branch CSV Import Engine:</strong><br>
                Each branch scheduled at this concurrent time slot has its own individual student CSV file.
                Download the sample template for each branch, attach its dedicated CSV file below, and click <strong>"Import Branch Only"</strong> or <strong>"Import All Branch CSVs"</strong> to auto-enroll students and generate 5×3 multi-hall seating!
              </div>
            </div>

            <!-- Branches Grid: Each Branch with its own Individual File Slot -->
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i class="bi bi-files text-primary"></i> Individual Branch Files for this Session ({{ selectedSession?.branchExams?.length || 0 }} Branches):
              </h6>
              <span class="badge bg-light text-muted border small">
                {{ selectedFilesCount }} of {{ selectedSession?.branchExams?.length || 0 }} Files Selected
              </span>
            </div>

            <div class="row g-3 mb-4">
              <div *ngFor="let be of selectedSession?.branchExams" class="col-md-6">
                <div class="card border-0 shadow-sm rounded-4 h-100 p-3 bg-white border-top border-4"
                     [ngClass]="getBranchBorderTop(be.branch)">
                  <!-- Branch Card Header -->
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span class="badge px-2 py-1 fs-6 mb-1 fw-bold" [ngClass]="getBranchBadge(be.branch)">
                        <i class="bi bi-mortarboard-fill me-1"></i> Branch: {{ be.branch || 'ALL' }}
                      </span>
                      <h6 class="fw-bold text-dark mb-0">{{ be.examName }}</h6>
                      <small class="text-muted">{{ be.subject }}</small>
                    </div>
                    <button type="button" class="btn btn-sm btn-outline-primary rounded-pill px-2 py-1 small" (click)="downloadBranchTemplate(be.branch || 'CSE')">
                      <i class="bi bi-download me-1"></i> Template
                    </button>
                  </div>

                  <!-- Allotted Halls and Capacity -->
                  <div class="small text-muted mb-3 d-flex flex-wrap align-items-center gap-2">
                    <span class="badge bg-light text-dark border">
                      <i class="bi bi-building me-1"></i> Halls:
                      <span *ngFor="let h of be.allottedHalls; let last = last">{{ h.hallNumber }}{{ !last ? ', ' : '' }}</span>
                    </span>
                    <span class="badge bg-light text-dark border">
                      <i class="bi bi-person-fill me-1"></i> {{ be.registeredStudentsCount || 0 }} Enrolled
                    </span>
                    <span class="badge bg-success-subtle text-success border border-success-subtle">
                      {{ be.allottedCapacity || 0 }} Seats
                    </span>
                  </div>

                  <!-- Individual File Picker & Action for this Branch -->
                  <div class="mt-auto">
                    <!-- If no file selected yet for this branch -->
                    <div *ngIf="!branchFiles[(be.branch || 'ALL').toUpperCase()]" class="p-3 border border-2 border-dashed rounded-3 text-center bg-light bg-opacity-50">
                      <label class="btn btn-sm btn-outline-primary rounded-pill px-3 mb-1 cursor-pointer">
                        <i class="bi bi-filetype-csv me-1"></i> Choose {{ be.branch || 'ALL' }} Students CSV
                        <input type="file" hidden accept=".csv" (change)="onBranchFileChange($event, be.branch || 'ALL')" />
                      </label>
                      <div class="small text-muted" style="font-size: 0.75rem;">Select individual CSV file for {{ be.branch || 'ALL' }} candidates</div>
                    </div>

                    <!-- If file IS selected for this branch -->
                    <div *ngIf="branchFiles[(be.branch || 'ALL').toUpperCase()]" class="p-3 border rounded-3 bg-success bg-opacity-10 border-success-subtle">
                      <div class="d-flex align-items-center justify-content-between mb-2">
                        <div class="small text-success fw-bold text-truncate">
                          <i class="bi bi-file-earmark-check-fill me-1"></i> {{ branchFiles[(be.branch || 'ALL').toUpperCase()].name }}
                          <span class="badge bg-white text-muted border ms-1">{{ (branchFiles[(be.branch || 'ALL').toUpperCase()].size / 1024).toFixed(1) }} KB</span>
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-danger border-0 p-0" (click)="removeBranchFile(be.branch || 'ALL')">
                          <i class="bi bi-x-circle-fill"></i>
                        </button>
                      </div>

                      <div class="d-flex justify-content-between align-items-center pt-2 border-top border-success-subtle">
                        <span class="small text-muted" style="font-size: 0.75rem;">Individual file ready</span>
                        <button type="button" class="btn btn-sm btn-success rounded-pill px-3 shadow-sm"
                                [disabled]="isBranchImporting[(be.branch || 'ALL').toUpperCase()]"
                                (click)="uploadSingleBranchFromConcurrent(be)">
                          <span *ngIf="isBranchImporting[(be.branch || 'ALL').toUpperCase()]" class="spinner-border spinner-border-sm me-1"></span>
                          <i *ngIf="!isBranchImporting[(be.branch || 'ALL').toUpperCase()]" class="bi bi-cloud-arrow-up-fill me-1"></i>
                          <span>Import {{ be.branch }} Only</span>
                        </button>
                      </div>
                    </div>

                    <!-- Individual Branch Result if imported -->
                    <div *ngIf="branchImportSummaries[(be.branch || 'ALL').toUpperCase()]" class="mt-2 p-2 border rounded-3 bg-white shadow-sm small">
                      <div class="d-flex justify-content-between align-items-center mb-1 text-success fw-bold">
                        <span><i class="bi bi-check-circle-fill me-1"></i> {{ branchImportSummaries[(be.branch || 'ALL').toUpperCase()].successfullyImported }} Candidates Enrolled</span>
                      </div>
                      <div *ngIf="branchImportSummaries[(be.branch || 'ALL').toUpperCase()].hallAllocations?.length > 0" class="mt-1">
                        <div *ngFor="let h of branchImportSummaries[(be.branch || 'ALL').toUpperCase()].hallAllocations" class="d-flex justify-content-between text-muted" style="font-size: 0.75rem;">
                          <span>{{ h.hallNumber }} ({{ h.building }}):</span>
                          <span class="fw-semibold" [ngClass]="h.filled ? 'text-success' : 'text-primary'">
                            {{ h.assignedCount }}/{{ h.capacity }} seats {{ h.filled ? '[100% Full]' : '[Overflow]' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Auto-Allocate Seating Checkbox -->
            <div class="form-check form-switch mb-3 p-3 bg-white rounded-3 shadow-sm">
              <input class="form-check-input ms-0 me-2" type="checkbox" id="autoAllocateSwitch" [(ngModel)]="autoAllocateSeating" />
              <label class="form-check-label fw-bold text-dark small" for="autoAllocateSwitch">
                <i class="bi bi-cpu-fill text-success me-1"></i> Auto-Generate Seating with 5×3 Multi-Hall Overflow Allocation
              </label>
              <div class="text-muted small ms-4">When enabled, students from all imported branch CSVs are immediately seated in their admin-allotted halls (15 seats each, filling Hall 1 to 100% then overflowing to Hall 2).</div>
            </div>

            <!-- Progress Spinner -->
            <div *ngIf="isConcurrentImporting" class="text-center py-4 bg-white rounded-3 shadow-sm mb-3">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="text-muted small mt-2 mb-0 fw-semibold">Processing individual branch CSV files, enrolling students, and allocating 5×3 hall seating...</p>
            </div>

            <!-- Post-Import Results Breakdown (Combined) -->
            <div *ngIf="concurrentSummary" class="card border-0 shadow-sm rounded-3 p-3 bg-white mb-3">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <i class="bi bi-check-circle-fill text-success"></i> Concurrent Import Results
                </h6>
                <span class="badge bg-success-subtle text-success px-3 py-1 fs-6">
                  {{ concurrentSummary.totalStudentsImported }} Students Enrolled Across {{ concurrentSummary.totalBranchesProcessed }} Branches
                </span>
              </div>

              <!-- Branch Results Cards -->
              <div class="row g-3">
                <div *ngFor="let br of concurrentSummary.branchResults" class="col-md-6">
                  <div class="border rounded-3 p-3 bg-light bg-opacity-50">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="badge px-2 py-1 fw-bold" [ngClass]="getBranchBadge(br.branch)">{{ br.branch }}</span>
                      <strong class="text-success small"><i class="bi bi-person-check-fill me-1"></i> {{ br.successfullyImported }} Enrolled</strong>
                    </div>
                    <div class="small fw-semibold text-dark text-truncate mb-2">{{ br.examName }}</div>

                    <!-- Hall Allocations Overflow Bar -->
                    <div *ngIf="br.hallAllocations && br.hallAllocations.length > 0" class="mt-2">
                      <div class="small text-secondary fw-semibold mb-1">5×3 Multi-Hall Seating:</div>
                      <div *ngFor="let hall of br.hallAllocations" class="p-2 border rounded-2 bg-white mb-1 small">
                        <div class="d-flex justify-content-between mb-1">
                          <span class="fw-bold">{{ hall.hallNumber }} ({{ hall.building }})</span>
                          <span [ngClass]="hall.filled ? 'text-success fw-bold' : 'text-primary'">
                            {{ hall.assignedCount }}/{{ hall.capacity }} Seats
                            <span *ngIf="hall.filled" class="badge bg-success ms-1">100% Full</span>
                            <span *ngIf="!hall.filled" class="badge bg-info text-dark ms-1">Overflow</span>
                          </span>
                        </div>
                        <div class="progress" style="height: 6px;">
                          <div class="progress-bar" [ngClass]="hall.filled ? 'bg-success' : 'bg-info'"
                               [style.width.%]="(hall.assignedCount / hall.capacity) * 100"></div>
                        </div>
                      </div>
                    </div>

                    <!-- Error details if any -->
                    <div *ngIf="br.errors && br.errors.length > 0" class="mt-2 text-danger small">
                      <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ br.errors.length }} issue(s) reported
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light border-0 py-3 px-4">
            <button type="button" class="btn btn-secondary rounded-pill px-3" (click)="closeConcurrentModal()">Close</button>
            <button
              type="button"
              class="btn btn-info text-white rounded-pill px-4 shadow-sm"
              [disabled]="selectedFilesCount === 0 || isConcurrentImporting"
              (click)="uploadConcurrentBranchCsvs()"
            >
              <i class="bi bi-upload me-1"></i>
              <span>Import All ({{ selectedFilesCount }}) Branch CSVs</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Dedicated Single Branch Student Import Modal Backdrop -->
    <div *ngIf="isSingleBranchModalOpen && singleImportExam" class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-light border-0 py-3 px-4">
            <h5 class="modal-title fw-bold text-dark d-flex align-items-center gap-2">
              <i class="bi bi-mortarboard-fill text-primary"></i>
              Import Individual Students CSV:
              <span class="badge px-3 py-1 fs-6" [ngClass]="getBranchBadge(singleImportExam.branch)">
                {{ singleImportExam.branch || 'ALL' }}
              </span>
            </h5>
            <button type="button" class="btn-close" (click)="closeSingleBranchModal()"></button>
          </div>
          <div class="modal-body p-4">
            <!-- Exam Details Card -->
            <div class="card border-0 shadow-sm rounded-3 p-3 mb-3 bg-light bg-opacity-50">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="fw-bold text-dark mb-1">{{ singleImportExam.examName }}</h6>
                  <p class="text-secondary small mb-1">Subject: <strong>{{ singleImportExam.subject }}</strong> | Date: <strong>{{ singleImportExam.examDate }}</strong> ({{ singleImportExam.startTime }} - {{ singleImportExam.endTime }})</p>
                  <div class="d-flex align-items-center gap-2 mt-1">
                    <span class="badge bg-white text-dark border">
                      <i class="bi bi-building me-1"></i> Allotted Halls:
                      <span *ngFor="let h of singleImportExam.allottedHalls; let last = last">{{ h.hallNumber }}{{ !last ? ', ' : '' }}</span>
                    </span>
                    <span class="badge bg-success-subtle text-success border border-success-subtle">
                      {{ singleImportExam.allottedCapacity || 0 }} Total Allotted Seats
                    </span>
                  </div>
                </div>
                <button class="btn btn-sm btn-outline-primary bg-white shadow-sm" (click)="downloadSingleBranchTemplate()">
                  <i class="bi bi-download me-1"></i> Download {{ singleImportExam.branch || 'Branch' }} Template
                </button>
              </div>
            </div>

            <div class="alert alert-info border-0 rounded-3 small py-2 px-3 mb-3">
              <i class="bi bi-info-circle-fill me-1"></i>
              Upload the individual CSV file containing candidates for <strong>{{ singleImportExam.branch || 'this branch' }}</strong>. Candidates will be enrolled in <strong>{{ singleImportExam.examName }}</strong> and seated across the allotted halls with automatic 5×3 multi-hall overflow!
            </div>

            <!-- File Upload Input -->
            <div class="p-4 border border-2 border-dashed rounded-3 text-center bg-white mb-3">
              <label class="btn btn-primary rounded-pill px-4 mb-2 cursor-pointer shadow-sm">
                <i class="bi bi-folder2-open me-2"></i> Choose {{ singleImportExam.branch || 'Branch' }} Students CSV File
                <input type="file" hidden accept=".csv" (change)="onSingleFileSelected($event)" />
              </label>
              <div class="text-muted small">Select an individual CSV file formatted with: <code>registerNumber, name, branch, year, section, email, phone</code></div>
              <div *ngIf="singleImportFile" class="mt-3 badge bg-success-subtle text-success p-2 fs-7 border border-success-subtle">
                <i class="bi bi-file-earmark-check-fill me-1"></i> {{ singleImportFile.name }} ({{ (singleImportFile.size / 1024).toFixed(1) }} KB)
              </div>
            </div>

            <!-- Uploading spinner -->
            <div *ngIf="isSingleImporting" class="text-center py-3">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="text-muted small mt-2 mb-0">Enrolling candidates and allocating 5×3 multi-hall seating...</p>
            </div>

            <!-- Import Summary Report with Hall Overflow -->
            <div *ngIf="singleImportSummary" class="mt-3">
              <div class="alert alert-success border-0 rounded-3 mb-3">
                <i class="bi bi-check-circle-fill me-1"></i>
                <strong>Successfully imported and enrolled {{ singleImportSummary.successfullyImported }} candidates into {{ singleImportExam.examName }}!</strong>
              </div>

              <div *ngIf="singleImportSummary.hallAllocations && singleImportSummary.hallAllocations.length > 0" class="card border-0 shadow-sm rounded-3 p-3 bg-light bg-opacity-50">
                <h6 class="fw-bold text-dark mb-2 small text-uppercase">5×3 Multi-Hall Seating Allocation:</h6>
                <div *ngFor="let hall of singleImportSummary.hallAllocations" class="p-2 border rounded-2 bg-white mb-2 small">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="fw-bold">{{ hall.hallNumber }} ({{ hall.building }})</span>
                    <span [ngClass]="hall.filled ? 'text-success fw-bold' : 'text-primary'">
                      {{ hall.assignedCount }}/{{ hall.capacity }} Seats
                      <span *ngIf="hall.filled" class="badge bg-success ms-1">100% Full</span>
                      <span *ngIf="!hall.filled" class="badge bg-info text-dark ms-1">Overflow</span>
                    </span>
                  </div>
                  <div class="progress" style="height: 6px;">
                    <div class="progress-bar" [ngClass]="hall.filled ? 'bg-success' : 'bg-info'"
                         [style.width.%]="(hall.assignedCount / hall.capacity) * 100"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light border-0 py-3 px-4">
            <button type="button" class="btn btn-secondary rounded-pill px-3" (click)="closeSingleBranchModal()">Close</button>
            <button
              type="button"
              class="btn btn-success text-white rounded-pill px-4 shadow-sm"
              [disabled]="!singleImportFile || isSingleImporting"
              (click)="uploadSingleBranchCsv()"
            >
              <i class="bi bi-cloud-arrow-up-fill me-1"></i>
              <span>Import & Allocate Seating</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <app-confirmation-dialog
      [isOpen]="isDeleteDialogOpen"
      title="Delete Examination"
      [message]="'Are you sure you want to delete ' + (examToDelete?.examName || '') + '? All seat arrangements and candidate enrollments will also be removed.'"
      (confirmed)="confirmDelete()"
      (cancelled)="cancelDelete()"
    ></app-confirmation-dialog>
  `,
  styles: [`
    /* ====== EXAM LIST TABLE ====== */
    .exams-table-card {
      border-radius: 16px !important;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06) !important;
      border: 1px solid #e2e8f0 !important;
      background: #ffffff;
    }
    .table-meta-bar {
      background: linear-gradient(135deg, #f8fafc, #f1f5f9);
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.8rem;
    }
    .table-meta-label { font-weight: 600; color: #475569; }

    /* Custom Responsive Scrollbar */
    .table-responsive {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .table-responsive::-webkit-scrollbar {
      height: 6px;
    }
    .table-responsive::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 999px;
    }
    .table-responsive::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 999px;
    }
    .table-responsive::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    .exams-table {
      min-width: 880px;
      width: 100%;
      margin-bottom: 0;
    }
    .exams-table thead tr {
      background: linear-gradient(135deg, #0f172a, #1e293b);
    }
    .exams-table thead th {
      color: rgba(255,255,255,0.9) !important;
      font-size: 0.74rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      padding: 0.85rem 0.65rem;
      border: none !important;
      white-space: nowrap;
    }
    .th-inner {
      display: flex;
      align-items: center;
    }

    .exams-table tbody tr {
      transition: background 0.15s, transform 0.15s;
    }
    .exams-table tbody tr:hover {
      background: #f8faff !important;
    }
    .exams-table td {
      padding: 0.75rem 0.65rem;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }

    /* Row accent bar */
    .col-exam-name {
      position: relative;
      padding-left: 1.5rem !important;
    }
    .exam-row-accent {
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 4px;
      border-radius: 0 2px 2px 0;
    }
    .row-accent-0 { background: linear-gradient(180deg, #6366f1, #8b5cf6); }
    .row-accent-1 { background: linear-gradient(180deg, #f59e0b, #ef4444); }
    .row-accent-2 { background: linear-gradient(180deg, #10b981, #0891b2); }
    .row-accent-3 { background: linear-gradient(180deg, #ec4899, #f43f5e); }
    .row-accent-4 { background: linear-gradient(180deg, #3b82f6, #06b6d4); }

    .exam-name-cell {
      max-width: 260px;
    }
    .exam-row-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.25;
    }
    .exam-row-meta {
      line-height: 1.2;
    }

    .branch-pill {
      font-size: 0.73rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
    }

    .schedule-cell {
      white-space: nowrap;
    }
    .schedule-date {
      font-size: 0.82rem;
      line-height: 1.25;
    }
    .schedule-time {
      font-size: 0.74rem;
      line-height: 1.25;
    }

    .hall-tag {
      display: inline-flex;
      align-items: center;
      font-size: 0.68rem;
      font-weight: 700;
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      padding: 0.12rem 0.45rem;
      border-radius: 6px;
      white-space: nowrap;
    }
    .hall-more-tag {
      display: inline-flex;
      align-items: center;
      font-size: 0.65rem;
      font-weight: 700;
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
      padding: 0.1rem 0.35rem;
      border-radius: 6px;
      cursor: help;
    }
    .seats-tag {
      display: inline-flex;
      align-items: center;
      font-size: 0.68rem;
      font-weight: 700;
      background: #f0fdf4;
      color: #16a34a;
      border: 1px solid #bbf7d0;
      padding: 0.1rem 0.45rem;
      border-radius: 6px;
      white-space: nowrap;
    }

    .candidates-link {
      display: inline-flex;
      align-items: center;
      font-size: 0.8rem;
      font-weight: 600;
      color: #4f46e5;
      text-decoration: none;
      transition: color 0.15s;
      white-space: nowrap;
    }
    .candidates-link:hover {
      color: #3730a3;
      text-decoration: underline;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      white-space: nowrap;
      letter-spacing: 0.04em;
    }
    .status-dot {
      font-size: 0.42rem;
    }

    /* Action buttons */
    .action-btns {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.3rem;
      white-space: nowrap;
    }
    .act-btn {
      width: 29px;
      height: 29px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.78rem;
      cursor: pointer;
      border: 1.5px solid transparent;
      transition: all 0.15s ease;
      text-decoration: none;
      background: #f8fafc;
      flex-shrink: 0;
    }
    .act-import  { color: #16a34a; border-color: #bbf7d0; }
    .act-import:hover  { background: #16a34a; color: #fff; border-color: #16a34a; transform: translateY(-1px); }
    .act-generate { color: #0284c7; border-color: #bae6fd; }
    .act-generate:hover { background: #0284c7; color: #fff; border-color: #0284c7; transform: translateY(-1px); }
    .act-view  { color: #0891b2; border-color: #a5f3fc; }
    .act-view:hover  { background: #0891b2; color: #fff; border-color: #0891b2; transform: translateY(-1px); }
    .act-edit  { color: #4f46e5; border-color: #c7d2fe; }
    .act-edit:hover  { background: #4f46e5; color: #fff; border-color: #4f46e5; transform: translateY(-1px); }
    .act-delete { color: #dc2626; border-color: #fecaca; }
    .act-delete:hover { background: #dc2626; color: #fff; border-color: #dc2626; transform: translateY(-1px); }

    /* Sticky Actions Column */
    .sticky-action-col {
      position: sticky !important;
      right: 0 !important;
      z-index: 5;
      box-shadow: -6px 0 12px rgba(0, 0, 0, 0.05);
    }
    .exams-table thead th.sticky-action-col {
      background: #0f172a !important;
      z-index: 6;
    }
    .exams-table tbody td.sticky-action-col {
      background: #ffffff;
    }
    .exams-table tbody tr:hover td.sticky-action-col {
      background: #f8faff !important;
    }

    .edit-update-btn {
      font-size: 0.74rem;
      padding: 0.25rem 0.7rem !important;
      white-space: nowrap;
      background: linear-gradient(135deg, #2563eb, #3b82f6) !important;
      border: none !important;
      color: #ffffff !important;
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25) !important;
    }
    .edit-update-btn:hover {
      background: linear-gradient(135deg, #1d4ed8, #2563eb) !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4) !important;
    }

    .hover-primary {
      cursor: pointer;
      transition: color 0.15s ease;
    }
    .hover-primary:hover {
      color: #2563eb !important;
      text-decoration: underline !important;
    }

    .branch-tab-btn {
      font-size: 0.78rem;
    }
  `]
})
export class ExamListComponent implements OnInit {
  exams: Exam[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  isDeleteDialogOpen = false;
  examToDelete: Exam | null = null;

  selectedBranch: string = 'ALL_BRANCHES';
  searchTerm: string = '';
  selectedStatus: string = 'ALL';

  // CSV Import state
  isImportModalOpen = false;
  isImporting = false;
  selectedFile: File | null = null;
  importSummary: ExamImportSummary | null = null;

  // Concurrent Multi-Branch Import State
  concurrentSessions: ConcurrentExamSession[] = [];
  isConcurrentModalOpen = false;
  isConcurrentImporting = false;
  selectedSessionKey = '';
  selectedSession: ConcurrentExamSession | null = null;
  branchFiles: { [branch: string]: File } = {};
  autoAllocateSeating = true;
  concurrentSummary: ConcurrentBranchImportSummary | null = null;
  isBranchImporting: { [branch: string]: boolean } = {};
  branchImportSummaries: { [branch: string]: any } = {};

  // Single Branch Import State
  isSingleBranchModalOpen = false;
  singleImportExam: Exam | null = null;
  singleImportFile: File | null = null;
  isSingleImporting = false;
  singleImportSummary: StudentImportSummary | null = null;

  constructor(
    private examService: ExamService,
    private studentService: StudentService
  ) {}

  get filteredExams(): Exam[] {
    return this.exams.filter(e => {
      const matchBranch = this.selectedBranch === 'ALL_BRANCHES' ||
        (e.branch || 'ALL').toUpperCase() === this.selectedBranch.toUpperCase();
      const matchStatus = this.selectedStatus === 'ALL' ||
        (e.status || '').toUpperCase() === this.selectedStatus.toUpperCase();
      const query = this.searchTerm.trim().toLowerCase();
      const matchSearch = !query ||
        (e.examName && e.examName.toLowerCase().includes(query)) ||
        (e.subject && e.subject.toLowerCase().includes(query)) ||
        (e.branch && e.branch.toLowerCase().includes(query)) ||
        (e.examDate && e.examDate.toLowerCase().includes(query)) ||
        (e.allottedHalls && e.allottedHalls.some((h: any) => h.hallNumber && h.hallNumber.toLowerCase().includes(query)));
      return matchBranch && matchStatus && matchSearch;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedBranch = 'ALL_BRANCHES';
    this.selectedStatus = 'ALL';
  }

  getAllHallsTooltip(halls?: any[]): string {
    if (!halls || halls.length === 0) return 'All Halls';
    return halls.map(h => h.hallNumber).join(', ');
  }

  get multiBranchSessions(): ConcurrentExamSession[] {
    return this.concurrentSessions.filter(s => s.totalBranches >= 2);
  }

  countExamsByBranch(branch: string): number {
    return this.exams.filter(e => (e.branch || 'ALL').toUpperCase() === branch.toUpperCase()).length;
  }

  getBranchBadge(branch?: string): string {
    switch ((branch || 'ALL').toUpperCase()) {
      case 'CSE': return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'ECE': return 'bg-info-subtle text-info-emphasis border border-info-subtle';
      case 'MECH': return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'CIVIL': return 'bg-success-subtle text-success border border-success-subtle';
      case 'IT': return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'EEE': return 'bg-secondary-subtle text-dark border';
      default: return 'bg-light text-secondary border';
    }
  }

  getBranchBorderTop(branch?: string): string {
    switch ((branch || 'ALL').toUpperCase()) {
      case 'CSE': return 'border-primary';
      case 'ECE': return 'border-info';
      case 'MECH': return 'border-warning';
      case 'CIVIL': return 'border-success';
      case 'IT': return 'border-danger';
      case 'EEE': return 'border-secondary';
      default: return 'border-secondary';
    }
  }

  ngOnInit(): void {
    this.loadExams();
    this.loadConcurrentSessions();
  }

  loadExams(): void {
    this.isLoading = true;
    this.examService.getAllExams().subscribe({
      next: (res) => {
        this.exams = res.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to load exams.';
        this.isLoading = false;
      }
    });
  }

  loadConcurrentSessions(): void {
    this.examService.getConcurrentSessions().subscribe({
      next: (res) => {
        this.concurrentSessions = res.data || [];
        if (this.concurrentSessions.length > 0 && !this.selectedSessionKey) {
          const multi = this.concurrentSessions.find(s => s.totalBranches >= 2) || this.concurrentSessions[0];
          this.setSession(multi);
        }
      }
    });
  }

  setSession(session: ConcurrentExamSession): void {
    this.selectedSession = session;
    this.selectedSessionKey = session.sessionDate + '_' + session.startTime + '_' + session.endTime;
    this.branchFiles = {};
    this.concurrentSummary = null;
  }

  openConcurrentModal(session?: ConcurrentExamSession): void {
    this.isConcurrentModalOpen = true;
    this.concurrentSummary = null;
    this.branchFiles = {};
    if (session) {
      this.setSession(session);
    } else if (this.multiBranchSessions.length > 0) {
      this.setSession(this.multiBranchSessions[0]);
    } else if (this.concurrentSessions.length > 0) {
      this.setSession(this.concurrentSessions[0]);
    }
  }

  closeConcurrentModal(): void {
    this.isConcurrentModalOpen = false;
    this.branchFiles = {};
    this.concurrentSummary = null;
  }

  onSessionSelectChange(): void {
    const found = this.concurrentSessions.find(
      s => (s.sessionDate + '_' + s.startTime + '_' + s.endTime) === this.selectedSessionKey
    );
    if (found) {
      this.setSession(found);
    }
  }

  onBranchFileChange(event: any, branch: string): void {
    const file = event.target.files?.[0];
    if (file) {
      this.branchFiles[branch.toUpperCase()] = file;
    }
  }

  removeBranchFile(branch: string): void {
    delete this.branchFiles[branch.toUpperCase()];
  }

  onBatchFilesDrop(event: any): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0 || !this.selectedSession) return;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const upper = f.name.toUpperCase();
      let matchedBranch = '';
      for (const be of this.selectedSession.branchExams) {
        const b = (be.branch || 'ALL').toUpperCase();
        if (upper.includes(b)) {
          matchedBranch = b;
          break;
        }
      }
      if (!matchedBranch) {
        for (const std of ['CSE', 'ECE', 'MECH', 'CIVIL', 'IT', 'EEE']) {
          if (upper.includes(std)) {
            matchedBranch = std;
            break;
          }
        }
      }
      if (matchedBranch) {
        this.branchFiles[matchedBranch] = f;
      }
    }
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

  get selectedFilesCount(): number {
    return Object.keys(this.branchFiles).length;
  }

  uploadSingleBranchFromConcurrent(be: any): void {
    const branchKey = (be.branch || 'ALL').toUpperCase();
    const file = this.branchFiles[branchKey];
    if (!file) return;

    this.isBranchImporting[branchKey] = true;
    this.studentService.importStudents(file, be.id).subscribe({
      next: (res) => {
        this.branchImportSummaries[branchKey] = res.data;
        this.isBranchImporting[branchKey] = false;
        if (res.data && res.data.successfullyImported > 0) {
          this.successMessage = `Successfully imported ${res.data.successfullyImported} candidates for ${be.branch} (${be.examName})!`;
          this.loadExams();
          this.loadConcurrentSessions();
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || `Failed to import CSV for branch ${be.branch}.`;
        this.isBranchImporting[branchKey] = false;
      }
    });
  }

  uploadConcurrentBranchCsvs(): void {
    if (!this.selectedSession || this.selectedFilesCount === 0) return;

    this.isConcurrentImporting = true;
    this.concurrentSummary = null;

    const branches = Object.keys(this.branchFiles);
    const fileList = Object.values(this.branchFiles);

    this.studentService.importConcurrentBranchStudents(
      fileList,
      this.selectedSession.sessionDate,
      this.selectedSession.startTime,
      this.selectedSession.endTime,
      this.autoAllocateSeating,
      branches
    ).subscribe({
      next: (res) => {
        this.concurrentSummary = res.data;
        this.isConcurrentImporting = false;
        if (this.concurrentSummary && this.concurrentSummary.totalStudentsImported > 0) {
          this.successMessage = `Successfully imported and enrolled ${this.concurrentSummary.totalStudentsImported} candidates across ${this.concurrentSummary.totalBranchesProcessed} branches for ${this.selectedSession?.sessionLabel}!`;
          this.loadExams();
          this.loadConcurrentSessions();
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Concurrent branch CSV import failed.';
        this.isConcurrentImporting = false;
      }
    });
  }

  openSingleBranchImportModal(exam: Exam): void {
    this.singleImportExam = exam;
    this.singleImportFile = null;
    this.singleImportSummary = null;
    this.isSingleBranchModalOpen = true;
  }

  closeSingleBranchModal(): void {
    this.isSingleBranchModalOpen = false;
    this.singleImportExam = null;
    this.singleImportFile = null;
    this.singleImportSummary = null;
  }

  onSingleFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.singleImportFile = file;
    }
  }

  downloadSingleBranchTemplate(): void {
    if (!this.singleImportExam) return;
    const branch = this.singleImportExam.branch || 'CSE';
    this.downloadBranchTemplate(branch);
  }

  uploadSingleBranchCsv(): void {
    if (!this.singleImportFile || !this.singleImportExam) return;
    this.isSingleImporting = true;
    this.singleImportSummary = null;

    this.studentService.importStudents(this.singleImportFile, this.singleImportExam.id).subscribe({
      next: (res) => {
        this.singleImportSummary = res.data;
        this.isSingleImporting = false;
        if (this.singleImportSummary && this.singleImportSummary.successfullyImported > 0) {
          this.successMessage = `Successfully imported and enrolled ${this.singleImportSummary.successfullyImported} candidates into ${this.singleImportExam?.examName} (${this.singleImportExam?.branch})!`;
          this.loadExams();
          this.loadConcurrentSessions();
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'CSV Import failed. Check CSV format and values.';
        this.isSingleImporting = false;
      }
    });
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'SCHEDULED': return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'IN_PROGRESS': return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'COMPLETED': return 'bg-success-subtle text-success border border-success-subtle';
      case 'CANCELLED': return 'bg-danger-subtle text-danger border border-danger-subtle';
      default: return 'bg-secondary-subtle text-secondary';
    }
  }

  promptDelete(exam: Exam): void {
    this.examToDelete = exam;
    this.isDeleteDialogOpen = true;
  }

  confirmDelete(): void {
    if (!this.examToDelete) return;
    this.examService.deleteExam(this.examToDelete.id).subscribe({
      next: () => {
        this.successMessage = `Exam ${this.examToDelete?.examName} was deleted successfully.`;
        this.isDeleteDialogOpen = false;
        this.examToDelete = null;
        this.loadExams();
        this.loadConcurrentSessions();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to delete exam.';
        this.isDeleteDialogOpen = false;
        this.examToDelete = null;
      }
    });
  }

  cancelDelete(): void {
    this.isDeleteDialogOpen = false;
    this.examToDelete = null;
  }

  // --- CSV Import Methods ---
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

    this.examService.importExams(this.selectedFile).subscribe({
      next: (res) => {
        this.importSummary = res.data;
        this.isImporting = false;
        if (this.importSummary && this.importSummary.successfullyImported > 0) {
          this.successMessage = `Successfully imported ${this.importSummary.successfullyImported} exam schedule(s).`;
          this.loadExams();
          this.loadConcurrentSessions();
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'CSV Import failed. Check CSV format and values.';
        this.isImporting = false;
      }
    });
  }

  downloadSampleCsv(): void {
    this.examService.downloadCsvTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'exam_schedule_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        const csvContent = 'examName,subject,examDate,startTime,endTime,status,branch,allottedHalls\n' +
          'Data Structures End Sem,CS101,2026-10-15,09:30,12:30,SCHEDULED,CSE,LH-101;LH-201\n' +
          'Digital Signal Processing,EC201,2026-10-15,09:30,12:30,SCHEDULED,ECE,LH-301\n' +
          'Fluid Mechanics,ME202,2026-10-15,09:30,12:30,SCHEDULED,MECH,LH-201\n';
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'exam_schedule_template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    });
  }
}
