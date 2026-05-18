import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicNavComponent } from '../../../shared/components/public-nav/public-nav.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, PublicNavComponent],
  template: `
    <div class="public-site">
      <app-public-nav />
      <main class="public-main">
        <router-outlet />
      </main>
      <footer class="public-footer">
        <p>&copy; {{ year }} Colegio San Francisco de Asís — Todos los derechos reservados</p>
      </footer>
    </div>
  `,
})
export class PublicLayoutComponent {
  year = new Date().getFullYear();
}
