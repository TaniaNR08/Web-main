import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Entrega } from '../../../shared/models';
import { sw } from '../../../shared/utils/swal';

interface EntregasResponse { entregas: Entrega[]; }

@Component({
  selector: 'app-ver-entregas',
  standalone: true,
  imports: [HeaderComponent],
  template: `
    <app-header />
    <div class="page-bg">
      <div class="page-content px-4">
        <div class="max-w-4xl mx-auto">
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Entregas de la Tarea</h2>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead><tr class="bg-black text-white">
                  <th class="px-4 py-3 text-left font-semibold rounded-tl-lg">Estudiante</th>
                  <th class="px-4 py-3 text-left font-semibold">Fecha de Entrega</th>
                  <th class="px-4 py-3 text-left font-semibold rounded-tr-lg">Archivo</th>
                </tr></thead>
                <tbody class="divide-y divide-gray-100">
                  @for (e of entregas(); track e.entrega_id) {
                    <tr class="hover:bg-gray-50 transition">
                      <td class="px-4 py-3 text-gray-700 font-mono">{{ e.user_id }}</td>
                      <td class="px-4 py-3 text-gray-600 text-xs">{{ e.fecha_entrega }}</td>
                      <td class="px-4 py-3 text-gray-600">{{ e.nombre ?? '-' }}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="3" class="px-4 py-6 text-center text-gray-400 text-sm">Sin entregas</td></tr>
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
export class VerEntregasComponent implements OnInit {
  private api   = inject(ApiService);
  private route = inject(ActivatedRoute);
  entregas      = signal<Entrega[]>([]);

  ngOnInit(): void {
    const tareaId = this.route.snapshot.paramMap.get('tareaId');
    this.api.post<EntregasResponse>('/verEntregas', { tarea_id: tareaId }).subscribe({
      next: ({ entregas }) => this.entregas.set(entregas ?? []),
      error: () => sw.error('Error', 'No se pudo cargar las entregas.'),
    });
  }
}
