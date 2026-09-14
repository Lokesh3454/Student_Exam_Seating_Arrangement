import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(15, 23, 42, 0.6);" *ngIf="isOpen">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content shadow-lg border-0 rounded-4">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold text-danger d-flex align-items-center gap-2">
              <i class="bi bi-exclamation-triangle-fill"></i>
              {{ title }}
            </h5>
            <button type="button" class="btn-close" (click)="onCancel()"></button>
          </div>
          <div class="modal-body py-3 text-secondary">
            {{ message }}
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-light rounded-pill px-4" (click)="onCancel()">Cancel</button>
            <button type="button" class="btn btn-danger rounded-pill px-4" (click)="onConfirm()">Confirm Delete</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ConfirmationDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed with this operation?';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
