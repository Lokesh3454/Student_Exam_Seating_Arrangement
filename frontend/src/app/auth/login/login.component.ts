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
    <div class="login-root">

      <!-- ===== FULL-PAGE BACKGROUND ===== -->
      <div class="bg-layer"></div>
      <div class="bg-overlay"></div>

      <!-- Animated floating orbs -->
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="orb orb-4"></div>

      <!-- ===== CONTENT WRAPPER ===== -->
      <div class="page-content">

        <!-- LEFT COLUMN: Hero Info -->
        <div class="hero-col">
          <!-- Top Badge -->
          <div class="hero-badge-wrap">
            <span class="hero-badge"><i class="bi bi-mortarboard-fill me-2"></i>Smart University Platform</span>
          </div>

          <!-- Main Heading -->
          <h1 class="hero-heading">
            Intelligent<br/>
            <span class="gradient-text">Exam Seating</span><br/>
            Management
          </h1>
          <p class="hero-desc">
            Automated seat allocation, real-time attendance, secure JWT access control —
            all built for modern universities.
          </p>

          <!-- Feature Cards -->
          <div class="feature-cards">
            <div class="feat-card">
              <div class="feat-icon"><i class="bi bi-grid-3x3-gap-fill"></i></div>
              <div>
                <div class="feat-title">Smart Seating</div>
                <div class="feat-sub">Auto-assign seats by subject & branch</div>
              </div>
            </div>
            <div class="feat-card">
              <div class="feat-icon feat-icon-amber"><i class="bi bi-person-check-fill"></i></div>
              <div>
                <div class="feat-title">Attendance Tracking</div>
                <div class="feat-sub">Real-time present / absent monitoring</div>
              </div>
            </div>
            <div class="feat-card">
              <div class="feat-icon feat-icon-cyan"><i class="bi bi-shield-lock-fill"></i></div>
              <div>
                <div class="feat-title">Role-Based Access</div>
                <div class="feat-sub">Admin · Faculty · Student portals</div>
              </div>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="stats-row">
            <div class="stat-box">
              <div class="stat-num">500+</div>
              <div class="stat-label">Students</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-box">
              <div class="stat-num">30+</div>
              <div class="stat-label">Halls</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-box">
              <div class="stat-num">100%</div>
              <div class="stat-label">Automated</div>
            </div>
          </div>

          <!-- Campus image thumbnail -->
          <div class="campus-thumb">
            <img src="/assets/campus-bg.jpg" alt="University campus" class="campus-img" />
            <div class="campus-label"><i class="bi bi-geo-alt-fill me-1"></i>Smart Campus Network</div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Login Form Card -->
        <div class="form-col">
          <div class="login-card">

            <!-- Card Header Gradient Band -->
            <div class="card-top-band">
              <div class="brand-icon-wrap">
                <i class="bi bi-shield-lock-fill text-white"></i>
              </div>
              <div class="card-top-text">
                <div class="card-top-title">ExamSeat Pro</div>
                <div class="card-top-sub">Secure Management Portal</div>
              </div>
            </div>

            <!-- Card Body -->
            <div class="card-body-inner">
              <h2 class="form-title">Welcome Back 👋</h2>
              <p class="form-sub">Sign in to continue to your dashboard</p>

              <!-- Error Alert -->
              <div *ngIf="errorMessage" class="error-alert">
                <i class="bi bi-exclamation-circle-fill me-2"></i>
                <span>{{ errorMessage }}</span>
                <button class="error-close" (click)="errorMessage = ''"><i class="bi bi-x-lg"></i></button>
              </div>

              <!-- Quick Demo Fill -->
              <div class="demo-section">
                <div class="demo-header">
                  <span><i class="bi bi-lightning-charge-fill text-warning me-1"></i>Quick Login Demo</span>
                  <span class="demo-tag">1-Click Fill</span>
                </div>
                <div class="demo-btns">
                  <button class="demo-btn admin" (click)="fillCredentials('admin','admin123')">
                    <i class="bi bi-shield-fill"></i><span>Admin</span>
                  </button>
                  <button class="demo-btn faculty" (click)="fillCredentials('faculty','faculty123')">
                    <i class="bi bi-mortarboard-fill"></i><span>Faculty</span>
                  </button>
                  <button class="demo-btn student" (click)="fillCredentials('student','student123')">
                    <i class="bi bi-person-badge-fill"></i><span>Student</span>
                  </button>
                </div>
              </div>

              <!-- Login Form -->
              <form (ngSubmit)="onSubmit()" class="login-form">
                <div class="field-group">
                  <label class="field-label">Username / Student ID</label>
                  <div class="field-wrap">
                    <i class="bi bi-person-fill field-icon"></i>
                    <input type="text" class="field-input" [(ngModel)]="username" name="username"
                      required placeholder="admin, faculty, or student" />
                  </div>
                </div>

                <div class="field-group">
                  <label class="field-label">Password</label>
                  <div class="field-wrap">
                    <i class="bi bi-key-fill field-icon"></i>
                    <input type="password" class="field-input" [(ngModel)]="password" name="password"
                      required placeholder="••••••••" />
                  </div>
                </div>

                <button type="submit" class="signin-btn" [disabled]="!username || !password || isLoading">
                  <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  <i *ngIf="!isLoading" class="bi bi-box-arrow-in-right me-2 fs-5"></i>
                  {{ isLoading ? 'Authenticating...' : 'Sign In to Dashboard' }}
                </button>
              </form>

              <!-- Seating icon -->
              <div class="seating-preview">
                <img src="/assets/seating-icon.jpg" alt="Seat chart preview" class="seating-img" />
                <span class="seating-label">Live Seating Chart</span>
              </div>

              <!-- Footer link -->
              <div class="card-footer-link">
                <span class="text-muted">Looking for your seat number?</span>
                <a routerLink="/seating/search" class="seat-link">
                  <i class="bi bi-search me-1"></i>Public Seat Finder
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    /* =====================================================
       ROOT & BACKGROUND
    ===================================================== */
    :host {
      display: block;
    }
    .login-root {
      position: relative;
      min-height: 100vh;
      overflow: hidden;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .bg-layer {
      position: fixed;
      inset: 0;
      background: url('/assets/campus-bg.jpg') center center / cover no-repeat;
      z-index: 0;
    }
    .bg-overlay {
      position: fixed;
      inset: 0;
      background: linear-gradient(
        135deg,
        rgba(9, 9, 40, 0.88) 0%,
        rgba(30, 18, 80, 0.82) 40%,
        rgba(60, 10, 90, 0.78) 70%,
        rgba(15, 40, 100, 0.85) 100%
      );
      z-index: 1;
    }

    /* Floating animated orbs */
    .orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.45;
      pointer-events: none;
      z-index: 2;
    }
    .orb-1 {
      width: 500px; height: 500px;
      background: radial-gradient(circle, #7c3aed 0%, transparent 70%);
      top: -150px; left: -100px;
      animation: drift1 14s ease-in-out infinite alternate;
    }
    .orb-2 {
      width: 400px; height: 400px;
      background: radial-gradient(circle, #2563eb 0%, transparent 70%);
      bottom: -100px; right: -80px;
      animation: drift2 16s ease-in-out infinite alternate;
    }
    .orb-3 {
      width: 300px; height: 300px;
      background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
      top: 40%; left: 40%;
      animation: drift3 18s ease-in-out infinite alternate;
    }
    .orb-4 {
      width: 250px; height: 250px;
      background: radial-gradient(circle, #f59e0b 0%, transparent 70%);
      top: 10%; right: 30%;
      animation: drift1 20s ease-in-out infinite alternate;
    }
    @keyframes drift1 { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(60px,40px) scale(1.15)} }
    @keyframes drift2 { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(-50px,-30px) scale(1.1)} }
    @keyframes drift3 { 0%{transform:translate(0,0) scale(1)} 100%{transform:translate(30px,-50px) scale(0.9)} }

    /* =====================================================
       PAGE LAYOUT
    ===================================================== */
    .page-content {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      gap: 3.5rem;
      padding: 3rem 2rem;
      max-width: 1280px;
      margin: 0 auto;
    }

    /* =====================================================
       LEFT HERO COLUMN
    ===================================================== */
    .hero-col {
      flex: 1.1;
      max-width: 560px;
      color: #fff;
      animation: slideInLeft 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    @keyframes slideInLeft {
      from { opacity:0; transform:translateX(-40px); }
      to   { opacity:1; transform:translateX(0); }
    }

    .hero-badge-wrap { margin-bottom: 1.5rem; }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      background: rgba(255,255,255,0.12);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.22);
      color: #c4b5fd;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 0.45rem 1.1rem;
      border-radius: 999px;
      letter-spacing: 0.04em;
    }

    .hero-heading {
      font-size: clamp(2.2rem, 4vw, 3.2rem);
      font-weight: 900;
      line-height: 1.12;
      color: #fff;
      margin-bottom: 1.1rem;
      text-shadow: 0 4px 30px rgba(0,0,0,0.4);
    }
    .gradient-text {
      background: linear-gradient(90deg, #a78bfa 0%, #38bdf8 50%, #f9a8d4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-desc {
      font-size: 1rem;
      color: rgba(255,255,255,0.75);
      line-height: 1.7;
      margin-bottom: 2rem;
      max-width: 440px;
    }

    /* Feature cards */
    .feature-cards {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }
    .feat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(255,255,255,0.07);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 14px;
      padding: 0.9rem 1.2rem;
      transition: background 0.25s, transform 0.25s;
    }
    .feat-card:hover {
      background: rgba(255,255,255,0.12);
      transform: translateX(6px);
    }
    .feat-icon {
      width: 42px; height: 42px;
      border-radius: 10px;
      background: linear-gradient(135deg, #7c3aed, #4f46e5);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.2rem; color: #fff; flex-shrink: 0;
      box-shadow: 0 4px 14px rgba(124,58,237,0.4);
    }
    .feat-icon-amber { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 4px 14px rgba(245,158,11,0.4); }
    .feat-icon-cyan  { background: linear-gradient(135deg, #06b6d4, #0284c7); box-shadow: 0 4px 14px rgba(6,182,212,0.4); }
    .feat-title { font-size: 0.9rem; font-weight: 700; color: #fff; margin-bottom: 0.1rem; }
    .feat-sub   { font-size: 0.78rem; color: rgba(255,255,255,0.6); }

    /* Stats */
    .stats-row {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 1.75rem;
    }
    .stat-box { text-align: center; }
    .stat-num { font-size: 1.6rem; font-weight: 900; color: #a78bfa; line-height: 1; }
    .stat-label { font-size: 0.72rem; color: rgba(255,255,255,0.55); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 0.2rem; }
    .stat-divider { width: 1px; height: 36px; background: rgba(255,255,255,0.15); }

    /* Campus thumbnail */
    .campus-thumb {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.15);
      box-shadow: 0 20px 50px rgba(0,0,0,0.4);
    }
    .campus-img {
      width: 100%; height: 160px; object-fit: cover;
      display: block; filter: brightness(0.85);
      transition: transform 0.4s ease;
    }
    .campus-thumb:hover .campus-img { transform: scale(1.04); }
    .campus-label {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      padding: 0.6rem 1rem;
      background: linear-gradient(transparent, rgba(0,0,0,0.7));
      font-size: 0.8rem; font-weight: 600; color: #e0e7ff;
    }

    /* =====================================================
       RIGHT FORM COLUMN
    ===================================================== */
    .form-col {
      flex: 0 0 420px;
      animation: slideInRight 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
    }
    @keyframes slideInRight {
      from { opacity:0; transform:translateX(40px); }
      to   { opacity:1; transform:translateX(0); }
    }

    .login-card {
      background: rgba(255,255,255,0.96);
      border-radius: 24px;
      overflow: hidden;
      box-shadow:
        0 30px 70px rgba(0,0,0,0.35),
        0 0 0 1px rgba(255,255,255,0.15),
        inset 0 1px 0 rgba(255,255,255,0.9);
      backdrop-filter: blur(20px);
    }

    /* Card Top Gradient Band */
    .card-top-band {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%);
      padding: 1.4rem 1.75rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .brand-icon-wrap {
      width: 50px; height: 50px;
      border-radius: 14px;
      background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem;
      border: 1px solid rgba(255,255,255,0.3);
      flex-shrink: 0;
    }
    .card-top-title { font-size: 1.1rem; font-weight: 800; color: #fff; }
    .card-top-sub   { font-size: 0.75rem; color: rgba(255,255,255,0.75); }

    /* Card Body */
    .card-body-inner { padding: 1.75rem; }
    .form-title { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-bottom: 0.3rem; }
    .form-sub   { font-size: 0.85rem; color: #64748b; margin-bottom: 1.25rem; }

    /* Error */
    .error-alert {
      display: flex; align-items: center; gap: 0.5rem;
      background: #fef2f2; border: 1px solid #fecaca;
      border-radius: 10px; padding: 0.7rem 1rem;
      color: #dc2626; font-size: 0.85rem; margin-bottom: 1rem;
    }
    .error-close { margin-left: auto; background: none; border: none; color: #dc2626; cursor: pointer; }

    /* Demo Section */
    .demo-section {
      background: linear-gradient(135deg, #f8fafc, #f1f5f9);
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 0.9rem 1rem;
      margin-bottom: 1.25rem;
    }
    .demo-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 0.7rem;
      font-size: 0.75rem; font-weight: 700; color: #64748b;
      text-transform: uppercase; letter-spacing: 0.05em;
    }
    .demo-tag {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: #fff; font-size: 0.62rem; font-weight: 700;
      padding: 0.15rem 0.6rem; border-radius: 999px;
      letter-spacing: 0.04em;
    }
    .demo-btns { display: flex; gap: 0.5rem; }
    .demo-btn {
      flex: 1; padding: 0.5rem 0.4rem;
      border: 1.5px solid transparent;
      border-radius: 10px; font-size: 0.78rem; font-weight: 700;
      cursor: pointer; transition: all 0.2s ease;
      display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem;
    }
    .demo-btn.admin   { background:#fef2f2; color:#dc2626; border-color:#fecaca; }
    .demo-btn.admin:hover   { background:#dc2626; color:#fff; transform:translateY(-3px); box-shadow:0 6px 16px rgba(220,38,38,0.35); }
    .demo-btn.faculty { background:#fffbeb; color:#d97706; border-color:#fde68a; }
    .demo-btn.faculty:hover { background:#d97706; color:#fff; transform:translateY(-3px); box-shadow:0 6px 16px rgba(217,119,6,0.35); }
    .demo-btn.student { background:#f0f9ff; color:#0284c7; border-color:#bae6fd; }
    .demo-btn.student:hover { background:#0284c7; color:#fff; transform:translateY(-3px); box-shadow:0 6px 16px rgba(2,132,199,0.35); }

    /* Form Fields */
    .login-form { display: flex; flex-direction: column; gap: 0; }
    .field-group { margin-bottom: 1rem; }
    .field-label {
      display: block; font-size: 0.82rem; font-weight: 700;
      color: #374151; margin-bottom: 0.4rem;
    }
    .field-wrap { position: relative; }
    .field-icon {
      position: absolute; left: 0.9rem; top: 50%;
      transform: translateY(-50%);
      color: #94a3b8; font-size: 1rem; pointer-events: none;
    }
    .field-input {
      width: 100%;
      padding: 0.75rem 0.9rem 0.75rem 2.6rem;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      font-size: 0.9rem; color: #1e293b;
      background: #f8fafc;
      outline: none; transition: all 0.2s;
      box-sizing: border-box;
    }
    .field-input:focus {
      border-color: #6366f1;
      background: #fff;
      box-shadow: 0 0 0 4px rgba(99,102,241,0.15);
    }
    .field-input::placeholder { color: #cbd5e1; }

    /* Sign In Button */
    .signin-btn {
      width: 100%; margin-top: 0.5rem;
      padding: 0.85rem;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%);
      background-size: 200% 200%;
      color: #fff; font-size: 0.95rem; font-weight: 800;
      border: none; border-radius: 12px;
      cursor: pointer;
      display: inline-flex; align-items: center; justify-content: center;
      transition: all 0.3s ease;
      box-shadow: 0 8px 24px rgba(79,70,229,0.45);
      letter-spacing: 0.02em;
      animation: gradientShift 4s ease infinite;
    }
    @keyframes gradientShift {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .signin-btn:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 16px 36px rgba(79,70,229,0.55);
    }
    .signin-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    /* Seating preview */
    .seating-preview {
      display: flex; align-items: center; gap: 0.75rem;
      margin-top: 1.25rem;
      background: linear-gradient(135deg, #f5f3ff, #eff6ff);
      border: 1px solid #ddd6fe;
      border-radius: 12px; padding: 0.6rem 0.9rem;
    }
    .seating-img {
      width: 44px; height: 44px;
      border-radius: 8px; object-fit: cover;
      border: 2px solid #c4b5fd;
    }
    .seating-label { font-size: 0.8rem; font-weight: 700; color: #5b21b6; }

    /* Footer link */
    .card-footer-link {
      text-align: center;
      margin-top: 1.1rem;
      font-size: 0.82rem; color: #64748b;
      display: flex; flex-direction: column; gap: 0.3rem;
    }
    .seat-link {
      color: #6366f1; font-weight: 700; text-decoration: none;
      transition: color 0.2s;
    }
    .seat-link:hover { color: #4f46e5; text-decoration: underline; }

    /* =====================================================
       RESPONSIVE
    ===================================================== */
    @media (max-width: 900px) {
      .page-content {
        flex-direction: column;
        gap: 2rem;
        padding: 2rem 1rem;
        align-items: stretch;
      }
      .hero-col { max-width: 100%; }
      .campus-thumb { display: none; }
      .form-col { flex: none; width: 100%; max-width: 480px; margin: 0 auto; }
    }
    @media (max-width: 480px) {
      .hero-heading { font-size: 2rem; }
      .feature-cards { gap: 0.5rem; }
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
