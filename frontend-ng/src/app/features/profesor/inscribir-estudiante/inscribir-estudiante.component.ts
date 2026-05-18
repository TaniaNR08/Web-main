import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ApiResponse } from '../../../shared/models';
import { sw } from '../../../shared/utils/swal';

@Component({
  selector: 'app-inscribir-estudiante',
  standalone: true,
  imports: [HeaderComponent, ReactiveFormsModule],
  template: `
    <app-header />
    <div class="page-bg">
      <div class="page-content px-4">
        <div class="max-w-md mx-auto">
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Inscribir Estudiante</h2>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-gray-600">Numero de Identificacion</label>
                <input formControlName="estudiante_id" placeholder="Ej: 1019987036"
                  class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition">
              </div>
              <button type="submit"
                class="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                Inscribir
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class InscribirEstudianteComponent {
  private api    = inject(ApiService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  form = new FormGroup({ estudiante_id: new FormControl('', Validators.required) });

  onSubmit(): void {
    if (this.form.invalid) return;
    const groupId = this.route.snapshot.paramMap.get('id');
    this.api.post<ApiResponse>('/inscribirEstudiante', {
      estudiante_id: this.form.getRawValue().estudiante_id,
      group_id: groupId,
    }).subscribe({
      next: async (data) => {
        if (data.error) { sw.error('Error', data.error); return; }
        await sw.success('Estudiante inscrito', data.message);
        this.router.navigate(['/profesor/grupos', groupId]);
      },
      error: () => sw.error('Error', 'No se pudo conectar con el servidor.'),
    });
  }
}
