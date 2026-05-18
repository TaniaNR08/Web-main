import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../../core/services/content.service';
import { SeccionInstitucional } from '../../../shared/models';

@Component({
  selector: 'app-institucional',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="public-page">
      <div class="public-container">
        <h1 class="public-page-title">Información institucional</h1>
        <p class="public-page-subtitle">Conoce nuestra misión, visión, historia y estructura organizacional.</p>

        @for (s of secciones(); track s.clave) {
          <article class="public-info-block">
            <h2>{{ s.titulo }}</h2>
            <p>{{ s.contenido }}</p>
          </article>
        } @empty {
          <p class="public-muted">No hay contenido institucional disponible.</p>
        }

        <div class="public-info-block public-info-block--docs">
          <h2>Documentos oficiales</h2>
          <p>Consulta y descarga el PEI, el manual de convivencia y otros documentos en la zona de descargas.</p>
          <a routerLink="/descargas" class="public-btn public-btn--primary">Ir a descargas</a>
        </div>
      </div>
    </div>
  `,
})
export class InstitucionalComponent implements OnInit {
  private content = inject(ContentService);
  secciones = signal<SeccionInstitucional[]>([]);

  ngOnInit(): void {
    this.content.getInstitucional().subscribe({
      next: ({ secciones }) => this.secciones.set(secciones),
    });
  }
}
