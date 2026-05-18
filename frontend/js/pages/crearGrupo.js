document.getElementById('crearGrupoForm').addEventListener('submit', async function (event) {
  event.preventDefault();
  const nombre   = document.getElementById('nombre').value;
  const profesor = sessionStorage.getItem('user');

  try {
    const res = await fetch('http://localhost:3001/crearGrupo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('token')}`
      },
      body: JSON.stringify({ nombre, profesor })
    });
    const data = await res.json();
    if (data.error) {
      Swal.fire({ icon: 'error', title: 'Error', text: data.error, customClass: { popup: 'rounded-2xl' } });
    } else {
      await Swal.fire({ icon: 'success', title: 'Grupo creado', text: data.message, timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-2xl' } });
      window.history.back();
    }
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo conectar con el servidor.', customClass: { popup: 'rounded-2xl' } });
  }
});
