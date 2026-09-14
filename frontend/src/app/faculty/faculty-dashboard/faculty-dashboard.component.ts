import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FacultyService } from '../../core/services/faculty.service';
import { AuthService, UserSession } from '../../core/services/auth.service';
import { FacultyAssignment } from '../../core/models/faculty-assignment.model';

@Component({
  selector: 'app-faculty-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="fade-in">
      <!-- Greeting and Header -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-1 fw-bold">
              <i class="bi bi-mortarboard-fill me-1"></i> Faculty Invigilation Portal
            </span>
          </div>
          <h2 class="h3 fw-bold text-dark mb-1">Welcome back, {{ user?.username }}</h2>
          <p class="text-secondary small mb-0">Track your assigned invigilation duties, halls, candidate headcounts and mark student attendance</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary d-flex align-items-center gap-2" (click)="loadDuties()">
            <i class="bi bi-arrow-clockwise"></i>
            <span>Refresh Duties</span>
          </button>
        </div>
      </div>

      <!-- Clickable Metrics Cards -->
      <div class="row g-3 mb-4">
        <!-- Assigned Exams -->
        <div class="col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 card-clickable" (click)="navigate('/exams')">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-muted small fw-semibold">Assigned Exams</span>
              <div class="p-2 rounded-3 bg-primary-subtle text-primary">
                <i class="bi bi-journal-bookmark fs-5"></i>
              </div>
            </div>
            <div class="fs-2 fw-bold text-dark">{{ getUniqueExamsCount() }}</div>
            <span class="small text-secondary">Scheduled for invigilation</span>
            <div class="mt-2 pt-2 border-top text-primary small fw-semibold d-flex align-items-center gap-1">
              <i class="bi bi-arrow-right-circle"></i> View Exam Timetable
            </div>
          </div>
        </div>

        <!-- Assigned Halls -->
        <div class="col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 card-clickable" (click)="navigate('/halls')">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-muted small fw-semibold">Assigned Halls</span>
              <div class="p-2 rounded-3 bg-success-subtle text-success">
                <i class="bi bi-building fs-5"></i>
              </div>
            </div>
            <div class="fs-2 fw-bold text-dark">{{ duties.length }}</div>
            <span class="small text-secondary">Examination rooms allocated</span>
            <div class="mt-2 pt-2 border-top text-primary small fw-semibold d-flex align-items-center gap-1">
              <i class="bi bi-arrow-right-circle"></i> View Halls &amp; Seats
            </div>
          </div>
        </div>

        <!-- Total Candidates -->
        <div class="col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 card-clickable" (click)="navigate('/students')">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-muted small fw-semibold">Total Candidates</span>
              <div class="p-2 rounded-3 bg-info-subtle text-info">
                <i class="bi bi-people-fill fs-5"></i>
              </div>
            </div>
            <div class="fs-2 fw-bold text-dark">{{ getTotalStudentsCount() }}</div>
            <span class="small text-secondary">Students under your supervision</span>
            <div class="mt-2 pt-2 border-top text-primary small fw-semibold d-flex align-items-center gap-1">
              <i class="bi bi-arrow-right-circle"></i> View Student List
            </div>
          </div>
        </div>

        <!-- Attendance Summary -->
        <div class="col-sm-6 col-xl-3">
          <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100 card-clickable" (click)="navigate('/attendance')">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="text-muted small fw-semibold">Attendance Summary</span>
              <div class="p-2 rounded-3 bg-warning-subtle text-warning-emphasis">
                <i class="bi bi-check2-all fs-5"></i>
              </div>
            </div>
            <div class="fs-2 fw-bold text-dark">{{ getAttendanceSummaryText() }}</div>
            <span class="small text-secondary">Completed vs Pending register</span>
            <div class="mt-2 pt-2 border-top text-primary small fw-semibold d-flex align-items-center gap-1">
              <i class="bi bi-arrow-right-circle"></i> Mark Attendance
            </div>
          </div>
        </div>
      </div>

      <!-- Duty Roster Section -->
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center gap-2">
            <div class="bg-primary-subtle text-primary p-2 rounded-3">
              <i class="bi bi-calendar-check-fill fs-5"></i>
            </div>
            <div>
              <h5 class="mb-0 fw-bold">My Invigilation Schedule &amp; Hall Roster</h5>
              <small class="text-secondary">Click on any duty to conduct attendance or review candidate desk allocations</small>
            </div>
          </div>
        </div>

        <div *ngIf="isLoading" class="p-5 text-center text-secondary">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 small mb-0">Retrieving assigned duties...</p>
        </div>

        <div *ngIf="!isLoading && duties.length === 0" class="p-5 text-center text-muted">
          <i class="bi bi-calendar-x fs-1 opacity-50 d-block mb-2 text-secondary"></i>
          <h6 class="fw-bold text-dark mb-1">No Duty Assignments Found</h6>
          <p class="small text-secondary mb-0">You currently do not have any invigilation duties scheduled by the administrator.</p>
        </div>

        <div *ngIf="!isLoading && duties.length > 0" class="p-3">
          <div class="row g-3">
            <div *ngFor="let d of duties" class="col-md-6 col-xl-4">
              <div class="card border border-light-subtle rounded-4 h-100 shadow-sm card-clickable"
                   (click)="navigate('/attendance?examId=' + d.examId + '&hallId=' + d.hallId)">
                <div class="card-body p-4 d-flex flex-column justify-content-between">
                  <div>
                    <!-- Header -->
                    <div class="d-flex justify-content-between align-items-start mb-3">
                      <span class="badge bg-primary px-3 py-2 rounded-pill font-monospace fs-6">
                        Hall {{ d.hallNumber || d.hallCode }}
                      </span>
                      <span class="badge bg-light text-dark border">
                        {{ d.building }}
                      </span>
                    </div>

                    <!-- Exam Details -->
                    <h5 class="fw-bold text-dark mb-1">{{ d.examName }}</h5>
                    <p class="text-secondary small mb-3">{{ d.subject }}</p>

                    <!-- Timetable details -->
                    <div class="bg-light p-3 rounded-3 mb-3">
                      <div class="d-flex align-items-center gap-2 mb-2 small text-dark fw-semibold">
                        <i class="bi bi-calendar-event text-primary"></i>
                        <span>Date: {{ d.examDate }}</span>
                      </div>
                      <div class="d-flex align-items-center gap-2 small text-dark fw-semibold">
                        <i class="bi bi-clock-history text-danger"></i>
                        <span>Time: {{ d.startTime }} - {{ d.endTime }}</span>
                      </div>
                    </div>

                    <!-- Student Count & Attendance Summary -->
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <span class="text-muted small d-block">Candidates</span>
                        <span class="fw-bold text-dark fs-5">{{ d.assignedStudentsCount || d.totalStudents || 0 }} Students</span>
                      </div>
                      <div class="text-end">
                        <span class="text-muted small d-block">Register Status</span>
                        <span class="badge" [ngClass]="d.attendanceSummary && d.attendanceSummary.includes('Completed') ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'">
                          {{ d.attendanceSummary || (d.assignedStudentsCount ? 'Candidates Seated' : 'Scheduled') }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="pt-2 border-top d-flex gap-2" (click)="$event.stopPropagation()">
                    <a [routerLink]="['/attendance']" [queryParams]="{ examId: d.examId, hallId: d.hallId }"
                       class="btn btn-primary flex-grow-1 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold">
                      <i class="bi bi-person-check-fill"></i>
                      <span>Mark Attendance</span>
                    </a>
                    <a [routerLink]="['/seating/arrangement']" [queryParams]="{ examId: d.examId, hallId: d.hallId }"
                       class="btn btn-outline-secondary d-flex align-items-center justify-content-center p-2" title="View Seating Grid">
                      <i class="bi bi-grid-3x3-gap"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card-clickable {
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }
    .card-clickable:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.10) !important;
    }
  `]
})
export class FacultyDashboardComponent implements OnInit {
  user: UserSession | null = null;
  duties: FacultyAssignment[] = [];
  isLoading = false;

  constructor(
    private authService: AuthService,
    private facultyService: FacultyService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    this.authService.currentUser$.subscribe(u => this.user = u);
    this.loadDuties();
  }

  navigate(path: string): void {
    this.router.navigateByUrl(path);
  }

  loadDuties(): void {
    this.isLoading = true;
    this.facultyService.getMyDuties().subscribe({
      next: (res) => {
        this.duties = res.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getUniqueExamsCount(): number {
    const examIds = new Set(this.duties.map(d => d.examId));
    return examIds.size;
  }

  getTotalStudentsCount(): number {
    return this.duties.reduce((sum, d) => sum + (d.assignedStudentsCount || d.totalStudents || 0), 0);
  }

  getAttendanceSummaryText(): string {
    if (this.duties.length === 0) return '0 / 0 Done';
    const completed = this.duties.filter(d => d.attendanceSummary && d.attendanceSummary.includes('Completed')).length;
    return `${completed} / ${this.duties.length} Marked`;
  }
}
