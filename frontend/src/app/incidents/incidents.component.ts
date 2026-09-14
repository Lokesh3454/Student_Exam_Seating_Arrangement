import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IncidentService } from '../core/services/incident.service';
import { ExamService } from '../core/services/exam.service';
import { HallService } from '../core/services/hall.service';
import { StudentService } from '../core/services/student.service';
import { AuthService } from '../core/services/auth.service';
import { MalpracticeIncident, IncidentRequest, IncidentType, IncidentStatus } from '../core/models/incident.model';
import { Exam } from '../core/models/exam.model';
import { Hall } from '../core/models/hall.model';
import { Student } from '../core/models/student.model';

@Component({
  selector: 'app-incidents',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="fade-in">
      <!-- Header -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <span class="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fw-semibold mb-2">
            <i class="bi bi-shield-exclamation me-1"></i> Exam Integrity & Disciplinary Cell
          </span>
          <h2 class="h3 fw-bold text-dark mb-1">Examination Malpractice & Incident Reports</h2>
          <p class="text-secondary small mb-0">Record, investigate, and review examination misconduct with official disciplinary tracking</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-danger rounded-pill px-4 shadow-sm d-flex align-items-center gap-2"
                  (click)="openReportModal()">
            <i class="bi bi-plus-circle-fill"></i>
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      <!-- KPI Metrics -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-primary">
            <div class="text-secondary small fw-semibold text-uppercase">Total Reported</div>
            <div class="h3 fw-bold text-dark my-1">{{ incidents.length }}</div>
            <div class="small text-muted">All exam misconduct cases</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-warning">
            <div class="text-secondary small fw-semibold text-uppercase">Pending Review</div>
            <div class="h3 fw-bold text-warning my-1">{{ getPendingCount() }}</div>
            <div class="small text-muted">Awaiting administrative inquiry</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-danger">
            <div class="text-secondary small fw-semibold text-uppercase">Confirmed Action</div>
            <div class="h3 fw-bold text-danger my-1">{{ getConfirmedCount() }}</div>
            <div class="small text-muted">Disciplinary penalty confirmed</div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 border-start border-4 border-success">
            <div class="text-secondary small fw-semibold text-uppercase">Dismissed / Exonerated</div>
            <div class="h3 fw-bold text-success my-1">{{ getDismissedCount() }}</div>
            <div class="small text-muted">Cleared after investigation</div>
          </div>
        </div>
      </div>

      <!-- Filter Controls Bar -->
      <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-md-4">
            <label class="form-label small fw-semibold text-dark mb-1">Status Filter</label>
            <select class="form-select bg-light border-0" [(ngModel)]="selectedStatusFilter" (change)="applyFilters()">
              <option value="ALL">All Statuses</option>
              <option value="REPORTED">Reported (New)</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="CONFIRMED_ACTION_TAKEN">Confirmed Action Taken</option>
              <option value="DISMISSED">Dismissed</option>
            </select>
          </div>
          <div class="col-md-5">
            <label class="form-label small fw-semibold text-dark mb-1">Search Candidate / Exam</label>
            <div class="input-group">
              <span class="input-group-text bg-light border-0"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control bg-light border-0"
                     placeholder="Search register no, student name, hall..."
                     [(ngModel)]="searchKeyword" (input)="applyFilters()" />
            </div>
          </div>
          <div class="col-md-3 text-end pt-3">
            <span class="badge bg-light text-dark border px-3 py-2">
              Showing: <strong>{{ filteredIncidents.length }}</strong> of {{ incidents.length }}
            </span>
          </div>
        </div>
      </div>

      <!-- Alerts -->
      <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
        <i class="bi bi-check-circle-fill"></i>
        <div>{{ successMessage }}</div>
        <button type="button" class="btn-close" (click)="successMessage = ''"></button>
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <div>{{ errorMessage }}</div>
        <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-danger" role="status"></div>
        <p class="text-muted mt-2">Loading incident records...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && filteredIncidents.length === 0" class="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
        <i class="bi bi-shield-check fs-1 text-success opacity-75 d-block mb-3"></i>
        <h5 class="fw-bold text-dark">No Incidents Found</h5>
        <p class="small text-secondary mb-0">No disciplinary violations match your filter criteria.</p>
      </div>

      <!-- Incidents Table -->
      <div *ngIf="!isLoading && filteredIncidents.length > 0" class="card border-0 shadow-sm rounded-4 overflow-hidden mb-5">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="ps-4">ID</th>
                <th>Student Candidate</th>
                <th>Examination & Hall</th>
                <th>Violation Type</th>
                <th>Description & Items</th>
                <th>Status</th>
                <th>Reported By</th>
                <th class="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let inc of filteredIncidents">
                <td class="ps-4 fw-bold text-secondary">#{{ inc.id }}</td>
                <td>
                  <div class="fw-bold text-dark">{{ inc.studentName }}</div>
                  <div class="small text-muted font-monospace">{{ inc.studentRegisterNumber }} • {{ inc.studentBranch }}</div>
                </td>
                <td>
                  <div class="fw-semibold text-dark">{{ inc.examName }}</div>
                  <div class="small text-muted"><i class="bi bi-geo-alt me-1"></i>Hall {{ inc.hallNumber }}</div>
                </td>
                <td>
                  <span class="badge px-2 py-1 rounded-pill" [ngClass]="getTypeBadgeClass(inc.incidentType)">
                    {{ formatIncidentType(inc.incidentType) }}
                  </span>
                </td>
                <td style="max-width: 250px;">
                  <div class="text-truncate small text-dark" [title]="inc.description">{{ inc.description }}</div>
                  <div *ngIf="inc.confiscatedItems" class="text-truncate text-danger small mt-1">
                    <i class="bi bi-box-seam me-1"></i>Confiscated: {{ inc.confiscatedItems }}
                  </div>
                </td>
                <td>
                  <span class="badge px-3 py-1 rounded-pill fw-semibold" [ngClass]="getStatusBadgeClass(inc.status)">
                    {{ formatStatus(inc.status) }}
                  </span>
                </td>
                <td>
                  <div class="small fw-semibold text-dark">{{ inc.reportedBy }}</div>
                  <div class="small text-muted">{{ inc.reportedAt | date:'short' }}</div>
                </td>
                <td class="text-end pe-4">
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary rounded-pill px-3"
                            (click)="viewIncidentDetails(inc)" title="View Full Report">
                      <i class="bi bi-eye"></i> Details
                    </button>
                    <button *ngIf="isAdmin" class="btn btn-sm btn-outline-dark rounded-pill px-3 ms-1"
                            (click)="openReviewModal(inc)" title="Review & Take Action">
                      <i class="bi bi-pencil-square"></i> Review
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Report Incident Modal -->
    <div class="modal fade show d-block" *ngIf="isReportModalOpen" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          <div class="modal-header bg-danger text-white p-4">
            <h5 class="modal-title fw-bold d-flex align-items-center gap-2">
              <i class="bi bi-shield-exclamation"></i> Report Examination Malpractice
            </h5>
            <button type="button" class="btn-close btn-close-white" (click)="isReportModalOpen = false"></button>
          </div>
          <form (ngSubmit)="submitIncidentReport()">
            <div class="modal-body p-4">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-dark">Select Examination <span class="text-danger">*</span></label>
                  <select class="form-select bg-light" [(ngModel)]="newIncident.examId" name="examId" required>
                    <option [ngValue]="null" disabled>-- Choose Exam --</option>
                    <option *ngFor="let ex of exams" [ngValue]="ex.id">{{ ex.examName }} ({{ ex.subject }})</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-dark">Examination Hall <span class="text-danger">*</span></label>
                  <select class="form-select bg-light" [(ngModel)]="newIncident.hallId" name="hallId" required>
                    <option [ngValue]="null" disabled>-- Choose Hall --</option>
                    <option *ngFor="let h of halls" [ngValue]="h.id">Hall {{ h.hallNumber }} ({{ h.building }})</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-dark">Candidate / Student <span class="text-danger">*</span></label>
                  <select class="form-select bg-light" [(ngModel)]="newIncident.studentId" name="studentId" required>
                    <option [ngValue]="null" disabled>-- Choose Student --</option>
                    <option *ngFor="let st of students" [ngValue]="st.id">{{ st.registerNumber }} - {{ st.name }} ({{ st.branch }})</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-dark">Type of Violation <span class="text-danger">*</span></label>
                  <select class="form-select bg-light" [(ngModel)]="newIncident.incidentType" name="incidentType" required>
                    <option value="UNAUTHORIZED_MATERIALS">Possession of Chits / Written Notes</option>
                    <option value="ELECTRONIC_DEVICE">Mobile Phone / Smartwatch / Earphones</option>
                    <option value="IMPERSONATION">Impersonation / Fake Candidate</option>
                    <option value="TALKING_OR_COPYING">Copying / Unauthorized Communication</option>
                    <option value="DISRUPTIVE_BEHAVIOR">Disruptive / Threatening Behavior</option>
                    <option value="LEAVING_WITHOUT_PERMISSION">Leaving Hall Without Permission</option>
                    <option value="OTHER">Other Disciplinary Breach</option>
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label small fw-semibold text-dark">Incident Description & Evidence <span class="text-danger">*</span></label>
                  <textarea class="form-control bg-light" rows="3" [(ngModel)]="newIncident.description" name="description"
                            placeholder="Detailed description of what occurred, time of event, seating location..." required></textarea>
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-dark">Confiscated Material / Items</label>
                  <input type="text" class="form-control bg-light" [(ngModel)]="newIncident.confiscatedItems" name="confiscatedItems"
                         placeholder="e.g. 2 printed chits, Samsung smartphone, programmable calculator" />
                </div>

                <div class="col-md-6">
                  <label class="form-label small fw-semibold text-dark">Immediate Invigilator Action Taken</label>
                  <input type="text" class="form-control bg-light" [(ngModel)]="newIncident.actionTaken" name="actionTaken"
                         placeholder="e.g. Answer sheet seized, candidate replaced with new booklet, escorted out" />
                </div>
              </div>
            </div>
            <div class="modal-footer p-3 bg-light">
              <button type="button" class="btn btn-outline-secondary rounded-pill px-4" (click)="isReportModalOpen = false">Cancel</button>
              <button type="submit" class="btn btn-danger rounded-pill px-4 shadow-sm" [disabled]="isSubmitting">
                <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
                <span>Submit Official Report</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Review / Status Action Modal (Admin Only) -->
    <div class="modal fade show d-block" *ngIf="isReviewModalOpen && selectedIncident" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          <div class="modal-header bg-dark text-white p-4">
            <h5 class="modal-title fw-bold">Review Disciplinary Case #{{ selectedIncident.id }}</h5>
            <button type="button" class="btn-close btn-close-white" (click)="isReviewModalOpen = false"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3">
              <div class="small text-muted text-uppercase">Candidate</div>
              <div class="fw-bold text-dark">{{ selectedIncident.studentName }} ({{ selectedIncident.studentRegisterNumber }})</div>
            </div>
            <div class="mb-3">
              <div class="small text-muted text-uppercase">Violation</div>
              <div class="badge bg-danger-subtle text-danger">{{ formatIncidentType(selectedIncident.incidentType) }}</div>
              <div class="small text-secondary mt-1">{{ selectedIncident.description }}</div>
            </div>

            <div class="mb-3">
              <label class="form-label small fw-semibold text-dark">Update Case Status</label>
              <select class="form-select bg-light" [(ngModel)]="reviewStatus">
                <option value="REPORTED">REPORTED (New)</option>
                <option value="UNDER_REVIEW">UNDER REVIEW (Committee Inquiry)</option>
                <option value="CONFIRMED_ACTION_TAKEN">CONFIRMED ACTION TAKEN (Penalty Enacted)</option>
                <option value="DISMISSED">DISMISSED (Cleared of Charges)</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label small fw-semibold text-dark">Final Committee Decision / Penalty</label>
              <textarea class="form-control bg-light" rows="3" [(ngModel)]="reviewAction"
                        placeholder="e.g. Current examination cancelled; student debarred for subsequent 2 papers."></textarea>
            </div>
          </div>
          <div class="modal-footer p-3 bg-light">
            <button type="button" class="btn btn-outline-secondary rounded-pill px-4" (click)="isReviewModalOpen = false">Close</button>
            <button type="button" class="btn btn-primary rounded-pill px-4 shadow-sm" (click)="submitReview()">
              Save Decision
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Details View Modal -->
    <div class="modal fade show d-block" *ngIf="isDetailsModalOpen && selectedIncident" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          <div class="modal-header bg-primary text-white p-4">
            <h5 class="modal-title fw-bold">Case File #{{ selectedIncident.id }}</h5>
            <button type="button" class="btn-close btn-close-white" (click)="isDetailsModalOpen = false"></button>
          </div>
          <div class="modal-body p-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="badge px-3 py-2 rounded-pill" [ngClass]="getStatusBadgeClass(selectedIncident.status)">
                {{ formatStatus(selectedIncident.status) }}
              </span>
              <span class="small text-muted">{{ selectedIncident.reportedAt | date:'medium' }}</span>
            </div>

            <ul class="list-group list-group-flush mb-3">
              <li class="list-group-item px-0 py-2 d-flex justify-content-between">
                <span class="text-secondary small">Student Name:</span>
                <span class="fw-bold text-dark">{{ selectedIncident.studentName }}</span>
              </li>
              <li class="list-group-item px-0 py-2 d-flex justify-content-between">
                <span class="text-secondary small">Register Number:</span>
                <span class="font-monospace text-primary fw-bold">{{ selectedIncident.studentRegisterNumber }}</span>
              </li>
              <li class="list-group-item px-0 py-2 d-flex justify-content-between">
                <span class="text-secondary small">Branch:</span>
                <span class="fw-semibold text-dark">{{ selectedIncident.studentBranch }}</span>
              </li>
              <li class="list-group-item px-0 py-2 d-flex justify-content-between">
                <span class="text-secondary small">Exam & Hall:</span>
                <span class="fw-semibold text-dark">{{ selectedIncident.examName }} • Hall {{ selectedIncident.hallNumber }}</span>
              </li>
              <li class="list-group-item px-0 py-2 d-flex justify-content-between">
                <span class="text-secondary small">Reported By:</span>
                <span class="fw-semibold text-dark">{{ selectedIncident.reportedBy }}</span>
              </li>
              <li class="list-group-item px-0 py-2 d-flex justify-content-between" *ngIf="selectedIncident.confiscatedItems">
                <span class="text-secondary small">Confiscated Items:</span>
                <span class="text-danger fw-semibold">{{ selectedIncident.confiscatedItems }}</span>
              </li>
            </ul>

            <div class="p-3 bg-light rounded-3 mb-3">
              <div class="small fw-semibold text-dark mb-1">Description:</div>
              <div class="small text-secondary">{{ selectedIncident.description }}</div>
            </div>

            <div class="p-3 bg-warning-subtle rounded-3" *ngIf="selectedIncident.actionTaken">
              <div class="small fw-bold text-dark mb-1">Disciplinary Action Taken:</div>
              <div class="small text-dark">{{ selectedIncident.actionTaken }}</div>
            </div>
          </div>
          <div class="modal-footer p-3 bg-light">
            <button type="button" class="btn btn-secondary rounded-pill px-4" (click)="isDetailsModalOpen = false">Close</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class IncidentsComponent implements OnInit {
  incidents: MalpracticeIncident[] = [];
  filteredIncidents: MalpracticeIncident[] = [];
  exams: Exam[] = [];
  halls: Hall[] = [];
  students: Student[] = [];

  isLoading = true;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  selectedStatusFilter = 'ALL';
  searchKeyword = '';

  // Modals state
  isReportModalOpen = false;
  isReviewModalOpen = false;
  isDetailsModalOpen = false;
  selectedIncident: MalpracticeIncident | null = null;

  reviewStatus: IncidentStatus = 'REPORTED';
  reviewAction = '';

  newIncident: IncidentRequest = {
    examId: null as any,
    hallId: null as any,
    studentId: null as any,
    incidentType: 'UNAUTHORIZED_MATERIALS',
    description: '',
    confiscatedItems: '',
    actionTaken: ''
  };

  isAdmin = false;

  constructor(
    private incidentService: IncidentService,
    private examService: ExamService,
    private hallService: HallService,
    private studentService: StudentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN') || this.authService.hasRole('ADMIN');
    this.loadIncidents();
    this.loadPrerequisites();
  }

  loadIncidents(): void {
    this.isLoading = true;
    this.incidentService.getAllIncidents().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.incidents = res.data || [];
        this.applyFilters();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to load incident reports';
      }
    });
  }

  loadPrerequisites(): void {
    this.examService.getAllExams().subscribe(res => this.exams = res.data || []);
    this.hallService.getAllHalls().subscribe(res => this.halls = res.data || []);
    this.studentService.getAllStudents().subscribe(res => this.students = res.data || []);
  }

  applyFilters(): void {
    let list = [...this.incidents];
    if (this.selectedStatusFilter !== 'ALL') {
      list = list.filter(i => i.status === this.selectedStatusFilter);
    }
    if (this.searchKeyword.trim()) {
      const q = this.searchKeyword.toLowerCase().trim();
      list = list.filter(i =>
        i.studentName?.toLowerCase().includes(q) ||
        i.studentRegisterNumber?.toLowerCase().includes(q) ||
        i.examName?.toLowerCase().includes(q) ||
        i.hallNumber?.toLowerCase().includes(q) ||
        i.description?.toLowerCase().includes(q)
      );
    }
    this.filteredIncidents = list;
  }

  getPendingCount(): number {
    return this.incidents.filter(i => i.status === 'REPORTED' || i.status === 'UNDER_REVIEW').length;
  }

  getConfirmedCount(): number {
    return this.incidents.filter(i => i.status === 'CONFIRMED_ACTION_TAKEN').length;
  }

  getDismissedCount(): number {
    return this.incidents.filter(i => i.status === 'DISMISSED').length;
  }

  openReportModal(): void {
    this.newIncident = {
      examId: this.exams.length > 0 ? this.exams[0].id : (null as any),
      hallId: this.halls.length > 0 ? this.halls[0].id : (null as any),
      studentId: this.students.length > 0 ? this.students[0].id : (null as any),
      incidentType: 'UNAUTHORIZED_MATERIALS',
      description: '',
      confiscatedItems: '',
      actionTaken: ''
    };
    this.isReportModalOpen = true;
  }

  submitIncidentReport(): void {
    if (!this.newIncident.examId || !this.newIncident.hallId || !this.newIncident.studentId || !this.newIncident.description) {
      this.errorMessage = 'Please complete all mandatory fields';
      return;
    }
    this.isSubmitting = true;
    this.incidentService.reportIncident(this.newIncident).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isReportModalOpen = false;
        this.successMessage = 'Incident report lodged successfully';
        this.loadIncidents();
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to submit incident report';
      }
    });
  }

  openReviewModal(inc: MalpracticeIncident): void {
    this.selectedIncident = inc;
    this.reviewStatus = inc.status;
    this.reviewAction = inc.actionTaken || '';
    this.isReviewModalOpen = true;
  }

  submitReview(): void {
    if (!this.selectedIncident) return;
    this.incidentService.updateStatus(this.selectedIncident.id, this.reviewStatus, this.reviewAction).subscribe({
      next: (res) => {
        this.isReviewModalOpen = false;
        this.successMessage = 'Disciplinary status updated';
        this.loadIncidents();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update incident status';
      }
    });
  }

  viewIncidentDetails(inc: MalpracticeIncident): void {
    this.selectedIncident = inc;
    this.isDetailsModalOpen = true;
  }

  formatIncidentType(type: IncidentType): string {
    switch (type) {
      case 'UNAUTHORIZED_MATERIALS': return 'Chits / Notes';
      case 'ELECTRONIC_DEVICE': return 'Electronic Device';
      case 'IMPERSONATION': return 'Impersonation';
      case 'TALKING_OR_COPYING': return 'Copying / Talking';
      case 'DISRUPTIVE_BEHAVIOR': return 'Disruptive Behavior';
      case 'LEAVING_WITHOUT_PERMISSION': return 'Unauthorized Exit';
      default: return 'Other Breach';
    }
  }

  getTypeBadgeClass(type: IncidentType): string {
    switch (type) {
      case 'UNAUTHORIZED_MATERIALS': return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'ELECTRONIC_DEVICE': return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      case 'IMPERSONATION': return 'bg-dark text-white';
      case 'TALKING_OR_COPYING': return 'bg-info-subtle text-info-emphasis border border-info-subtle';
      case 'DISRUPTIVE_BEHAVIOR': return 'bg-secondary text-white';
      default: return 'bg-light text-dark border';
    }
  }

  formatStatus(status: IncidentStatus): string {
    switch (status) {
      case 'REPORTED': return 'Reported';
      case 'UNDER_REVIEW': return 'Under Review';
      case 'CONFIRMED_ACTION_TAKEN': return 'Action Confirmed';
      case 'DISMISSED': return 'Dismissed';
      default: return status;
    }
  }

  getStatusBadgeClass(status: IncidentStatus): string {
    switch (status) {
      case 'REPORTED': return 'bg-warning-subtle text-warning-emphasis';
      case 'UNDER_REVIEW': return 'bg-info-subtle text-info-emphasis';
      case 'CONFIRMED_ACTION_TAKEN': return 'bg-danger text-white';
      case 'DISMISSED': return 'bg-success-subtle text-success';
      default: return 'bg-secondary text-white';
    }
  }
}
