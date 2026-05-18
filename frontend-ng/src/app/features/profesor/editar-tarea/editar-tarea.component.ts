import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ApiResponse } from '../../../shared/models';
import { sw } from '../../../shared/utils/swal';

@Component({
  selector: 'app-editar-tarea',
  standalone: true,
  imports: [HeaderComponent, ReactiveFormsModule],
  template: `
    <app-header />
    <div class="page-bg">
      <div class="page-content px-4">
        <div class="max-w-lg mx-auto">
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Editar Tarea</h2>
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-gray-600">Nombre de la tarea</label>
                <input formControlName="titulo"
                  class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition">
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-gray-600">Descripcion</label>
                <textarea formControlName="descripcion" rows="3"
                  class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition resize-none"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-1">
                  <label class="text-sm font-medium text-gray-600">Fecha de inicio</label>
                  <input type="datetime-local" formControlName="fecha_inicio"
                    class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition">
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-sm font-medium text-gray-600">Fecha final</label>
                  <input type="datetime-local" formControlName="fecha_final"
                    class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition">
                </div>
              </div>
              <button type="submit"
                class="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EditarTareaComponent implements OnInit {
  private api   = inject(ApiService);
  private route = inject(ActivatedRoute);
  router        = inject(Router);

  private groupId  = '';
  private tareaId  = '';

  form = new FormGroup({
    titulo:       new FormControl('', Validators.required),
    descripcion:  new FormControl('', Validators.required),
    fecha_inicio: new FormControl('', Validators.required),
    fecha_final:  new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id')     ?? '';
    this.tareaId = this.route.snapshot.paramMap.get('tareaId') ?? '';
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.api.post<ApiResponse>('/editarTarea', { ...this.form.getRawValue(), tarea_id: this.tareaId }).subscribe({
      next: async (data) => {
        if (data.error) { sw.error('Error', data.error); return; }
        await sw.success('Tarea actualizada', data.message);
        this.router.navigate(['/profesor/grupos', this.groupId]);
      },
      error: () => sw.error('Error', 'No se pudo conectar con el servidor.'),
    });
  }
}
