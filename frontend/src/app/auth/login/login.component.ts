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
    <div class="login-wrapper d-flex align-items-center justify-content-center py-5 position-relative overflow-hidden">
      <!-- Ambient Background Glow Orbs -->
      <div class="ambient-orb ambient-orb-1"></div>
      <div class="ambient-orb ambient-orb-2"></div>
      <div class="ambient-orb ambient-orb-3"></div>

      <div class="container position-relative" style="z-index: 2;">
        <div class="row justify-content-center">
          <div class="col-md-7 col-lg-5 col-xl-4">
            <!-- Glass Login Card -->
            <div class="card shadow-2xl border-0 rounded-4 overflow-hidden glass-login-card fade-in">
              <!-- Top Header with Brand Gradient -->
              <div class="card-header text-center pt-4 pb-3 border-0 bg-transparent">
                <div class="brand-shield-wrapper mx-auto mb-3 shadow-glow">
                  <i class="bi bi-shield-lock-fill fs-2 text-white"></i>
                </div>
                <h3 class="fw-bold mb-1 text-dark tracking-tight brand-font">Welcome Back</h3>
                <p class="text-secondary small mb-0">Smart Examination & Seating Management</p>
              </div>

              <div class="card-body px-4 px-md-5 pt-2 pb-4">
                <!-- Error Banner -->
                <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show d-flex align-items-center gap-2 mb-4 border-0 rounded-3 shadow-sm" role="alert">
                  <i class="bi bi-exclamation-triangle-fill fs-5 text-danger"></i>
                  <div class="small fw-medium">{{ errorMessage }}</div>
                  <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
                </div>

                <!-- Quick Demo Accounts Shortcuts -->
                <div class="mb-4 p-3 quick-fill-box rounded-3">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <span class="text-secondary small fw-bold text-uppercase" style="font-size: 0.68rem; letter-spacing: 0.05em;">
                      <i class="bi bi-lightning-charge-fill text-warning me-1"></i> Quick Demo Fill:
                    </span>
                    <span class="badge bg-white text-muted border shadow-2xs" style="font-size: 0.62rem;">1-Click</span>
                  </div>
                  <div class="d-flex flex-wrap gap-2">
                    <button type="button" class="btn btn-demo-role btn-demo-admin flex-grow-1" (click)="fillCredentials('admin', 'admin123')">
                      <i class="bi bi-shield-fill"></i>
                      <span>Admin</span>
                    </button>
                    <button type="button" class="btn btn-demo-role btn-demo-faculty flex-grow-1" (click)="fillCredentials('faculty', 'faculty123')">
                      <i class="bi bi-mortarboard-fill"></i>
                      <span>Faculty</span>
                    </button>
                    <button type="button" class="btn btn-demo-role btn-demo-student flex-grow-1" (click)="fillCredentials('student', 'student123')">
                      <i class="bi bi-person-badge-fill"></i>
                      <span>Student</span>
                    </button>
                  </div>
                </div>

                <!-- Login Form -->
                <form (ngSubmit)="onSubmit()">
                  <div class="mb-3">
                    <label class="form-label small fw-semibold text-dark mb-1">Username / ID</label>
                    <div class="input-group modern-input-group">
                      <span class="input-group-text bg-white border-end-0 text-muted">
                        <i class="bi bi-person"></i>
                      </span>
                      <input
                        type="text"
                        class="form-control border-start-0"
                        [(ngModel)]="username"
                        name="username"
                        required
                        placeholder="e.g. admin or student"
                      />
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="form-label small fw-semibold text-dark mb-1">Password</label>
                    <div class="input-group modern-input-group">
                      <span class="input-group-text bg-white border-end-0 text-muted">
                        <i class="bi bi-key"></i>
                      </span>
                      <input
                        type="password"
                        class="form-control border-start-0"
                        [(ngModel)]="password"
                        name="password"
                        required
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    class="btn btn-primary w-100 py-2 rounded-pill fw-semibold shadow-md btn-login-submit"
                    [disabled]="!username || !password || isLoading"
                  >
                    <span *ngIf="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
                    <i *ngIf="!isLoading" class="bi bi-arrow-right-circle-fill fs-5"></i>
                    <span>{{ isLoading ? 'Signing in...' : 'Sign In to Dashboard' }}</span>
                  </button>
                </form>
              </div>

              <div class="card-footer border-0 text-center py-3 bg-light bg-opacity-50">
                <div class="small text-secondary">
                  Looking for your seat number?
                  <a routerLink="/seating/search" class="fw-bold text-primary text-decoration-none d-inline-flex align-items-center gap-1 mt-1 ms-1 hover-underline">
                    <span>Public Seat Finder</span>
                    <i class="bi bi-arrow-right"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: calc(100vh - 64px);
      background: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 40%),
                  radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 40%),
                  #f8fafc;
    }

    .ambient-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(70px);
      opacity: 0.6;
      pointer-events: none;
      animation: floatSlow 12s ease-in-out infinite alternate;
    }
    .ambient-orb-1 {
      width: 320px;
      height: 320px;
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.25), rgba(124, 58, 237, 0.25));
      top: -80px;
      left: 10%;
    }
    .ambient-orb-2 {
      width: 280px;
      height: 280px;
      background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(14, 165, 233, 0.2));
      bottom: -60px;
      right: 15%;
      animation-delay: -4s;
    }
    .ambient-orb-3 {
      width: 220px;
      height: 220px;
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15));
      top: 40%;
      right: 5%;
      animation-delay: -8s;
    }

    @keyframes floatSlow {
      0% { transform: translateY(0) scale(1); }
      50% { transform: translateY(20px) scale(1.05); }
      100% { transform: translateY(-15px) scale(0.95); }
    }

    .glass-login-card {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.8) !important;
      box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.6);
    }

    .brand-shield-wrapper {
      width: 64px;
      height: 64px;
      border-radius: 1.25rem;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(79, 70, 229, 0.4);
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .glass-login-card:hover .brand-shield-wrapper {
      transform: scale(1.06) rotate(4deg);
    }

    .quick-fill-box {
      background: rgba(241, 245, 249, 0.7);
      border: 1px solid rgba(226, 232, 240, 0.8);
      backdrop-filter: blur(6px);
    }

    .btn-demo-role {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.4rem 0.65rem;
      border-radius: 0.5rem;
      border: 1px solid transparent;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
    }
    .btn-demo-admin {
      background: rgba(239, 68, 68, 0.08);
      color: #dc2626;
      border-color: rgba(239, 68, 68, 0.2);
    }
    .btn-demo-admin:hover {
      background: #dc2626;
      color: #fff;
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(220, 38, 38, 0.25);
    }

    .btn-demo-faculty {
      background: rgba(245, 158, 11, 0.08);
      color: #b45309;
      border-color: rgba(245, 158, 11, 0.2);
    }
    .btn-demo-faculty:hover {
      background: #d97706;
      color: #fff;
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(217, 119, 6, 0.25);
    }

    .btn-demo-student {
      background: rgba(6, 182, 212, 0.08);
      color: #0369a1;
      border-color: rgba(6, 182, 212, 0.2);
    }
    .btn-demo-student:hover {
      background: #0284c7;
      color: #fff;
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(2, 132, 199, 0.25);
    }

    .modern-input-group .input-group-text {
      background: #ffffff !important;
      border-color: rgba(203, 213, 225, 0.8);
      border-top-left-radius: 0.65rem;
      border-bottom-left-radius: 0.65rem;
    }
    .modern-input-group .form-control {
      background: #ffffff !important;
      border-color: rgba(203, 213, 225, 0.8);
      border-top-right-radius: 0.65rem;
      border-bottom-right-radius: 0.65rem;
    }
    .modern-input-group .form-control:focus {
      border-color: #6366f1;
      box-shadow: none;
    }
    .modern-input-group:focus-within {
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
      border-radius: 0.65rem;
    }
    .modern-input-group:focus-within .input-group-text,
    .modern-input-group:focus-within .form-control {
      border-color: #6366f1;
    }

    .btn-login-submit {
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .btn-login-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 24px -4px rgba(79, 70, 229, 0.45);
    }

    .hover-underline:hover {
      text-decoration: underline !important;
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
