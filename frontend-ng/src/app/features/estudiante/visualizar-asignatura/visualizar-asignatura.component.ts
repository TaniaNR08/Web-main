import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Tarea } from '../../../shared/models';
import { sw } from '../../../shared/utils/swal';

interface TareasResponse { tareas: Tarea[]; }
interface IsEntregadaResponse { success: boolean; }
interface TareaConEstado extends Tarea { entregada: boolean; vencida: boolean; }

@Component({
  selector: 'app-visualizar-asignatura',
  standalone: true,
  imports: [HeaderComponent],
  template: `
    <app-header />
    <div class="page-bg">
      <div class="page-content px-4">
        <div class="max-w-5xl mx-auto">
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-800">Tareas de la Asignatura</h2>
              <button (click)="toggleOrden()"
                class="px-4 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700">
                Ordenar: {{ sortByFecha() ? 'Por Fecha' : 'Por Estado' }}
              </button>
            </div>

            @if (loading()) {
              <p class="text-center text-gray-400 text-sm py-6">Cargando tareas...</p>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead><tr class="bg-black text-white">
                    <th class="px-4 py-3 text-left font-semibold rounded-tl-lg">Título</th>
                    <th class="px-4 py-3 text-left font-semibold">Descripción</th>
                    <th class="px-4 py-3 text-left font-semibold">Inicio</th>
                    <th class="px-4 py-3 text-left font-semibold">Vencimiento</th>
                    <th class="px-4 py-3 text-left font-semibold rounded-tr-lg">Acción</th>
                  </tr></thead>
                  <tbody class="divide-y divide-gray-100">
                    @for (t of tareasSorted(); track t.tarea_id) {
                      <tr class="hover:bg-gray-50 transition">
                        <td class="px-4 py-3 text-gray-800 font-medium">{{ t.titulo }}</td>
                        <td class="px-4 py-3 text-gray-600 max-w-[200px] truncate">{{ t.descripcion }}</td>
                        <td class="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{{ t.fecha_inicio }}</td>
                        <td class="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{{ t.fecha_final }}</td>
                        <td class="px-4 py-3">
                          @if (t.vencida) {
                            @if (t.entregada) {
                              <span class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-100 text-green-700 border border-green-200 cursor-not-allowed">
                                Entregado
                              </span>
                            } @else {
                              <span class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-600 border border-red-200 cursor-not-allowed">
                                Vencida
                              </span>
                            }
                          } @else {
                            @if (t.entregada) {
                              <button (click)="entregar(t)"
                                class="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition">
                                Editar entrega
                              </button>
                            } @else {
                              <button (click)="entregar(t)"
                                class="px-3 py-1.5 text-xs font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition">
                                Entregar
                              </button>
                            }
                          }
                        </td>
                      </tr>
                    } @empty {
                      <tr><td colspan="5" class="px-4 py-6 text-center text-gray-400 text-sm">Sin tareas asignadas</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class VisualizarAsignaturaComponent implements OnInit {
  private api    = inject(ApiService);
  private auth   = inject(AuthService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  private groupId = '';
  loading         = signal(true);
  sortByFecha     = signal(false);
  tareas          = signal<TareaConEstado[]>([]);

  tareasSorted = computed(() => {
    const ts = this.tareas();
    if (this.sortByFecha()) {
      return [...ts].sort((a, b) =>
        new Date(a.fecha_final).getTime() - new Date(b.fecha_final).getTime()
      );
    }
    // Por estado: pendientes primero
    return [...ts].sort((a, b) =>
      a.entregada === b.entregada ? 0 : a.entregada ? 1 : -1
    );
  });

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id') ?? '';
    const userId = this.auth.user();

    this.api.post<TareasResponse>('/listarTareas', { group_id: this.groupId }).pipe(
      switchMap(({ tareas }) => {
        if (!tareas?.length) return of({ tareas: [], results: [] });
        const checks = tareas.map(t =>
          this.api.post<IsEntregadaResponse>('/isEntregada', { tarea_id: t.tarea_id, user_id: userId }).pipe(
            catchError(() => of({ success: false }))
          )
        );
        return forkJoin(checks).pipe(
          // return a combined object so the subscribe block has both
          switchMap(results => of({ tareas, results }))
        );
      })
    ).subscribe({
      next: ({ tareas, results }) => {
        const conEstado: TareaConEstado[] = tareas.map((t, i) => ({
          ...t,
          entregada: results[i]?.success ?? false,
          vencida:   new Date(t.fecha_final) < new Date(),
        }));
        this.tareas.set(conEstado);
        this.loading.set(false);
      },
      error: () => {
        sw.error('Error', 'No se pudo cargar las tareas.');
        this.loading.set(false);
      },
    });
  }

  toggleOrden(): void {
    this.sortByFecha.update(v => !v);
  }

  entregar(t: TareaConEstado): void {
    this.auth.setTareaId(t.tarea_id);
    this.router.navigate(['/estudiante/asignaturas', this.groupId, 'tareas', t.tarea_id, 'entregar']);
  }
}
