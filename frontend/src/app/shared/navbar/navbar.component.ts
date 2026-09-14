import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg px-3 py-2 glass-navbar">
      <div class="container-fluid">
        <!-- Brand Logo -->
        <a class="navbar-brand d-flex align-items-center gap-2 text-decoration-none" routerLink="/dashboard">
          <div class="brand-logo-icon shadow-glow">
            <i class="bi bi-grid-3x3-gap-fill text-white fs-5"></i>
          </div>
          <div class="d-flex flex-column">
            <div class="d-flex align-items-center gap-2">
              <span class="fs-5 fw-bold brand-title tracking-tight brand-font">SmartSeating</span>
              <span class="badge brand-pill-badge d-none d-sm-inline">PORTAL</span>
            </div>
            <span class="text-indigo-subtle" style="font-size: 0.68rem; letter-spacing: 0.05em; margin-top: -3px;">INTELLIGENT EXAM SYSTEM</span>
          </div>
        </a>

        <!-- Right Side Nav Items -->
        <div class="d-flex align-items-center gap-2 ms-auto">
          <!-- Public Student Seat Locator Highlight Link -->
          <a routerLink="/seating/search" class="btn btn-finder btn-sm rounded-pill px-3 py-1 d-flex align-items-center gap-2">
            <i class="bi bi-compass text-cyan animate-pulse-subtle"></i>
            <span class="d-none d-md-inline fw-semibold">Seat Finder</span>
          </a>

          <!-- Sign In link if not logged in -->
          <a *ngIf="!currentUser" routerLink="/login" class="btn btn-primary btn-sm px-3 py-1 rounded-pill shadow-sm">
            <i class="bi bi-box-arrow-in-right me-1"></i> Sign In
          </a>

          <!-- User Role Badge & Profile Dropdown -->
          <div class="dropdown" *ngIf="currentUser">
            <button class="btn btn-user-profile btn-sm dropdown-toggle d-flex align-items-center gap-2 rounded-pill px-3 py-1 text-light border-0"
                    type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <div class="user-avatar-circle position-relative">
                <i class="bi bi-person-fill text-white"></i>
                <span class="online-status-dot"></span>
              </div>
              <div class="d-none d-sm-flex flex-column text-start" style="line-height: 1.15;">
                <div class="d-flex align-items-center gap-1">
                  <span class="fw-semibold text-capitalize text-white small">{{ currentUser.username }}</span>
                  <span class="badge bg-warning text-dark py-0 px-1 fw-bold" *ngIf="currentUser.department" style="font-size: 0.65rem;">{{ currentUser.department }}</span>
                </div>
                <span class="user-role-text">{{ currentUser.role }}</span>
              </div>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-xl border-0 mt-2 p-2 glass-dropdown">
              <li class="px-3 py-2 border-bottom border-light border-opacity-10 mb-1">
                <div class="text-white fw-semibold small text-capitalize">{{ currentUser.username }}</div>
                <div class="text-indigo-subtle" style="font-size: 0.72rem;">
                  Role: {{ currentUser.role }}
                  <span *ngIf="currentUser.department"> &bull; {{ currentUser.department }}</span>
                </div>
              </li>
              <li *ngIf="currentUser.role === 'HOD' || currentUser.role === 'ADMIN'">
                <a class="dropdown-item rounded-2 text-light py-2 d-flex align-items-center gap-2" routerLink="/hod/portal">
                  <i class="bi bi-briefcase text-warning"></i>
                  <span>HOD Portal</span>
                </a>
              </li>
              <li>
                <a class="dropdown-item rounded-2 text-light py-2 d-flex align-items-center gap-2" routerLink="/dashboard">
                  <i class="bi bi-speedometer2 text-primary"></i>
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <a class="dropdown-item rounded-2 text-light py-2 d-flex align-items-center gap-2" routerLink="/seating/search">
                  <i class="bi bi-search text-info"></i>
                  <span>Student Locator</span>
                </a>
              </li>
              <li><hr class="dropdown-divider border-light border-opacity-10 my-1"></li>
              <li>
                <button class="dropdown-item rounded-2 text-danger py-2 d-flex align-items-center gap-2" (click)="logout()">
                  <i class="bi bi-box-arrow-right"></i>
                  <span>Sign Out</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 64px;
      z-index: 1040;
    }

    .glass-navbar {
      height: 64px;
      background: linear-gradient(90deg, #090d16 0%, #0f172a 20%, #151d3b 50%, #0f172a 80%, #090d16 100%) !important;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(99, 102, 241, 0.28) !important;
      box-shadow: 0 4px 28px rgba(0, 0, 0, 0.4), 0 1px 12px rgba(99, 102, 241, 0.2) !important;
      transition: all 0.25s ease;
    }

    .brand-logo-icon {
      width: 38px;
      height: 38px;
      border-radius: 0.75rem;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 18px rgba(99, 102, 241, 0.6), 0 4px 10px rgba(0, 0, 0, 0.3);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .navbar-brand:hover .brand-logo-icon {
      transform: scale(1.08) rotate(6deg);
    }

    .brand-title {
      background: linear-gradient(135deg, #ffffff 40%, #c7d2fe 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 800;
    }

    .brand-pill-badge {
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.35), rgba(124, 58, 237, 0.35));
      color: #c7d2fe;
      border: 1px solid rgba(165, 180, 252, 0.3);
      font-size: 0.62rem;
      padding: 0.25em 0.6em;
      letter-spacing: 0.08em;
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.25);
    }

    .text-indigo-subtle {
      color: #94a3b8;
    }

    .text-cyan {
      color: #38bdf8 !important;
    }

    .btn-finder {
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.18) 0%, rgba(14, 165, 233, 0.28) 100%);
      border: 1.5px solid rgba(6, 182, 212, 0.55);
      color: #e0f2fe !important;
      box-shadow: 0 0 16px rgba(6, 182, 212, 0.32);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-finder:hover {
      background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%);
      color: #ffffff !important;
      border-color: transparent;
      box-shadow: 0 0 24px rgba(6, 182, 212, 0.65), 0 4px 12px rgba(0, 0, 0, 0.2);
      transform: translateY(-1px);
    }
    .btn-finder:hover .text-cyan {
      color: #ffffff !important;
    }

    .btn-user-profile {
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.14) !important;
      backdrop-filter: blur(10px);
      transition: all 0.25s ease;
    }
    .btn-user-profile:hover {
      background: rgba(255, 255, 255, 0.14);
      border-color: rgba(99, 102, 241, 0.5) !important;
      box-shadow: 0 0 18px rgba(79, 70, 229, 0.4);
    }

    .user-avatar-circle {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4f46e5, #06b6d4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      box-shadow: 0 0 10px rgba(79, 70, 229, 0.4);
    }

    .online-status-dot {
      position: absolute;
      bottom: -1px;
      right: -1px;
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #10b981;
      border: 2px solid #0f172a;
      box-shadow: 0 0 6px #10b981;
    }

    .user-role-text {
      font-size: 0.62rem;
      color: #a5b4fc;
      letter-spacing: 0.08em;
      font-weight: 700;
    }

    .glass-dropdown {
      background: rgba(15, 23, 42, 0.97);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(99, 102, 241, 0.25);
      box-shadow: 0 18px 36px -4px rgba(0, 0, 0, 0.5), 0 0 20px rgba(79, 70, 229, 0.25);
      min-width: 210px;
    }
    .glass-dropdown .dropdown-item:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    @keyframes pulseSubtle {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.75; transform: scale(1.08); }
    }
    .animate-pulse-subtle {
      animation: pulseSubtle 2.5s infinite ease-in-out;
    }
  `]
})
export class NavbarComponent {
  currentUser = this.authService.currentUserValue;

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => this.currentUser = user);
  }

  logout(): void {
    this.authService.logout();
  }
}
