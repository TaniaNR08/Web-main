import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { Usuario, ApiResponse, Rol } from '../../../shared/models';
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
  imports: [HeaderComponent, ReactiveFormsModule],
  template: `
    <app-header [showBack]="false" />

    <div class="page-bg">
      <div class="page-content px-4">
        <div class="max-w-5xl mx-auto space-y-6">

          <!-- Crear usuario -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Crear Usuario</h2>
            <form [formGroup]="crearForm" (ngSubmit)="crearUsuario()">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div class="flex flex-col gap-1">
                  <label class="text-sm font-medium text-gray-600">Identificacion</label>
                  <input type="number" formControlName="user_id" placeholder="Ej: 1019986000"
                    class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition">
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-sm font-medium text-gray-600">Nombre completo</label>
                  <input type="text" formControlName="nombre" placeholder="Ej: Juan Perez"
                    class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition">
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-sm font-medium text-gray-600">Contrasena</label>
                  <input type="text" formControlName="passwd" placeholder="Contrasena inicial"
                    class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition">
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-sm font-medium text-gray-600">Rol</label>
                  <select formControlName="rol"
                    class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black transition bg-white">
                    <option value="">Seleccionar...</option>
                    <option value="estudiante">Estudiante</option>
                    <option value="profesor">Profesor</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>
              </div>
              <div class="mt-4 flex items-center gap-4">
                <button type="submit"
                  class="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
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
            <h2 class="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">Usuarios Registrados</h2>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="bg-black text-white">
                    <th class="px-4 py-3 text-left font-semibold rounded-tl-lg">ID</th>
                    <th class="px-4 py-3 text-left font-semibold">Nombre</th>
                    <th class="px-4 py-3 text-left font-semibold">Rol</th>
                    <th class="px-4 py-3 text-left font-semibold rounded-tr-lg">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (u of usuarios(); track u.user_id) {
                    <tr class="hover:bg-gray-50 transition">
                      <td class="px-4 py-3 text-gray-700 font-mono">{{ u.user_id }}</td>
                      <td class="px-4 py-3 text-gray-800 font-medium">{{ u.nombre }}</td>
                      <td class="px-4 py-3">
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
                    <tr><td colspan="4" class="px-4 py-6 text-center text-gray-400 text-sm">Sin usuarios registrados</td></tr>
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

  crearForm = new FormGroup({
    user_id: new FormControl('', Validators.required),
    nombre:  new FormControl('', Validators.required),
    passwd:  new FormControl('', Validators.required),
    rol:     new FormControl('', Validators.required),
  });

  ngOnInit(): void { this.cargarUsuarios(); }

  rolStyle(rol: string): string { return ROL_STYLES[rol] ?? ''; }

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
            <input id="swal-nombre" value="${u.nombre}" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black">
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1">Contrasena</label>
            <input id="swal-passwd" placeholder="Nueva contrasena" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black">
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-500 mb-1">Rol</label>
            <select id="swal-rol" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black bg-white">
              <option value="estudiante" ${u.rol === 'estudiante' ? 'selected' : ''}>Estudiante</option>
              <option value="profesor"   ${u.rol === 'profesor'   ? 'selected' : ''}>Profesor</option>
              <option value="administrador" ${u.rol === 'administrador' ? 'selected' : ''}>Administrador</option>
            </select>
          </div>
        </div>`,
      confirmButtonText: 'Guardar cambios', confirmButtonColor: '#000',
      cancelButtonText: 'Cancelar', showCancelButton: true,
      customClass: { popup: 'rounded-2xl' },
      preConfirm: () => {
        const nombre = (document.getElementById('swal-nombre') as HTMLInputElement).value;
        const passwd = (document.getElementById('swal-passwd') as HTMLInputElement).value;
        const rol    = (document.getElementById('swal-rol')    as HTMLSelectElement).value as Rol;
        if (!nombre || !passwd) { Swal.showValidationMessage('Nombre y contrasena son requeridos'); return false; }
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
