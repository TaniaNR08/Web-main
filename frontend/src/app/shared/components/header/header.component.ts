import { Component, computed, inject, input } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Rol } from '../../models';

interface NavLink { label: string; route: string; exact?: boolean; }

const ROL_NAV: Partial<Record<Rol, NavLink[]>> = {
  administrador: [{ label: 'Administración', route: '/admin' }],
  profesor:      [{ label: 'Mis grupos', route: '/profesor/grupos' }],
  estudiante:    [{ label: 'Mis asignaturas', route: '/estudiante/asignaturas' }],
};

const ROL_PANEL: Record<Rol, string> = {
  administrador: '/admin',
  profesor:      '/profesor/grupos',
  estudiante:    '/estudiante/asignaturas',
};

const ROL_ETIQUETA: Record<Rol, string> = {
  administrador: 'Administrador',
  profesor:      'Profesor',
  estudiante:    'Estudiante',
};

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="app-header">
      <nav class="header-left" aria-label="Navegación principal">
        @if (showBack()) {
          <button type="button" class="header-nav-btn header-nav-btn--back" (click)="goBack()" aria-label="Regresar">
            <i class="fa-solid fa-arrow-left" aria-hidden="true"></i>
          </button>
        }
        @for (link of navLinks(); track link.route) {
          <a [routerLink]="link.route"
             routerLinkActive="header-nav-btn--active"
             [routerLinkActiveOptions]="{ exact: link.exact ?? true }"
             class="header-nav-btn">
            {{ link.label }}
          </a>
        }
      </nav>

      <a routerLink="/" class="header-brand" aria-label="San Francisco de Asís — inicio">
        <img src="/logo.png" alt="" class="header-logo" (error)="hideImg($event)">
        <span class="header-brand-text">
          <span class="header-title">San Francisco de Asís</span>
          <span class="header-brand-sub">SchoolWebPro</span>
        </span>
      </a>

      <div class="header-right" aria-label="Sesión">
        @if (mostrarPanel()) {
          <a [routerLink]="panelRoute()"
             routerLinkActive="header-nav-btn--active"
             [routerLinkActiveOptions]="{ exact: false }"
             class="header-nav-btn">
            Mi panel
          </a>
        }
        <div class="header-user" [attr.title]="auth.nombre() || auth.user()">
          <span class="header-user-role">{{ rolEtiqueta() }}</span>
          <span class="header-user-name">{{ nombreVisible() }}</span>
        </div>
        <button type="button" class="header-nav-btn header-nav-btn--logout" (click)="auth.logout()">
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

  navLinks = computed<NavLink[]>(() => {
    const rol = this.auth.rol();
    return rol ? (ROL_NAV[rol] ?? []) : [];
  });

  panelRoute = computed(() => {
    const rol = this.auth.rol();
    return rol ? ROL_PANEL[rol] : '/login';
  });

  mostrarPanel = computed(() => {
    const panel = this.panelRoute();
    return !this.navLinks().some((l) => l.route === panel);
  });

  rolEtiqueta = computed(() => {
    const rol = this.auth.rol();
    return rol ? ROL_ETIQUETA[rol] : '';
  });

  nombreVisible = computed(() => {
    const nombre = (this.auth.nombre() || this.auth.user()).trim();
    const rol = this.auth.rol();
    if (!rol || !nombre) return nombre;
    const prefijo = ROL_ETIQUETA[rol];
    const sinPrefijo = nombre.replace(new RegExp(`^${prefijo}\\s+`, 'i'), '').trim();
    return sinPrefijo || nombre;
  });

  goBack(): void { this.location.back(); }

  hideImg(e: Event): void {
    (e.target as HTMLImageElement).style.display = 'none';
  }
}
