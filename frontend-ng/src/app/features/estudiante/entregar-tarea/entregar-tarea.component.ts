import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { sw } from '../../../shared/utils/swal';

const FILE_NAME_RE = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+(\.[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+)*$/;
const MAX_SIZE     = 2 * 1024 * 1024 * 1024; // 2 GB

@Component({
  selector: 'app-entregar-tarea',
  standalone: true,
  imports: [HeaderComponent],
  template: `
    <app-header />
    <div class="page-bg">
      <div class="page-content px-4">
        <div class="max-w-lg mx-auto">
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Entregar Tarea</h2>

            <div class="flex flex-col gap-4">
              <!-- Drop zone -->
              <label class="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-gray-500 hover:bg-gray-50 transition"
                [class.border-black]="fileName()">
                <input type="file" class="hidden" (change)="onFileChange($event)">
                @if (fileName()) {
                  <i class="fa-solid fa-file-circle-check text-2xl text-green-600"></i>
                  <span class="text-sm font-medium text-gray-700 text-center break-all">{{ fileName() }}</span>
                  <span class="text-xs text-gray-400">Haz clic para cambiar el archivo</span>
                } @else {
                  <i class="fa-solid fa-cloud-arrow-up text-3xl text-gray-400"></i>
                  <span class="text-sm font-medium text-gray-600">Haz clic para seleccionar un archivo</span>
                  <span class="text-xs text-gray-400">Máximo 2 GB</span>
                }
              </label>

              @if (error()) {
                <p class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {{ error() }}
                </p>
              }

              <button (click)="onSubmit()" [disabled]="loading()"
                class="w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
                @if (loading()) { Subiendo... } @else { Entregar }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EntregarTareaComponent {
  private api    = inject(ApiService);
  private auth   = inject(AuthService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  fileName = signal('');
  loading  = signal(false);
  error    = signal('');
  private selectedFile: File | null = null;

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0] ?? null;
    this.error.set('');
    if (!file) return;

    if (file.size > MAX_SIZE) {
      this.error.set('El archivo no puede superar 2 GB.');
      input.value = '';
      return;
    }
    if (!FILE_NAME_RE.test(file.name)) {
      this.error.set('El nombre del archivo solo puede contener letras y números.');
      input.value = '';
      return;
    }

    this.selectedFile = file;
    this.fileName.set(file.name);
  }

  onSubmit(): void {
    if (!this.selectedFile) {
      sw.warning('Archivo requerido', 'Debes seleccionar un archivo.');
      return;
    }
    if (this.loading()) return;

    const tareaId = this.route.snapshot.paramMap.get('tareaId') ?? '';
    const groupId = this.route.snapshot.paramMap.get('id')      ?? '';
    const userId  = this.auth.user();
    const fecha   = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const form = new FormData();
    form.append('tarea_id',      tareaId);
    form.append('user_id',       userId);
    form.append('fecha_entrega', fecha);
    form.append('nombre',        this.selectedFile.name);
    form.append('archivo_entrega', this.selectedFile, this.selectedFile.name);

    this.loading.set(true);
    this.api.postForm<{ success: boolean; error?: string }>('/crearEntrega', form).subscribe({
      next: async (data) => {
        this.loading.set(false);
        if (!data.success) {
          sw.error('Error', data.error ?? 'No se pudo subir el archivo.');
          return;
        }
        await sw.success('Entrega realizada', 'Archivo subido exitosamente.');
        this.router.navigate(['/estudiante/asignaturas', groupId]);
      },
      error: () => {
        this.loading.set(false);
        sw.error('Error', 'No se pudo conectar con el servidor.');
      },
    });
  }
}
