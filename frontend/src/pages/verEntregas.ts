import { renderHeader } from '../components/header';
import { api } from '../services/api';
import { EntregasResponse } from '../types';
import { session } from '../utils/auth';
import { showError } from '../utils/swal';

renderHeader({ showBack: true });

async function cargarEntregas(): Promise<void> {
  try {
    const { entregas } = await api.post<EntregasResponse>('/verEntregas', { tarea_id: session.getTareaId() });
    if (!entregas?.length) return;
    const tbody = document.querySelector<HTMLTableSectionElement>('#entregasTable tbody')!;
    entregas.forEach((e) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50 transition';
      tr.innerHTML = `
        <td class="px-4 py-3 text-gray-700 font-mono">${e.user_id}</td>
        <td class="px-4 py-3 text-gray-600 text-xs">${e.fecha_entrega}</td>
        <td class="px-4 py-3 text-gray-600">${e.nombre ?? '-'}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch {
    await showError('Error', 'No se pudo cargar las entregas.');
  }
}

cargarEntregas();
