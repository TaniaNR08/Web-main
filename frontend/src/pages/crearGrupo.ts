import { renderHeader } from '../components/header';
import { api } from '../services/api';
import { ApiResponse } from '../types';
import { session } from '../utils/auth';
import { showSuccess, showError } from '../utils/swal';

renderHeader({ showBack: true });

document.getElementById('crearGrupoForm')!.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre   = (document.getElementById('nombre') as HTMLInputElement).value;
  try {
    const data = await api.post<ApiResponse>('/crearGrupo', { nombre, profesor: session.getUser() });
    if (data.error) { await showError('Error', data.error); return; }
    await showSuccess('Grupo creado', data.message);
    history.back();
  } catch {
    await showError('Error', 'No se pudo conectar con el servidor.');
  }
});
