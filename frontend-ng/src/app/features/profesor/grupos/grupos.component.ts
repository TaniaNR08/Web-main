import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Grupo } from '../../../shared/models';
import { sw } from '../../../shared/utils/swal';

interface GruposResponse { grupos: Grupo[]; }

@Component({
  selector: 'app-grupos',
  standalone: true,
  imports: [HeaderComponent],
  template: `
    <app-header [showBack]="false" />
    <div class="page-bg">
      <div class="page-content px-4">
        <div class="max-w-3xl mx-auto">
          <div class="card p-6">
            <div class="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-800">Mis Grupos</h2>
              <button (click)="router.navigate(['/profesor/grupos/crear'])"
                class="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                Crear Grupo
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-black text-white">
                    <th class="px-4 py-3 text-left font-semibold rounded-tl-lg">ID</th>
                    <th class="px-4 py-3 text-left font-semibold rounded-tr-lg">Nombre del Grupo</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (g of grupos(); track g.group_id) {
                    <tr class="hover:bg-gray-50 transition cursor-pointer" (click)="verGrupo(g)">
                      <td class="px-4 py-3 text-gray-700 font-mono">{{ g.group_id }}</td>
                      <td class="px-4 py-3 text-blue-700 font-medium hover:underline">{{ g.nombre }}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="2" class="px-4 py-6 text-center text-gray-400 text-sm">Sin grupos</td></tr>
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
export class GruposComponent implements OnInit {
  private api  = inject(ApiService);
  private auth = inject(AuthService);
  router       = inject(Router);
  grupos       = signal<Grupo[]>([]);

  ngOnInit(): void {
    const user = this.auth.user();
    this.api.get<GruposResponse>(`/grupos/profesor/${user}`).subscribe({
      next: ({ grupos }) => this.grupos.set(grupos ?? []),
      error: () => sw.error('Error', 'No se pudo cargar los grupos.'),
    });
  }

  verGrupo(g: Grupo): void {
    this.auth.setGroupId(g.group_id);
    this.router.navigate(['/profesor/grupos', g.group_id]);
  }
}
