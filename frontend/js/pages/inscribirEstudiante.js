document.getElementById('inscribirEstudianteForm').addEventListener('submit', async function (event) {
  event.preventDefault();
  const estudiante_id = document.getElementById('estudiante_id').value;
  const group_id      = sessionStorage.getItem('group_id');

  try {
    const res = await fetch('http://localhost:3001/inscribirEstudiante', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('token')}`
      },
      body: JSON.stringify({ estudiante_id, group_id })
    });
    const data = await res.json();
    if (data.error) {
      Swal.fire({ icon: 'error', title: 'Error', text: data.error, customClass: { popup: 'rounded-2xl' } });
    } else {
      await Swal.fire({ icon: 'success', title: 'Estudiante inscrito', text: data.message, timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-2xl' } });
      window.history.back();
    }
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo conectar con el servidor.', customClass: { popup: 'rounded-2xl' } });
  }
});
