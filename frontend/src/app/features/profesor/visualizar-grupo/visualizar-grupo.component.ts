import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { GrupoContextoComponent } from '../../../shared/components/grupo-contexto/grupo-contexto.component';
import { EstudianteListado, Tarea, ApiResponse } from '../../../shared/models';
import { FechaPipe } from '../../../shared/pipes/fecha.pipe';
import { sw } from '../../../shared/utils/swal';

interface EstudiantesResponse { estudiantes: EstudianteListado[]; }
interface TareasResponse { tareas: Tarea[]; }

@Component({
  selector: 'app-visualizar-grupo',
  standalone: true,
  imports: [HeaderComponent, GrupoContextoComponent, FechaPipe],
  template: `
    <app-header />
    <div class="page-bg">
      <div class="page-content px-4">
        <app-grupo-contexto class="block max-w-5xl mx-auto" />
        <div class="max-w-5xl mx-auto space-y-6">

          <!-- Estudiantes -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-800">Estudiantes Inscritos</h2>
              <button (click)="router.navigate(['/profesor/grupos', groupId, 'inscribir'])"
                class="btn-primary px-5 py-2 text-sm">
                Inscribir estudiante
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (e of estudiantes(); track e.user_id) {
                    <tr class="hover:bg-gray-50 transition">
                      <td class="px-4 py-3 text-gray-600 font-mono text-xs">{{ e.user_id }}</td>
                      <td class="px-4 py-3 text-gray-800 font-medium">{{ e.nombre }}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="2" class="px-4 py-6 text-center text-gray-400 text-sm">Sin estudiantes</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Tareas -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-800">Tareas Asignadas</h2>
              <button (click)="router.navigate(['/profesor/grupos', groupId, 'asignar-tarea'])"
                class="btn-primary px-5 py-2 text-sm">
                Asignar tarea
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Tarea</th>
                    <th>Descripción</th>
                    <th>Inicio</th>
                    <th>Final</th>
                    <th>Entregas</th>
                    <th>Editar</th>
                    <th>Eliminar</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (t of tareas(); track t.tarea_id) {
                    <tr class="hover:bg-gray-50 transition">
                      <td class="px-4 py-3 text-gray-800 font-medium">{{ t.titulo }}</td>
                      <td class="px-4 py-3 text-gray-600 max-w-xs truncate">{{ t.descripcion }}</td>
                      <td class="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{{ t.fecha_inicio | fecha }}</td>
                      <td class="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{{ t.fecha_final | fecha }}</td>
                      <td class="px-4 py-3">
                        <button (click)="verEntregas(t)"
                          class="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition">
                          Ver
                        </button>
                      </td>
                      <td class="px-4 py-3">
                        <button (click)="editarTarea(t)"
                          class="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition">
                          Editar
                        </button>
                      </td>
                      <td class="px-4 py-3">
                        <button (click)="eliminarTarea(t)"
                          class="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="7" class="px-4 py-6 text-center text-gray-400 text-sm">Sin tareas</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
})
export class VisualizarGrupoComponent implements OnInit {
  private api   = inject(ApiService);
  private auth  = inject(AuthService);
  private route = inject(ActivatedRoute);
  router        = inject(Router);

  groupId    = '';
  estudiantes = signal<EstudianteListado[]>([]);
  tareas      = signal<Tarea[]>([]);

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id') ?? '';
    this.auth.setGroupId(this.groupId);
    this.api.post<EstudiantesResponse>('/listarEstudiantes', { group_id: this.groupId }).subscribe({
      next: ({ estudiantes }) => this.estudiantes.set(estudiantes ?? []),
    });
    this.api.post<TareasResponse>('/listarTareas', { group_id: this.groupId }).subscribe({
      next: ({ tareas }) => this.tareas.set(tareas ?? []),
    });
  }

  verEntregas(t: Tarea): void {
    this.auth.setTareaId(t.tarea_id);
    this.router.navigate(['/profesor/grupos', this.groupId, 'tareas', t.tarea_id, 'entregas']);
  }

  editarTarea(t: Tarea): void {
    this.auth.setTareaId(t.tarea_id);
    this.router.navigate(['/profesor/grupos', this.groupId, 'tareas', t.tarea_id, 'editar']);
  }

  async eliminarTarea(t: Tarea): Promise<void> {
    const ok = await sw.confirm(`Seguro que deseas eliminar "${t.titulo}"?`);
    if (!ok) return;
    this.api.post<ApiResponse>('/eliminarTarea', { tarea_id: t.tarea_id }).subscribe({
      next: () => {
        sw.success('Tarea eliminada');
        this.tareas.update(ts => ts.filter(x => x.tarea_id !== t.tarea_id));
      },
      error: () => sw.error('Error', 'No se pudo eliminar la tarea.'),
    });
  }
}
