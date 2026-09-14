import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule],
  template: `
    <footer class="site-footer no-print">
      <!-- Top Wave Divider -->
      <div class="footer-wave">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#0f0c29"/>
        </svg>
      </div>

      <div class="footer-inner">
        <!-- Brand Column -->
        <div class="footer-brand">
          <div class="footer-logo">
            <div class="footer-shield"><i class="bi bi-shield-lock-fill"></i></div>
            <div>
              <div class="footer-name">ExamSeat Pro</div>
              <div class="footer-tagline">Smart Examination Management</div>
            </div>
          </div>
          <p class="footer-desc">
            Intelligent seating arrangement, attendance tracking, and role-based access control for modern universities.
          </p>
          <div class="footer-socials">
            <a href="#" class="social-pill" title="GitHub"><i class="bi bi-github"></i></a>
            <a href="#" class="social-pill" title="LinkedIn"><i class="bi bi-linkedin"></i></a>
            <a href="#" class="social-pill" title="Email"><i class="bi bi-envelope-fill"></i></a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="footer-links-col">
          <div class="footer-col-title"><i class="bi bi-grid-fill me-2 text-purple"></i>Quick Access</div>
          <ul class="footer-links">
            <li><a routerLink="/dashboard"><i class="bi bi-speedometer2"></i>Dashboard</a></li>
            <li><a routerLink="/exams"><i class="bi bi-journal-bookmark-fill"></i>Exams</a></li>
            <li><a routerLink="/seating"><i class="bi bi-grid-3x3-gap-fill"></i>Seating Plans</a></li>
            <li><a routerLink="/students"><i class="bi bi-people-fill"></i>Students</a></li>
            <li><a routerLink="/halls"><i class="bi bi-building"></i>Exam Halls</a></li>
          </ul>
        </div>

        <!-- Portal Links -->
        <div class="footer-links-col">
          <div class="footer-col-title"><i class="bi bi-person-badge-fill me-2 text-cyan"></i>Portals</div>
          <ul class="footer-links">
            <li><a routerLink="/login"><i class="bi bi-shield-fill"></i>Admin Login</a></li>
            <li><a routerLink="/login"><i class="bi bi-mortarboard-fill"></i>Faculty Login</a></li>
            <li><a routerLink="/seating/search"><i class="bi bi-search"></i>Student Seat Finder</a></li>
            <li><a routerLink="/login"><i class="bi bi-person-badge-fill"></i>Student Login</a></li>
          </ul>
        </div>

        <!-- Status / Stats -->
        <div class="footer-stats-col">
          <div class="footer-col-title"><i class="bi bi-bar-chart-fill me-2 text-amber"></i>System Status</div>
          <div class="status-card">
            <div class="status-dot"></div>
            <div>
              <div class="status-label">All Systems Online</div>
              <div class="status-sub">Uptime: 99.9%</div>
            </div>
          </div>
          <div class="mini-stats">
            <div class="mini-stat">
              <div class="mini-stat-num">500+</div>
              <div class="mini-stat-label">Students</div>
            </div>
            <div class="mini-stat">
              <div class="mini-stat-num">30+</div>
              <div class="mini-stat-label">Halls</div>
            </div>
            <div class="mini-stat">
              <div class="mini-stat-num">100%</div>
              <div class="mini-stat-label">Automated</div>
            </div>
          </div>
          <a routerLink="/seating/search" class="footer-cta">
            <i class="bi bi-search me-2"></i>Find My Seat
          </a>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <div class="footer-bottom-inner">
          <div class="footer-copy">
            © 2026 <strong>Smart Exam Hall Seating Arrangement System</strong>. All rights reserved.
          </div>
          <div class="footer-badges">
            <span class="footer-badge-item"><i class="bi bi-shield-check me-1"></i>JWT Secured</span>
            <span class="footer-badge-item"><i class="bi bi-cloud-check me-1"></i>Cloud Hosted</span>
            <span class="footer-badge-item"><i class="bi bi-phone me-1"></i>Mobile Ready</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .site-footer {
      background: #0f0c29;
      color: rgba(255,255,255,0.75);
      font-family: 'Inter', system-ui, sans-serif;
      position: relative;
    }

    .footer-wave {
      margin-bottom: -2px;
      line-height: 0;
    }
    .footer-wave svg {
      width: 100%; height: 50px; display: block;
    }

    .footer-inner {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1.2fr;
      gap: 2.5rem;
      padding: 2.5rem 3rem;
      max-width: 1280px;
      margin: 0 auto;
      border-bottom: 1px solid rgba(255,255,255,0.07);
    }

    /* ---- Brand ---- */
    .footer-logo {
      display: flex; align-items: center; gap: 0.85rem; margin-bottom: 1rem;
    }
    .footer-shield {
      width: 44px; height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.3rem; color: #fff;
      box-shadow: 0 6px 18px rgba(124,58,237,0.4);
      flex-shrink: 0;
    }
    .footer-name { font-size: 1rem; font-weight: 800; color: #fff; }
    .footer-tagline { font-size: 0.72rem; color: #a78bfa; }

    .footer-desc {
      font-size: 0.82rem; line-height: 1.7;
      color: rgba(255,255,255,0.55); margin-bottom: 1.2rem;
    }

    .footer-socials { display: flex; gap: 0.6rem; }
    .social-pill {
      width: 36px; height: 36px;
      border-radius: 10px;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.12);
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,0.65); font-size: 1rem;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .social-pill:hover {
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      border-color: transparent; color: #fff;
      transform: translateY(-3px); box-shadow: 0 6px 16px rgba(79,70,229,0.4);
    }

    /* ---- Links ---- */
    .footer-col-title {
      font-size: 0.78rem; font-weight: 800; color: #fff;
      text-transform: uppercase; letter-spacing: 0.08em;
      margin-bottom: 1rem;
    }
    .text-purple { color: #a78bfa; }
    .text-cyan   { color: #67e8f9; }
    .text-amber  { color: #fcd34d; }

    .footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.55rem; }
    .footer-links li a {
      display: inline-flex; align-items: center; gap: 0.55rem;
      font-size: 0.85rem; color: rgba(255,255,255,0.6);
      text-decoration: none;
      transition: all 0.2s;
    }
    .footer-links li a i { font-size: 0.9rem; opacity: 0.7; }
    .footer-links li a:hover { color: #a78bfa; transform: translateX(4px); }

    /* ---- Stats ---- */
    .status-card {
      display: flex; align-items: center; gap: 0.75rem;
      background: rgba(34,197,94,0.08);
      border: 1px solid rgba(34,197,94,0.2);
      border-radius: 10px; padding: 0.7rem 0.9rem;
      margin-bottom: 1.1rem;
    }
    .status-dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: #22c55e; flex-shrink: 0;
      box-shadow: 0 0 0 4px rgba(34,197,94,0.2);
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 4px rgba(34,197,94,0.2); }
      50%       { box-shadow: 0 0 0 8px rgba(34,197,94,0.08); }
    }
    .status-label { font-size: 0.82rem; font-weight: 700; color: #4ade80; }
    .status-sub   { font-size: 0.72rem; color: rgba(255,255,255,0.45); }

    .mini-stats { display: flex; gap: 1rem; margin-bottom: 1.25rem; }
    .mini-stat { text-align: center; }
    .mini-stat-num { font-size: 1.25rem; font-weight: 900; color: #a78bfa; }
    .mini-stat-label { font-size: 0.68rem; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.06em; }

    .footer-cta {
      display: inline-flex; align-items: center;
      padding: 0.55rem 1.2rem;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      color: #fff; font-size: 0.82rem; font-weight: 700;
      border-radius: 999px; text-decoration: none;
      transition: all 0.2s; box-shadow: 0 4px 14px rgba(79,70,229,0.4);
    }
    .footer-cta:hover {
      transform: translateY(-2px); box-shadow: 0 8px 22px rgba(79,70,229,0.55);
      color: #fff;
    }

    /* ---- Bottom Bar ---- */
    .footer-bottom {
      background: rgba(0,0,0,0.3);
      padding: 0.9rem 3rem;
    }
    .footer-bottom-inner {
      max-width: 1280px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 0.75rem;
    }
    .footer-copy {
      font-size: 0.78rem; color: rgba(255,255,255,0.45);
    }
    .footer-copy strong { color: rgba(255,255,255,0.65); }
    .footer-badges { display: flex; gap: 0.6rem; flex-wrap: wrap; }
    .footer-badge-item {
      display: inline-flex; align-items: center;
      font-size: 0.72rem; font-weight: 600;
      padding: 0.25rem 0.7rem;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 999px;
      color: rgba(255,255,255,0.55);
    }

    /* ---- Responsive ---- */
    @media (max-width: 1024px) {
      .footer-inner { grid-template-columns: 1fr 1fr; padding: 2rem 1.5rem; }
    }
    @media (max-width: 600px) {
      .footer-inner { grid-template-columns: 1fr; gap: 1.75rem; padding: 1.75rem 1.25rem; }
      .footer-bottom { padding: 0.9rem 1.25rem; }
      .footer-bottom-inner { flex-direction: column; text-align: center; }
    }
  `]
})
export class FooterComponent {}
