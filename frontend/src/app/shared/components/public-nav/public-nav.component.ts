import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

const LINKS = [
  { label: 'Inicio',        route: '/' },
  { label: 'Institucional', route: '/institucional' },
  { label: 'Noticias',      route: '/noticias' },
  { label: 'Calendario',    route: '/calendario' },
  { label: 'Admisiones',    route: '/admisiones' },
  { label: 'Descargas',     route: '/descargas' },
  { label: 'Galería',       route: '/galeria' },
  { label: 'Contacto',      route: '/contacto' },
];

@Component({
  selector: 'app-public-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="public-nav">
      <a routerLink="/" class="public-nav-brand">
        <img src="/logo.png" alt="Logo" class="public-nav-logo" (error)="hideImg($event)">
        <span>San Francisco de Asís</span>
      </a>

      <button type="button" class="public-nav-toggle" (click)="menuOpen = !menuOpen" aria-label="Menu">
        <i class="fa-solid" [class]="menuOpen ? 'fa-xmark' : 'fa-bars'"></i>
      </button>

      <div class="public-nav-links" [class.public-nav-links--open]="menuOpen">
        @for (link of links; track link.route) {
          <a [routerLink]="link.route"
             routerLinkActive="public-nav-link--active"
             [routerLinkActiveOptions]="{ exact: link.route === '/' }"
             class="public-nav-link"
             (click)="menuOpen = false">
            {{ link.label }}
          </a>
        }
      </div>

      <div class="public-nav-actions" [class.public-nav-actions--open]="menuOpen">
        @if (auth.isAuthenticated()) {
          <button type="button" class="public-nav-btn public-nav-btn--primary" (click)="irPanel()">
            Mi panel
          </button>
        } @else {
          <a routerLink="/login" class="public-nav-btn public-nav-btn--primary" (click)="menuOpen = false">
            Ingresar
          </a>
        }
      </div>
    </nav>
  `,
})
export class PublicNavComponent {
  links = LINKS;
  menuOpen = false;
  auth = inject(AuthService);

  irPanel(): void {
    const rol = this.auth.rol();
    if (rol) this.auth.redirectByRol(rol);
  }

  hideImg(e: Event): void {
    (e.target as HTMLImageElement).style.display = 'none';
  }
}
