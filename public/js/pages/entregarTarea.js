document.getElementById('entregarTareaForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const fileInput = document.querySelector('input[type="file"]');
  if (!fileInput || !fileInput.files[0]) {
    alert("Debes seleccionar un archivo.");
    return;
  }
  const file = fileInput.files[0];
  const fileName = file.name;
  const fileSize = file.size; // Tamaño en bytes
  const maxSizeBytes = 2 * 1024 * 1024 * 1024; // 2GB en bytes
  if (fileSize > maxSizeBytes) {
    alert("El archivo no puede superar 2GB.");
    return;
  }
  const isValidName = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+(\.[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]+)*$/.test(fileName);
  if (!isValidName) {
    alert("El nombre del archivo solo puede contener letras y números (sin caracteres especiales).");
    return;
  }
  const tarea_id = sessionStorage.getItem('tarea_id');
  const user_id = sessionStorage.getItem('user');
  const fecha_entrega = new Date();
  fecha_entrega.setDate(fecha_entrega.getDate());
  const fechaEntregaFormateada = fecha_entrega.toISOString().slice(0, 19).replace('T', ' ');
  document.getElementById('tarea_id').value = tarea_id;
  document.getElementById('user_id').value = user_id;
  document.getElementById('fecha_entrega').value = fechaEntregaFormateada;
  const entregarTareaForm = new FormData(this);
  fetch('http://localhost:3000/crearEntrega', {
    method: 'POST',
    body: entregarTareaForm
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error al subir el archivo');
    }
    return response.text();
  })
  .then(data => {
    console.log(data);
    alert('Archivo subido exitosamente');
    window.history.back();
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error al subir el archivo');
  });
});
