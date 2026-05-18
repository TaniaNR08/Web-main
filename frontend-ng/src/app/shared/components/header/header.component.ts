import { Component, inject, input } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="app-header">
      <div class="header-left">
        @if (showBack()) {
          <button class="header-back-btn" (click)="goBack()">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Regresar
          </button>
        } @else {
          <div></div>
        }
      </div>

      <div class="header-center">
        <img src="/logo.png" alt="Logo" class="header-logo"
             (error)="hideImg($event)">
        <span class="header-title">San Francisco de Asis</span>
      </div>

      <div class="header-right">
        <div class="header-user">
          <span class="header-user-role">{{ auth.rol() }}</span>
          <span class="header-user-id">{{ auth.user() }}</span>
        </div>
        <button class="header-logout-btn" (click)="auth.logout()">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Salir
        </button>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  showBack = input(true);
  auth     = inject(AuthService);
  private location = inject(Location);

  goBack(): void { this.location.back(); }
  hideImg(e: Event): void { (e.target as HTMLImageElement).style.display = 'none'; }
}
