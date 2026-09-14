import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer py-3 bg-white border-top text-center text-muted no-print">
      <div class="container">
        <small>© 2026 Smart Exam Hall Seating Arrangement System. All rights reserved.</small>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      font-size: 0.85rem;
    }
  `]
})
export class FooterComponent {}
