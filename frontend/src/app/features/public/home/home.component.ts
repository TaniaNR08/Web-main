import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ContentService } from '../../../core/services/content.service';
import { EventoCalendario, Noticia } from '../../../shared/models';
import { NOTICIA_DEFAULT, urlImagenNoticia } from '../../../shared/utils/media-images';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <section class="public-hero">
      <div class="public-hero-inner">
        <h1>Colegio San Francisco de Asís</h1>
        <p>Educación integral con valores, excelencia académica y compromiso con la comunidad.</p>
        <div class="public-hero-actions">
          <a routerLink="/admisiones" class="public-btn public-btn--primary">Solicitar admisión</a>
          <a routerLink="/login" class="public-btn public-btn--outline">Acceso estudiantes y docentes</a>
        </div>
      </div>
    </section>

    <section class="public-section">
      <div class="public-container">
        <div class="public-section-header">
          <h2>Noticias y eventos recientes</h2>
          <a routerLink="/noticias" class="public-link">Ver todas</a>
        </div>
        @if (loading()) {
          <p class="public-muted">Cargando...</p>
        } @else {
          <div class="public-grid public-grid--3">
            @for (n of noticias(); track n.noticia_id) {
              <article class="public-card">
                <img [src]="imgUrl(n)" [alt]="n.titulo" class="public-card-img" loading="lazy"
                     referrerpolicy="no-referrer" (error)="onImgError($event)">
                <div class="public-card-body">
                  <span class="public-badge">{{ n.tipo === 'evento' ? 'Evento' : 'Noticia' }}</span>
                  <h3>{{ n.titulo }}</h3>
                  <p>{{ truncar(n.contenido, 120) }}</p>
                  <time class="public-muted">{{ n.fecha_publicacion | date:'mediumDate' }}</time>
                </div>
              </article>
            } @empty {
              <p class="public-muted">No hay publicaciones disponibles.</p>
            }
          </div>
        }
      </div>
    </section>

    <section class="public-section public-section--alt">
      <div class="public-container">
        <div class="public-section-header">
          <h2>Próximos en el calendario</h2>
          <a routerLink="/calendario" class="public-link">Calendario completo</a>
        </div>
        <ul class="public-event-list">
          @for (e of proximosEventos(); track e.evento_id) {
            <li class="public-event-item">
              <span class="public-event-dot" [style.background]="e.color"></span>
              <div>
                <strong>{{ e.titulo }}</strong>
                <span class="public-muted">{{ e.fecha | date:'longDate' }}</span>
              </div>
            </li>
          } @empty {
            <li class="public-muted">Sin eventos programados.</li>
          }
        </ul>
      </div>
    </section>

    <section class="public-section">
      <div class="public-container public-quick-links">
        <a routerLink="/institucional" class="public-quick-card"><i class="fa-solid fa-school"></i><span>Institucional</span></a>
        <a routerLink="/descargas" class="public-quick-card"><i class="fa-solid fa-file-pdf"></i><span>Documentos</span></a>
        <a routerLink="/galeria" class="public-quick-card"><i class="fa-solid fa-images"></i><span>Galería</span></a>
        <a routerLink="/contacto" class="public-quick-card"><i class="fa-solid fa-envelope"></i><span>Contacto</span></a>
      </div>
    </section>
  `,
})
export class HomeComponent implements OnInit {
  private content = inject(ContentService);
  noticias = signal<Noticia[]>([]);
  proximosEventos = signal<EventoCalendario[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.content.getNoticias(6).subscribe({
      next: ({ noticias }) => { this.noticias.set(noticias); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.content.getEventos().subscribe({
      next: ({ eventos }) => {
        const hoy = new Date().toISOString().slice(0, 10);
        this.proximosEventos.set(eventos.filter((e) => e.fecha >= hoy).slice(0, 5));
      },
    });
  }

  truncar(texto: string, max: number): string {
    return texto.length <= max ? texto : texto.slice(0, max) + '...';
  }

  imgUrl(n: Noticia): string {
    return urlImagenNoticia(n.titulo, n.imagen_url);
  }

  onImgError(e: Event): void {
    const img = e.target as HTMLImageElement;
    if (img.dataset['fallback'] === '1') return;
    img.dataset['fallback'] = '1';
    img.src = NOTICIA_DEFAULT;
  }
}
