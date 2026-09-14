import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-page">
      <!-- Left Panel: Background Image with Overlay Text -->
      <div class="login-hero" role="img" aria-label="University examination hall">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <div class="hero-badge">
            <i class="bi bi-mortarboard-fill me-2"></i>Smart Campus
          </div>
          <h1 class="hero-title">Intelligent Exam<br>Seating System</h1>
          <p class="hero-subtitle">Automated hall allocation, live attendance tracking, and comprehensive examination management — all in one platform.</p>
          <div class="hero-stats">
            <div class="stat-pill"><i class="bi bi-building me-1"></i>Multi-Hall</div>
            <div class="stat-pill"><i class="bi bi-people me-1"></i>All Roles</div>
            <div class="stat-pill"><i class="bi bi-shield-check me-1"></i>Secure JWT</div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Login Form -->
      <div class="login-form-panel">
        <div class="login-form-inner">
          <!-- Brand Logo -->
          <div class="brand-logo-wrap mb-4">
            <div class="brand-shield">
              <i class="bi bi-shield-lock-fill text-white fs-3"></i>
            </div>
            <div>
              <div class="brand-name">ExamSeat Pro</div>
              <div class="brand-sub">Secure Management Portal</div>
            </div>
          </div>

          <h2 class="login-title mb-1">Welcome Back 👋</h2>
          <p class="login-sub mb-4">Sign in to access your dashboard</p>

          <!-- Error Banner -->
          <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4 border-0 rounded-3" role="alert">
            <i class="bi bi-exclamation-triangle-fill text-danger"></i>
            <div class="small fw-medium">{{ errorMessage }}</div>
            <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
          </div>

          <!-- Quick Demo Shortcuts -->
          <div class="quick-fill-box mb-4">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="quick-fill-label"><i class="bi bi-lightning-charge-fill text-warning me-1"></i>Quick Demo Fill</span>
              <span class="badge-one-click">1-Click</span>
            </div>
            <div class="d-flex gap-2">
              <button type="button" class="demo-btn demo-admin flex-grow-1" (click)="fillCredentials('admin', 'admin123')">
                <i class="bi bi-shield-fill"></i> Admin
              </button>
              <button type="button" class="demo-btn demo-faculty flex-grow-1" (click)="fillCredentials('faculty', 'faculty123')">
                <i class="bi bi-mortarboard-fill"></i> Faculty
              </button>
              <button type="button" class="demo-btn demo-student flex-grow-1" (click)="fillCredentials('student', 'student123')">
                <i class="bi bi-person-badge-fill"></i> Student
              </button>
            </div>
          </div>

          <!-- Login Form -->
          <form (ngSubmit)="onSubmit()">
            <div class="form-group mb-3">
              <label class="form-label-custom">Username / ID</label>
              <div class="input-wrap">
                <i class="bi bi-person input-icon"></i>
                <input type="text" class="form-input" [(ngModel)]="username" name="username" required placeholder="e.g. admin or student" />
              </div>
            </div>
            <div class="form-group mb-4">
              <label class="form-label-custom">Password</label>
              <div class="input-wrap">
                <i class="bi bi-key input-icon"></i>
                <input type="password" class="form-input" [(ngModel)]="password" name="password" required placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" class="btn-signin" [disabled]="!username || !password || isLoading">
              <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
              <i *ngIf="!isLoading" class="bi bi-arrow-right-circle-fill me-2 fs-5"></i>
              {{ isLoading ? 'Signing in...' : 'Sign In to Dashboard' }}
            </button>
          </form>

          <div class="text-center mt-4">
            <span class="text-muted small">Looking for your seat?</span>
            <a routerLink="/seating/search" class="link-accent ms-1 small">Public Seat Finder →</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex;
      min-height: 100vh;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    /* ====== LEFT HERO PANEL ====== */
    .login-hero {
      flex: 1.2;
      position: relative;
      background: url('/assets/exam-hall-bg.jpg') center center / cover no-repeat;
      display: flex;
      align-items: flex-end;
      padding: 3rem;
      min-height: 100vh;
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        160deg,
        rgba(15, 23, 42, 0.35) 0%,
        rgba(30, 41, 59, 0.55) 40%,
        rgba(79, 70, 229, 0.75) 100%
      );
    }
    .hero-content {
      position: relative;
      z-index: 2;
      color: #fff;
      max-width: 520px;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.25);
      color: #e0e7ff;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.35rem 0.9rem;
      border-radius: 999px;
      letter-spacing: 0.04em;
      margin-bottom: 1.25rem;
    }
    .hero-title {
      font-size: clamp(2rem, 3.5vw, 2.8rem);
      font-weight: 800;
      line-height: 1.15;
      color: #fff;
      margin-bottom: 1rem;
      text-shadow: 0 2px 20px rgba(0,0,0,0.3);
    }
    .hero-subtitle {
      font-size: 1rem;
      color: rgba(255,255,255,0.82);
      line-height: 1.65;
      margin-bottom: 1.75rem;
    }
    .hero-stats {
      display: flex;
      gap: 0.65rem;
      flex-wrap: wrap;
    }
    .stat-pill {
      display: inline-flex;
      align-items: center;
      background: rgba(255,255,255,0.12);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(255,255,255,0.2);
      color: #fff;
      font-size: 0.78rem;
      font-weight: 600;
      padding: 0.3rem 0.8rem;
      border-radius: 999px;
    }

    /* ====== RIGHT FORM PANEL ====== */
    .login-form-panel {
      flex: 0 0 460px;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 2rem;
      box-shadow: -20px 0 60px rgba(0,0,0,0.08);
      overflow-y: auto;
    }
    .login-form-inner {
      width: 100%;
      max-width: 380px;
    }

    /* Brand */
    .brand-logo-wrap {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .brand-shield {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 20px rgba(79,70,229,0.4);
      flex-shrink: 0;
    }
    .brand-name {
      font-size: 1.15rem;
      font-weight: 800;
      color: #1e293b;
      line-height: 1.2;
    }
    .brand-sub {
      font-size: 0.72rem;
      color: #94a3b8;
      font-weight: 500;
    }

    /* Titles */
    .login-title {
      font-size: 1.65rem;
      font-weight: 800;
      color: #0f172a;
    }
    .login-sub {
      color: #64748b;
      font-size: 0.9rem;
    }

    /* Quick demo */
    .quick-fill-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 0.85rem 1rem;
    }
    .quick-fill-label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
    }
    .badge-one-click {
      font-size: 0.62rem;
      font-weight: 600;
      background: #fff;
      color: #94a3b8;
      border: 1px solid #e2e8f0;
      border-radius: 999px;
      padding: 0.1rem 0.6rem;
    }
    .demo-btn {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.45rem 0.6rem;
      border-radius: 8px;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
    }
    .demo-admin { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
    .demo-admin:hover { background: #dc2626; color: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(220,38,38,0.3); }
    .demo-faculty { background: #fffbeb; color: #d97706; border-color: #fde68a; }
    .demo-faculty:hover { background: #d97706; color: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(217,119,6,0.3); }
    .demo-student { background: #f0f9ff; color: #0284c7; border-color: #bae6fd; }
    .demo-student:hover { background: #0284c7; color: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(2,132,199,0.3); }

    /* Form inputs */
    .form-label-custom {
      font-size: 0.82rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.35rem;
      display: block;
    }
    .input-wrap {
      position: relative;
    }
    .input-icon {
      position: absolute;
      left: 0.9rem;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      font-size: 1rem;
      pointer-events: none;
    }
    .form-input {
      width: 100%;
      padding: 0.7rem 0.9rem 0.7rem 2.6rem;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.9rem;
      color: #1e293b;
      background: #fff;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      box-sizing: border-box;
    }
    .form-input:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
    }
    .form-input::placeholder { color: #cbd5e1; }

    /* Submit button */
    .btn-signin {
      width: 100%;
      padding: 0.8rem;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #fff;
      font-size: 0.95rem;
      font-weight: 700;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.25s ease;
      box-shadow: 0 6px 20px rgba(79, 70, 229, 0.35);
      letter-spacing: 0.01em;
    }
    .btn-signin:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(79, 70, 229, 0.45);
    }
    .btn-signin:disabled { opacity: 0.65; cursor: not-allowed; }

    .link-accent {
      color: #6366f1;
      font-weight: 600;
      text-decoration: none;
    }
    .link-accent:hover { text-decoration: underline; }

    /* Responsive: stack on mobile */
    @media (max-width: 768px) {
      .login-hero { display: none; }
      .login-form-panel {
        flex: 1;
        padding: 2rem 1.5rem;
        box-shadow: none;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  returnUrl = '/dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  fillCredentials(u: string, p: string): void {
    this.username = u;
    this.password = p;
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (!this.username || !this.password) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (user) => {
        this.isLoading = false;
        if (user.role === 'STUDENT') {
          this.router.navigate(['/dashboard']);
        } else if (user.role === 'FACULTY') {
          this.router.navigate(['/faculty/dashboard']);
        } else {
          this.router.navigateByUrl(this.returnUrl);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid username or password';
      }
    });
  }
}
