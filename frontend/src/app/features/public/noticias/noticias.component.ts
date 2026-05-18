import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ContentService } from '../../../core/services/content.service';
import { Noticia } from '../../../shared/models';
import { NOTICIA_DEFAULT, urlImagenNoticia } from '../../../shared/utils/media-images';

@Component({
  selector: 'app-noticias',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="public-page">
      <div class="public-container">
        <h1 class="public-page-title">Noticias y eventos</h1>
        <p class="public-page-subtitle">Publicaciones institucionales más recientes.</p>
        <div class="public-grid public-grid--2">
          @for (n of noticias(); track n.noticia_id) {
            <article class="public-card">
              <img [src]="imgUrl(n)" [alt]="n.titulo" class="public-card-img" loading="lazy"
                   referrerpolicy="no-referrer" (error)="onImgError($event)">
              <div class="public-card-body">
                <span class="public-badge">{{ n.tipo === 'evento' ? 'Evento' : 'Noticia' }}</span>
                <h3>{{ n.titulo }}</h3>
                <p>{{ n.contenido }}</p>
                <time class="public-muted">{{ n.fecha_publicacion | date:'fullDate' }}</time>
              </div>
            </article>
          } @empty {
            <p class="public-muted">No hay noticias publicadas.</p>
          }
        </div>
      </div>
    </div>
  `,
})
export class NoticiasComponent implements OnInit {
  private content = inject(ContentService);
  noticias = signal<Noticia[]>([]);

  ngOnInit(): void {
    this.content.getNoticias(50).subscribe({
      next: ({ noticias }) => this.noticias.set(noticias),
    });
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
