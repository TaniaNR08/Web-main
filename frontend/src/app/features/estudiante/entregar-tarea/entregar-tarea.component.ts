import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Entrega } from '../../../shared/models';
import { sw } from '../../../shared/utils/swal';

const FILE_NAME_RE = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+(\.[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+)*$/;
const MAX_SIZE     = 2 * 1024 * 1024 * 1024; // 2 GB

interface IsEntregadaResponse {
  success: boolean;
  entrega?: Entrega | null;
  calificada?: boolean;
  editable?: boolean;
}

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
            @if (bloqueada()) {
              <h2 class="text-lg font-semibold text-gray-800 mb-2">Entrega bloqueada</h2>
              <p class="text-sm text-gray-600 mb-4">
                Esta tarea ya fue calificada. No puedes cambiar el archivo enviado.
              </p>
              <button type="button" class="btn-primary btn-primary--block" (click)="volver()">
                Volver a la asignatura
              </button>
            } @else {
              <h2 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                {{ modoEdicion() ? 'Editar entrega' : 'Entregar tarea' }}
              </h2>

              @if (modoEdicion()) {
                <p class="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mb-4">
                  Archivo actual: <strong>{{ entregaActual() }}</strong>. Sube otro archivo solo si deseas reemplazarlo
                  (mientras no haya calificación).
                </p>
              }

              <div class="flex flex-col gap-4">
                <label class="upload-drop" [class.upload-drop--active]="fileName()">
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

                <button type="button" (click)="onSubmit()" [disabled]="loading() || comprobando()"
                  class="btn-primary btn-primary--block">
                  @if (loading()) { Subiendo... } @else { {{ modoEdicion() ? 'Guardar cambios' : 'Entregar' }} }
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EntregarTareaComponent implements OnInit {
  private api    = inject(ApiService);
  private auth   = inject(AuthService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  fileName       = signal('');
  loading        = signal(false);
  comprobando    = signal(true);
  error          = signal('');
  bloqueada      = signal(false);
  modoEdicion    = signal(false);
  entregaActual  = signal('');
  private selectedFile: File | null = null;
  private groupId = '';
  private tareaId = '';

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id') ?? '';
    this.tareaId = this.route.snapshot.paramMap.get('tareaId') ?? '';
    const userId = this.auth.user();

    this.api.post<IsEntregadaResponse>('/isEntregada', { tarea_id: this.tareaId, user_id: userId }).subscribe({
      next: (res) => {
        const calificada = res.calificada ?? res.entrega?.nota != null;
        if (calificada) {
          this.bloqueada.set(true);
        } else if (res.success && res.entrega) {
          this.modoEdicion.set(true);
          this.entregaActual.set(res.entrega.nombre ?? 'archivo');
        }
        this.comprobando.set(false);
      },
      error: () => {
        this.comprobando.set(false);
      },
    });
  }

  volver(): void {
    this.router.navigate(['/estudiante/asignaturas', this.groupId]);
  }

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
    if (this.loading() || this.bloqueada()) return;

    const userId = this.auth.user();
    const fecha  = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const form = new FormData();
    form.append('tarea_id',      this.tareaId);
    form.append('user_id',       userId);
    form.append('fecha_entrega', fecha);
    form.append('nombre',        this.selectedFile.name);
    form.append('archivo_entrega', this.selectedFile, this.selectedFile.name);

    this.loading.set(true);
    this.api.postForm<{ success: boolean; error?: string; actualizada?: boolean }>('/crearEntrega', form).subscribe({
      next: async (data) => {
        this.loading.set(false);
        if (!data.success) {
          sw.error('Error', data.error ?? 'No se pudo subir el archivo.');
          return;
        }
        const titulo = data.actualizada ? 'Entrega actualizada' : 'Entrega realizada';
        const texto  = data.actualizada
          ? 'El archivo se reemplazó correctamente.'
          : 'Archivo subido exitosamente.';
        await sw.success(titulo, texto);
        this.volver();
      },
      error: (err) => {
        this.loading.set(false);
        const msg = (err as { error?: { error?: string } })?.error?.error
          ?? 'No se pudo conectar con el servidor.';
        sw.error('Error', msg);
      },
    });
  }
}
