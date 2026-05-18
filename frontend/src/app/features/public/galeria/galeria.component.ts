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
                     (error)="onImgError($event, item.titulo)">
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

  onImgError(e: Event, titulo: string): void {
    const img = e.target as HTMLImageElement;
    if (img.dataset['fallback'] === '1') return;
    img.dataset['fallback'] = '1';
    img.src = urlImagenGaleria(titulo, null);
  }
}
