document.getElementById('entregarTareaForm').addEventListener('submit', async function (event) {
  event.preventDefault();

  const fileInput = document.querySelector('input[type="file"]');
  if (!fileInput || !fileInput.files[0]) {
    Swal.fire({ icon: 'warning', title: 'Archivo requerido', text: 'Debes seleccionar un archivo.', customClass: { popup: 'rounded-2xl' } });
    return;
  }

  const file    = fileInput.files[0];
  const maxSize = 2 * 1024 * 1024 * 1024; // 2 GB
  if (file.size > maxSize) {
    Swal.fire({ icon: 'error', title: 'Archivo muy grande', text: 'El archivo no puede superar 2 GB.', customClass: { popup: 'rounded-2xl' } });
    return;
  }

  const isValidName = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+(\.[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+)*$/.test(file.name);
  if (!isValidName) {
    Swal.fire({ icon: 'error', title: 'Nombre invalido', text: 'El nombre del archivo solo puede contener letras y numeros, sin caracteres especiales.', customClass: { popup: 'rounded-2xl' } });
    return;
  }

  const tarea_id = sessionStorage.getItem('tarea_id');
  const user_id  = sessionStorage.getItem('user');
  const fecha    = new Date();
  const fechaEntregaFormateada = fecha.toISOString().slice(0, 19).replace('T', ' ');

  document.getElementById('tarea_id').value      = tarea_id;
  document.getElementById('user_id').value       = user_id;
  document.getElementById('fecha_entrega').value = fechaEntregaFormateada;

  const formData = new FormData(this);

  try {
    const res = await fetch('http://localhost:3001/crearEntrega', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Error al subir el archivo');
    await Swal.fire({ icon: 'success', title: 'Entrega realizada', text: 'Archivo subido exitosamente.', timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-2xl' } });
    window.history.back();
  } catch (err) {
    console.error('Error:', err);
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo subir el archivo.', customClass: { popup: 'rounded-2xl' } });
  }
});
