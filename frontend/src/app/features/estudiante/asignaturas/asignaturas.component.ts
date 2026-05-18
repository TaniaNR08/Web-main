import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Grupo } from '../../../shared/models';
import { sw } from '../../../shared/utils/swal';

interface AsignaturasResponse { asignaturas: Grupo[]; }
interface EntregasProximasItem { result: { fecha_final: string }; entregas: unknown[]; }
interface EntregasProximasResponse { success: boolean; data: EntregasProximasItem[]; }

@Component({
  selector: 'app-asignaturas',
  standalone: true,
  imports: [HeaderComponent],
  template: `
    <app-header [showBack]="false" />
    <div class="page-bg">
      <div class="page-content px-4">
        <div class="max-w-4xl mx-auto">
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Mis Asignaturas</h2>
            <div class="overflow-x-auto">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Asignatura</th>
                  </tr>
                </thead>
                <tbody>
                  @for (a of asignaturas(); track a.group_id) {
                    <tr class="cursor-pointer" (click)="verAsignatura(a)">
                      <td class="text-gray-600 font-mono text-xs">{{ a.group_id }}</td>
                      <td><span class="link-table">{{ a.nombre }}</span></td>
                    </tr>
                  } @empty {
                    <tr><td colspan="2" class="text-center text-gray-400 py-6">Sin asignaturas</td></tr>
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
export class AsignaturasComponent implements OnInit {
  private api    = inject(ApiService);
  private auth   = inject(AuthService);
  private router = inject(Router);
  asignaturas    = signal<Grupo[]>([]);

  ngOnInit(): void {
    this.api.get<AsignaturasResponse>(`/asignaturas/estudiante/${this.auth.user()}`).subscribe({
      next: ({ asignaturas }) => {
        this.asignaturas.set(asignaturas ?? []);
        this.checkPendientes(asignaturas ?? []);
      },
      error: () => sw.error('Error', 'No se pudo cargar las asignaturas.'),
    });
  }

  verAsignatura(a: Grupo): void {
    this.auth.setGroupId(a.group_id);
    this.router.navigate(['/estudiante/asignaturas', a.group_id]);
  }

  private checkPendientes(asignaturas: Grupo[]): void {
    const userId = this.auth.user();
    asignaturas.forEach(a => {
      this.api.post<EntregasProximasResponse>('/entregasProximas', {
        user_id: userId,
        group_id: a.group_id,
      }).subscribe({
        next: ({ data }) => {
          if (!data?.length) return;
          const hasPendiente = data.some(({ result, entregas }) => {
            if (entregas.length > 0) return false;
            const diff = Math.ceil(
              (new Date(result.fecha_final).getTime() - Date.now()) / 86_400_000
            );
            return diff >= 0 && diff <= 3;
          });
          if (hasPendiente) {
            sw.warning('Tarea pendiente', `"${a.nombre}" tiene tareas próximas a vencer.`);
          }
        },
      });
    });
  }
}
