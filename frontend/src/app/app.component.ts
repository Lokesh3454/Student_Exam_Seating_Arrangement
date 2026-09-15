import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent],
  template: `
    <div class="d-flex flex-column min-vh-100 bg-body-tertiary">
      <!-- Top Navigation Bar -->
      <app-navbar class="d-print-none"></app-navbar>

      <!-- Main Layout Body -->
      <div class="d-flex flex-grow-1 position-relative layout-body">
        <!-- Sidebar Navigation (Fixed in place, hidden on login page and print) -->
        <app-sidebar *ngIf="showSidebar()" class="d-none d-md-block d-print-none sidebar-sticky-wrapper"></app-sidebar>

        <!-- Main Content Area -->
        <main class="flex-grow-1 p-2 p-md-3 p-xl-4 overflow-auto content-area">
          <div class="container-fluid px-1 px-md-2 px-xl-3">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>

      <!-- Footer -->
      <app-footer class="d-print-none"></app-footer>
    </div>
  `,
  styles: [`
    .layout-body {
      margin-top: 64px;
    }
    .sidebar-sticky-wrapper {
      position: sticky;
      top: 64px;
      height: calc(100vh - 64px);
      z-index: 1020;
      flex-shrink: 0;
    }
    .content-area {
      min-height: calc(100vh - 64px - 60px);
      background-color: transparent;
      min-width: 0;
      max-width: 100%;
      width: 100%;
    }
  `]
})
export class AppComponent {
  title = 'smart-exam-seating-system';

  constructor(private router: Router) {}

  showSidebar(): boolean {
    const url = this.router.url;
    return !url.includes('/login');
  }
}
