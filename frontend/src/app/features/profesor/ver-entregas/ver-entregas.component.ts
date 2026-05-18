import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { GrupoContextoComponent } from '../../../shared/components/grupo-contexto/grupo-contexto.component';
import { Entrega, EstudianteListado } from '../../../shared/models';
import { puedePrevisualizar, tipoVistaPrevia, VistaPreviaEntrega } from '../../../shared/utils/entrega-archivo';
import { claseNota, etiquetaNota, formatearNota } from '../../../shared/utils/calificacion';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { sw } from '../../../shared/utils/swal';

interface EntregasResponse { entregas: Entrega[]; error?: string; }
interface EstudiantesResponse { estudiantes: EstudianteListado[]; }
interface CalificarResponse { success: boolean; entrega: Entrega; error?: string; }

interface CalificacionDraft {
  nota: string;
  comentario: string;
}

@Component({
  selector: 'app-ver-entregas',
  standalone: true,
  imports: [HeaderComponent, GrupoContextoComponent, FechaPipe],
  template: `
    <app-header />
    <div class="page-bg">
      <div class="page-content px-4">
        <app-grupo-contexto subtitulo="Entregas y calificaciones" class="block max-w-5xl mx-auto" />
        <div class="max-w-5xl mx-auto">
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-1">Entregas de la tarea</h2>
            <p class="text-sm text-gray-500 mb-4">Califique sobre 100. El estudiante verá la nota en su asignatura.</p>
            <div class="overflow-x-auto">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Fecha</th>
                    <th>Archivo</th>
                    <th>Calificación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (e of entregas(); track e.entrega_id) {
                    <tr>
                      <td>
                        <span class="font-medium text-gray-800">{{ nombreEstudiante(e.user_id) }}</span>
                        <span class="block text-xs text-gray-500 font-mono">{{ e.user_id }}</span>
                      </td>
                      <td class="text-xs text-gray-600 whitespace-nowrap">{{ e.fecha_entrega | fecha }}</td>
                      <td class="text-gray-700 max-w-[10rem] truncate" [title]="e.nombre ?? ''">{{ e.nombre ?? '—' }}</td>
                      <td class="calificacion-cell">
                        <div class="calificacion-form">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="0–100"
                            [value]="draftNota(e.entrega_id)"
                            (input)="actualizarDraft(e.entrega_id, 'nota', $any($event.target).value)"
                            [disabled]="guardandoId() === e.entrega_id">
                          <input
                            type="text"
                            placeholder="Comentario (opcional)"
                            maxlength="500"
                            [value]="draftComentario(e.entrega_id)"
                            (input)="actualizarDraft(e.entrega_id, 'comentario', $any($event.target).value)"
                            [disabled]="guardandoId() === e.entrega_id">
                          <button
                            type="button"
                            class="calificacion-guardar"
                            (click)="guardarCalificacion(e)"
                            [disabled]="guardandoId() === e.entrega_id">
                            {{ guardandoId() === e.entrega_id ? 'Guardando…' : 'Guardar nota' }}
                          </button>
                        </div>
                        @if (e.nota != null) {
                          <span class="nota-badge mt-1" [class]="claseNota(e.nota)">
                            {{ formatearNota(e.nota) }} · {{ etiquetaNota(e.nota) }}
                          </span>
                          @if (e.comentario) {
                            <p class="calificacion-comentario-vista">{{ e.comentario }}</p>
                          }
                        }
                      </td>
                      <td>
                        <div class="flex flex-wrap gap-2">
                          @if (puedeVer(e)) {
                            <button type="button" (click)="previsualizar(e)" [disabled]="cargandoId() === e.entrega_id"
                              class="entrega-btn entrega-btn--preview">Ver</button>
                          }
                          <button type="button" (click)="descargar(e)" [disabled]="cargandoId() === e.entrega_id"
                            class="entrega-btn entrega-btn--download">Descargar</button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="5" class="text-center text-gray-400 py-6">Sin entregas</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    @if (previewUrl()) {
      <div class="entrega-preview-backdrop" (click)="cerrarPreview()" role="presentation">
        <div class="entrega-preview-modal" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
          <div class="entrega-preview-header">
            <p class="entrega-preview-title">{{ previewNombre() }}</p>
            <button type="button" class="entrega-preview-close" (click)="cerrarPreview()">&times;</button>
          </div>
          <div class="entrega-preview-body">
            @switch (previewTipo()) {
              @case ('pdf') { <iframe [src]="previewUrl()" class="entrega-preview-frame" title="PDF"></iframe> }
              @case ('imagen') { <img [src]="previewUrl()" [alt]="previewNombre()" class="entrega-preview-img" /> }
              @case ('texto') { <iframe [src]="previewUrl()" class="entrega-preview-frame"></iframe> }
            }
          </div>
          <div class="entrega-preview-footer">
            <button type="button" class="entrega-btn entrega-btn--download" (click)="descargarDesdePreview()">Descargar</button>
            <button type="button" class="entrega-btn entrega-btn--muted" (click)="cerrarPreview()">Cerrar</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class VerEntregasComponent implements OnInit, OnDestroy {
  private api   = inject(ApiService);
  private route = inject(ActivatedRoute);

  entregas       = signal<Entrega[]>([]);
  nombres        = signal<Map<number, string>>(new Map());
  drafts         = signal<Record<number, CalificacionDraft>>({});
  cargandoId     = signal<number | null>(null);
  guardandoId    = signal<number | null>(null);
  previewUrl     = signal('');
  previewNombre  = signal('');
  previewTipo    = signal<VistaPreviaEntrega>(null);

  formatearNota = formatearNota;
  etiquetaNota  = etiquetaNota;
  claseNota     = claseNota;

  private previewEntrega: Entrega | null = null;
  private groupId = '';

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id') ?? '';
    const tareaId = this.route.snapshot.paramMap.get('tareaId');

    this.api.post<EstudiantesResponse>('/listarEstudiantes', { group_id: this.groupId }).subscribe({
      next: ({ estudiantes }) => {
        const map = new Map<number, string>();
        (estudiantes ?? []).forEach((s) => map.set(Number(s.user_id), s.nombre));
        this.nombres.set(map);
      },
    });

    this.api.post<EntregasResponse>('/verEntregas', { tarea_id: tareaId }).subscribe({
      next: (res) => {
        if (res.error) {
          sw.error('Error', res.error);
          return;
        }
        const lista = res.entregas ?? [];
        this.entregas.set(lista);
        this.inicializarDrafts(lista);
      },
      error: (err) => {
        const msg = (err as { error?: { error?: string } })?.error?.error
          ?? 'No se pudo cargar las entregas. Reinicie el backend (submissions-service).';
        sw.error('Error', msg);
      },
    });
  }

  ngOnDestroy(): void {
    this.revokePreviewUrl();
  }

  nombreEstudiante(userId: number): string {
    return this.nombres().get(Number(userId)) ?? `Estudiante ${userId}`;
  }

  draftNota(entregaId: number): string {
    return this.drafts()[entregaId]?.nota ?? '';
  }

  draftComentario(entregaId: number): string {
    return this.drafts()[entregaId]?.comentario ?? '';
  }

  actualizarDraft(entregaId: number, campo: keyof CalificacionDraft, valor: string): void {
    this.drafts.update((d) => ({
      ...d,
      [entregaId]: { ...d[entregaId], [campo]: valor },
    }));
  }

  guardarCalificacion(e: Entrega): void {
    const draft = this.drafts()[e.entrega_id];
    const nota = Number(draft?.nota);
    if (!Number.isFinite(nota) || nota < 0 || nota > 100) {
      sw.warning('Nota inválida', 'Ingrese un valor entre 0 y 100.');
      return;
    }

    this.guardandoId.set(e.entrega_id);
    this.api.post<CalificarResponse>('/calificarEntrega', {
      entrega_id: e.entrega_id,
      nota,
      comentario: draft?.comentario?.trim() || undefined,
    }).subscribe({
      next: ({ success, entrega, error }) => {
        this.guardandoId.set(null);
        if (!success || !entrega) {
          sw.error('Error', error ?? 'No se pudo guardar la calificación.');
          return;
        }
        this.entregas.update((lista) =>
          lista.map((x) => (x.entrega_id === entrega.entrega_id ? { ...x, ...entrega } : x))
        );
        sw.success('Calificación guardada', `Nota registrada: ${formatearNota(entrega.nota)}`);
      },
      error: () => {
        this.guardandoId.set(null);
        sw.error('Error', 'No se pudo guardar la calificación.');
      },
    });
  }

  puedeVer(e: Entrega): boolean {
    return puedePrevisualizar(e.nombre) && !!e.entrega_id;
  }

  previsualizar(e: Entrega): void {
    if (!e.entrega_id || !puedePrevisualizar(e.nombre)) return;
    this.cargandoId.set(e.entrega_id);
    this.api.getBlob(`/entregas/${e.entrega_id}/archivo`, { inline: '1' }).subscribe({
      next: (blob) => {
        this.cargandoId.set(null);
        if (blob.type.includes('json')) {
          sw.error('Error', 'No se pudo abrir el archivo.');
          return;
        }
        this.revokePreviewUrl();
        this.previewEntrega = e;
        this.previewNombre.set(e.nombre ?? 'archivo');
        this.previewTipo.set(tipoVistaPrevia(e.nombre));
        this.previewUrl.set(URL.createObjectURL(blob));
      },
      error: () => {
        this.cargandoId.set(null);
        sw.error('Error', 'No se pudo cargar la vista previa.');
      },
    });
  }

  descargar(e: Entrega): void {
    if (!e.entrega_id) return;
    this.cargandoId.set(e.entrega_id);
    this.api.getBlob(`/entregas/${e.entrega_id}/archivo`).subscribe({
      next: (blob) => this.guardarBlob(blob, e.nombre ?? `entrega-${e.user_id}`),
      error: () => {
        this.cargandoId.set(null);
        sw.error('Error', 'No se pudo descargar el archivo.');
      },
    });
  }

  descargarDesdePreview(): void {
    if (this.previewEntrega) this.descargar(this.previewEntrega);
  }

  cerrarPreview(): void {
    this.revokePreviewUrl();
    this.previewEntrega = null;
    this.previewNombre.set('');
    this.previewTipo.set(null);
  }

  private inicializarDrafts(entregas: Entrega[]): void {
    const d: Record<number, CalificacionDraft> = {};
    entregas.forEach((e) => {
      d[e.entrega_id] = {
        nota: e.nota != null ? String(e.nota) : '',
        comentario: e.comentario ?? '',
      };
    });
    this.drafts.set(d);
  }

  private guardarBlob(blob: Blob, nombre: string): void {
    this.cargandoId.set(null);
    if (blob.type.includes('json')) {
      sw.error('Error', 'No se pudo descargar el archivo.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(url);
  }

  private revokePreviewUrl(): void {
    const url = this.previewUrl();
    if (url) URL.revokeObjectURL(url);
    this.previewUrl.set('');
  }
}
