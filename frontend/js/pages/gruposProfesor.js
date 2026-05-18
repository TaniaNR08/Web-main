function fetchGrupos() {
  const user   = sessionStorage.getItem('user');
  const passwd = sessionStorage.getItem('passwd');

  fetch('http://localhost:3001/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, passwd })
  })
    .then(res => res.json())
    .then(data => {
      if (data.grupos && data.grupos.length > 0) {
        const tbody = document.querySelector('#gruposTable tbody');
        data.grupos.forEach(grupo => {
          const tr = document.createElement('tr');
          tr.className = 'hover:bg-gray-50 transition cursor-pointer';
          tr.innerHTML = `
            <td class="px-4 py-3 text-gray-700 font-mono">${grupo.group_id}</td>
            <td class="px-4 py-3 text-gray-800 font-medium text-blue-700 hover:underline">${grupo.nombre}</td>
          `;
          tr.onclick = () => {
            sessionStorage.setItem('group_id', grupo.group_id);
            window.location.href = 'visualizarGrupo.html';
          };
          tbody.appendChild(tr);
        });
      } else {
        Swal.fire({ icon: 'info', title: 'Sin grupos', text: 'No hay grupos disponibles.', customClass: { popup: 'rounded-2xl' } });
      }
    })
    .catch(err => console.error('Error al cargar los grupos:', err));
}

window.onload = function () {
  fetchGrupos();
  document.getElementById('crearGrupoBtn').addEventListener('click', () => {
    window.location.href = 'crearGrupo.html';
  });
};
