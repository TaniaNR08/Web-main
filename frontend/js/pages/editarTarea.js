document.getElementById('tareaForm').addEventListener('submit', async function (event) {
  event.preventDefault();
  const tarea_id    = sessionStorage.getItem('tarea_id');
  const titulo      = document.getElementById('titulo').value;
  const descripcion = document.getElementById('descripcion').value;
  const fecha_inicio = document.getElementById('fecha_inicio').value;
  const fecha_final  = document.getElementById('fecha_final').value;
  const group_id    = sessionStorage.getItem('group_id');

  try {
    const res = await fetch('http://localhost:3001/editarTarea', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('token')}`
      },
      body: JSON.stringify({ tarea_id, titulo, descripcion, fecha_inicio, fecha_final })
    });
    const data = await res.json();
    await Swal.fire({ icon: 'success', title: 'Tarea actualizada', text: data.message, timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-2xl' } });
    window.history.back();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo conectar con el servidor.', customClass: { popup: 'rounded-2xl' } });
  }
});
