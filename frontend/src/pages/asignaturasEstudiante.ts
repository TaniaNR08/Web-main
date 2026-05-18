import { renderHeader } from '../components/header';
import { api } from '../services/api';
import { LoginResponse, Grupo } from '../types';
import { session } from '../utils/auth';
import { showError, showWarning } from '../utils/swal';

renderHeader({ showBack: false });

const API = 'http://localhost:3001';

async function fetchEntregasProximas(group_id: number): Promise<boolean> {
  try {
    const res = await api.post<{ data: [unknown, { entregas: unknown[]; result: { fecha_final: string } }] | null; success: boolean }>(
      '/entregasProximas',
      { user_id: session.getUser(), group_id }
    );
    if (res.data != null) {
      if (res.data[1].entregas.length === 0) {
        const diff = Math.ceil((new Date(res.data[1].result.fecha_final).getTime() - Date.now()) / 86_400_000);
        if (diff <= 3) return res.success;
      }
    }
    return false;
  } catch {
    return false;
  }
}

async function cargarAsignaturas(): Promise<void> {
  try {
    const data = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: session.getUser(), passwd: session.getPasswd() }),
    }).then(r => r.json()) as LoginResponse;

    if (!data.asignaturas || data.asignaturas.length === 0) return;

    const tbody = document.querySelector<HTMLTableSectionElement>('#asignaturasTable tbody')!;
    data.asignaturas.forEach(async (asignatura: Grupo) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50 transition cursor-pointer';
      tr.innerHTML = `
        <td class="px-4 py-3 text-gray-700 font-mono">${asignatura.group_id}</td>
        <td class="px-4 py-3 text-blue-700 font-medium hover:underline">${asignatura.nombre}</td>
      `;
      tr.addEventListener('click', () => {
        session.set('group_id', String(asignatura.group_id));
        window.location.href = 'visualizarAsignatura.html';
      });
      tbody.appendChild(tr);

      const pendiente = await fetchEntregasProximas(asignatura.group_id);
      if (pendiente) {
        await showWarning('Tarea pendiente', `${asignatura.nombre} contiene tareas por vencer.`);
      }
    });
  } catch {
    await showError('Error', 'No se pudo cargar las asignaturas.');
  }
}

cargarAsignaturas();
