import { renderHeader } from '../components/header';
import { api } from '../services/api';
import { ApiResponse } from '../types';
import { session } from '../utils/auth';
import { showSuccess, showError } from '../utils/swal';

renderHeader({ showBack: true });

document.getElementById('tareaForm')!.addEventListener('submit', async (e) => {
  e.preventDefault();
  const titulo      = (document.getElementById('titulo')      as HTMLInputElement).value;
  const descripcion = (document.getElementById('descripcion') as HTMLTextAreaElement).value;
  const fecha_inicio = (document.getElementById('fecha_inicio') as HTMLInputElement).value;
  const fecha_final  = (document.getElementById('fecha_final')  as HTMLInputElement).value;

  try {
    const data = await api.post<ApiResponse>('/asignarTarea', {
      titulo, descripcion, fecha_inicio, fecha_final, group_id: session.getGroupId(),
    });
    if (data.error) { await showError('Error', data.error); return; }
    await showSuccess('Tarea asignada');
    history.back();
  } catch {
    await showError('Error', 'No se pudo conectar con el servidor.');
  }
});
