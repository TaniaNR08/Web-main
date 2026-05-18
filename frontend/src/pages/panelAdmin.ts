import { renderHeader } from '../components/header';
import { api } from '../services/api';
import { Usuario, UsuariosResponse, ApiResponse } from '../types';
import { showSuccess, showError, confirmDelete, Swal } from '../utils/swal';

const ROL_STYLES: Record<string, string> = {
  administrador: 'bg-purple-100 text-purple-700',
  profesor:      'bg-blue-100 text-blue-700',
  estudiante:    'bg-green-100 text-green-700',
};

renderHeader({ showBack: false });

async function cargarUsuarios(): Promise<void> {
  try {
    const { usuarios, error } = await api.get<UsuariosResponse>('/usuarios');
    if (error) { await showError('Error', error); return; }

    const tbody = document.querySelector<HTMLTableSectionElement>('#usuariosTable tbody')!;
    tbody.innerHTML = '';

    usuarios.forEach((u) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50 transition';
      tr.innerHTML = `
        <td class="px-4 py-3 text-gray-700 font-mono">${u.user_id}</td>
        <td class="px-4 py-3 text-gray-800 font-medium">${u.nombre}</td>
        <td class="px-4 py-3">
          <span class="px-2 py-1 rounded-full text-xs font-semibold capitalize ${ROL_STYLES[u.rol] ?? ''}">
            ${u.rol}
          </span>
        </td>
        <td class="px-4 py-3">
          <div class="flex gap-2">
            <button data-action="editar" class="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition">Editar</button>
            <button data-action="eliminar" class="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition">Eliminar</button>
          </div>
        </td>
      `;
      tr.querySelector<HTMLButtonElement>('[data-action="editar"]')!
        .addEventListener('click', () => editarUsuario(u));
      tr.querySelector<HTMLButtonElement>('[data-action="eliminar"]')!
        .addEventListener('click', () => eliminarUsuario(u));
      tbody.appendChild(tr);
    });
  } catch {
    await showError('Error', 'No se pudo cargar los usuarios.');
  }
}

async function editarUsuario(u: Usuario): Promise<void> {
  const { value: formValues } = await Swal.fire<{ nombre: string; passwd: string; rol: string }>({
    title: 'Editar usuario',
    width: 480,
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
    confirmButtonText: 'Guardar cambios',
    confirmButtonColor: '#000',
    cancelButtonText: 'Cancelar',
    showCancelButton: true,
    customClass: { popup: 'rounded-2xl' },
    preConfirm: () => {
      const nombre = (document.getElementById('swal-nombre') as HTMLInputElement).value;
      const passwd = (document.getElementById('swal-passwd') as HTMLInputElement).value;
      const rol    = (document.getElementById('swal-rol')    as HTMLSelectElement).value;
      if (!nombre || !passwd) {
        Swal.showValidationMessage('Nombre y contrasena son requeridos');
        return false;
      }
      return { nombre, passwd, rol };
    },
  });

  if (!formValues) return;

  try {
    const data = await api.patch<ApiResponse>(`/usuarios/${u.user_id}`, formValues);
    if (data.error) { await showError('Error', data.error); return; }
    await showSuccess('Actualizado', data.message);
    cargarUsuarios();
  } catch {
    await showError('Error', 'No se pudo actualizar el usuario.');
  }
}

async function eliminarUsuario(u: Usuario): Promise<void> {
  const ok = await confirmDelete(`Seguro que deseas eliminar a ${u.nombre}?`);
  if (!ok) return;

  try {
    const data = await api.delete<ApiResponse>(`/usuarios/${u.user_id}`);
    if (data.error) { await showError('Error', data.error); return; }
    await showSuccess('Eliminado', data.message);
    cargarUsuarios();
  } catch {
    await showError('Error', 'No se pudo eliminar el usuario.');
  }
}

document.getElementById('crearUsuarioForm')!.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form     = e.target as HTMLFormElement;
  const user_id  = (document.getElementById('user_id')  as HTMLInputElement).value;
  const nombre   = (document.getElementById('nombre')   as HTMLInputElement).value;
  const passwd   = (document.getElementById('passwd')   as HTMLInputElement).value;
  const rol      = (document.getElementById('rol')      as HTMLSelectElement).value;
  const feedback = document.getElementById('formFeedback')!;

  try {
    const data = await api.post<ApiResponse>('/usuarios', { user_id, nombre, passwd, rol });
    if (data.error) {
      feedback.textContent = data.error;
      feedback.className   = 'text-sm font-medium text-red-500';
    } else {
      feedback.textContent = data.message ?? 'Usuario creado correctamente';
      feedback.className   = 'text-sm font-medium text-green-600';
      form.reset();
      await showSuccess('Usuario creado');
      cargarUsuarios();
    }
  } catch {
    feedback.textContent = 'Error al crear usuario';
    feedback.className   = 'text-sm font-medium text-red-500';
  }
});

cargarUsuarios();
