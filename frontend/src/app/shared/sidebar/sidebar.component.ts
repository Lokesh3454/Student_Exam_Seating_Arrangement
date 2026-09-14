import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, UserSession } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="sidebar p-3 d-flex flex-column">
      <!-- Role Badge Header in Sidebar -->
      <div class="p-2 mb-3 rounded-3 d-flex align-items-center gap-2 user-chip" *ngIf="user">
        <div class="user-chip-icon shadow-sm" [ngClass]="getRoleChipBg()">
          <i class="bi" [ngClass]="getRoleIcon()"></i>
        </div>
        <div class="overflow-hidden flex-grow-1">
          <div class="fw-bold text-white text-truncate small">{{ user.username }}</div>
          <span class="badge py-1 px-2 mt-1" [ngClass]="getRoleBadgeClass()">{{ user.role }}</span>
        </div>
      </div>

      <div class="sidebar-nav-scroll flex-grow-1">
        <!-- HOD Department Portal Section (Admin & HOD) -->
        <div *ngIf="isHod || isAdmin" class="mb-3">
          <div class="nav-section-title text-uppercase fw-bold mb-2 px-2 d-flex align-items-center gap-2">
            <span class="section-dot bg-warning"></span>
            <span>Department Head</span>
          </div>
          <ul class="nav nav-pills flex-column gap-1">
            <li class="nav-item">
              <a routerLink="/hod/portal" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2">
                <i class="bi bi-briefcase-fill text-amber-soft fs-5"></i>
                <span>HOD Portal</span>
                <span class="badge bg-warning text-dark ms-auto fw-bold" *ngIf="isHod && user?.department">{{ user?.department }}</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Core Management Section (Admin, Faculty, HOD) -->
        <div *ngIf="isAdmin || isFaculty || isHod" class="mb-3">
          <div class="nav-section-title text-uppercase fw-bold mb-2 px-2 d-flex align-items-center gap-2">
            <span class="section-dot bg-primary"></span>
            <span>Core Management</span>
          </div>
          <ul class="nav nav-pills flex-column gap-1">
            <li class="nav-item">
              <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link d-flex align-items-center gap-2">
                <i class="bi bi-speedometer2 text-primary-soft fs-5"></i>
                <span>Dashboard</span>
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/students" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2">
                <i class="bi bi-people text-info-soft fs-5"></i>
                <span>Students</span>
              </a>
            </li>
            <li class="nav-item" *ngIf="isAdmin">
              <a routerLink="/faculty" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link d-flex align-items-center gap-2">
                <i class="bi bi-person-badge text-warning-soft fs-5"></i>
                <span>Faculty</span>
              </a>
            </li>
            <li class="nav-item" *ngIf="isAdmin">
              <a routerLink="/faculty/assignments" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2">
                <i class="bi bi-person-check text-amber-soft fs-5"></i>
                <span>Hall Invigilation</span>
              </a>
            </li>
            <li class="nav-item" *ngIf="isFaculty">
              <a routerLink="/faculty/dashboard" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2">
                <i class="bi bi-mortarboard-fill text-warning-soft fs-5"></i>
                <span>My Duty Dashboard</span>
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/halls" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2">
                <i class="bi bi-building text-success-soft fs-5"></i>
                <span>Halls & Seats</span>
              </a>
            </li>
            <li class="nav-item" *ngIf="isAdmin">
              <a routerLink="/exams" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2">
                <i class="bi bi-calendar-event text-danger-soft fs-5"></i>
                <span>Exams</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Student Candidate Portal Section -->
        <div *ngIf="isStudent" class="mb-3">
          <div class="nav-section-title text-uppercase fw-bold mb-2 px-2 d-flex align-items-center gap-2">
            <span class="section-dot bg-cyan"></span>
            <span>Candidate Portal</span>
          </div>
          <ul class="nav nav-pills flex-column gap-1">
            <li class="nav-item">
              <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link d-flex align-items-center gap-2">
                <i class="bi bi-speedometer2 text-primary-soft fs-5"></i>
                <span>My Dashboard</span>
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/exams" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2">
                <i class="bi bi-calendar-check text-danger-soft fs-5"></i>
                <span>Exam Timetable</span>
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/halls" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2">
                <i class="bi bi-building text-success-soft fs-5"></i>
                <span>Hall Details</span>
              </a>
            </li>
          </ul>
        </div>

        <div class="sidebar-divider my-2"></div>

        <!-- Seating Automation -->
        <div class="mb-3">
          <div class="nav-section-title text-uppercase fw-bold mb-2 px-2 d-flex align-items-center gap-2">
            <span class="section-dot bg-purple"></span>
            <span>Seating & Allocation</span>
          </div>
          <ul class="nav nav-pills flex-column gap-1">
            <li class="nav-item" *ngIf="isAdmin">
              <a routerLink="/seating/generate" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2">
                <i class="bi bi-magic text-purple-soft fs-5"></i>
                <span>Generate Seating</span>
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/seating/arrangement" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2">
                <i class="bi bi-grid-3x3-gap text-primary-soft fs-5"></i>
                <span>Seating Grid</span>
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/seating/search" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2">
                <i class="bi bi-compass text-info-soft fs-5"></i>
                <span>Student Seat Finder</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Operations (Admin, Faculty, HOD) -->
        <div *ngIf="isAdmin || isFaculty || isHod" class="mb-3">
          <div class="sidebar-divider my-2"></div>
          <div class="nav-section-title text-uppercase fw-bold mb-2 px-2 d-flex align-items-center gap-2">
            <span class="section-dot bg-emerald"></span>
            <span>Operations</span>
          </div>
          <ul class="nav nav-pills flex-column gap-1">
            <li class="nav-item">
              <a routerLink="/attendance" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2">
                <i class="bi bi-check2-circle text-success-soft fs-5"></i>
                <span>Attendance</span>
              </a>
            </li>
            <li class="nav-item">
              <a routerLink="/incidents" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2">
                <i class="bi bi-shield-exclamation text-danger-soft fs-5"></i>
                <span>Malpractice Incidents</span>
              </a>
            </li>
            <li class="nav-item" *ngIf="isAdmin">
              <a routerLink="/reports" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2">
                <i class="bi bi-bar-chart text-info-soft fs-5"></i>
                <span>Reports</span>
              </a>
            </li>
            <li class="nav-item" *ngIf="isAdmin">
              <a routerLink="/audit-logs" routerLinkActive="active" class="nav-link d-flex align-items-center gap-2">
                <i class="bi bi-clock-history text-purple-soft fs-5"></i>
                <span>System Audit Logs</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }

    .sidebar {
      width: 260px;
      height: 100%;
      background: linear-gradient(180deg, #090d16 0%, #0f172a 45%, #121c38 85%, #0a0e1a 100%);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 4px 0 28px rgba(0, 0, 0, 0.35);
      overflow-y: auto;
      overflow-x: hidden;
      user-select: none;
    }

    /* Custom Sleek Scrollbar for Sidebar */
    .sidebar::-webkit-scrollbar {
      width: 5px;
    }
    .sidebar::-webkit-scrollbar-track {
      background: transparent;
    }
    .sidebar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 999px;
    }
    .sidebar::-webkit-scrollbar-thumb:hover {
      background: rgba(99, 102, 241, 0.5);
    }

    .user-chip {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      transition: all 0.25s ease;
    }
    .user-chip:hover {
      background: rgba(255, 255, 255, 0.1);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      border-color: rgba(99, 102, 241, 0.35);
    }

    .user-chip-icon {
      width: 38px;
      height: 38px;
      border-radius: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
    }

    .nav-section-title {
      font-size: 0.68rem;
      letter-spacing: 0.1em;
      color: #818cf8;
      font-weight: 700;
    }

    .section-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      box-shadow: 0 0 8px currentColor;
    }
    .bg-cyan { background-color: #06b6d4; }
    .bg-purple { background-color: #a855f7; }
    .bg-emerald { background-color: #10b981; }

    .sidebar-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08) 20%, rgba(255, 255, 255, 0.08) 80%, transparent);
    }

    .nav-link {
      font-size: 0.88rem;
      font-weight: 500;
      border-radius: 0.65rem;
      padding: 0.62rem 0.85rem;
      color: #cbd5e1;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff !important;
      transform: translateX(4px);
    }

    .nav-link.active {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 4px 18px rgba(99, 102, 241, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      transform: translateX(4px);
      font-weight: 600;
    }
    .nav-link.active i {
      color: #ffffff !important;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }

    /* Soft Icon Colors */
    .text-primary-soft { color: #818cf8; }
    .text-info-soft { color: #38bdf8; }
    .text-warning-soft { color: #fbbf24; }
    .text-amber-soft { color: #f59e0b; }
    .text-success-soft { color: #34d399; }
    .text-danger-soft { color: #f87171; }
    .text-purple-soft { color: #c084fc; }

    @media (max-width: 768px) {
      .sidebar {
        width: 100%;
        height: auto;
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  user: UserSession | null = null;
  isAdmin = false;
  isFaculty = false;
  isStudent = false;
  isHod = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => {
      this.user = u;
      this.isAdmin = this.authService.isAdmin();
      this.isFaculty = this.authService.isFaculty();
      this.isStudent = this.authService.isStudent();
      this.isHod = this.authService.isHod();
    });
  }

  getRoleBadgeClass(): string {
    switch (this.user?.role) {
      case 'ADMIN': return 'bg-danger text-white border border-danger-subtle';
      case 'FACULTY': return 'bg-warning text-dark border border-warning-subtle';
      case 'STUDENT': return 'bg-info text-dark border border-info-subtle';
      case 'HOD': return 'bg-warning text-dark border border-warning-subtle fw-bold';
      default: return 'bg-secondary text-white';
    }
  }

  getRoleChipBg(): string {
    switch (this.user?.role) {
      case 'ADMIN': return 'bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25';
      case 'FACULTY': return 'bg-warning bg-opacity-25 text-warning border border-warning border-opacity-25';
      case 'STUDENT': return 'bg-info bg-opacity-25 text-info border border-info border-opacity-25';
      case 'HOD': return 'bg-warning bg-opacity-25 text-warning border border-warning border-opacity-25';
      default: return 'bg-secondary bg-opacity-25 text-light';
    }
  }

  getRoleIcon(): string {
    switch (this.user?.role) {
      case 'ADMIN': return 'bi-shield-shaded';
      case 'FACULTY': return 'bi-mortarboard-fill';
      case 'STUDENT': return 'bi-person-badge-fill';
      case 'HOD': return 'bi-award-fill';
      default: return 'bi-person';
    }
  }
}
