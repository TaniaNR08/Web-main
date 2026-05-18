class Notificador {
  constructor() { this.observadores = []; }
  suscribir(observador) { this.observadores.push(observador); }
  notificar(mensaje) { this.observadores.forEach(obs => obs(mensaje)); }
}

const notificador = new Notificador();
notificador.suscribir(mensaje => {
  Swal.fire({
    icon: 'warning',
    title: 'Tarea pendiente',
    text: mensaje,
    timer: 4000,
    showConfirmButton: false,
    customClass: { popup: 'rounded-2xl' }
  });
});

async function fetchEntregasProximas(user, group_id) {
  try {
    const res = await fetch('http://localhost:3001/entregasProximas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('token')}`
      },
      body: JSON.stringify({ user_id: user, group_id })
    });
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    const responseData = await res.json();
    if (responseData.data != null) {
      if (responseData.data[1].entregas.length === 0) {
        const hoy         = new Date();
        const fechaFinal  = new Date(responseData.data[1].result.fecha_final);
        const diferenciaDias = Math.ceil((fechaFinal - hoy) / (1000 * 60 * 60 * 24));
        if (diferenciaDias <= 3) return responseData.success;
      }
    }
    return false;
  } catch (err) {
    console.error('Error al obtener entregas proximas:', err);
  }
}

function fetchAsignaturas() {
  const user   = sessionStorage.getItem('user');
  const passwd = sessionStorage.getItem('passwd');

  fetch('http://localhost:3001/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user, passwd })
  })
    .then(res => res.json())
    .then(data => {
      if (data.asignaturas && data.asignaturas.length > 0) {
        const tbody = document.querySelector('#asignaturasTable tbody');
        data.asignaturas.forEach(async asignatura => {
          const tr = document.createElement('tr');
          tr.className = 'hover:bg-gray-50 transition cursor-pointer';
          tr.innerHTML = `
            <td class="px-4 py-3 text-gray-700 font-mono">${asignatura.group_id}</td>
            <td class="px-4 py-3 text-gray-800 font-medium text-blue-700 hover:underline">${asignatura.nombre}</td>
          `;
          tr.onclick = () => {
            sessionStorage.setItem('group_id', asignatura.group_id);
            window.location.href = 'visualizarAsignatura.html';
          };
          tbody.appendChild(tr);

          const pendiente = await fetchEntregasProximas(user, asignatura.group_id);
          if (pendiente) {
            notificador.notificar(`${asignatura.nombre} contiene tareas pendientes por vencer.`);
          }
        });
      } else {
        console.log('No hay asignaturas inscritas.');
      }
    })
    .catch(err => console.error('Error al cargar las asignaturas:', err));
}

window.onload = function () {
  fetchAsignaturas();
};
