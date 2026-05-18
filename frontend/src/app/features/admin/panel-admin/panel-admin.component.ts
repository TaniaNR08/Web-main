import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Usuario, ApiResponse, Rol } from '../../../shared/models';
import { coincideBusqueda } from '../../../shared/utils/texto-busqueda';
import { sw, Swal } from '../../../shared/utils/swal';

interface UsuariosResponse { usuarios: Usuario[]; error?: string; }

const ROL_STYLES: Record<string, string> = {
  administrador: 'bg-purple-100 text-purple-700',
  profesor:      'bg-blue-100 text-blue-700',
  estudiante:    'bg-green-100 text-green-700',
};

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [HeaderComponent, ReactiveFormsModule, RouterLink],
  template: `
    <app-header [showBack]="false" />

    <div class="page-bg">
      <div class="page-content px-4">
        <div class="max-w-5xl mx-auto space-y-6">

          <div class="flex justify-end">
            <a routerLink="/admin/contenido"
              class="inline-flex items-center gap-2 bg-white/90 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white transition shadow">
              <i class="fa-solid fa-newspaper"></i> Gestionar contenido del sitio
            </a>
          </div>

          <!-- Crear usuario -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Crear Usuario</h2>
            <form [formGroup]="crearForm" (ngSubmit)="crearUsuario()">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div class="flex flex-col gap-1">
                  <label class="text-sm font-medium text-gray-600">Identificación</label>
                  <input type="number" formControlName="user_id" placeholder="Ej: 1019986000"
                    class="input-field">
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-sm font-medium text-gray-600">Nombre completo</label>
                  <input type="text" formControlName="nombre" placeholder="Ej: Juan Perez"
                    class="input-field">
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-sm font-medium text-gray-600">Contraseña</label>
                  <input type="text" formControlName="passwd" placeholder="Contraseña inicial"
                    class="input-field">
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-sm font-medium text-gray-600">Rol</label>
                  <select formControlName="rol"
                    class="input-field">
                    <option value="">Seleccionar...</option>
                    <option value="estudiante">Estudiante</option>
                    <option value="profesor">Profesor</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
              </div>
              <div class="mt-4 flex items-center gap-4">
                <button type="submit"
                  class="btn-primary">
                  Crear Usuario
                </button>
                @if (feedback()) {
                  <p [class]="feedbackOk() ? 'text-sm font-medium text-green-600' : 'text-sm font-medium text-red-500'">
                    {{ feedback() }}
                  </p>
                }
              </div>
            </form>
          </div>

          <!-- Tabla usuarios -->
          <div class="card p-6">
            <div class="mb-4 pb-2 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-800">Usuarios registrados</h2>
              <p class="text-sm text-gray-500 mt-0.5">
                {{ usuariosFiltrados().length }} de {{ usuarios().length }} usuarios
              </p>
            </div>

            <div class="panel-filtros mb-4">
              <label class="grupos-search flex-1" for="filtro-usuarios-texto">
                <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                <input
                  id="filtro-usuarios-texto"
                  type="search"
                  [formControl]="filtroTexto"
                  placeholder="Buscar por ID o nombre..."
                  autocomplete="off">
              </label>
              <div class="flex flex-col gap-1 min-w-[10rem]">
                <label class="text-xs font-medium text-gray-600" for="filtro-usuarios-rol">Rol</label>
                <select id="filtro-usuarios-rol" [formControl]="filtroRol" class="panel-filtros-select">
                  <option value="">Todos los roles</option>
                  <option value="estudiante">Estudiante</option>
                  <option value="profesor">Profesor</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
              @if (hayFiltrosActivos()) {
                <button type="button" class="panel-filtros-limpiar" (click)="limpiarFiltros()">
                  Limpiar filtros
                </button>
              }
            </div>

            <div class="overflow-x-auto">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  @for (u of usuariosFiltrados(); track u.user_id) {
                    <tr>
                      <td class="text-gray-700 font-mono text-xs">{{ u.user_id }}</td>
                      <td class="text-gray-800 font-medium">{{ u.nombre }}</td>
                      <td>
                        <span class="px-2 py-1 rounded-full text-xs font-semibold capitalize"
                          [class]="rolStyle(u.rol)">{{ u.rol }}</span>
                      </td>
                      <td class="px-4 py-3">
                        <div class="flex gap-2">
                          <button (click)="editarUsuario(u)"
                            class="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition">
                            Editar
                          </button>
                          <button (click)="eliminarUsuario(u)"
                            class="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition">
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="text-center text-gray-400 py-6 text-sm">
                        @if (usuarios().length && hayFiltrosActivos()) {
                          No hay usuarios que coincidan con el filtro.
                        } @else {
                          Sin usuarios registrados.
                        }
                      </td>
                    </tr>
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
export class PanelAdminComponent implements OnInit {
  private api = inject(ApiService);

  usuarios   = signal<Usuario[]>([]);
  feedback   = signal('');
  feedbackOk = signal(false);

  filtroTexto = new FormControl('', { nonNullable: true });
  filtroRol   = new FormControl('', { nonNullable: true });

  private terminoTexto = toSignal(
    this.filtroTexto.valueChanges.pipe(startWith(this.filtroTexto.value)),
    { initialValue: '' },
  );
  private rolSeleccionado = toSignal(
    this.filtroRol.valueChanges.pipe(startWith(this.filtroRol.value)),
    { initialValue: '' },
  );

  usuariosFiltrados = computed(() => {
    const texto = this.terminoTexto()?.trim() ?? '';
    const rol = this.rolSeleccionado() ?? '';
    return this.usuarios().filter((u) => {
      const coincideRol = !rol || u.rol === rol;
      if (!coincideRol) return false;
      if (!texto) return true;
      const porNombre = coincideBusqueda(u.nombre, texto);
      const porId = String(u.user_id).includes(texto.replace(/\s/g, ''));
      return porNombre || porId;
    });
  });

  crearForm = new FormGroup({
    user_id: new FormControl('', Validators.required),
    nombre:  new FormControl('', Validators.required),
    passwd:  new FormControl('', Validators.required),
    rol:     new FormControl('', Validators.required),
  });

  ngOnInit(): void { this.cargarUsuarios(); }

  rolStyle(rol: string): string { return ROL_STYLES[rol] ?? ''; }

  hayFiltrosActivos(): boolean {
    return !!this.filtroTexto.value.trim() || !!this.filtroRol.value;
  }

  limpiarFiltros(): void {
    this.filtroTexto.setValue('');
    this.filtroRol.setValue('');
  }

  cargarUsuarios(): void {
    this.api.get<UsuariosResponse>('/usuarios').subscribe({
      next: ({ usuarios }) => this.usuarios.set(usuarios),
      error: () => sw.error('Error', 'No se pudo cargar los usuarios.'),
    });
  }

  crearUsuario(): void {
    if (this.crearForm.invalid) return;
    this.api.post<ApiResponse>('/usuarios', this.crearForm.getRawValue()).subscribe({
      next: (data) => {
        if (data.error) {
          this.feedback.set(data.error); this.feedbackOk.set(false);
        } else {
          this.feedback.set(data.message ?? 'Usuario creado'); this.feedbackOk.set(true);
          this.crearForm.reset();
          sw.success('Usuario creado');
          this.cargarUsuarios();
        }
      },
      error: () => { this.feedback.set('Error al crear usuario'); this.feedbackOk.set(false); },
    });
  }

  async editarUsuario(u: Usuario): Promise<void> {
    const { value } = await Swal.fire<{ nombre: string; passwd: string; rol: Rol }>({
      title: 'Editar usuario', width: 480,
      html: `
        <div class="flex flex-col gap-3 text-left mt-2">
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1">ID</label>
            <input disabled value="${u.user_id}" class="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-400">
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1">Nombre</label>
            <input id="swal-nombre" value="${u.nombre}" class="input-field">
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1">Contraseña</label>
            <input id="swal-passwd" placeholder="Nueva contraseña" class="input-field">
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1">Rol</label>
            <select id="swal-rol" class="input-field">
              <option value="estudiante" ${u.rol === 'estudiante' ? 'selected' : ''}>Estudiante</option>
              <option value="profesor"   ${u.rol === 'profesor'   ? 'selected' : ''}>Profesor</option>
              <option value="administrador" ${u.rol === 'administrador' ? 'selected' : ''}>Administrador</option>
            </select>
          </div>
        </div>`,
      confirmButtonText: 'Guardar cambios', confirmButtonColor: '#1e3a5f',
      cancelButtonText: 'Cancelar', showCancelButton: true,
      customClass: { popup: 'rounded-2xl' },
      preConfirm: () => {
        const nombre = (document.getElementById('swal-nombre') as HTMLInputElement).value;
        const passwd = (document.getElementById('swal-passwd') as HTMLInputElement).value;
        const rol    = (document.getElementById('swal-rol')    as HTMLSelectElement).value as Rol;
        if (!nombre || !passwd) { Swal.showValidationMessage('Nombre y contraseña son requeridos'); return false; }
        return { nombre, passwd, rol };
      },
    });
    if (!value) return;
    this.api.patch<ApiResponse>(`/usuarios/${u.user_id}`, value).subscribe({
      next: (data) => {
        if (data.error) { sw.error('Error', data.error); return; }
        sw.success('Actualizado', data.message); this.cargarUsuarios();
      },
      error: () => sw.error('Error', 'No se pudo actualizar el usuario.'),
    });
  }

  async eliminarUsuario(u: Usuario): Promise<void> {
    const ok = await sw.confirm(`Seguro que deseas eliminar a ${u.nombre}?`);
    if (!ok) return;
    this.api.delete<ApiResponse>(`/usuarios/${u.user_id}`).subscribe({
      next: (data) => {
        if (data.error) { sw.error('Error', data.error); return; }
        sw.success('Eliminado', data.message); this.cargarUsuarios();
      },
      error: () => sw.error('Error', 'No se pudo eliminar el usuario.'),
    });
  }
}
