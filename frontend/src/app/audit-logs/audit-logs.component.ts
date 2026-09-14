import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuditLogService } from '../core/services/audit-log.service';
import { AuditLog } from '../core/models/audit-log.model';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="fade-in">
      <!-- Header -->
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <span class="badge bg-dark-subtle text-dark px-3 py-2 rounded-pill fw-semibold mb-2">
            <i class="bi bi-clock-history me-1"></i> System Administration & Governance
          </span>
          <h2 class="h3 fw-bold text-dark mb-1">Security Audit & Activity Trail</h2>
          <p class="text-secondary small mb-0">Immutable chronological history of all administrative operations, seating allocations, and disciplinary actions</p>
        </div>
        <div>
          <button class="btn btn-outline-primary rounded-pill px-4 shadow-sm d-flex align-items-center gap-2"
                  (click)="loadAuditLogs()" [disabled]="isLoading">
            <i class="bi bi-arrow-clockwise" [class.spin]="isLoading"></i>
            <span>Refresh Trail</span>
          </button>
        </div>
      </div>

      <!-- Search & Filter Card -->
      <div class="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <div class="row g-3 align-items-center">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-light border-0"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control bg-light border-0"
                     placeholder="Search by username, action (e.g. GENERATE_SEATING), entity..."
                     [(ngModel)]="searchQuery" (input)="filterLogs()" />
            </div>
          </div>
          <div class="col-md-4">
            <div class="d-flex gap-2 flex-wrap">
              <button class="btn btn-sm rounded-pill px-3"
                      [ngClass]="activeFilter === 'ALL' ? 'btn-primary' : 'btn-light border'"
                      (click)="setFilter('ALL')">All ({{ logs.length }})</button>
              <button class="btn btn-sm rounded-pill px-3"
                      [ngClass]="activeFilter === 'SEATING' ? 'btn-primary' : 'btn-light border'"
                      (click)="setFilter('SEATING')">Seating</button>
              <button class="btn btn-sm rounded-pill px-3"
                      [ngClass]="activeFilter === 'IMPORT' ? 'btn-primary' : 'btn-light border'"
                      (click)="setFilter('IMPORT')">Imports</button>
              <button class="btn btn-sm rounded-pill px-3"
                      [ngClass]="activeFilter === 'INCIDENT' ? 'btn-primary' : 'btn-light border'"
                      (click)="setFilter('INCIDENT')">Incidents</button>
            </div>
          </div>
          <div class="col-md-2 text-end">
            <span class="badge bg-light text-dark border px-3 py-2">
              <strong>{{ filteredLogs.length }}</strong> events
            </span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="text-muted mt-2">Loading audit logs...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && filteredLogs.length === 0" class="card border-0 shadow-sm rounded-4 p-5 text-center text-muted">
        <i class="bi bi-journal-text fs-1 opacity-50 d-block mb-3"></i>
        <h5 class="fw-bold text-dark">No Audit Records Found</h5>
        <p class="small text-secondary mb-0">System events will appear here as users perform actions.</p>
      </div>

      <!-- Timeline List -->
      <div *ngIf="!isLoading && filteredLogs.length > 0" class="d-flex flex-column gap-3 mb-5">
        <div *ngFor="let log of filteredLogs" class="card border-0 shadow-sm rounded-4 p-3 p-md-4 transition hover-lift">
          <div class="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
            <div class="d-flex align-items-center gap-3">
              <div class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                   style="width: 44px; height: 44px;"
                   [ngClass]="getActionIconBg(log.action)">
                <i [ngClass]="getActionIcon(log.action)" class="fs-5"></i>
              </div>
              <div>
                <div class="d-flex align-items-center gap-2">
                  <span class="fw-bold text-dark fs-6">{{ log.username }}</span>
                  <span class="badge bg-light text-secondary border rounded-pill small">{{ log.userRole || 'USER' }}</span>
                </div>
                <div class="small text-muted font-monospace">{{ log.timestamp | date:'medium' }}</div>
              </div>
            </div>

            <div>
              <span class="badge px-3 py-2 rounded-pill fw-semibold" [ngClass]="getActionBadgeClass(log.action)">
                {{ log.action }}
              </span>
            </div>
          </div>

          <div class="ms-md-5 ps-md-2 mt-2 pt-2 border-top">
            <div *ngIf="log.targetEntity" class="small fw-semibold text-primary mb-1">
              <i class="bi bi-bullseye me-1"></i> Target: {{ log.targetEntity }}
            </div>
            <div class="text-secondary small">{{ log.details || 'No additional event details.' }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
    .hover-lift:hover {
      transform: translateY(-2px);
      transition: all 0.2s ease-in-out;
    }
  `]
})
export class AuditLogsComponent implements OnInit {
  logs: AuditLog[] = [];
  filteredLogs: AuditLog[] = [];
  isLoading = true;
  searchQuery = '';
  activeFilter = 'ALL';

  constructor(private auditLogService: AuditLogService) {}

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.isLoading = true;
    this.auditLogService.getAuditLogs().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.logs = res.data || [];
        this.filterLogs();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.filterLogs();
  }

  filterLogs(): void {
    let list = [...this.logs];

    if (this.activeFilter !== 'ALL') {
      list = list.filter(l => l.action?.toUpperCase().includes(this.activeFilter));
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(l =>
        l.username?.toLowerCase().includes(q) ||
        l.action?.toLowerCase().includes(q) ||
        l.targetEntity?.toLowerCase().includes(q) ||
        l.details?.toLowerCase().includes(q)
      );
    }

    this.filteredLogs = list;
  }

  getActionIcon(action: string): string {
    const a = action?.toUpperCase() || '';
    if (a.includes('SEATING')) return 'bi-grid-3x3-gap-fill';
    if (a.includes('IMPORT')) return 'bi-file-earmark-spreadsheet-fill';
    if (a.includes('INCIDENT')) return 'bi-shield-exclamation';
    if (a.includes('ATTENDANCE')) return 'bi-clipboard-check-fill';
    if (a.includes('AUTH') || a.includes('LOGIN')) return 'bi-key-fill';
    return 'bi-activity';
  }

  getActionIconBg(action: string): string {
    const a = action?.toUpperCase() || '';
    if (a.includes('INCIDENT')) return 'bg-danger';
    if (a.includes('SEATING')) return 'bg-primary';
    if (a.includes('IMPORT')) return 'bg-success';
    if (a.includes('ATTENDANCE')) return 'bg-info';
    return 'bg-dark';
  }

  getActionBadgeClass(action: string): string {
    const a = action?.toUpperCase() || '';
    if (a.includes('INCIDENT')) return 'bg-danger-subtle text-danger border border-danger-subtle';
    if (a.includes('SEATING')) return 'bg-primary-subtle text-primary border border-primary-subtle';
    if (a.includes('IMPORT')) return 'bg-success-subtle text-success border border-success-subtle';
    if (a.includes('DELETE') || a.includes('CLEAR')) return 'bg-warning-subtle text-warning-emphasis border border-warning-subtle';
    return 'bg-light text-dark border';
  }
}
