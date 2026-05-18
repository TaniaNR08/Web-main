import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { GrupoContextoComponent } from '../../../shared/components/grupo-contexto/grupo-contexto.component';
import { ApiResponse, EstudianteListado } from '../../../shared/models';
import { sw } from '../../../shared/utils/swal';

interface EstudiantesDisponiblesResponse {
  estudiantes: EstudianteListado[];
  error?: string;
}

@Component({
  selector: 'app-inscribir-estudiante',
  standalone: true,
  imports: [HeaderComponent, GrupoContextoComponent, ReactiveFormsModule],
  template: `
    <app-header />
    <div class="page-bg">
      <div class="page-content px-4">
        <app-grupo-contexto subtitulo="Inscribir estudiante" class="block max-w-lg mx-auto" />
        <div class="max-w-lg mx-auto">
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-1 pb-2 border-b border-gray-200">
              Inscribir estudiante
            </h2>
            <p class="text-sm text-gray-500 mb-4">Busque y seleccione un estudiante disponible para el grupo.</p>

            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-1">
                <label class="text-sm font-medium text-gray-600" for="buscar-estudiante">Buscar</label>
                <input
                  id="buscar-estudiante"
                  type="search"
                  [formControl]="busqueda"
                  placeholder="Nombre o número de identificación..."
                  class="input-field"
                  autocomplete="off">
              </div>

              @if (cargando()) {
                <p class="text-sm text-gray-500 text-center py-4">Cargando estudiantes...</p>
              } @else if (errorCarga()) {
                <p class="text-sm text-red-600 text-center py-4">{{ errorCarga() }}</p>
              } @else {
                <div class="border border-gray-200 rounded-lg overflow-hidden">
                  <div class="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-200">
                    Estudiantes disponibles ({{ estudiantes().length }})
                  </div>
                  <ul class="max-h-64 overflow-y-auto divide-y divide-gray-100" role="listbox">
                    @for (e of estudiantes(); track e.user_id) {
                      <li>
                        <button
                          type="button"
                          role="option"
                          class="w-full text-left px-3 py-3 text-sm transition flex justify-between items-center gap-3"
                          [class.bg-gray-100]="seleccionado()?.user_id === e.user_id"
                          [class.ring-2]="seleccionado()?.user_id === e.user_id"
                          [class.ring-inset]="seleccionado()?.user_id === e.user_id"
                          [class.ring-gray-800]="seleccionado()?.user_id === e.user_id"
                          (click)="seleccionar(e)">
                          <span class="font-medium text-gray-800">{{ e.nombre }}</span>
                          <span class="text-gray-500 shrink-0">{{ e.user_id }}</span>
                        </button>
                      </li>
                    } @empty {
                      <li class="px-3 py-6 text-sm text-gray-500 text-center">
                        No hay estudiantes disponibles con ese criterio.
                      </li>
                    }
                  </ul>
                </div>

                @if (seleccionado()) {
                  <p class="text-sm text-gray-600">
                    Seleccionado: <strong>{{ seleccionado()!.nombre }}</strong>
                    ({{ seleccionado()!.user_id }})
                  </p>
                }
              }

              <button
                type="button"
                [disabled]="!seleccionado() || inscribiendo()"
                (click)="inscribir()"
                class="btn-primary btn-primary--block">
                {{ inscribiendo() ? 'Inscribiendo...' : 'Inscribir estudiante' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class InscribirEstudianteComponent implements OnInit {
  private api    = inject(ApiService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  busqueda = new FormControl('', { nonNullable: true });
  estudiantes = signal<EstudianteListado[]>([]);
  seleccionado = signal<EstudianteListado | null>(null);
  cargando = signal(false);
  inscribiendo = signal(false);
  errorCarga = signal('');

  private groupId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');

  ngOnInit(): void {
    this.cargarEstudiantes();
    this.busqueda.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(() => this.cargarEstudiantes());
  }

  seleccionar(estudiante: EstudianteListado): void {
    this.seleccionado.set(estudiante);
  }

  private cargarEstudiantes(): void {
    const groupId = this.groupId();
    if (!groupId) return;

    this.cargando.set(true);
    this.errorCarga.set('');
    const q = this.busqueda.value.trim();
    const url = q
      ? `/estudiantes/disponibles/${groupId}?q=${encodeURIComponent(q)}`
      : `/estudiantes/disponibles/${groupId}`;

    this.api.get<EstudiantesDisponiblesResponse>(url).subscribe({
      next: ({ estudiantes, error }) => {
        this.cargando.set(false);
        if (error) {
          this.errorCarga.set(error);
          this.estudiantes.set([]);
          return;
        }
        this.estudiantes.set(estudiantes ?? []);
        const sel = this.seleccionado();
        if (sel && !estudiantes.some((e) => e.user_id === sel.user_id)) {
          this.seleccionado.set(null);
        }
      },
      error: () => {
        this.cargando.set(false);
        this.errorCarga.set('No se pudo cargar la lista de estudiantes.');
        this.estudiantes.set([]);
      },
    });
  }

  inscribir(): void {
    const estudiante = this.seleccionado();
    const groupId = this.groupId();
    if (!estudiante || !groupId) return;

    this.inscribiendo.set(true);
    this.api.post<ApiResponse>('/inscribirEstudiante', {
      estudiante_id: estudiante.user_id,
      group_id: groupId,
    }).subscribe({
      next: async (data) => {
        this.inscribiendo.set(false);
        if (data.error) { sw.error('Error', data.error); return; }
        const msg = data.message ?? '';
        if (msg && !/correctamente/i.test(msg)) {
          sw.warning('Aviso', msg);
          this.cargarEstudiantes();
          return;
        }
        await sw.success('Estudiante inscrito', msg || 'Inscripción correcta');
        this.router.navigate(['/profesor/grupos', groupId]);
      },
      error: () => {
        this.inscribiendo.set(false);
        sw.error('Error', 'No se pudo conectar con el servidor.');
      },
    });
  }
}
