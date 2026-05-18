import { Component, inject, OnInit, signal } from '@angular/core';
import { ContentService } from '../../../core/services/content.service';
import { ItemGaleria } from '../../../shared/models';
import { urlImagenGaleria } from '../../../shared/utils/media-images';

@Component({
  selector: 'app-galeria',
  standalone: true,
  template: `
    <div class="public-page">
      <div class="public-container">
        <h1 class="public-page-title">Galería multimedia</h1>
        <p class="public-page-subtitle">Imagenes y videos de eventos escolares por categoria.</p>

        <div class="public-filter-bar">
          <button type="button" class="public-filter-btn"
            [class.public-filter-btn--active]="!categoriaActiva()"
            (click)="filtrar(null)">Todas</button>
          @for (c of categorias(); track c) {
            <button type="button" class="public-filter-btn"
              [class.public-filter-btn--active]="categoriaActiva() === c"
              (click)="filtrar(c)">{{ c }}</button>
          }
        </div>

        <div class="public-gallery-grid">
          @for (item of items(); track item.media_id) {
            <figure class="public-gallery-item">
              @if (item.tipo === 'video') {
                <iframe [src]="item.url" title="{{ item.titulo }}" loading="lazy"></iframe>
              } @else {
                <img [src]="imgUrl(item)" [alt]="item.titulo" loading="lazy" referrerpolicy="no-referrer"
                     (error)="onImgError($event)">
              }
              <figcaption>{{ item.titulo }} <span class="public-muted">— {{ item.categoria }}</span></figcaption>
            </figure>
          } @empty {
            <p class="public-muted">No hay contenido en esta categoria.</p>
          }
        </div>
      </div>
    </div>
  `,
})
export class GaleriaComponent implements OnInit {
  private content = inject(ContentService);
  items = signal<ItemGaleria[]>([]);
  categorias = signal<string[]>([]);
  categoriaActiva = signal<string | null>(null);

  ngOnInit(): void {
    this.content.getCategoriasGaleria().subscribe({
      next: ({ categorias }) => this.categorias.set(categorias),
    });
    this.cargar();
  }

  filtrar(cat: string | null): void {
    this.categoriaActiva.set(cat);
    this.cargar();
  }

  private cargar(): void {
    const cat = this.categoriaActiva();
    this.content.getGaleria(cat ?? undefined).subscribe({
      next: ({ galeria }) => this.items.set(galeria),
    });
  }

  imgUrl(item: ItemGaleria): string {
    return urlImagenGaleria(item.titulo, item.url);
  }

  onImgError(e: Event): void {
    const img = e.target as HTMLImageElement;
    if (img.dataset['fallback'] === '1') return;
    img.dataset['fallback'] = '1';
    // Placeholder SVG gris — indica claramente que la imagen no cargó
    img.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='45%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='40' fill='%239ca3af'%3E%F0%9F%96%BC%3C/text%3E%3Ctext x='50%25' y='62%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%239ca3af'%3EImagen no disponible%3C/text%3E%3C/svg%3E`;
  }
}
