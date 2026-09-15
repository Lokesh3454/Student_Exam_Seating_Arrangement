import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, UserSession } from '../core/services/auth.service';
import { ReportService } from '../core/services/report.service';
import { ExamService } from '../core/services/exam.service';
import { HallService } from '../core/services/hall.service';
import { SeatingService } from '../core/services/seating.service';
import { StudentService } from '../core/services/student.service';
import { DashboardStats } from '../core/models/report.model';
import { Exam } from '../core/models/exam.model';
import { Hall } from '../core/models/hall.model';
import { StudentSeatSearchResponse } from '../core/models/seating.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="dashboard">

      <!-- ========================================== -->
      <!-- 1. STUDENT VIEW: CANDIDATE EXAMINATION PORTAL -->
      <!-- ========================================== -->
      <div *ngIf="isStudent" class="student-portal">

        <!-- Student Welcome Hero Banner -->
        <div class="card border-0 shadow-sm text-white p-4 rounded-4 mb-4" style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);">
          <div class="row align-items-center">
            <div class="col-md-8">
              <span class="badge bg-white text-primary px-3 py-1 rounded-pill fw-semibold mb-2 shadow-sm">
                <i class="bi bi-mortarboard-fill me-1"></i> Candidate Examination Portal
              </span>
              <h3 class="fw-bold mb-1">Welcome, {{ currentUser?.username }}!</h3>
              <p class="mb-0 text-white-50">View your active examination timetables, locate assigned hall &amp; seat numbers, and print your admission slips.</p>
            </div>
            <div class="col-md-4 text-md-end mt-3 mt-md-0">
              <a routerLink="/seating/search" class="btn btn-light rounded-pill px-4 shadow-sm fw-semibold text-primary">
                <i class="bi bi-search me-1"></i> Public Seat Locator
              </a>
            </div>
          </div>
        </div>

        <!-- Student Quick-Action Cards -->
        <div class="row g-3 mb-4">
          <!-- My Exams -->
          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 h-100 card-clickable" (click)="navigate('/exams')">
              <div class="d-flex flex-column align-items-center text-center h-100 gap-2 py-1">
                <div class="icon-circle bg-danger bg-opacity-10 text-danger">
                  <i class="bi bi-calendar-check fs-4"></i>
                </div>
                <div>
                  <div class="fw-bold text-dark">My Exams</div>
                  <div class="text-muted small">{{ studentExams.length }} Scheduled</div>
                </div>
                <span class="mt-auto text-primary small fw-semibold">View Schedule →</span>
              </div>
            </div>
          </div>

          <!-- My Hall -->
          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 h-100 card-clickable" (click)="navigate('/halls')">
              <div class="d-flex flex-column align-items-center text-center h-100 gap-2 py-1">
                <div class="icon-circle bg-success bg-opacity-10 text-success">
                  <i class="bi bi-building fs-4"></i>
                </div>
                <div>
                  <div class="fw-bold text-dark">Exam Halls</div>
                  <div class="text-muted small">{{ studentHalls.length }} Configured</div>
                </div>
                <span class="mt-auto text-primary small fw-semibold">View Halls →</span>
              </div>
            </div>
          </div>

          <!-- Seating Arrangement -->
          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 h-100 card-clickable" (click)="navigate('/seating/arrangement')">
              <div class="d-flex flex-column align-items-center text-center h-100 gap-2 py-1">
                <div class="icon-circle bg-primary bg-opacity-10 text-primary">
                  <i class="bi bi-grid-3x3-gap fs-4"></i>
                </div>
                <div>
                  <div class="fw-bold text-dark">Seating Plan</div>
                  <div class="text-muted small">View arrangement grid</div>
                </div>
                <span class="mt-auto text-primary small fw-semibold">View Grid →</span>
              </div>
            </div>
          </div>

          <!-- My Seat (scrolls to finder, highlights result if found) -->
          <div class="col-6 col-md-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 h-100 card-clickable"
                 [class.border]="seatResult"
                 [class.border-success]="seatResult"
                 (click)="scrollToFinder()">
              <div class="d-flex flex-column align-items-center text-center h-100 gap-2 py-1">
                <div class="icon-circle bg-warning bg-opacity-10 text-warning">
                  <i class="bi bi-geo-alt-fill fs-4"></i>
                </div>
                <div>
                  <div class="fw-bold text-dark">My Seat</div>
                  <div class="text-muted small" *ngIf="!seatResult">Locate your desk</div>
                  <div class="text-success small fw-bold" *ngIf="seatResult">Hall {{ seatResult.hall }} · Seat {{ seatResult.seat }}</div>
                </div>
                <span class="mt-auto text-primary small fw-semibold">Find Seat →</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Student Seat Quick-Finder Card -->
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4" #seatFinderCard>
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h5 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <i class="bi bi-geo-alt-fill text-primary"></i> Instant Hall &amp; Desk Finder
            </h5>
            <span class="text-muted small">Select an exam to retrieve your allocated desk</span>
          </div>

          <form (ngSubmit)="searchStudentSeat()">
            <div class="row g-3 align-items-end">
              <div class="col-md-5">
                <label class="form-label fw-semibold text-dark small">Select Examination</label>
                <select class="form-select bg-light" [(ngModel)]="studentSelectedExamId" name="studentExamId">
                  <option [ngValue]="null" disabled>-- Choose Examination --</option>
                  <option *ngFor="let ex of studentExams" [ngValue]="ex.id">
                    {{ ex.examName }} ({{ ex.subject }})
                  </option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label fw-semibold text-dark small">Register Number</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0"><i class="bi bi-person-badge"></i></span>
                  <input
                    type="text"
                    class="form-control bg-light border-start-0"
                    [(ngModel)]="studentRegisterNumber"
                    name="studentRegNo"
                    placeholder="e.g. 21CS001"
                    required
                  />
                </div>
              </div>

              <div class="col-md-3">
                <button
                  type="submit"
                  class="btn btn-primary w-100 rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                  [disabled]="!studentSelectedExamId || !studentRegisterNumber.trim() || isSeatSearching"
                >
                  <span *ngIf="isSeatSearching" class="spinner-border spinner-border-sm"></span>
                  <i *ngIf="!isSeatSearching" class="bi bi-search"></i>
                  <span>Locate My Seat</span>
                </button>
              </div>
            </div>
          </form>

          <!-- Search Feedback / Error Banner -->
          <div *ngIf="seatSearchError" class="alert alert-warning alert-dismissible fade show mt-3 mb-0 d-flex align-items-center gap-2" role="alert">
            <i class="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
            <div>{{ seatSearchError }}</div>
            <button type="button" class="btn-close" (click)="seatSearchError = ''"></button>
          </div>

          <!-- Retrieved Admission / Seat Card -->
          <div *ngIf="seatResult" class="card border border-primary border-opacity-25 bg-light rounded-4 overflow-hidden mt-4 shadow-sm">
            <div class="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
              <div>
                <span class="badge bg-white text-primary px-3 py-1 fw-bold rounded-pill mb-1">OFFICIAL ALLOCATION</span>
                <h6 class="fw-bold mb-0 text-white">Examination Seat &amp; Hall Details</h6>
              </div>
              <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-sm btn-light rounded-pill px-3 shadow-sm d-flex align-items-center gap-1"
                        (click)="downloadStudentAdmitCard()" [disabled]="isDownloadingAdmitCard">
                  <span *ngIf="isDownloadingAdmitCard" class="spinner-border spinner-border-sm text-danger"></span>
                  <i *ngIf="!isDownloadingAdmitCard" class="bi bi-file-earmark-pdf-fill text-danger"></i>
                  <span class="text-danger fw-semibold">
                    {{ isDownloadingAdmitCard ? 'Generating PDF...' : 'Download Admit Card (PDF)' }}
                  </span>
                </button>
                <button class="btn btn-sm btn-light rounded-pill px-3 shadow-sm d-flex align-items-center gap-1" (click)="printSlip()">
                  <i class="bi bi-printer-fill text-primary"></i>
                  <span class="text-primary fw-semibold">Print Slip</span>
                </button>
              </div>
            </div>

            <div class="card-body p-4">
              <div class="row g-3 align-items-center">
                <div class="col-md-6 border-end-md">
                  <div class="text-muted small text-uppercase fw-semibold">Candidate Name</div>
                  <h5 class="fw-bold text-dark mt-1 mb-2">{{ seatResult.studentName }}</h5>
                  <div class="mb-1"><span class="text-muted small">Register Number:</span> <span class="badge bg-primary bg-opacity-10 text-primary fw-bold">{{ seatResult.registerNumber }}</span></div>
                  <div><span class="text-muted small">Examination:</span> <strong class="text-dark">{{ seatResult.exam }}</strong></div>
                  <div><span class="text-muted small">Scheduled Date:</span> <span class="text-success fw-semibold">{{ seatResult.date }}</span></div>
                </div>

                <div class="col-md-6 text-center">
                  <span class="text-muted small text-uppercase fw-semibold d-block mb-1">Assigned Examination Hall</span>
                  <div class="display-6 fw-bold text-primary mb-2">Hall {{ seatResult.hall }}</div>
                  <div class="d-flex justify-content-center gap-2 flex-wrap">
                    <span class="badge bg-white text-dark border px-3 py-2 shadow-sm">Desk: <strong>{{ seatResult.seat }}</strong></span>
                    <span class="badge bg-white text-dark border px-3 py-2 shadow-sm">Row: <strong>{{ seatResult.row }}</strong></span>
                    <span class="badge bg-white text-dark border px-3 py-2 shadow-sm">Col: <strong>{{ seatResult.column }}</strong></span>
                  </div>
                </div>
              </div>

              <!-- Interactive 2D Hall Floor Map & Desk Locator -->
              <div class="mt-4 pt-4 border-top">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h6 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <i class="bi bi-map-fill text-primary"></i> Interactive 2D Hall Floor Plan &amp; Seat Locator
                    </h6>
                    <span class="small text-muted">Top-down classroom layout • Whiteboard orientation</span>
                  </div>
                  <span class="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-semibold">
                    <i class="bi bi-geo-alt-fill me-1"></i> Row {{ seatResult.row }}, Column {{ seatResult.column }}
                  </span>
                </div>

                <div class="bg-white rounded-4 p-4 border shadow-sm">
                  <!-- Front Whiteboard / Screen -->
                  <div class="text-center mb-4">
                    <div class="d-inline-block px-5 py-2 bg-dark text-white rounded-pill small fw-bold shadow-sm">
                      <i class="bi bi-easel2-fill me-2 text-warning"></i> FRONT OF HALL / INSTRUCTOR DESK
                    </div>
                  </div>

                  <!-- Desk Matrix Layout -->
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

                  <!-- Hall Entrance & Legend -->
                  <div class="d-flex flex-wrap justify-content-between align-items-center mt-4 pt-3 border-top small text-secondary gap-2">
                    <div class="d-flex align-items-center gap-2">
                      <span class="badge bg-secondary px-3 py-1 rounded-pill"><i class="bi bi-door-open-fill me-1"></i> ENTRANCE</span>
                      <span>Hall {{ seatResult.hall }} Main Doorway</span>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                      <span><span class="legend-dot bg-success"></span> Your Allocated Seat</span>
                      <span><span class="legend-dot bg-secondary-subtle"></span> Other Seat</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Student Timetable & Halls Section -->
        <div class="row g-4">
          <!-- Exam Timetable -->
          <div class="col-lg-7">
            <div class="card shadow-sm border-0 rounded-4 h-100">
              <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
                <h5 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <i class="bi bi-calendar3 text-primary"></i> Examination Timetable
                </h5>
                <span class="badge bg-primary bg-opacity-10 text-primary">{{ studentExams.length }} Scheduled</span>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table align-middle mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>Exam Name</th>
                        <th>Subject Code</th>
                        <th>Date</th>
                        <th>Session Timing</th>
                        <th class="text-end">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let ex of studentExams">
                        <td class="fw-semibold text-dark">{{ ex.examName }}</td>
                        <td><span class="badge bg-secondary bg-opacity-10 text-secondary">{{ ex.subject }}</span></td>
                        <td><i class="bi bi-calendar-event me-1 text-muted"></i>{{ ex.examDate }}</td>
                        <td><i class="bi bi-clock me-1 text-muted"></i>{{ ex.startTime }} - {{ ex.endTime }}</td>
                        <td class="text-end">
                          <button class="btn btn-sm btn-outline-primary rounded-pill px-3" (click)="quickCheckExam(ex.id)">
                            Check Seat
                          </button>
                        </td>
                      </tr>
                      <tr *ngIf="studentExams.length === 0">
                        <td colspan="5" class="text-center py-4 text-muted">No scheduled examinations found.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Examination Halls Directory -->
          <div class="col-lg-5">
            <div class="card shadow-sm border-0 rounded-4 h-100">
              <div class="card-header bg-white py-3">
                <h5 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <i class="bi bi-building text-info"></i> Campus Examination Halls
                </h5>
              </div>
              <div class="card-body p-3">
                <div *ngIf="studentHalls.length === 0" class="text-center text-muted py-4">
                  No examination halls configured.
                </div>
                <div class="list-group list-group-flush">
                  <div *ngFor="let hall of studentHalls"
                       class="list-group-item list-group-item-action px-0 d-flex justify-content-between align-items-center"
                       style="cursor:pointer"
                       (click)="navigate('/halls/view/' + hall.id)">
                    <div>
                      <div class="fw-bold text-dark">Hall {{ hall.hallNumber }}</div>
                      <div class="text-muted small"><i class="bi bi-geo-alt me-1"></i>{{ hall.building }} &bull; Floor {{ hall.floor }}</div>
                    </div>
                    <span class="badge bg-light text-dark border rounded-pill px-3 py-2">
                      {{ hall.capacity }} Seats
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================== -->
      <!-- 2. ADMIN & FACULTY VIEW: EXECUTIVE DASHBOARD -->
      <!-- ========================================== -->
      <div *ngIf="!isStudent" class="admin-dashboard">
        <!-- Header -->
        <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h3 class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <i class="bi bi-speedometer2 text-primary"></i> Smart Examination Dashboard
            </h3>
            <p class="text-muted small mb-0">Live monitoring of candidates, hall capacities, seat allocations, and timetables.</p>
          </div>
          <div class="d-flex gap-2">
            <a *ngIf="isAdmin" routerLink="/seating/generate" class="btn btn-primary d-flex align-items-center gap-2 shadow-sm rounded-pill px-3">
              <i class="bi bi-magic"></i>
              <span>Generate Seating</span>
            </a>
            <a routerLink="/seating/search" class="btn btn-outline-secondary d-flex align-items-center gap-2 rounded-pill px-3">
              <i class="bi bi-search"></i>
              <span>Student Search</span>
            </a>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted small">Loading live metrics from Spring Boot...</p>
        </div>

        <!-- 7 KPI Statistics Cards (All Clickable) -->
        <div *ngIf="!loading && stats" class="row g-3 mb-3">

          <!-- 1. Total Students -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="card p-3 border-0 border-start border-4 border-primary shadow-sm h-100 card-clickable" (click)="navigate('/students')">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted small fw-semibold text-uppercase">Total Students</span>
                  <h3 class="fw-bold text-dark my-1">{{ stats.totalStudents }}</h3>
                  <span class="badge bg-primary bg-opacity-10 text-primary">Registered</span>
                </div>
                <div class="p-3 bg-primary bg-opacity-10 text-primary rounded-circle fs-4">
                  <i class="bi bi-people-fill"></i>
                </div>
              </div>
              <div class="mt-2 pt-2 border-top text-primary small fw-semibold d-flex align-items-center gap-1">
                <i class="bi bi-arrow-right-circle"></i> View Student Management
              </div>
            </div>
          </div>

          <!-- 2. Total Halls -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="card p-3 border-0 border-start border-4 border-info shadow-sm h-100 card-clickable" (click)="navigate('/halls')">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted small fw-semibold text-uppercase">Total Halls</span>
                  <h3 class="fw-bold text-dark my-1">{{ stats.totalHalls }}</h3>
                  <span class="badge bg-info bg-opacity-10 text-info">Configured</span>
                </div>
                <div class="p-3 bg-info bg-opacity-10 text-info rounded-circle fs-4">
                  <i class="bi bi-building-fill"></i>
                </div>
              </div>
              <div class="mt-2 pt-2 border-top text-primary small fw-semibold d-flex align-items-center gap-1">
                <i class="bi bi-arrow-right-circle"></i> View Hall Management
              </div>
            </div>
          </div>

          <!-- 3. Total Exams -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="card p-3 border-0 border-start border-4 border-danger shadow-sm h-100 card-clickable" (click)="navigate('/exams')">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted small fw-semibold text-uppercase">Total Exams</span>
                  <h3 class="fw-bold text-dark my-1">{{ stats.totalExams }}</h3>
                  <span class="badge bg-danger bg-opacity-10 text-danger">Scheduled</span>
                </div>
                <div class="p-3 bg-danger bg-opacity-10 text-danger rounded-circle fs-4">
                  <i class="bi bi-journal-check"></i>
                </div>
              </div>
              <div class="mt-2 pt-2 border-top text-primary small fw-semibold d-flex align-items-center gap-1">
                <i class="bi bi-arrow-right-circle"></i> View Exam Management
              </div>
            </div>
          </div>

          <!-- 4. Total Faculty (Admin only) -->
          <div class="col-12 col-sm-6 col-xl-3" *ngIf="isAdmin">
            <div class="card p-3 border-0 border-start border-4 border-secondary shadow-sm h-100 card-clickable" (click)="navigate('/faculty')">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted small fw-semibold text-uppercase">Total Faculty</span>
                  <h3 class="fw-bold text-dark my-1">{{ stats.totalFaculty }}</h3>
                  <span class="badge bg-secondary bg-opacity-10 text-secondary">Invigilators</span>
                </div>
                <div class="p-3 bg-secondary bg-opacity-10 text-secondary rounded-circle fs-4">
                  <i class="bi bi-person-badge-fill"></i>
                </div>
              </div>
              <div class="mt-2 pt-2 border-top text-primary small fw-semibold d-flex align-items-center gap-1">
                <i class="bi bi-arrow-right-circle"></i> View Faculty Management
              </div>
            </div>
          </div>

          <!-- 5. Available Seats -->
          <div class="col-12 col-sm-6 col-xl-4">
            <div class="card p-3 border-0 border-start border-4 border-success shadow-sm h-100 card-clickable" (click)="navigate('/halls')">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted small fw-semibold text-uppercase">Available Seats</span>
                  <h3 class="fw-bold text-success my-1">{{ stats.availableSeats }}</h3>
                  <span class="badge bg-success bg-opacity-10 text-success">Ready for Seating</span>
                </div>
                <div class="p-3 bg-success bg-opacity-10 text-success rounded-circle fs-4">
                  <i class="bi bi-check-circle-fill"></i>
                </div>
              </div>
              <div class="mt-2 pt-2 border-top text-primary small fw-semibold d-flex align-items-center gap-1">
                <i class="bi bi-arrow-right-circle"></i> View Halls &amp; Seats
              </div>
            </div>
          </div>

          <!-- 6. Occupied Seats -->
          <div class="col-12 col-sm-6 col-xl-4">
            <div class="card p-3 border-0 border-start border-4 border-warning shadow-sm h-100 card-clickable" (click)="navigate('/seating/arrangement')">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted small fw-semibold text-uppercase">Occupied Seats</span>
                  <h3 class="fw-bold text-warning my-1">{{ stats.occupiedSeats }}</h3>
                  <span class="badge bg-warning bg-opacity-10 text-warning">Allocated to Candidates</span>
                </div>
                <div class="p-3 bg-warning bg-opacity-10 text-warning rounded-circle fs-4">
                  <i class="bi bi-pie-chart-fill"></i>
                </div>
              </div>
              <div class="mt-2 pt-2 border-top text-primary small fw-semibold d-flex align-items-center gap-1">
                <i class="bi bi-arrow-right-circle"></i> View Seating Arrangement
              </div>
            </div>
          </div>

          <!-- 7. Upcoming Exams -->
          <div class="col-12 col-sm-12 col-xl-4">
            <div class="card p-3 border-0 border-start border-4 border-info shadow-sm h-100 card-clickable" (click)="navigate('/exams')">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <span class="text-muted small fw-semibold text-uppercase">Upcoming Exams</span>
                  <h3 class="fw-bold text-info my-1">{{ stats.upcomingExamsCount }}</h3>
                  <span class="badge bg-info bg-opacity-10 text-info">Future Timetables</span>
                </div>
                <div class="p-3 bg-info bg-opacity-10 text-info rounded-circle fs-4">
                  <i class="bi bi-calendar-event-fill"></i>
                </div>
              </div>
              <div class="mt-2 pt-2 border-top text-primary small fw-semibold d-flex align-items-center gap-1">
                <i class="bi bi-arrow-right-circle"></i> View All Exams
              </div>
            </div>
          </div>
        </div>

        <!-- ── Action Cards Row (Seating / Attendance / Reports / Invigilation / Faculty) ── -->
        <div *ngIf="!loading && stats" class="row g-3 mb-4">

          <!-- Seating Arrangements (Admin) -->
          <div class="col-12 col-md-6 col-xl-4" *ngIf="isAdmin">
            <div class="card border-0 shadow-sm rounded-4 p-4 h-100 card-clickable" (click)="navigate('/seating/generate')">
              <div class="d-flex align-items-start gap-3">
                <div class="action-icon bg-primary bg-opacity-10 text-primary">
                  <i class="bi bi-magic fs-3"></i>
                </div>
                <div class="flex-grow-1">
                  <h6 class="fw-bold text-dark mb-1">Seating Arrangements</h6>
                  <p class="text-muted small mb-2">Generate, view and manage student seat allocations for any exam.</p>
                  <span class="text-primary small fw-semibold d-flex align-items-center gap-1">
                    <i class="bi bi-arrow-right-circle"></i> Manage Seating
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- View Seating Grid (Faculty) -->
          <div class="col-12 col-md-6 col-xl-4" *ngIf="isFaculty">
            <div class="card border-0 shadow-sm rounded-4 p-4 h-100 card-clickable" (click)="navigate('/seating/arrangement')">
              <div class="d-flex align-items-start gap-3">
                <div class="action-icon bg-primary bg-opacity-10 text-primary">
                  <i class="bi bi-grid-3x3-gap fs-3"></i>
                </div>
                <div class="flex-grow-1">
                  <h6 class="fw-bold text-dark mb-1">Seating Arrangement</h6>
                  <p class="text-muted small mb-2">View seating grid for your assigned exam halls and students.</p>
                  <span class="text-primary small fw-semibold d-flex align-items-center gap-1">
                    <i class="bi bi-arrow-right-circle"></i> View Grid
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Attendance -->
          <div class="col-12 col-md-6 col-xl-4">
            <div class="card border-0 shadow-sm rounded-4 p-4 h-100 card-clickable" (click)="navigate('/attendance')">
              <div class="d-flex align-items-start gap-3">
                <div class="action-icon bg-success bg-opacity-10 text-success">
                  <i class="bi bi-person-check-fill fs-3"></i>
                </div>
                <div class="flex-grow-1">
                  <h6 class="fw-bold text-dark mb-1">Attendance</h6>
                  <p class="text-muted small mb-2">Mark and manage examination attendance records for candidates.</p>
                  <span class="text-primary small fw-semibold d-flex align-items-center gap-1">
                    <i class="bi bi-arrow-right-circle"></i> Manage Attendance
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Reports (Admin only) -->
          <div class="col-12 col-md-6 col-xl-4" *ngIf="isAdmin">
            <div class="card border-0 shadow-sm rounded-4 p-4 h-100 card-clickable" (click)="navigate('/reports')">
              <div class="d-flex align-items-start gap-3">
                <div class="action-icon bg-info bg-opacity-10 text-info">
                  <i class="bi bi-bar-chart-fill fs-3"></i>
                </div>
                <div class="flex-grow-1">
                  <h6 class="fw-bold text-dark mb-1">Reports</h6>
                  <p class="text-muted small mb-2">Generate seating, attendance and student reports with PDF export.</p>
                  <span class="text-primary small fw-semibold d-flex align-items-center gap-1">
                    <i class="bi bi-arrow-right-circle"></i> View Reports
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Hall Invigilation (Admin only) -->
          <div class="col-12 col-md-6 col-xl-4" *ngIf="isAdmin">
            <div class="card border-0 shadow-sm rounded-4 p-4 h-100 card-clickable" (click)="navigate('/faculty/assignments')">
              <div class="d-flex align-items-start gap-3">
                <div class="action-icon bg-warning bg-opacity-10 text-warning">
                  <i class="bi bi-person-check fs-3"></i>
                </div>
                <div class="flex-grow-1">
                  <h6 class="fw-bold text-dark mb-1">Hall Invigilation</h6>
                  <p class="text-muted small mb-2">Assign faculty members to exam halls for invigilation duties.</p>
                  <span class="text-primary small fw-semibold d-flex align-items-center gap-1">
                    <i class="bi bi-arrow-right-circle"></i> Manage Assignments
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Faculty Management (Admin only) -->
          <div class="col-12 col-md-6 col-xl-4" *ngIf="isAdmin">
            <div class="card border-0 shadow-sm rounded-4 p-4 h-100 card-clickable" (click)="navigate('/faculty')">
              <div class="d-flex align-items-start gap-3">
                <div class="action-icon bg-secondary bg-opacity-10 text-secondary">
                  <i class="bi bi-mortarboard-fill fs-3"></i>
                </div>
                <div class="flex-grow-1">
                  <h6 class="fw-bold text-dark mb-1">Faculty Management</h6>
                  <p class="text-muted small mb-2">Add, edit and manage faculty members and their profiles.</p>
                  <span class="text-primary small fw-semibold d-flex align-items-center gap-1">
                    <i class="bi bi-arrow-right-circle"></i> Manage Faculty
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Capacity & Occupancy Visualization Progress Bar -->
        <div *ngIf="!loading && stats" class="card shadow-sm border-0 mb-4 p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <i class="bi bi-bar-chart-line-fill text-primary"></i> Overall Seat Capacity &amp; Utilization
            </h6>
            <span class="badge bg-dark rounded-pill px-3 py-2">
              Total Capacity: {{ stats.totalSeats }} Seats
            </span>
          </div>
          <div class="progress mb-3" style="height: 14px;">
            <div class="progress-bar bg-warning" role="progressbar"
                 [style.width.%]="getOccupancyPercent()"
                 title="Occupied">
            </div>
            <div class="progress-bar bg-success" role="progressbar"
                 [style.width.%]="getAvailablePercent()"
                 title="Available">
            </div>
          </div>
          <div class="d-flex justify-content-between text-muted small">
            <div><i class="bi bi-circle-fill text-warning me-1"></i> Occupied: <strong>{{ stats.occupiedSeats }}</strong> ({{ getOccupancyPercent() }}%)</div>
            <div><i class="bi bi-circle-fill text-success me-1"></i> Available: <strong>{{ stats.availableSeats }}</strong> ({{ getAvailablePercent() }}%)</div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div *ngIf="!loading && stats" class="row g-4 mb-4">

          <!-- ===== UPCOMING EXAMINATIONS – Card Layout ===== -->
          <div class="col-lg-7">
            <div class="card border-0 h-100 upcoming-exams-card">
              <div class="card-header-custom d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-2">
                  <div class="section-icon-wrap bg-primary-soft">
                    <i class="bi bi-calendar3-event-fill text-primary"></i>
                  </div>
                  <div>
                    <div class="section-title">Upcoming Examinations</div>
                    <div class="section-sub">{{ stats.upcomingExams.length }} exam{{ stats.upcomingExams.length !== 1 ? 's' : '' }} scheduled</div>
                  </div>
                </div>
                <a routerLink="/exams" class="btn btn-sm btn-outline-primary rounded-pill px-3">View All</a>
              </div>

              <div class="card-body p-3">
                <!-- Empty State -->
                <div *ngIf="stats.upcomingExams.length === 0" class="empty-state">
                  <i class="bi bi-calendar-x fs-1 text-muted opacity-50"></i>
                  <p class="mt-2 text-muted mb-0">No upcoming exams scheduled yet.</p>
                </div>

                <!-- Exam Cards -->
                <div *ngFor="let exam of stats.upcomingExams; let i = index"
                     class="exam-card-row"
                     (click)="navigate('/seating/arrangement/' + exam.id)">

                  <!-- Left colored accent bar -->
                  <div class="exam-accent" [ngClass]="['accent-' + (i % 5)]"></div>

                  <!-- Exam Info -->
                  <div class="exam-card-body">
                    <div class="d-flex align-items-start justify-content-between gap-2 mb-2">
                      <div>
                        <div class="exam-title">{{ exam.title }}</div>
                        <span class="exam-code-badge">{{ exam.examCode }}</span>
                      </div>
                      <span class="exam-status-badge">
                        <i class="bi bi-circle-fill me-1" style="font-size:0.5rem"></i>SCHEDULED
                      </span>
                    </div>

                    <div class="exam-meta-row">
                      <div class="exam-meta-item">
                        <i class="bi bi-calendar-event text-primary"></i>
                        <span>{{ exam.examDate }}</span>
                      </div>
                      <div class="exam-meta-item">
                        <i class="bi bi-clock text-warning"></i>
                        <span>{{ exam.startTime }} – {{ exam.endTime }}</span>
                      </div>
                      <div class="exam-meta-item">
                        <i class="bi bi-people-fill text-success"></i>
                        <span><strong>{{ exam.assignedStudents }}</strong> candidates</span>
                      </div>
                    </div>
                  </div>

                  <!-- Action -->
                  <div class="exam-card-action" (click)="$event.stopPropagation()">
                    <a [routerLink]="['/seating/arrangement', exam.id]"
                       class="btn btn-sm btn-primary rounded-pill px-3">
                      <i class="bi bi-grid-3x3-gap-fill me-1"></i>Seating
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ===== BRANCH DISTRIBUTION – Multi-color vibrant bars ===== -->
          <div class="col-lg-5">
            <div class="card border-0 h-100 branch-dist-card">
              <div class="card-header-custom d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-2">
                  <div class="section-icon-wrap bg-info-soft">
                    <i class="bi bi-bar-chart-line-fill text-info"></i>
                  </div>
                  <div>
                    <div class="section-title">Branch Distribution</div>
                    <div class="section-sub">{{ stats.totalStudents }} total candidates</div>
                  </div>
                </div>
              </div>

              <div class="card-body p-3">
                <!-- Empty state -->
                <div *ngIf="getBranchKeys().length === 0" class="empty-state">
                  <i class="bi bi-people fs-1 text-muted opacity-50"></i>
                  <p class="mt-2 text-muted mb-0">No students enrolled yet.</p>
                </div>

                <!-- Branch Bars -->
                <div class="branch-list">
                  <div *ngFor="let branch of getBranchKeys(); let i = index" class="branch-item">
                    <div class="branch-header">
                      <div class="branch-label-wrap">
                        <span class="branch-dot" [ngClass]="['dot-' + (i % 8)]"></span>
                        <span class="branch-name">{{ branch }}</span>
                      </div>
                      <div class="branch-right">
                        <span class="branch-count">{{ stats.branchDistribution[branch] }}</span>
                        <span class="branch-pct">{{ getBranchPercent(stats.branchDistribution[branch]) }}%</span>
                      </div>
                    </div>
                    <div class="branch-bar-track">
                      <div class="branch-bar-fill"
                           [ngClass]="['bar-' + (i % 8)]"
                           [style.width.%]="getBranchPercent(stats.branchDistribution[branch])">
                        <span class="bar-tooltip">{{ stats.branchDistribution[branch] }} students ({{ getBranchPercent(stats.branchDistribution[branch]) }}%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Summary Footer -->
                <div *ngIf="getBranchKeys().length > 0" class="branch-summary-footer">
                  <div class="summary-stat">
                    <div class="summary-num">{{ getBranchKeys().length }}</div>
                    <div class="summary-label">Branches</div>
                  </div>
                  <div class="summary-divider"></div>
                  <div class="summary-stat">
                    <div class="summary-num">{{ stats.totalStudents }}</div>
                    <div class="summary-label">Students</div>
                  </div>
                  <div class="summary-divider"></div>
                  <div class="summary-stat">
                    <div class="summary-num">{{ stats.upcomingExamsCount }}</div>
                    <div class="summary-label">Exams Ahead</div>
                  </div>
                </div>

                <button class="btn btn-outline-primary btn-sm w-100 rounded-pill mt-3" (click)="navigate('/students')">
                  <i class="bi bi-people-fill me-1"></i>Manage All Students
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ====================== SHARED CARD STYLES ====================== */
    .card-clickable {
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }
    .card-clickable:hover {
      transform: translateY(-5px) scale(1.01);
      box-shadow: 0 16px 32px -8px rgba(15, 23, 42, 0.12), 0 4px 12px -2px rgba(79, 70, 229, 0.12) !important;
    }
    .row-clickable {
      cursor: pointer;
      transition: all 0.18s ease;
    }
    .row-clickable:hover {
      background-color: rgba(99, 102, 241, 0.06) !important;
      transform: translateX(3px);
    }

    /* ====================== CARD HEADER ====================== */
    .card-header-custom {
      padding: 1rem 1.25rem;
      background: #fff;
      border-bottom: 1px solid #f1f5f9;
      border-radius: 16px 16px 0 0;
    }
    .section-icon-wrap {
      width: 40px; height: 40px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.1rem; flex-shrink: 0;
    }
    .bg-primary-soft { background: rgba(99,102,241,0.1); }
    .bg-info-soft    { background: rgba(6,182,212,0.1); }
    .section-title { font-size: 0.95rem; font-weight: 800; color: #0f172a; line-height: 1.2; }
    .section-sub   { font-size: 0.72rem; color: #94a3b8; font-weight: 500; }

    /* ====================== UPCOMING EXAMS CARDS ====================== */
    .upcoming-exams-card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      overflow: hidden;
    }
    .empty-state {
      text-align: center;
      padding: 2.5rem 1rem;
    }
    .exam-card-row {
      display: flex;
      align-items: center;
      gap: 0;
      border: 1px solid #f1f5f9;
      border-radius: 12px;
      margin-bottom: 0.65rem;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s ease;
      background: #fff;
    }
    .exam-card-row:hover {
      border-color: #c7d2fe;
      box-shadow: 0 4px 16px rgba(99,102,241,0.12);
      transform: translateX(4px);
    }
    /* Left accent bars */
    .exam-accent {
      width: 5px; min-height: 80px; align-self: stretch; flex-shrink: 0;
    }
    .accent-0 { background: linear-gradient(180deg, #6366f1, #8b5cf6); }
    .accent-1 { background: linear-gradient(180deg, #f59e0b, #ef4444); }
    .accent-2 { background: linear-gradient(180deg, #10b981, #0891b2); }
    .accent-3 { background: linear-gradient(180deg, #ec4899, #f43f5e); }
    .accent-4 { background: linear-gradient(180deg, #3b82f6, #06b6d4); }

    .exam-card-body {
      flex: 1;
      padding: 0.75rem 0.9rem;
      min-width: 0;
    }
    .exam-title {
      font-size: 0.9rem; font-weight: 700; color: #1e293b;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .exam-code-badge {
      display: inline-block;
      font-size: 0.68rem; font-weight: 700;
      background: #f1f5f9; color: #64748b;
      border-radius: 6px; padding: 0.1rem 0.5rem;
      letter-spacing: 0.04em; margin-top: 0.2rem;
    }
    .exam-status-badge {
      display: inline-flex; align-items: center; white-space: nowrap;
      font-size: 0.65rem; font-weight: 800;
      background: #dcfce7; color: #16a34a;
      border-radius: 999px; padding: 0.2rem 0.65rem;
      letter-spacing: 0.05em;
    }
    .exam-meta-row {
      display: flex; flex-wrap: wrap; gap: 0.6rem;
      margin-top: 0.4rem;
    }
    .exam-meta-item {
      display: inline-flex; align-items: center; gap: 0.35rem;
      font-size: 0.78rem; color: #475569;
    }
    .exam-meta-item i { font-size: 0.85rem; }
    .exam-card-action {
      padding: 0.75rem 0.9rem;
      flex-shrink: 0;
    }

    /* ====================== BRANCH DISTRIBUTION ====================== */
    .branch-dist-card {
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
      overflow: hidden;
    }
    .branch-list {
      display: flex; flex-direction: column; gap: 0.7rem;
      max-height: 340px; overflow-y: auto;
      padding-right: 4px;
    }
    .branch-list::-webkit-scrollbar { width: 4px; }
    .branch-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
    .branch-item { }
    .branch-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 0.35rem;
    }
    .branch-label-wrap { display: flex; align-items: center; gap: 0.5rem; }
    .branch-dot {
      width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
    }
    /* 8 distinct colors */
    .dot-0 { background: #6366f1; }
    .dot-1 { background: #f59e0b; }
    .dot-2 { background: #10b981; }
    .dot-3 { background: #ec4899; }
    .dot-4 { background: #3b82f6; }
    .dot-5 { background: #ef4444; }
    .dot-6 { background: #8b5cf6; }
    .dot-7 { background: #06b6d4; }

    .branch-name { font-size: 0.82rem; font-weight: 700; color: #1e293b; }
    .branch-right { display: flex; align-items: center; gap: 0.5rem; }
    .branch-count {
      font-size: 0.82rem; font-weight: 800; color: #1e293b;
      background: #f8fafc; border: 1px solid #e2e8f0;
      border-radius: 6px; padding: 0.05rem 0.45rem;
    }
    .branch-pct { font-size: 0.72rem; font-weight: 700; color: #64748b; min-width: 34px; text-align: right; }

    .branch-bar-track {
      height: 10px;
      background: #f1f5f9;
      border-radius: 999px;
      overflow: visible;
      position: relative;
    }
    .branch-bar-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      min-width: 6px;
    }
    .branch-bar-fill:hover .bar-tooltip { display: block; }
    .bar-tooltip {
      display: none;
      position: absolute;
      top: -28px; left: 50%; transform: translateX(-50%);
      background: #1e293b; color: #fff;
      font-size: 0.68rem; white-space: nowrap;
      padding: 0.2rem 0.5rem; border-radius: 6px;
      z-index: 10;
    }
    /* Bar colors matching dots */
    .bar-0 { background: linear-gradient(90deg, #818cf8, #6366f1); }
    .bar-1 { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
    .bar-2 { background: linear-gradient(90deg, #34d399, #10b981); }
    .bar-3 { background: linear-gradient(90deg, #f472b6, #ec4899); }
    .bar-4 { background: linear-gradient(90deg, #60a5fa, #3b82f6); }
    .bar-5 { background: linear-gradient(90deg, #f87171, #ef4444); }
    .bar-6 { background: linear-gradient(90deg, #a78bfa, #8b5cf6); }
    .bar-7 { background: linear-gradient(90deg, #22d3ee, #06b6d4); }

    /* Summary footer */
    .branch-summary-footer {
      display: flex; align-items: center; justify-content: space-between;
      background: linear-gradient(135deg, #f8faff, #f0f4ff);
      border: 1px solid #e0e7ff;
      border-radius: 12px;
      padding: 0.75rem 1.25rem;
      margin-top: 0.85rem;
    }
    .summary-stat { text-align: center; }
    .summary-num { font-size: 1.2rem; font-weight: 900; color: #4f46e5; line-height: 1; }
    .summary-label { font-size: 0.68rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 0.15rem; }
    .summary-divider { width: 1px; height: 30px; background: #e0e7ff; }
    .icon-circle {
      width: 52px;
      height: 52px;
      border-radius: 0.95rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .card-clickable:hover .icon-circle {
      transform: scale(1.12) rotate(5deg);
    }
    .action-icon {
      width: 56px;
      height: 56px;
      border-radius: 1.1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .card-clickable:hover .action-icon {
      transform: scale(1.1) rotate(-4deg);
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
export class DashboardComponent implements OnInit {
  // Common
  currentUser: UserSession | null = null;
  isAdmin = false;
  isFaculty = false;
  isStudent = false;
  loading = true;

  // Admin/Faculty specific
  stats: DashboardStats | null = null;

  // Student specific
  studentExams: Exam[] = [];
  studentHalls: Hall[] = [];
  studentSelectedExamId: number | null = null;
  studentRegisterNumber = '';
  studentProfileId: number | null = null;
  seatResult: StudentSeatSearchResponse | null = null;
  isSeatSearching = false;
  isDownloadingAdmitCard = false;
  seatSearchError = '';

  @ViewChild('seatFinderCard') seatFinderCard!: ElementRef;

  constructor(
    private authService: AuthService,
    private reportService: ReportService,
    private examService: ExamService,
    private hallService: HallService,
    private seatingService: SeatingService,
    private studentService: StudentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.isAdmin = this.authService.isAdmin();
    this.isFaculty = this.authService.isFaculty();
    this.isStudent = this.authService.isStudent();

    if (this.isStudent) {
      this.initStudentPortal();
    } else {
      this.loadAdminData();
    }
  }

  navigate(path: string): void {
    this.router.navigateByUrl(path);
  }

  scrollToFinder(): void {
    if (this.seatFinderCard?.nativeElement) {
      this.seatFinderCard.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // --- Student Portal Logic ---
  private initStudentPortal(): void {
    this.loading = true;

    // Step 1: Fetch the real student profile (register number ≠ login username)
    this.studentService.getMyProfile().subscribe({
      next: (profileRes) => {
        const profile = profileRes.data;
        if (profile) {
          this.studentProfileId = profile.id;
          if (profile.registerNumber) {
            this.studentRegisterNumber = profile.registerNumber;
          } else {
            this.studentRegisterNumber = this.currentUser?.username || '';
          }
        }
        this.loadStudentExamsAndSearch();
      },
      error: () => {
        // Profile not linked — fallback gracefully
        this.studentRegisterNumber = this.currentUser?.username || '';
        this.loadStudentExamsAndSearch();
      }
    });

    this.hallService.getAllHalls().subscribe({
      next: (res) => { this.studentHalls = res.data || []; }
    });
  }

  private loadStudentExamsAndSearch(): void {
    this.examService.getAllExams().subscribe({
      next: (res) => {
        this.studentExams = res.data || [];
        if (this.studentExams.length > 0) {
          this.studentSelectedExamId = this.studentExams[0].id;
          if (this.studentRegisterNumber) {
            this.searchStudentSeat();
          }
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  quickCheckExam(examId: number): void {
    this.studentSelectedExamId = examId;
    this.searchStudentSeat();
  }

  searchStudentSeat(): void {
    if (!this.studentSelectedExamId || !this.studentRegisterNumber.trim()) {
      return;
    }

    this.isSeatSearching = true;
    this.seatSearchError = '';
    this.seatResult = null;

    this.seatingService.searchStudentSeat(this.studentRegisterNumber.trim(), this.studentSelectedExamId).subscribe({
      next: (res) => {
        this.isSeatSearching = false;
        this.seatResult = res.data || null;
      },
      error: (err) => {
        this.isSeatSearching = false;
        this.seatSearchError = err.error?.message || `No seat allocation found for Register Number "${this.studentRegisterNumber.trim()}". Seating may not be generated yet.`;
      }
    });
  }

  downloadStudentAdmitCard(): void {
    if (!this.studentSelectedExamId || !this.studentProfileId) return;
    this.isDownloadingAdmitCard = true;
    this.reportService.downloadAdmitCardPdf(this.studentSelectedExamId, this.studentProfileId).subscribe({
      next: (blob) => {
        this.isDownloadingAdmitCard = false;
        this.reportService.triggerFileDownload(blob, `admit-card-${this.studentRegisterNumber}-exam-${this.studentSelectedExamId}.pdf`);
      },
      error: () => {
        this.isDownloadingAdmitCard = false;
      }
    });
  }

  getHallGridRows(): { rowNumber: number; cols: { colNumber: number; seatNumber: string; isUserSeat: boolean }[] }[] {
    if (!this.seatResult) return [];
    const hall = this.studentHalls.find(h => h.hallNumber === this.seatResult?.hall);
    const numRows = hall?.rowsCount || Math.max(Number(this.seatResult.hallRows) || Number(this.seatResult.row) || 5, 5);
    const numCols = hall?.columnsCount || Math.max(Number(this.seatResult.hallColumns) || Number(this.seatResult.column) || 3, 3);

    const rows = [];
    for (let r = 1; r <= numRows; r++) {
      const cols = [];
      for (let c = 1; c <= numCols; c++) {
        const seatNum = `R${r}-C${c}`;
        const isUserSeat = (r === Number(this.seatResult.row) && c === Number(this.seatResult.column)) ||
                           (this.seatResult.seat === seatNum);
        cols.push({ colNumber: c, seatNumber: seatNum, isUserSeat });
      }
      rows.push({ rowNumber: r, cols });
    }
    return rows;
  }

  printSlip(): void {
    window.print();
  }

  // --- Admin/Faculty Portal Logic ---
  private loadAdminData(): void {
    this.loading = true;
    this.reportService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getOccupancyPercent(): number {
    if (!this.stats || this.stats.totalSeats === 0) return 0;
    return Math.round((this.stats.occupiedSeats / this.stats.totalSeats) * 100);
  }

  getAvailablePercent(): number {
    if (!this.stats || this.stats.totalSeats === 0) return 0;
    return Math.round((this.stats.availableSeats / this.stats.totalSeats) * 100);
  }

  getBranchKeys(): string[] {
    if (!this.stats || !this.stats.branchDistribution) return [];
    return Object.keys(this.stats.branchDistribution).sort();
  }

  getBranchPercent(count: number): number {
    if (!this.stats || this.stats.totalStudents === 0) return 0;
    return Math.round((count / this.stats.totalStudents) * 100);
  }
}
