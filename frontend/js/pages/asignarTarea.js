document.getElementById('tareaForm').addEventListener('submit', async function (event) {
  event.preventDefault();
  const titulo      = document.getElementById('titulo').value;
  const descripcion = document.getElementById('descripcion').value;
  const fecha_inicio = document.getElementById('fecha_inicio').value;
  const fecha_final  = document.getElementById('fecha_final').value;
  const group_id    = sessionStorage.getItem('group_id');

  try {
    const res = await fetch('http://localhost:3001/asignarTarea', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('token')}`
      },
      body: JSON.stringify({ titulo, descripcion, fecha_inicio, fecha_final, group_id })
    });
    const data = await res.json();
    if (data.success) {
      await Swal.fire({ icon: 'success', title: 'Tarea asignada', timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-2xl' } });
    } else {
      await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo asignar la tarea.', customClass: { popup: 'rounded-2xl' } });
    }
    window.history.back();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo conectar con el servidor.', customClass: { popup: 'rounded-2xl' } });
  }
});
