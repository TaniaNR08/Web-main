import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Tarea, ApiResponse } from '../../../shared/models';
import { sw } from '../../../shared/utils/swal';

interface EstudiantesResponse { estudiantes: Array<{ user_id: number }>; }
interface TareasResponse { tareas: Tarea[]; }

@Component({
  selector: 'app-visualizar-grupo',
  standalone: true,
  imports: [HeaderComponent],
  template: `
    <app-header />
    <div class="page-bg">
      <div class="page-content px-4">
        <div class="max-w-5xl mx-auto space-y-6">

          <!-- Estudiantes -->
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-800">Estudiantes Inscritos</h2>
              <button (click)="router.navigate(['/profesor/grupos', groupId, 'inscribir'])"
                class="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                Inscribir Estudiante
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead><tr class="bg-black text-white">
                  <th class="px-4 py-3 text-left font-semibold rounded-lg">Codigo</th>
                </tr></thead>
                <tbody class="divide-y divide-gray-100">
                  @for (e of estudiantes(); track e.user_id) {
                    <tr class="hover:bg-gray-50"><td class="px-4 py-3 text-gray-700 font-mono">{{ e.user_id }}</td></tr>
                  } @empty {
                    <tr><td class="px-4 py-6 text-center text-gray-400 text-sm">Sin estudiantes</td></tr>
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
                class="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                Asignar Tarea
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead><tr class="bg-black text-white">
                  <th class="px-4 py-3 text-left font-semibold rounded-tl-lg">Tarea</th>
                  <th class="px-4 py-3 text-left font-semibold">Descripcion</th>
                  <th class="px-4 py-3 text-left font-semibold">Inicio</th>
                  <th class="px-4 py-3 text-left font-semibold">Final</th>
                  <th class="px-4 py-3 text-left font-semibold">Entregas</th>
                  <th class="px-4 py-3 text-left font-semibold">Editar</th>
                  <th class="px-4 py-3 text-left font-semibold rounded-tr-lg">Eliminar</th>
                </tr></thead>
                <tbody class="divide-y divide-gray-100">
                  @for (t of tareas(); track t.tarea_id) {
                    <tr class="hover:bg-gray-50 transition">
                      <td class="px-4 py-3 text-gray-800 font-medium">{{ t.titulo }}</td>
                      <td class="px-4 py-3 text-gray-600 max-w-xs truncate">{{ t.descripcion }}</td>
                      <td class="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{{ t.fecha_inicio }}</td>
                      <td class="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">{{ t.fecha_final }}</td>
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
  estudiantes = signal<Array<{ user_id: number }>>([]);
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
