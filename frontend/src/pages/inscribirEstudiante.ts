import { renderHeader } from '../components/header';
import { api } from '../services/api';
import { ApiResponse } from '../types';
import { session } from '../utils/auth';
import { showSuccess, showError } from '../utils/swal';

renderHeader({ showBack: true });

document.getElementById('inscribirEstudianteForm')!.addEventListener('submit', async (e) => {
  e.preventDefault();
  const estudiante_id = (document.getElementById('estudiante_id') as HTMLInputElement).value;
  try {
    const data = await api.post<ApiResponse>('/inscribirEstudiante', { estudiante_id, group_id: session.getGroupId() });
    if (data.error) { await showError('Error', data.error); return; }
    await showSuccess('Estudiante inscrito', data.message);
    history.back();
  } catch {
    await showError('Error', 'No se pudo conectar con el servidor.');
  }
});
