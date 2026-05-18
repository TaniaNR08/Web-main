import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ContentService } from '../../../core/services/content.service';
import { Documento } from '../../../shared/models';

const CAT_LABELS: Record<string, string> = {
  circular: 'Circular',
  formato: 'Formato',
  pei: 'PEI',
  manual: 'Manual de convivencia',
  lista: 'Lista escolar',
  otro: 'Otro',
};

@Component({
  selector: 'app-descargas',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="public-page">
      <div class="public-container">
        <h1 class="public-page-title">Zona de descargas</h1>
        <p class="public-page-subtitle">Circulares, formatos de matrícula, listas escolares y documentos oficiales.</p>

        <div class="public-doc-list">
          @for (d of documentos(); track d.doc_id) {
            <div class="public-doc-item">
              <div>
                <span class="public-badge">{{ catLabel(d.categoria) }}</span>
                <h3>{{ d.nombre }}</h3>
                <p class="public-muted">{{ d.nombre_archivo }} — {{ d.fecha_subida | date:'mediumDate' }}</p>
              </div>
              <button type="button" class="public-btn public-btn--primary" (click)="descargar(d)">
                <i class="fa-solid fa-download"></i> Descargar
              </button>
            </div>
          } @empty {
            <p class="public-muted">No hay documentos disponibles.</p>
          }
        </div>
      </div>
    </div>
  `,
})
export class DescargasComponent implements OnInit {
  private content = inject(ContentService);
  documentos = signal<Documento[]>([]);

  ngOnInit(): void {
    this.content.getDocumentos().subscribe({
      next: ({ documentos }) => this.documentos.set(documentos),
    });
  }

  catLabel(c: string): string { return CAT_LABELS[c] ?? c; }

  descargar(d: Documento): void {
    this.content.descargarDocumento(d.doc_id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = d.nombre_archivo;
        a.click();
        URL.revokeObjectURL(url);
      },
    });
  }
}
