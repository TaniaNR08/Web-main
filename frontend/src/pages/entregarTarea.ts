import { renderHeader } from '../components/header';
import { session } from '../utils/auth';
import { showSuccess, showError, showWarning } from '../utils/swal';

renderHeader({ showBack: true });

document.getElementById('entregarTareaForm')!.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form  = e.target as HTMLFormElement;
  const input = form.querySelector<HTMLInputElement>('input[type="file"]')!;
  const file  = input.files?.[0];

  if (!file) { await showWarning('Archivo requerido', 'Debes seleccionar un archivo.'); return; }
  if (file.size > 2 * 1024 * 1024 * 1024) { await showError('Archivo muy grande', 'El archivo no puede superar 2 GB.'); return; }
  if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+(\.[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+)*$/.test(file.name)) {
    await showError('Nombre invalido', 'El nombre del archivo solo puede contener letras y numeros.'); return;
  }

  const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');
  (document.getElementById('tarea_id')      as HTMLInputElement).value = session.getTareaId();
  (document.getElementById('user_id')       as HTMLInputElement).value = session.getUser();
  (document.getElementById('fecha_entrega') as HTMLInputElement).value = fecha;

  try {
    const res = await fetch('http://localhost:3001/crearEntrega', { method: 'POST', body: new FormData(form) });
    if (!res.ok) throw new Error('Error al subir el archivo');
    await showSuccess('Entrega realizada', 'Archivo subido exitosamente.');
    history.back();
  } catch {
    await showError('Error', 'No se pudo subir el archivo.');
  }
});
