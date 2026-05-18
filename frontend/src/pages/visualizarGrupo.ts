import { renderHeader } from '../components/header';
import { api } from '../services/api';
import { EstudiantesResponse, TareasResponse, ApiResponse } from '../types';
import { session } from '../utils/auth';
import { showError, confirmDelete, showSuccess } from '../utils/swal';

renderHeader({ showBack: true });

const BTN_BLUE = 'px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition cursor-pointer';
const BTN_RED  = 'px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition cursor-pointer';

async function cargarEstudiantes(): Promise<void> {
  try {
    const { estudiantes } = await api.post<EstudiantesResponse>('/listarEstudiantes', { group_id: session.getGroupId() });
    const tbody = document.querySelector<HTMLTableSectionElement>('#estudiantesTable tbody')!;
    if (!estudiantes?.length) return;
    estudiantes.forEach(({ user_id }) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50 transition';
      tr.innerHTML = `<td class="px-4 py-3 text-gray-700 font-mono">${user_id}</td>`;
      tbody.appendChild(tr);
    });
  } catch {
    await showError('Error', 'No se pudo cargar los estudiantes.');
  }
}

async function eliminarTarea(tarea_id: number): Promise<void> {
  const ok = await confirmDelete('Seguro que deseas eliminar esta tarea?');
  if (!ok) return;
  try {
    await api.post<ApiResponse>('/eliminarTarea', { tarea_id });
    await showSuccess('Tarea eliminada');
    location.reload();
  } catch {
    await showError('Error', 'No se pudo eliminar la tarea.');
  }
}

async function cargarTareas(): Promise<void> {
  try {
    const { tareas } = await api.post<TareasResponse>('/listarTareas', { group_id: session.getGroupId() });
    const tbody = document.querySelector<HTMLTableSectionElement>('#tareasTable tbody')!;
    if (!tareas?.length) return;
    tareas.forEach((tarea) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50 transition';

      const verBtn  = document.createElement('button');
      verBtn.textContent = 'Ver Entregas';
      verBtn.className   = BTN_BLUE;
      verBtn.addEventListener('click', () => { session.set('tarea_id', String(tarea.tarea_id)); window.location.href = 'verEntregas.html'; });

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Editar';
      editBtn.className   = BTN_BLUE;
      editBtn.addEventListener('click', () => { session.set('tarea_id', String(tarea.tarea_id)); window.location.href = 'editarTarea.html'; });

      const elimBtn = document.createElement('button');
      elimBtn.textContent = 'Eliminar';
      elimBtn.className   = BTN_RED;
      elimBtn.addEventListener('click', () => eliminarTarea(tarea.tarea_id));

      tr.innerHTML = `
        <td class="px-4 py-3 text-gray-800 font-medium">${tarea.titulo}</td>
        <td class="px-4 py-3 text-gray-600">${tarea.descripcion}</td>
        <td class="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">${tarea.fecha_inicio}</td>
        <td class="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">${tarea.fecha_final}</td>
      `;
      const mkTd = (btn: HTMLButtonElement) => { const td = document.createElement('td'); td.className = 'px-4 py-3'; td.appendChild(btn); return td; };
      tr.appendChild(mkTd(verBtn));
      tr.appendChild(mkTd(editBtn));
      tr.appendChild(mkTd(elimBtn));
      tbody.appendChild(tr);
    });
  } catch {
    await showError('Error', 'No se pudo cargar las tareas.');
  }
}

document.getElementById('inscribirEstudianteBtn')!
  .addEventListener('click', () => { window.location.href = 'inscribirEstudiante.html'; });
document.getElementById('asignarTareaBtn')!
  .addEventListener('click', () => { window.location.href = 'asignarTarea.html'; });

cargarEstudiantes();
cargarTareas();
