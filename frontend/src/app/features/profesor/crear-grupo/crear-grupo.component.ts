import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ApiResponse } from '../../../shared/models';
import { sw } from '../../../shared/utils/swal';

@Component({
  selector: 'app-crear-grupo',
  standalone: true,
  imports: [HeaderComponent, ReactiveFormsModule],
  template: `
    <app-header />
    <div class="page-bg">
      <div class="page-content px-4">
        <div class="max-w-md mx-auto">
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Crear Grupo</h2>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-gray-600">Nombre del Grupo</label>
                <input formControlName="nombre" placeholder="Ej: Algebra Lineal Grupo A1"
                  class="input-field">
              </div>
              <button type="submit"
                class="btn-primary btn-primary--block">
                Crear Grupo
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CrearGrupoComponent {
  private api  = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = new FormGroup({ nombre: new FormControl('', Validators.required) });

  onSubmit(): void {
    if (this.form.invalid) return;
    const { nombre } = this.form.getRawValue();
    this.api.post<ApiResponse>('/crearGrupo', { nombre, profesor: this.auth.user() }).subscribe({
      next: async (data) => {
        if (data.error) { sw.error('Error', data.error); return; }
        await sw.success('Grupo creado', data.message);
        this.router.navigate(['/profesor/grupos']);
      },
      error: () => sw.error('Error', 'No se pudo conectar con el servidor.'),
    });
  }
}
