import { renderHeader } from '../components/header';
import { api } from '../services/api';
import { Tarea, TareasResponse, IsEntregadaResponse } from '../types';
import { session } from '../utils/auth';
import { showError } from '../utils/swal';

renderHeader({ showBack: true });

let ordenInicial = true;

async function isEntregada(tarea_id: number): Promise<boolean> {
  try {
    const { success } = await api.post<IsEntregadaResponse>('/isEntregada', { tarea_id, user_id: session.getUser() });
    return success;
  } catch { return false; }
}

function sortByFecha(tareas: Tarea[]): Tarea[] {
  return [...tareas].sort((a, b) => new Date(a.fecha_final).getTime() - new Date(b.fecha_final).getTime());
}

async function sortByEstado(tareas: Tarea[]): Promise<Tarea[]> {
  const con = await Promise.all(tareas.map(async t => ({ t, done: await isEntregada(t.tarea_id) })));
  return con.sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1)).map(x => x.t);
}

async function renderTareas(tareas: Tarea[]): Promise<void> {
  const tbody = document.querySelector<HTMLTableSectionElement>('#tareasTable tbody')!;
  tbody.innerHTML = '';

  for (const tarea of tareas) {
    const vencida = new Date(tarea.fecha_final) < new Date();
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50 transition';

    const tdTitulo = document.createElement('td'); tdTitulo.className = 'px-4 py-3 text-gray-800 font-medium'; tdTitulo.textContent = tarea.titulo;
    const tdDesc   = document.createElement('td'); tdDesc.className   = 'px-4 py-3 text-gray-600';             tdDesc.textContent   = tarea.descripcion;
    const tdIni    = document.createElement('td'); tdIni.className    = 'px-4 py-3 text-gray-600 text-xs';     tdIni.textContent    = tarea.fecha_inicio;
    const tdFin    = document.createElement('td'); tdFin.className    = 'px-4 py-3 text-gray-600 text-xs';     tdFin.textContent    = tarea.fecha_final;
    const tdBtn    = document.createElement('td'); tdBtn.className    = 'px-4 py-3';

    tr.append(tdTitulo, tdDesc, tdIni, tdFin, tdBtn);
    tbody.appendChild(tr);

    isEntregada(tarea.tarea_id).then(done => {
      const btn = document.createElement('button');
      if (vencida) {
        btn.disabled  = true;
        btn.textContent = done ? 'Entregado' : 'Vencida';
        btn.className = done
          ? 'px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-100 text-green-700 border border-green-200 cursor-not-allowed'
          : 'px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-600 border border-red-200 cursor-not-allowed';
      } else {
        btn.textContent = done ? 'Editar entrega' : 'Entregar';
        btn.className   = done
          ? 'px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition'
          : 'px-3 py-1.5 text-xs font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition';
        btn.addEventListener('click', () => { session.set('tarea_id', String(tarea.tarea_id)); window.location.href = 'entregarTarea.html'; });
      }
      tdBtn.appendChild(btn);
    });
  }
}

async function cargarTareas(): Promise<void> {
  try {
    const { tareas } = await api.post<TareasResponse>('/listarTareas', { group_id: session.getGroupId() });
    if (!tareas?.length) return;

    const btn = document.getElementById('cambiarOrdenBtn')!;
    if (ordenInicial) {
      btn.textContent = 'Cambiar Orden: Por Estado';
      ordenInicial = false;
      renderTareas(await sortByEstado(tareas));
    } else {
      btn.textContent = 'Cambiar Orden: Por Fecha';
      ordenInicial = true;
      renderTareas(sortByFecha(tareas));
    }
  } catch {
    await showError('Error', 'No se pudo cargar las tareas.');
  }
}

document.getElementById('cambiarOrdenBtn')!.addEventListener('click', cargarTareas);
cargarTareas();
