function fetchEntregas() {
  const tarea_id = sessionStorage.getItem('tarea_id');
  fetch('http://localhost:3001/verEntregas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    body: JSON.stringify({ tarea_id })
  })
    .then(res => res.json())
    .then(data => {
      if (data.entregas && data.entregas.length > 0) {
        const tbody = document.querySelector('#entregasTable tbody');
        data.entregas.forEach(entrega => {
          const tr = document.createElement('tr');
          tr.className = 'hover:bg-gray-50 transition';
          tr.innerHTML = `
            <td class="px-4 py-3 text-gray-700 font-mono">${entrega.user_id}</td>
            <td class="px-4 py-3 text-gray-600 text-xs">${entrega.fecha_entrega}</td>
            <td class="px-4 py-3 text-gray-600">${entrega.nombre || '-'}</td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        console.log('No hay entregas por el momento.');
      }
    })
    .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar las entregas.' }));
}

window.onload = fetchEntregas;
