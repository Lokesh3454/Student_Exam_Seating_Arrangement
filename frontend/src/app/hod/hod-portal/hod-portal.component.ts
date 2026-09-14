import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { HodService } from '../../core/services/hod.service';
import { StudentService } from '../../core/services/student.service';
import { SeatingService } from '../../core/services/seating.service';
import { ReportService } from '../../core/services/report.service';
import { IncidentService } from '../../core/services/incident.service';
import { ExamService } from '../../core/services/exam.service';
import { HodDashboardData, DepartmentHallMetric } from '../../core/models/hod.model';
import { Student, StudentImportSummary } from '../../core/models/student.model';
import { Exam } from '../../core/models/exam.model';
import { MalpracticeIncident, IncidentStatus, IncidentType } from '../../core/models/incident.model';
import { StudentSeatSearchResponse, SeatingArrangementDetail } from '../../core/models/seating.model';

@Component({
  selector: 'app-hod-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="hod-portal-container container-fluid px-3 px-md-4 py-4">

      <!-- ============================================== -->
      <!-- DEPARTMENT CHROMATIC HERO BANNER               -->
      <!-- ============================================== -->
      <div class="card border-0 rounded-4 shadow-lg text-white p-4 mb-4 dept-hero-card" [ngClass]="getBranchThemeClass()">
        <div class="row align-items-center g-3">
          <div class="col-lg-8">
            <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
              <span class="badge px-3 py-1 rounded-pill bg-white text-dark fw-bold shadow-sm">
                <i class="bi bi-mortarboard-fill text-primary me-1"></i>
                Department of {{ selectedBranch }}
              </span>
              <span class="badge px-3 py-1 rounded-pill bg-white bg-opacity-20 text-white border border-white border-opacity-25" *ngIf="isHodUser">
                <i class="bi bi-shield-check me-1"></i> Verified Head of Department
              </span>
              <span class="badge px-3 py-1 rounded-pill bg-amber bg-opacity-25 text-amber border border-warning border-opacity-50" *ngIf="isAdminUser">
                <i class="bi bi-person-gear me-1"></i> Admin View (Multi-Department Switcher)
              </span>
            </div>

            <h2 class="fw-bold mb-1 tracking-tight">
              {{ dashboardData?.departmentName || ('Department of ' + selectedBranch) }}
            </h2>
            <p class="mb-0 text-white-50 small">
              Academic Session 2026–27 | Centralized Examination Scheduling, 5&times;3 Hall Allocation, Candidate Enrollment &amp; Department Integrity
            </p>
          </div>

          <!-- Admin Department Switcher Pills -->
          <div class="col-lg-4 text-lg-end" *ngIf="isAdminUser">
            <div class="dept-switcher-box p-2 rounded-3 bg-dark bg-opacity-40 border border-white border-opacity-15 d-inline-block">
              <div class="text-white-50 text-uppercase small fw-bold mb-1 px-1 text-start" style="font-size: 0.72rem;">
                Select Branch Portal
              </div>
              <div class="btn-group btn-group-sm" role="group">
                <button *ngFor="let b of availableBranches" 
                        type="button" 
                        class="btn px-3 py-1 fw-semibold rounded-pill mx-1"
                        [ngClass]="selectedBranch === b ? 'btn-light text-dark shadow-sm' : 'btn-outline-light border-0'"
                        (click)="switchBranch(b)">
                  {{ b }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- INTERACTIVE QUICK-ACTION COMMAND TOOLBAR       -->
      <!-- ============================================== -->
      <div class="card border-0 rounded-4 shadow-sm p-3 mb-4 bg-white command-toolbar">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div class="d-flex flex-wrap align-items-center gap-2">
            <!-- 1. Seat Finder Toggle -->
            <button class="btn btn-sm rounded-pill px-3 fw-semibold d-flex align-items-center gap-2"
                    [ngClass]="showSeatFinder ? 'btn-primary text-white shadow-sm' : 'btn-outline-primary'"
                    (click)="toggleSeatFinder()">
              <i class="bi bi-geo-alt-fill"></i>
              <span>{{ showSeatFinder ? 'Close Desk Locator' : 'Instant Desk Locator' }}</span>
            </button>

            <!-- 2. Generate Seating -->
            <button class="btn btn-sm btn-outline-success rounded-pill px-3 fw-semibold d-flex align-items-center gap-2"
                    (click)="openGenerateSeatingModal()">
              <i class="bi bi-magic"></i>
              <span>Allocate Seating</span>
            </button>

            <!-- 3. Import Candidates CSV -->
            <button class="btn btn-sm btn-outline-secondary rounded-pill px-3 fw-semibold d-flex align-items-center gap-2"
                    (click)="openImportModal()">
              <i class="bi bi-cloud-arrow-up"></i>
              <span>Import Candidates CSV</span>
            </button>

            <!-- 4. Export Roster -->
            <button class="btn btn-sm btn-outline-dark rounded-pill px-3 fw-semibold d-flex align-items-center gap-2"
                    (click)="exportRosterCsv()">
              <i class="bi bi-download"></i>
              <span>Export Department Roster</span>
            </button>

            <!-- 5. Log Incident -->
            <button class="btn btn-sm btn-outline-danger rounded-pill px-3 fw-semibold d-flex align-items-center gap-2"
                    (click)="openLogIncidentModal()">
              <i class="bi bi-shield-plus"></i>
              <span>Log Incident</span>
            </button>
          </div>

          <!-- Live Refresh Action -->
          <div>
            <button class="btn btn-sm btn-light border rounded-pill px-3 d-flex align-items-center gap-2" 
                    [disabled]="loading"
                    (click)="loadBranchData()">
              <i class="bi bi-arrow-clockwise" [class.spin]="loading"></i>
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Live Feedback Alerts -->
      <div *ngIf="successMsg" class="alert alert-success alert-dismissible fade show rounded-3 shadow-sm border-0 d-flex align-items-center gap-2" role="alert">
        <i class="bi bi-check-circle-fill fs-5 text-success"></i>
        <div class="flex-grow-1">{{ successMsg }}</div>
        <button type="button" class="btn-close" (click)="successMsg = ''"></button>
      </div>

      <div *ngIf="errorMsg" class="alert alert-danger alert-dismissible fade show rounded-3 shadow-sm border-0 d-flex align-items-center gap-2" role="alert">
        <i class="bi bi-exclamation-triangle-fill fs-5 text-danger"></i>
        <div class="flex-grow-1">{{ errorMsg }}</div>
        <button type="button" class="btn-close" (click)="errorMsg = ''"></button>
      </div>

      <!-- ============================================== -->
      <!-- EMBEDDED INSTANT CANDIDATE SEAT LOCATOR WIDGET -->
      <!-- ============================================== -->
      <div class="card border-0 rounded-4 shadow-sm p-4 mb-4 seat-locator-card" *ngIf="showSeatFinder" #seatFinderSection>
        <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
          <div>
            <h5 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
              <i class="bi bi-compass-fill text-primary"></i>
              Candidate Instant Hall &amp; 5&times;3 Desk Locator
            </h5>
            <p class="text-muted small mb-0">Look up any {{ selectedBranch }} student to view their allocated hall, row, column, and admit slip.</p>
          </div>
          <button type="button" class="btn-close" (click)="showSeatFinder = false"></button>
        </div>

        <div class="row g-3 align-items-end mb-3">
          <div class="col-md-5">
            <label class="form-label small fw-semibold text-dark">Target Examination</label>
            <select class="form-select rounded-3" [(ngModel)]="searchExamId">
              <option [ngValue]="undefined" disabled>-- Choose Department Exam --</option>
              <option *ngFor="let ex of dashboardData?.upcomingExams" [ngValue]="ex.id">
                {{ ex.courseCode }} - {{ ex.courseName }} ({{ ex.examDate }})
              </option>
            </select>
          </div>

          <div class="col-md-4">
            <label class="form-label small fw-semibold text-dark">Candidate Register Number</label>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-person-badge"></i></span>
              <input type="text" 
                     class="form-control bg-light border-start-0" 
                     placeholder="e.g. 21CS001, 21ME001..." 
                     [(ngModel)]="searchRegisterNumber"
                     (keyup.enter)="locateCandidateSeat()">
            </div>
          </div>

          <div class="col-md-3">
            <button class="btn btn-primary w-100 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                    [disabled]="!searchExamId || !searchRegisterNumber.trim() || searchingSeat"
                    (click)="locateCandidateSeat()">
              <span *ngIf="searchingSeat" class="spinner-border spinner-border-sm"></span>
              <i *ngIf="!searchingSeat" class="bi bi-search"></i>
              <span>Locate Desk</span>
            </button>
          </div>
        </div>

        <!-- Seat Locator Result Card -->
        <div *ngIf="seatSearchResult" class="seat-result-box p-3 rounded-4 bg-light border">
          <div class="row align-items-center g-3">
            <div class="col-md-8">
              <div class="d-flex align-items-center gap-2 mb-1">
                <span class="badge bg-success text-white px-3 py-1 rounded-pill">
                  <i class="bi bi-check-circle-fill me-1"></i> SEAT ALLOCATED
                </span>
                <span class="text-muted small">&bull; {{ seatSearchResult.exam }}</span>
              </div>
              <h5 class="fw-bold text-dark mb-1">{{ seatSearchResult.studentName }} ({{ seatSearchResult.registerNumber }})</h5>
              <div class="d-flex flex-wrap gap-3 text-muted small mt-2">
                <span><i class="bi bi-building me-1 text-primary"></i> Hall: <strong>{{ seatSearchResult.hall }}</strong></span>
                <span><i class="bi bi-grid-3x3 me-1 text-success"></i> Desk: <strong class="text-success fs-6">{{ seatSearchResult.seat }}</strong></span>
                <span><i class="bi bi-arrows-fullscreen me-1 text-info"></i> Row {{ seatSearchResult.row }}, Column {{ seatSearchResult.column }}</span>
                <span><i class="bi bi-calendar3 me-1 text-danger"></i> Date: {{ seatSearchResult.date }}</span>
              </div>
            </div>
            <div class="col-md-4 text-md-end">
              <button class="btn btn-outline-primary rounded-pill px-3 shadow-sm d-flex align-items-center gap-2 ms-md-auto"
                      [disabled]="downloadingPdf"
                      (click)="downloadCandidateAdmitCard(searchExamId!, seatSearchResult.registerNumber)">
                <span *ngIf="downloadingPdf" class="spinner-border spinner-border-sm"></span>
                <i *ngIf="!downloadingPdf" class="bi bi-file-earmark-pdf-fill text-danger"></i>
                <span>Download Admit Card (PDF)</span>
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="seatSearchNotFound" class="alert alert-warning rounded-3 small mb-0 d-flex align-items-center gap-2">
          <i class="bi bi-exclamation-circle-fill fs-5 text-warning"></i>
          <div>No seating allocation found for candidate <strong>{{ searchRegisterNumber }}</strong> in this examination. Run "Allocate Seating" or verify registration.</div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- 5 CLICKABLE INTERACTIVE KPI METRICS CARDS      -->
      <!-- ============================================== -->
      <div class="row g-3 mb-4">
        <!-- 1. Branch Candidates -->
        <div class="col-12 col-sm-6 col-xl">
          <div class="kpi-card card border-0 border-start border-4 border-primary rounded-4 p-3 shadow-sm h-100 card-clickable"
               [class.active-kpi]="activeTab === 'students'"
               (click)="switchTab('students')">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-muted small fw-semibold text-uppercase">Candidates</span>
              <div class="icon-bubble bg-primary bg-opacity-10 text-primary">
                <i class="bi bi-people-fill fs-5"></i>
              </div>
            </div>
            <div class="fs-2 fw-bold text-dark">{{ dashboardData?.totalStudents ?? 0 }}</div>
            <div class="text-muted small mt-1">Enrolled in {{ selectedBranch }}</div>
            <div class="mt-2 pt-2 border-top text-primary small fw-semibold d-flex align-items-center justify-content-between">
              <span>View Roster</span>
              <i class="bi bi-arrow-right-circle"></i>
            </div>
          </div>
        </div>

        <!-- 2. Scheduled Exams -->
        <div class="col-12 col-sm-6 col-xl">
          <div class="kpi-card card border-0 border-start border-4 border-danger rounded-4 p-3 shadow-sm h-100 card-clickable"
               [class.active-kpi]="activeTab === 'exams'"
               (click)="switchTab('exams')">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-muted small fw-semibold text-uppercase">Exams</span>
              <div class="icon-bubble bg-danger bg-opacity-10 text-danger">
                <i class="bi bi-calendar-event-fill fs-5"></i>
              </div>
            </div>
            <div class="fs-2 fw-bold text-dark">{{ dashboardData?.totalExams ?? 0 }}</div>
            <div class="text-muted small mt-1">Scheduled for {{ selectedBranch }}</div>
            <div class="mt-2 pt-2 border-top text-danger small fw-semibold d-flex align-items-center justify-content-between">
              <span>View Exams</span>
              <i class="bi bi-arrow-right-circle"></i>
            </div>
          </div>
        </div>

        <!-- 3. Allotted Hall Seats (5x3 standard) -->
        <div class="col-12 col-sm-6 col-xl">
          <div class="kpi-card card border-0 border-start border-4 border-success rounded-4 p-3 shadow-sm h-100 card-clickable"
               [class.active-kpi]="activeTab === 'halls'"
               (click)="switchTab('halls')">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-muted small fw-semibold text-uppercase">5&times;3 Capacity</span>
              <div class="icon-bubble bg-success bg-opacity-10 text-success">
                <i class="bi bi-grid-3x3 fs-5"></i>
              </div>
            </div>
            <div class="fs-2 fw-bold text-dark">{{ dashboardData?.totalAllottedSeats ?? 0 }}</div>
            <div class="text-success small mt-1 fw-semibold">
              <i class="bi bi-diagram-3-fill me-1"></i>15 seats / hall
            </div>
            <div class="mt-2 pt-2 border-top text-success small fw-semibold d-flex align-items-center justify-content-between">
              <span>Inspect Halls</span>
              <i class="bi bi-arrow-right-circle"></i>
            </div>
          </div>
        </div>

        <!-- 4. Seated Candidates -->
        <div class="col-12 col-sm-6 col-xl">
          <div class="kpi-card card border-0 border-start border-4 border-info rounded-4 p-3 shadow-sm h-100 card-clickable"
               [class.active-kpi]="activeTab === 'halls'"
               (click)="switchTab('halls')">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-muted small fw-semibold text-uppercase">Seated</span>
              <div class="icon-bubble bg-info bg-opacity-10 text-info">
                <i class="bi bi-check2-circle fs-5"></i>
              </div>
            </div>
            <div class="fs-2 fw-bold text-dark">{{ dashboardData?.seatingAllocatedCount ?? 0 }}</div>
            <div class="text-info small mt-1">Arranged in Halls</div>
            <div class="mt-2 pt-2 border-top text-info small fw-semibold d-flex align-items-center justify-content-between">
              <span>View Allocations</span>
              <i class="bi bi-arrow-right-circle"></i>
            </div>
          </div>
        </div>

        <!-- 5. Malpractice Monitor -->
        <div class="col-12 col-sm-6 col-xl">
          <div class="kpi-card card border-0 border-start border-4 border-warning rounded-4 p-3 shadow-sm h-100 card-clickable"
               [class.active-kpi]="activeTab === 'incidents'"
               (click)="switchTab('incidents')">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-muted small fw-semibold text-uppercase">Incidents</span>
              <div class="icon-bubble bg-warning bg-opacity-10 text-warning">
                <i class="bi bi-shield-exclamation fs-5"></i>
              </div>
            </div>
            <div class="fs-2 fw-bold text-dark">{{ dashboardData?.incidentsCount ?? 0 }}</div>
            <div class="text-muted small mt-1">Disciplinary Reports</div>
            <div class="mt-2 pt-2 border-top text-warning small fw-semibold d-flex align-items-center justify-content-between">
              <span>Review Cases</span>
              <i class="bi bi-arrow-right-circle"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- NAVIGATION TABS                                -->
      <!-- ============================================== -->
      <ul class="nav nav-pills custom-tabs mb-4 p-1 rounded-4 bg-light shadow-sm border" role="tablist">
        <li class="nav-item flex-fill text-center">
          <button class="nav-link w-100 py-2 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  [ngClass]="{ 'active': activeTab === 'exams' }"
                  (click)="switchTab('exams')">
            <i class="bi bi-journal-bookmark-fill"></i>
            <span>Department Examinations ({{ dashboardData?.upcomingExams?.length || 0 }})</span>
          </button>
        </li>
        <li class="nav-item flex-fill text-center">
          <button class="nav-link w-100 py-2 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  [ngClass]="{ 'active': activeTab === 'students' }"
                  (click)="switchTab('students')">
            <i class="bi bi-people"></i>
            <span>Student Roster ({{ filteredStudents.length }})</span>
          </button>
        </li>
        <li class="nav-item flex-fill text-center">
          <button class="nav-link w-100 py-2 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  [ngClass]="{ 'active': activeTab === 'halls' }"
                  (click)="switchTab('halls')">
            <i class="bi bi-building-check"></i>
            <span>Hall Allotments &amp; 5&times;3 Capacity ({{ dashboardData?.allottedHalls?.length || 0 }})</span>
          </button>
        </li>
        <li class="nav-item flex-fill text-center">
          <button class="nav-link w-100 py-2 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  [ngClass]="{ 'active': activeTab === 'incidents' }"
                  (click)="switchTab('incidents')">
            <i class="bi bi-shield-exclamation"></i>
            <span>Malpractice Monitor ({{ dashboardData?.incidentsCount || 0 }})</span>
          </button>
        </li>
      </ul>

      <!-- Loading State -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted mt-2">Loading {{ selectedBranch }} department records...</p>
      </div>

      <!-- Tab Content Area -->
      <div *ngIf="!loading">

        <!-- ============================================== -->
        <!-- TAB 1: DEPARTMENT EXAMINATIONS & HALL OVERVIEW -->
        <!-- ============================================== -->
        <div *ngIf="activeTab === 'exams'">
          <div class="card border-0 rounded-4 shadow-sm p-4 mb-4">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
              <div>
                <h5 class="fw-bold mb-1 text-dark">
                  <i class="bi bi-journal-text text-primary me-2"></i>
                  Scheduled Examinations for {{ selectedBranch }}
                </h5>
                <p class="text-muted small mb-0">
                  Exams scoped to this department with allotted 5&times;3 capacity and candidate counts.
                </p>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-success rounded-pill px-3 shadow-sm fw-semibold" (click)="openGenerateSeatingModal()">
                  <i class="bi bi-magic me-1"></i> Allocate Seating
                </button>
                <button class="btn btn-primary rounded-pill px-3 shadow-sm fw-semibold" (click)="openImportModal()">
                  <i class="bi bi-upload me-1"></i> Import {{ selectedBranch }} Candidates CSV
                </button>
              </div>
            </div>

            <div *ngIf="dashboardData?.upcomingExams?.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-calendar-x fs-1 text-muted"></i>
              <h6 class="mt-2 fw-semibold">No Exams Scheduled for {{ selectedBranch }}</h6>
              <p class="small">Contact the administrator to schedule department exams.</p>
            </div>

            <div class="row g-3" *ngIf="(dashboardData?.upcomingExams?.length ?? 0) > 0">
              <div class="col-md-6 col-xl-4" *ngFor="let ex of dashboardData?.upcomingExams">
                <div class="card border h-100 rounded-4 p-3 shadow-sm exam-card">
                  <div class="d-flex align-items-start justify-content-between mb-2">
                    <span class="badge bg-primary bg-opacity-10 text-primary fw-bold px-3 py-1 rounded-pill">
                      {{ ex.courseCode }}
                    </span>
                    <span class="badge bg-secondary bg-opacity-10 text-secondary rounded-pill px-2 py-1 small">
                      Semester {{ ex.semester || 1 }}
                    </span>
                  </div>

                  <h6 class="fw-bold text-dark mb-1">{{ ex.courseName }}</h6>
                  <div class="text-muted small mb-3">
                    <i class="bi bi-calendar3 me-1 text-primary"></i> {{ ex.examDate }} &bull;
                    <i class="bi bi-clock me-1 text-primary"></i> {{ ex.startTime }} - {{ ex.endTime }}
                  </div>

                  <!-- Allotted Halls -->
                  <div class="mb-3">
                    <div class="text-muted small fw-semibold mb-1">
                      <i class="bi bi-building me-1"></i> Allotted Halls (5&times;3 Grid):
                    </div>
                    <div class="d-flex flex-wrap gap-1" *ngIf="ex.allottedHalls && ex.allottedHalls.length > 0">
                      <span *ngFor="let h of ex.allottedHalls" 
                            class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill px-2 py-1 badge-clickable"
                            (click)="inspectHallMatrix(h.id, h.hallNumber, h.capacity)">
                        {{ h.hallNumber }} ({{ h.capacity || 15 }} seats) &rarr;
                      </span>
                    </div>
                    <div class="text-muted small fst-italic" *ngIf="!ex.allottedHalls || ex.allottedHalls.length === 0">
                      Standard capacity (LH-101, LH-102)
                    </div>
                  </div>

                  <div class="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
                    <div class="small">
                      <span class="fw-bold text-dark">{{ ex.registeredStudentsCount || 0 }}</span>
                      <span class="text-muted"> Candidates</span>
                    </div>
                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-outline-success rounded-pill px-2 py-1"
                              title="Generate Seating Arrangement for this Exam"
                              (click)="quickGenerateSeatingForExam(ex.id)">
                        <i class="bi bi-magic"></i> Seating
                      </button>
                      <button class="btn btn-sm btn-outline-primary rounded-pill px-2 py-1"
                              title="Import Roster Directly for this Exam"
                              (click)="openImportModal(ex.id)">
                        <i class="bi bi-file-earmark-arrow-up"></i> Import
                      </button>
                      <a [routerLink]="['/seating/arrangement', ex.id]" 
                         class="btn btn-sm btn-primary rounded-pill px-2 py-1"
                         title="View Seating Grid">
                        <i class="bi bi-grid-3x3-gap"></i> Grid
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- TAB 2: DEPARTMENT STUDENT ROSTER & CSV IMPORT -->
        <!-- ============================================== -->
        <div *ngIf="activeTab === 'students'">
          <div class="card border-0 rounded-4 shadow-sm p-4 mb-4">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
              <div>
                <h5 class="fw-bold mb-1 text-dark">
                  <i class="bi bi-people-fill text-info me-2"></i>
                  {{ selectedBranch }} Candidates Roster
                </h5>
                <p class="text-muted small mb-0">
                  Enrolled students for {{ selectedBranch }}. Manage rosters with multi-hall overflow support.
                </p>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex flex-wrap gap-2">
                <button class="btn btn-outline-dark rounded-pill px-3 shadow-sm fw-semibold" (click)="exportRosterCsv()">
                  <i class="bi bi-download me-1"></i> Export Roster (.csv)
                </button>
                <button class="btn btn-outline-secondary rounded-pill px-3 shadow-sm fw-semibold" (click)="downloadTemplate()">
                  <i class="bi bi-filetype-csv me-1"></i> Download Template
                </button>
                <button class="btn btn-primary rounded-pill px-3 shadow-sm fw-semibold" (click)="openImportModal()">
                  <i class="bi bi-cloud-arrow-up me-1"></i> Import Candidates CSV
                </button>
              </div>
            </div>

            <!-- Search & Filters -->
            <div class="row g-2 mb-3">
              <div class="col-md-6 col-lg-4">
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0">
                    <i class="bi bi-search text-muted"></i>
                  </span>
                  <input type="text" 
                         class="form-control bg-light border-start-0" 
                         placeholder="Search by register no, name, or email..." 
                         [(ngModel)]="searchKeyword" 
                         (input)="filterStudents()">
                  <button *ngIf="searchKeyword" class="btn btn-light border" (click)="searchKeyword = ''; filterStudents()">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
              <div class="col-auto ms-auto text-muted small align-self-center">
                Showing {{ filteredStudents.length }} of {{ students.length }} candidates
              </div>
            </div>

            <!-- Candidates Table -->
            <div class="table-responsive rounded-3 border">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light text-uppercase small text-muted">
                  <tr>
                    <th>Register Number</th>
                    <th>Candidate Name</th>
                    <th>Branch</th>
                    <th>Year / Section</th>
                    <th>Email Address</th>
                    <th>Contact Phone</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let s of pagedStudents">
                    <td class="fw-bold text-primary">{{ s.registerNumber }}</td>
                    <td class="fw-semibold text-dark">{{ s.name }}</td>
                    <td>
                      <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-1">
                        {{ s.branch }}
                      </span>
                    </td>
                    <td>Year {{ s.year }} - Sec {{ s.section }}</td>
                    <td class="text-muted small">{{ s.email }}</td>
                    <td class="text-muted small">{{ s.phone || 'N/A' }}</td>
                    <td class="text-end">
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-light border rounded-pill px-2 py-1 me-1" 
                                title="Locate Desk in Seat Finder"
                                (click)="quickLocateCandidate(s.registerNumber)">
                          <i class="bi bi-compass text-primary"></i> Locate
                        </button>
                        <button class="btn btn-light border rounded-pill px-2 py-1"
                                title="Download Admit Slip"
                                (click)="quickDownloadAdmitSlip(s)">
                          <i class="bi bi-file-earmark-pdf text-danger"></i> Slip
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="filteredStudents.length === 0">
                    <td colspan="7" class="text-center py-4 text-muted">
                      <i class="bi bi-person-x fs-2 d-block mb-1"></i>
                      No candidates found matching criteria.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="d-flex align-items-center justify-content-between mt-3" *ngIf="filteredStudents.length > pageSize">
              <div class="text-muted small">
                Page {{ currentPage }} of {{ totalPages }}
              </div>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-secondary" [disabled]="currentPage === 1" (click)="currentPage = currentPage - 1">
                  &laquo; Prev
                </button>
                <button class="btn btn-outline-secondary" [disabled]="currentPage === totalPages" (click)="currentPage = currentPage + 1">
                  Next &raquo;
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- TAB 3: HALL ALLOTMENTS & 5x3 CAPACITY VISUALS  -->
        <!-- ============================================== -->
        <div *ngIf="activeTab === 'halls'">
          <div class="card border-0 rounded-4 shadow-sm p-4 mb-4">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
              <div>
                <h5 class="fw-bold mb-1 text-dark">
                  <i class="bi bi-building-check text-success me-2"></i>
                  Hall Allotments &amp; 5&times;3 Capacity Allocation
                </h5>
                <p class="text-muted small mb-0">
                  Standardized 5 rows &times; 3 columns (15 seats) hall occupancy for {{ selectedBranch }}. Overflow automatically routes to subsequent halls.
                </p>
              </div>
              <div>
                <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill">
                  <i class="bi bi-info-circle me-1"></i> Click any hall card to inspect 2D Floor Plan
                </span>
              </div>
            </div>

            <div *ngIf="dashboardData?.allottedHalls?.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-building-slash fs-1 text-muted"></i>
              <h6 class="mt-2 fw-semibold">No Examination Halls Allotted to {{ selectedBranch }}</h6>
              <p class="small">Assign halls when scheduling or importing examinations.</p>
            </div>

            <div class="row g-3" *ngIf="(dashboardData?.allottedHalls?.length ?? 0) > 0">
              <div class="col-md-6 col-xl-4" *ngFor="let h of dashboardData?.allottedHalls">
                <div class="card border rounded-4 p-3 shadow-sm h-100 hall-card card-clickable" 
                     [ngClass]="{'border-danger': h.filled, 'border-primary': !h.filled}"
                     (click)="inspectHallMatrix(h.hallId, h.hallNumber, h.capacity)">
                  <div class="d-flex align-items-start justify-content-between mb-2">
                    <div>
                      <h5 class="fw-bold mb-0 text-dark">{{ h.hallNumber }}</h5>
                      <span class="text-muted small">{{ h.building || 'Main Examination Block' }}</span>
                    </div>
                    <span class="badge rounded-pill px-3 py-1" [ngClass]="h.filled ? 'bg-danger text-white' : 'bg-success bg-opacity-10 text-success'">
                      {{ h.filled ? 'FILLED (15/15)' : 'AVAILABLE' }}
                    </span>
                  </div>

                  <!-- 5x3 Grid Summary Tag -->
                  <div class="d-flex align-items-center gap-2 mb-3">
                    <span class="badge bg-light text-dark border">5 Rows</span>
                    <span class="text-muted">&times;</span>
                    <span class="badge bg-light text-dark border">3 Columns</span>
                    <span class="text-muted">=</span>
                    <span class="badge bg-primary text-white">{{ h.capacity || 15 }} Desks</span>
                  </div>

                  <!-- Capacity Progress Bar -->
                  <div class="mb-3">
                    <div class="d-flex justify-content-between small text-muted mb-1">
                      <span>Occupancy</span>
                      <span class="fw-bold text-dark">{{ h.assignedCount || 0 }} / {{ h.capacity || 15 }} Desks</span>
                    </div>
                    <div class="progress" style="height: 10px; border-radius: 999px;">
                      <div class="progress-bar progress-bar-striped" 
                           [ngClass]="h.filled ? 'bg-danger' : 'bg-success'"
                           role="progressbar" 
                           [style.width.%]="getOccupancyPercent(h.assignedCount, h.capacity)">
                      </div>
                    </div>
                  </div>

                  <div class="mt-auto pt-2 border-top d-flex align-items-center justify-content-between">
                    <span class="text-primary small fw-semibold">
                      <i class="bi bi-eye me-1"></i> Inspect 5&times;3 Floor Plan
                    </span>
                    <span class="btn btn-sm btn-outline-primary rounded-pill px-3">
                      View Desks &rarr;
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- TAB 4: MALPRACTICE MONITOR                     -->
        <!-- ============================================== -->
        <div *ngIf="activeTab === 'incidents'">
          <div class="card border-0 rounded-4 shadow-sm p-4 mb-4">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
              <div>
                <h5 class="fw-bold mb-1 text-dark">
                  <i class="bi bi-shield-shaded text-danger me-2"></i>
                  Malpractice &amp; Integrity Incidents for {{ selectedBranch }}
                </h5>
                <p class="text-muted small mb-0">
                  Real-time disciplinary and academic integrity surveillance for candidates of {{ selectedBranch }}.
                </p>
              </div>
              <div>
                <button class="btn btn-outline-danger rounded-pill px-3 shadow-sm fw-semibold" (click)="openLogIncidentModal()">
                  <i class="bi bi-plus-circle me-1"></i> Log Disciplinary Report
                </button>
              </div>
            </div>

            <div *ngIf="dashboardData?.recentIncidents?.length === 0" class="text-center py-5 text-muted">
              <div class="icon-bubble bg-success bg-opacity-10 text-success mx-auto mb-3" style="width: 60px; height: 60px; font-size: 1.75rem;">
                <i class="bi bi-shield-check"></i>
              </div>
              <h5 class="fw-bold text-dark mb-1">Exemplary Academic Integrity</h5>
              <p class="text-muted small mb-0">Zero malpractice incidents recorded for {{ selectedBranch }} candidates.</p>
            </div>

            <div class="table-responsive rounded-3 border" *ngIf="(dashboardData?.recentIncidents?.length ?? 0) > 0">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light text-uppercase small text-muted">
                  <tr>
                    <th>Candidate</th>
                    <th>Exam &amp; Hall</th>
                    <th>Incident Type</th>
                    <th>Description</th>
                    <th>Confiscated Items</th>
                    <th>Status</th>
                    <th>Reported At</th>
                    <th class="text-end">Update</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let inc of dashboardData?.recentIncidents">
                    <td>
                      <div class="fw-bold text-dark">{{ inc.studentName }}</div>
                      <div class="text-muted small">{{ inc.studentRegisterNumber }}</div>
                    </td>
                    <td>
                      <div class="fw-semibold text-primary">{{ inc.examName }}</div>
                      <div class="text-muted small">Hall {{ inc.hallNumber }}</div>
                    </td>
                    <td>
                      <span class="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-1">
                        {{ inc.incidentType }}
                      </span>
                    </td>
                    <td class="small text-truncate" style="max-width: 200px;">{{ inc.description }}</td>
                    <td class="small text-muted">{{ inc.confiscatedItems || 'None' }}</td>
                    <td>
                      <span class="badge rounded-pill px-2 py-1" [ngClass]="getIncidentStatusClass(inc.status)">
                        {{ inc.status }}
                      </span>
                    </td>
                    <td class="text-muted small">{{ inc.reportedAt | date:'short' }}</td>
                    <td class="text-end">
                      <select class="form-select form-select-sm rounded-pill d-inline-block" 
                              style="width: auto;"
                              [ngModel]="inc.status"
                              (ngModelChange)="updateIncidentStatus(inc.id, $event)">
                        <option value="REPORTED">REPORTED</option>
                        <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                        <option value="CONFIRMED_ACTION_TAKEN">CONFIRMED</option>
                        <option value="DISMISSED">DISMISSED</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      <!-- ============================================== -->
      <!-- MODAL 1: INTERACTIVE 2D HALL MATRIX FLOOR PLAN -->
      <!-- ============================================== -->
      <div class="modal fade show d-block" *ngIf="showMatrixModal" tabindex="-1" style="background: rgba(0,0,0,0.6);">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content rounded-4 border-0 shadow-2xl">
            <div class="modal-header border-0 pb-0">
              <div>
                <h5 class="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <i class="bi bi-grid-3x3-gap-fill text-primary"></i>
                  Interactive 5&times;3 Floor Plan &bull; Hall {{ selectedMatrixHallNumber }}
                </h5>
                <p class="text-muted small mb-0">Architectural desk layout (5 rows &times; 3 columns = 15 desks). Green/blue indicates allocated candidates.</p>
              </div>
              <button type="button" class="btn-close" (click)="showMatrixModal = false"></button>
            </div>
            <div class="modal-body py-4">

              <!-- Interactive Whiteboard / Podium Representation -->
              <div class="hall-podium-banner text-center py-2 px-4 rounded-3 mb-4 mx-auto shadow-sm" style="max-width: 480px; background: #0f172a; color: #94a3b8; border: 1px dashed rgba(255,255,255,0.2);">
                <div class="fw-bold text-white small text-uppercase tracking-wider">
                  <i class="bi bi-easel2-fill text-cyan me-1"></i> Front Whiteboard &amp; Invigilator Podium
                </div>
                <div style="font-size: 0.7rem;">Entry Door &rarr; [Front Left] &bull; Exit Door &rarr; [Front Right]</div>
              </div>

              <!-- 5x3 Desk Matrix Grid -->
              <div class="desk-grid-container mx-auto" style="max-width: 620px;">
                <div *ngFor="let r of matrixRows" class="d-flex justify-content-between gap-3 mb-3">
                  <div *ngFor="let c of matrixCols" class="flex-fill">
                    <div class="desk-card p-2 rounded-3 text-center border shadow-xs"
                         [ngClass]="getDeskStatusClass(r, c)"
                         (click)="selectDesk(r, c)">
                      <div class="desk-num fw-bold small">R{{ r }}-C{{ c }}</div>
                      <div class="desk-occupant small text-truncate" style="max-width: 130px;">
                        {{ getDeskCandidateLabel(r, c) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Selected Desk Details Inspector -->
              <div *ngIf="selectedDeskInfo" class="mt-4 p-3 rounded-3 bg-light border">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <span class="badge bg-primary text-white me-2">Desk {{ selectedDeskInfo.seatNumber }}</span>
                    <strong class="text-dark">{{ selectedDeskInfo.studentName }}</strong>
                    <span class="text-muted small ms-2">({{ selectedDeskInfo.studentRegisterNumber }})</span>
                  </div>
                  <div class="text-muted small">
                    Branch: <strong>{{ selectedDeskInfo.studentBranch }}</strong> &bull; Section: {{ selectedDeskInfo.studentSection }}
                  </div>
                </div>
              </div>

              <!-- Hall Summary Badges -->
              <div class="d-flex justify-content-center gap-3 mt-3 pt-3 border-top small text-muted">
                <span><i class="bi bi-square-fill text-primary me-1"></i> Allocated Desks: <strong>{{ matrixAllocatedCount }}</strong></span>
                <span><i class="bi bi-square me-1 text-secondary"></i> Vacant Desks: <strong>{{ 15 - matrixAllocatedCount }}</strong></span>
                <span><i class="bi bi-calculator me-1 text-success"></i> Capacity: <strong>15 Desks</strong></span>
              </div>
            </div>
            <div class="modal-footer border-0 pt-0">
              <button type="button" class="btn btn-light rounded-pill px-4" (click)="showMatrixModal = false">Close</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- MODAL 2: GENERATE SEATING FOR DEPARTMENT       -->
      <!-- ============================================== -->
      <div class="modal fade show d-block" *ngIf="showGenerateModal" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content rounded-4 border-0 shadow-lg">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title fw-bold text-dark">
                <i class="bi bi-magic text-success me-2"></i>
                Generate Seating for {{ selectedBranch }} Exam
              </h5>
              <button type="button" class="btn-close" (click)="showGenerateModal = false"></button>
            </div>
            <div class="modal-body py-3">
              <p class="text-muted small mb-3">
                Run the automated seating allocation algorithm for {{ selectedBranch }}. Candidates will be seated into allotted halls (5&times;3 layout) with sequential overflow.
              </p>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Select Department Exam:</label>
                <select class="form-select rounded-3" [(ngModel)]="selectedGenerateExamId">
                  <option [ngValue]="undefined" disabled>-- Choose Exam --</option>
                  <option *ngFor="let ex of dashboardData?.upcomingExams" [ngValue]="ex.id">
                    {{ ex.courseCode }} - {{ ex.courseName }} ({{ ex.examDate }})
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Seating Distribution Strategy:</label>
                <select class="form-select rounded-3" [(ngModel)]="generateStrategy">
                  <option value="SEQUENTIAL">Sequential Roll Number Order (Standard 5x3)</option>
                  <option value="RANDOM">Randomized Scramble (Anti-Cheating)</option>
                  <option value="SECTION_ALTERNATION">Section Alternation (A &harr; B)</option>
                </select>
              </div>

              <div *ngIf="generatingSeating" class="text-center py-3">
                <div class="spinner-border text-success" role="status"></div>
                <div class="small text-muted mt-2">Computing 5&times;3 multi-hall allocations...</div>
              </div>
            </div>
            <div class="modal-footer border-0 pt-0">
              <button type="button" class="btn btn-light rounded-pill px-3" (click)="showGenerateModal = false">Cancel</button>
              <button type="button" 
                      class="btn btn-success rounded-pill px-4 shadow-sm fw-semibold"
                      [disabled]="!selectedGenerateExamId || generatingSeating"
                      (click)="executeSeatingGeneration()">
                <i class="bi bi-play-fill me-1"></i> Generate Seating
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- MODAL 3: LOG MALPRACTICE INCIDENT              -->
      <!-- ============================================== -->
      <div class="modal fade show d-block" *ngIf="showIncidentModal" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content rounded-4 border-0 shadow-lg">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title fw-bold text-dark">
                <i class="bi bi-shield-plus text-danger me-2"></i>
                Log Malpractice Incident &bull; {{ selectedBranch }}
              </h5>
              <button type="button" class="btn-close" (click)="showIncidentModal = false"></button>
            </div>
            <div class="modal-body py-3">
              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Select Candidate:</label>
                <select class="form-select rounded-3" [(ngModel)]="newIncidentStudentId">
                  <option [ngValue]="undefined" disabled>-- Choose Candidate --</option>
                  <option *ngFor="let s of students" [ngValue]="s.id">
                    {{ s.registerNumber }} - {{ s.name }} ({{ s.branch }})
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Select Examination:</label>
                <select class="form-select rounded-3" [(ngModel)]="newIncidentExamId">
                  <option [ngValue]="undefined" disabled>-- Choose Exam --</option>
                  <option *ngFor="let ex of dashboardData?.upcomingExams" [ngValue]="ex.id">
                    {{ ex.courseCode }} - {{ ex.courseName }}
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Examination Hall:</label>
                <select class="form-select rounded-3" [(ngModel)]="newIncidentHallId">
                  <option [ngValue]="undefined" disabled>-- Choose Hall --</option>
                  <option *ngFor="let h of dashboardData?.allottedHalls" [ngValue]="h.hallId">
                    {{ h.hallNumber }} ({{ h.building }})
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Incident Type:</label>
                <select class="form-select rounded-3" [(ngModel)]="newIncidentType">
                  <option value="UNAUTHORIZED_MATERIALS">Unauthorized Materials / Notes</option>
                  <option value="ELECTRONIC_DEVICE">Electronic Device / Smart Watch</option>
                  <option value="TALKING_OR_COPYING">Talking or Copying</option>
                  <option value="IMPERSONATION">Impersonation</option>
                  <option value="OTHER">Other Disciplinary Issue</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Description:</label>
                <textarea class="form-control rounded-3" rows="2" [(ngModel)]="newIncidentDesc" placeholder="Provide factual description..."></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Confiscated Items (Optional):</label>
                <input type="text" class="form-control rounded-3" [(ngModel)]="newIncidentConfiscated" placeholder="e.g. Cheat slip, mobile phone...">
              </div>
            </div>
            <div class="modal-footer border-0 pt-0">
              <button type="button" class="btn btn-light rounded-pill px-3" (click)="showIncidentModal = false">Cancel</button>
              <button type="button" 
                      class="btn btn-danger rounded-pill px-4 shadow-sm fw-semibold"
                      [disabled]="!newIncidentStudentId || !newIncidentExamId || !newIncidentHallId || !newIncidentDesc.trim() || submittingIncident"
                      (click)="submitIncident()">
                <span *ngIf="submittingIncident" class="spinner-border spinner-border-sm me-1"></span>
                <i *ngIf="!submittingIncident" class="bi bi-shield-check me-1"></i> File Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- MODAL 4: CANDIDATE CSV IMPORT MODAL            -->
      <!-- ============================================== -->
      <div class="modal fade show d-block" *ngIf="showImportModal" tabindex="-1" style="background: rgba(0,0,0,0.5);">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content rounded-4 border-0 shadow-lg">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title fw-bold text-dark">
                <i class="bi bi-cloud-arrow-up text-primary me-2"></i>
                Import {{ selectedBranch }} Candidates
              </h5>
              <button type="button" class="btn-close" (click)="closeImportModal()"></button>
            </div>
            <div class="modal-body py-3">
              <p class="text-muted small mb-3">
                Upload a CSV file of {{ selectedBranch }} candidates. Allotted halls have 5&times;3 (15 seats) capacity; any excess candidates will smoothly overflow to subsequent assigned halls.
              </p>

              <!-- Target Exam Select (Optional) -->
              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Link Directly to Department Exam (Optional):</label>
                <select class="form-select rounded-3" [(ngModel)]="targetExamId">
                  <option [ngValue]="undefined">-- General {{ selectedBranch }} Department Enrollment --</option>
                  <option *ngFor="let ex of dashboardData?.upcomingExams" [ngValue]="ex.id">
                    {{ ex.courseCode }} - {{ ex.courseName }} ({{ ex.examDate }})
                  </option>
                </select>
              </div>

              <!-- File Input -->
              <div class="mb-3">
                <label class="form-label small fw-semibold text-dark">Select CSV File:</label>
                <input type="file" class="form-control rounded-3" accept=".csv" (change)="onFileSelected($event)">
                <div class="form-text small">
                  Accepted format: .csv (Headers: registerNumber, name, branch, year, section, email, phone)
                </div>
              </div>

              <!-- Import Results -->
              <div *ngIf="importResult" class="alert alert-success rounded-3 small mb-0">
                <h6 class="fw-bold mb-1">Import Summary</h6>
                <div><strong>Successfully Imported:</strong> {{ importResult.successfullyImported }}</div>
                <div><strong>Total Rows:</strong> {{ importResult.totalRows }}</div>
                <div *ngIf="importResult.failedRows > 0"><strong>Failed:</strong> {{ importResult.failedRows }}</div>
                <div *ngIf="importResult.duplicateRows > 0"><strong>Duplicates:</strong> {{ importResult.duplicateRows }}</div>
                <div *ngIf="importResult.errors && importResult.errors.length > 0" class="mt-2 text-danger">
                  <strong>Errors:</strong>
                  <ul class="mb-0 ps-3">
                    <li *ngFor="let err of importResult.errors">{{ err.reason || err }}</li>
                  </ul>
                </div>
              </div>

              <div *ngIf="importError" class="alert alert-danger rounded-3 small mb-0 mt-2">
                <i class="bi bi-exclamation-triangle-fill me-1"></i> {{ importError }}
              </div>
            </div>

            <div class="modal-footer border-0 pt-0">
              <button type="button" class="btn btn-light rounded-pill px-3" (click)="closeImportModal()">Cancel</button>
              <button type="button" 
                      class="btn btn-primary rounded-pill px-4 shadow-sm fw-semibold" 
                      [disabled]="!selectedFile || importing"
                      (click)="uploadCsv()">
                <span *ngIf="importing" class="spinner-border spinner-border-sm me-1"></span>
                <i *ngIf="!importing" class="bi bi-upload me-1"></i>
                Upload &amp; Enroll
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .hod-portal-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .dept-hero-card {
      transition: all 0.3s ease;
    }

    .theme-cse {
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
    }

    .theme-ece {
      background: linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%);
    }

    .theme-mech {
      background: linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%);
    }

    .theme-civil {
      background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #8b5cf6 100%);
    }

    .theme-default {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
    }

    .kpi-card {
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.06) !important;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
    }

    .kpi-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08) !important;
    }

    .active-kpi {
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1) !important;
      background: #fafbff;
    }

    .icon-bubble {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .custom-tabs .nav-link {
      color: #64748b;
      border: none;
      transition: all 0.2s ease;
    }

    .custom-tabs .nav-link.active {
      background: #ffffff;
      color: #1e3a8a;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      font-weight: 700;
    }

    .exam-card, .hall-card {
      background: #ffffff;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .exam-card:hover, .hall-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.07);
    }

    .card-clickable {
      cursor: pointer;
    }

    .badge-clickable {
      cursor: pointer;
      transition: opacity 0.2s ease;
    }
    .badge-clickable:hover {
      opacity: 0.8;
    }

    /* 2D Hall Floor Plan Styling */
    .desk-card {
      cursor: pointer;
      transition: all 0.2s ease;
      min-height: 52px;
      display: flex;
      flex-column: column;
      align-items: center;
      justify-content: center;
    }

    .desk-card:hover {
      transform: scale(1.05);
    }

    .desk-occupied {
      background: rgba(37, 99, 235, 0.12);
      border-color: #3b82f6 !important;
      color: #1d4ed8;
    }

    .desk-vacant {
      background: #f8fafc;
      border-color: #e2e8f0 !important;
      border-style: dashed !important;
      color: #94a3b8;
    }

    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `]
})
export class HodPortalComponent implements OnInit, OnDestroy {
  @ViewChild('seatFinderSection') seatFinderSection?: ElementRef;

  selectedBranch: string = 'CSE';
  availableBranches: string[] = ['CSE', 'ECE', 'MECH', 'CIVIL'];
  
  isHodUser: boolean = false;
  isAdminUser: boolean = false;

  dashboardData: HodDashboardData | null = null;
  students: Student[] = [];
  filteredStudents: Student[] = [];
  searchKeyword: string = '';

  activeTab: 'exams' | 'students' | 'halls' | 'incidents' = 'exams';
  loading: boolean = true;
  errorMsg: string = '';
  successMsg: string = '';

  // Pagination for students
  currentPage: number = 1;
  pageSize: number = 10;

  // Embedded Seat Finder State
  showSeatFinder: boolean = false;
  searchExamId?: number;
  searchRegisterNumber: string = '';
  searchingSeat: boolean = false;
  seatSearchResult: StudentSeatSearchResponse | null = null;
  seatSearchNotFound: boolean = false;
  downloadingPdf: boolean = false;

  // 2D Hall Matrix Modal State
  showMatrixModal: boolean = false;
  selectedMatrixHallId?: number;
  selectedMatrixHallNumber: string = '';
  selectedMatrixCapacity: number = 15;
  matrixRows = [1, 2, 3, 4, 5];
  matrixCols = [1, 2, 3];
  hallArrangements: SeatingArrangementDetail[] = [];
  selectedDeskInfo: SeatingArrangementDetail | null = null;
  matrixAllocatedCount: number = 0;

  // Generate Seating Modal State
  showGenerateModal: boolean = false;
  selectedGenerateExamId?: number;
  generateStrategy: 'SEQUENTIAL' | 'RANDOM' | 'SECTION_ALTERNATION' = 'SEQUENTIAL';
  generatingSeating: boolean = false;

  // Log Incident Modal State
  showIncidentModal: boolean = false;
  newIncidentStudentId?: number;
  newIncidentExamId?: number;
  newIncidentHallId?: number;
  newIncidentType: IncidentType = 'UNAUTHORIZED_MATERIALS';
  newIncidentDesc: string = '';
  newIncidentConfiscated: string = '';
  submittingIncident: boolean = false;

  // CSV Import Modal State
  showImportModal: boolean = false;
  selectedFile: File | null = null;
  targetExamId?: number;
  importing: boolean = false;
  importResult: StudentImportSummary | null = null;
  importError: string = '';

  private routeSub?: Subscription;

  constructor(
    private authService: AuthService,
    private hodService: HodService,
    private studentService: StudentService,
    private seatingService: SeatingService,
    private reportService: ReportService,
    private incidentService: IncidentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isHodUser = this.authService.isHod();
    this.isAdminUser = this.authService.isAdmin();

    // If HOD, locked to their own department
    if (this.isHodUser) {
      const dept = this.authService.getDepartment();
      if (dept) {
        this.selectedBranch = dept.toUpperCase();
      }
    }

    // Read route params if available and admin
    this.routeSub = this.route.params.subscribe(params => {
      if (params['branch'] && this.isAdminUser) {
        this.selectedBranch = params['branch'].toUpperCase();
      }
      this.loadBranchData();
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  getBranchThemeClass(): string {
    switch (this.selectedBranch.toUpperCase()) {
      case 'CSE': return 'theme-cse';
      case 'ECE': return 'theme-ece';
      case 'MECH': return 'theme-mech';
      case 'CIVIL': return 'theme-civil';
      default: return 'theme-default';
    }
  }

  switchBranch(branch: string): void {
    if (!this.isAdminUser) return;
    this.selectedBranch = branch.toUpperCase();
    this.router.navigate(['/hod/portal', this.selectedBranch]);
  }

  switchTab(tab: 'exams' | 'students' | 'halls' | 'incidents'): void {
    this.activeTab = tab;
  }

  loadBranchData(): void {
    this.loading = true;
    this.errorMsg = '';

    this.hodService.getDashboard(this.selectedBranch).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.dashboardData = res.data;
          // Preselect searchExamId if available
          if (this.dashboardData.upcomingExams && this.dashboardData.upcomingExams.length > 0 && !this.searchExamId) {
            this.searchExamId = this.dashboardData.upcomingExams[0].id;
          }
        }
        this.loadStudents();
      },
      error: (err) => {
        this.errorMsg = 'Failed to load department dashboard data: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  loadStudents(): void {
    this.hodService.getDepartmentStudents(this.selectedBranch).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.students = res.data;
          this.filterStudents();
        }
        this.loading = false;
      },
      error: (err) => {
        this.errorMsg = 'Failed to load student roster: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  filterStudents(): void {
    if (!this.searchKeyword.trim()) {
      this.filteredStudents = [...this.students];
    } else {
      const kw = this.searchKeyword.trim().toLowerCase();
      this.filteredStudents = this.students.filter(s =>
        (s.registerNumber && s.registerNumber.toLowerCase().includes(kw)) ||
        (s.name && s.name.toLowerCase().includes(kw)) ||
        (s.email && s.email.toLowerCase().includes(kw))
      );
    }
    this.currentPage = 1;
  }

  get pagedStudents(): Student[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredStudents.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredStudents.length / this.pageSize) || 1;
  }

  getOccupancyPercent(assigned?: number, capacity?: number): number {
    const c = capacity || 15;
    const a = assigned || 0;
    return Math.min(100, Math.round((a / c) * 100));
  }

  getIncidentStatusClass(status?: string): string {
    switch (status) {
      case 'REPORTED': return 'bg-danger text-white';
      case 'UNDER_REVIEW': return 'bg-warning text-dark';
      case 'CONFIRMED_ACTION_TAKEN': return 'bg-success text-white';
      case 'DISMISSED': return 'bg-secondary text-white';
      default: return 'bg-secondary text-white';
    }
  }

  // ==========================================
  // FUNCTION 1: EMBEDDED SEAT LOCATOR
  // ==========================================
  toggleSeatFinder(): void {
    this.showSeatFinder = !this.showSeatFinder;
    if (this.showSeatFinder) {
      setTimeout(() => {
        this.seatFinderSection?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }

  quickLocateCandidate(regNo: string): void {
    this.showSeatFinder = true;
    this.searchRegisterNumber = regNo;
    if (this.dashboardData?.upcomingExams && this.dashboardData.upcomingExams.length > 0) {
      this.searchExamId = this.dashboardData.upcomingExams[0].id;
    }
    this.locateCandidateSeat();
    setTimeout(() => {
      this.seatFinderSection?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  locateCandidateSeat(): void {
    if (!this.searchExamId || !this.searchRegisterNumber.trim()) return;

    this.searchingSeat = true;
    this.seatSearchResult = null;
    this.seatSearchNotFound = false;

    this.seatingService.searchStudentSeat(this.searchRegisterNumber.trim(), this.searchExamId).subscribe({
      next: (res) => {
        this.searchingSeat = false;
        if (res.success && res.data) {
          this.seatSearchResult = res.data;
        } else {
          this.seatSearchNotFound = true;
        }
      },
      error: () => {
        this.searchingSeat = false;
        this.seatSearchNotFound = true;
      }
    });
  }

  downloadCandidateAdmitCard(examId: number, regNo: string): void {
    const student = this.students.find(s => s.registerNumber === regNo);
    if (!student) {
      this.errorMsg = 'Candidate not found in roster.';
      return;
    }

    this.downloadingPdf = true;
    this.reportService.downloadAdmitCardPdf(examId, student.id).subscribe({
      next: (blob) => {
        this.downloadingPdf = false;
        this.reportService.triggerFileDownload(blob, `AdmitCard_${regNo}_Exam${examId}.pdf`);
      },
      error: (err) => {
        this.downloadingPdf = false;
        this.errorMsg = 'Could not generate admit card: ' + (err.error?.message || err.message);
      }
    });
  }

  quickDownloadAdmitSlip(student: Student): void {
    const examId = this.dashboardData?.upcomingExams?.[0]?.id;
    if (!examId) {
      this.errorMsg = 'No active examination found for this branch.';
      return;
    }
    this.downloadCandidateAdmitCard(examId, student.registerNumber);
  }

  // ==========================================
  // FUNCTION 2: 2D HALL MATRIX FLOOR PLAN MODAL
  // ==========================================
  inspectHallMatrix(hallId?: number, hallNumber?: string, capacity?: number): void {
    if (!hallId) return;

    this.selectedMatrixHallId = hallId;
    this.selectedMatrixHallNumber = hallNumber || 'Hall';
    this.selectedMatrixCapacity = capacity || 15;
    this.selectedDeskInfo = null;
    this.showMatrixModal = true;

    // Fetch arrangements for the first upcoming exam
    const examId = this.dashboardData?.upcomingExams?.[0]?.id;
    if (examId) {
      this.seatingService.getArrangementByHallAndExam(hallId, examId).subscribe({
        next: (res) => {
          this.hallArrangements = res.data || [];
          this.matrixAllocatedCount = this.hallArrangements.length;
        },
        error: () => {
          this.hallArrangements = [];
          this.matrixAllocatedCount = 0;
        }
      });
    } else {
      this.hallArrangements = [];
      this.matrixAllocatedCount = 0;
    }
  }

  getDeskArrangement(row: number, col: number): SeatingArrangementDetail | undefined {
    return this.hallArrangements.find(a => a.rowNumber === row && a.columnNumber === col);
  }

  getDeskStatusClass(row: number, col: number): string {
    const arr = this.getDeskArrangement(row, col);
    return arr ? 'desk-occupied' : 'desk-vacant';
  }

  getDeskCandidateLabel(row: number, col: number): string {
    const arr = this.getDeskArrangement(row, col);
    return arr ? `${arr.studentRegisterNumber}` : 'Vacant';
  }

  selectDesk(row: number, col: number): void {
    const arr = this.getDeskArrangement(row, col);
    if (arr) {
      this.selectedDeskInfo = arr;
    } else {
      this.selectedDeskInfo = null;
    }
  }

  // ==========================================
  // FUNCTION 3: GENERATE SEATING FOR DEPARTMENT
  // ==========================================
  openGenerateSeatingModal(): void {
    if (this.dashboardData?.upcomingExams && this.dashboardData.upcomingExams.length > 0) {
      this.selectedGenerateExamId = this.dashboardData.upcomingExams[0].id;
    }
    this.showGenerateModal = true;
  }

  quickGenerateSeatingForExam(examId: number): void {
    this.selectedGenerateExamId = examId;
    this.executeSeatingGeneration();
  }

  executeSeatingGeneration(): void {
    if (!this.selectedGenerateExamId) return;

    this.generatingSeating = true;
    this.seatingService.generateSeating(this.selectedGenerateExamId, { strategy: this.generateStrategy }).subscribe({
      next: (res) => {
        this.generatingSeating = false;
        this.showGenerateModal = false;
        if (res.success && res.data) {
          this.successMsg = `Successfully generated 5×3 seating arrangement for ${res.data.totalStudents} candidates across ${res.data.hallsUsed} halls!`;
          this.loadBranchData();
        }
      },
      error: (err) => {
        this.generatingSeating = false;
        this.errorMsg = 'Seating generation error: ' + (err.error?.message || err.message);
      }
    });
  }

  // ==========================================
  // FUNCTION 4: LOG MALPRACTICE INCIDENT
  // ==========================================
  openLogIncidentModal(): void {
    this.newIncidentStudentId = undefined;
    this.newIncidentExamId = this.dashboardData?.upcomingExams?.[0]?.id;
    this.newIncidentHallId = this.dashboardData?.allottedHalls?.[0]?.hallId;
    this.newIncidentType = 'UNAUTHORIZED_MATERIALS';
    this.newIncidentDesc = '';
    this.newIncidentConfiscated = '';
    this.showIncidentModal = true;
  }

  submitIncident(): void {
    if (!this.newIncidentStudentId || !this.newIncidentExamId || !this.newIncidentHallId || !this.newIncidentDesc.trim()) {
      return;
    }

    this.submittingIncident = true;
    this.incidentService.reportIncident({
      examId: this.newIncidentExamId,
      studentId: this.newIncidentStudentId,
      hallId: this.newIncidentHallId,
      incidentType: this.newIncidentType,
      description: this.newIncidentDesc.trim(),
      confiscatedItems: this.newIncidentConfiscated.trim() || undefined
    }).subscribe({
      next: (res) => {
        this.submittingIncident = false;
        this.showIncidentModal = false;
        if (res.success) {
          this.successMsg = `Malpractice incident logged successfully for disciplinary review.`;
          this.loadBranchData();
        }
      },
      error: (err) => {
        this.submittingIncident = false;
        this.errorMsg = 'Could not log incident: ' + (err.error?.message || err.message);
      }
    });
  }

  updateIncidentStatus(incidentId: number, newStatus: IncidentStatus): void {
    this.incidentService.updateStatus(incidentId, newStatus).subscribe({
      next: (res) => {
        if (res.success) {
          this.successMsg = `Updated incident status to ${newStatus}.`;
          this.loadBranchData();
        }
      },
      error: (err) => {
        this.errorMsg = 'Could not update status: ' + (err.error?.message || err.message);
      }
    });
  }

  // ==========================================
  // FUNCTION 5: CSV EXPORT & TEMPLATE
  // ==========================================
  exportRosterCsv(): void {
    if (!this.students || this.students.length === 0) {
      this.errorMsg = 'No candidates in roster to export.';
      return;
    }

    const headers = 'registerNumber,name,branch,year,section,email,phone\n';
    const rows = this.students.map(s =>
      `"${s.registerNumber}","${s.name}","${s.branch}",${s.year},"${s.section}","${s.email}","${s.phone || ''}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${this.selectedBranch.toLowerCase()}_department_roster.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  downloadTemplate(): void {
    const branch = this.selectedBranch || 'CSE';
    let code = branch;
    if (branch === 'CSE') code = 'CS';
    else if (branch === 'ECE') code = 'EC';
    else if (branch === 'MECH') code = 'ME';
    else if (branch === 'CIVIL') code = 'CE';

    const firstNames = [
      'Aarav', 'Aditi', 'Akash', 'Ananya', 'Arjun',
      'Bhavya', 'Chetan', 'Deepa', 'Devendra', 'Divya',
      'Gautam', 'Harish', 'Ishaan', 'Janani', 'Karan',
      'Kavya', 'Lakshmi', 'Madhav', 'Meera', 'Mohit',
      'Nandini', 'Nikhil', 'Pooja', 'Pranav', 'Preeti',
      'Rahul', 'Rajeshwari', 'Rishi', 'Ritu', 'Rohan'
    ];
    const lastNames = [
      'Patel', 'Sharma', 'Verma', 'Iyer', 'Nair',
      'Reddy', 'Kumar', 'Menon', 'Joshi', 'Pillai',
      'Das', 'Rao', 'Kulkarni', 'Sundaram', 'Malhotra',
      'Hegde', 'Narayanan', 'Bhat', 'Sen', 'Agarwal',
      'Chawla', 'Deshmukh', 'Shetty', 'Venkatesh', 'Nambiar',
      'Saxena', 'Murthy', 'Kapoor', 'Sengupta', 'Mehta'
    ];

    const rows: string[] = ['registerNumber,name,branch,year,section,email,phone'];
    for (let i = 0; i < firstNames.length; i++) {
      const seq = i + 1;
      const numStr = seq < 10 ? `00${seq}` : `0${seq}`;
      const regNo = `21${code}${numStr}`;
      const fullName = `${firstNames[i]} ${lastNames[i]}`;
      const section = seq <= 15 ? 'A' : 'B';
      const email = `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase()}@${branch.toLowerCase()}.university.edu`;
      const phone = `98450${10000 + seq}`;
      rows.push(`${regNo},${fullName},${branch},3,${section},${email},${phone}`);
    }

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bulk_${branch.toLowerCase()}_students_30.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // ==========================================
  // FUNCTION 6: CSV IMPORT MODAL
  // ==========================================
  openImportModal(examId?: number): void {
    this.targetExamId = examId;
    this.selectedFile = null;
    this.importResult = null;
    this.importError = '';
    this.showImportModal = true;
  }

  closeImportModal(): void {
    this.showImportModal = false;
    this.selectedFile = null;
    this.importResult = null;
    this.importError = '';
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  uploadCsv(): void {
    if (!this.selectedFile) return;

    this.importing = true;
    this.importError = '';
    this.importResult = null;

    this.studentService.importStudents(this.selectedFile, this.targetExamId).subscribe({
      next: (res) => {
        this.importing = false;
        if (res.success && res.data) {
          this.importResult = res.data;
          this.successMsg = `Successfully imported ${res.data.successfullyImported} ${this.selectedBranch} candidates with 5×3 multi-hall overflow.`;
          this.loadBranchData();
        } else {
          this.importError = res.message || 'Import failed.';
        }
      },
      error: (err) => {
        this.importing = false;
        this.importError = 'Import error: ' + (err.error?.message || err.message);
      }
    });
  }
}
