import { renderHeader } from '../components/header';
import { LoginResponse, Grupo } from '../types';
import { session } from '../utils/auth';
import { showError, showInfo } from '../utils/swal';

renderHeader({ showBack: false });

const API = 'http://localhost:3001';

async function cargarGrupos(): Promise<void> {
  try {
    const data = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: session.getUser(), passwd: session.getPasswd() }),
    }).then(r => r.json()) as LoginResponse;

    if (!data.grupos || data.grupos.length === 0) {
      await showInfo('Sin grupos', 'No hay grupos disponibles.');
      return;
    }

    const tbody = document.querySelector<HTMLTableSectionElement>('#gruposTable tbody')!;
    data.grupos.forEach((grupo: Grupo) => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50 transition cursor-pointer';
      tr.innerHTML = `
        <td class="px-4 py-3 text-gray-700 font-mono">${grupo.group_id}</td>
        <td class="px-4 py-3 text-blue-700 font-medium hover:underline">${grupo.nombre}</td>
      `;
      tr.addEventListener('click', () => {
        session.set('group_id', String(grupo.group_id));
        window.location.href = 'visualizarGrupo.html';
      });
      tbody.appendChild(tr);
    });
  } catch {
    await showError('Error', 'No se pudo cargar los grupos.');
  }
}

document.getElementById('crearGrupoBtn')!
  .addEventListener('click', () => { window.location.href = 'crearGrupo.html'; });

cargarGrupos();
