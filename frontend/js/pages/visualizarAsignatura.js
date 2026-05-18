var ordenInicial = true;

function isEntregada(tarea_id) {
  const user_id = sessionStorage.getItem('user');
  return fetch('http://localhost:3001/isEntregada', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    body: JSON.stringify({ tarea_id, user_id })
  })
    .then(res => res.json())
    .then(data => data.success);
}

function ordenarPorFechaFinalAscendente(tareas) {
  return tareas.sort((a, b) => new Date(a.fecha_final) - new Date(b.fecha_final));
}

async function ordenarPorEstado(tareas) {
  const tareasConEstado = await Promise.all(tareas.map(async tarea => {
    const entregada = await isEntregada(tarea.tarea_id);
    return { tarea, entregada };
  }));
  return tareasConEstado
    .sort((a, b) => {
      if (a.entregada && !b.entregada) return 1;
      if (!a.entregada && b.entregada) return -1;
      return 0;
    })
    .map(t => t.tarea);
}

async function aplicarStrategy(tareas, estrategia) {
  return await estrategia(tareas);
}

async function fetchTareas() {
  const group_id = sessionStorage.getItem('group_id');
  fetch('http://localhost:3001/listarTareas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    body: JSON.stringify({ group_id })
  })
    .then(res => res.json())
    .then(async data => {
      if (data.tareas && data.tareas.length > 0) {
        if (ordenInicial) {
          document.getElementById('cambiarOrdenBtn').textContent = 'Cambiar Orden: Por Estado';
          ordenInicial = false;
          renderizarTareas(data.tareas, ordenarPorEstado);
        } else {
          document.getElementById('cambiarOrdenBtn').textContent = 'Cambiar Orden: Por Fecha';
          ordenInicial = true;
          renderizarTareas(data.tareas, ordenarPorFechaFinalAscendente);
        }
      } else {
        console.log('No hay tareas asignadas.');
      }
    })
    .catch(() => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar las tareas.' }));
}

async function renderizarTareas(dataTareas, orden) {
  const tareasOrdenadas = await aplicarStrategy(dataTareas, orden);
  const tbody = document.querySelector('#tareasTable tbody');
  tbody.innerHTML = '';

  for (const tarea of tareasOrdenadas) {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-gray-50 transition';

    const fechaFinal  = new Date(tarea.fecha_final);
    const fechaActual = new Date();
    const vencida     = fechaFinal < fechaActual;

    const tdTitulo = document.createElement('td');
    tdTitulo.className = 'px-4 py-3 text-gray-800 font-medium';
    tdTitulo.textContent = tarea.titulo;

    const tdDesc = document.createElement('td');
    tdDesc.className = 'px-4 py-3 text-gray-600 max-w-xs';
    tdDesc.textContent = tarea.descripcion;

    const tdInicio = document.createElement('td');
    tdInicio.className = 'px-4 py-3 text-gray-600 text-xs';
    tdInicio.textContent = tarea.fecha_inicio;

    const tdFinal = document.createElement('td');
    tdFinal.className = 'px-4 py-3 text-gray-600 text-xs';
    tdFinal.textContent = tarea.fecha_final;

    const tdBtn = document.createElement('td');
    tdBtn.className = 'px-4 py-3';

    tr.appendChild(tdTitulo);
    tr.appendChild(tdDesc);
    tr.appendChild(tdInicio);
    tr.appendChild(tdFinal);
    tr.appendChild(tdBtn);
    tbody.appendChild(tr);

    isEntregada(tarea.tarea_id).then(entregada => {
      const btn = document.createElement('button');
      btn.id = `entregarTareaBtn_${tarea.tarea_id}`;

      if (vencida) {
        btn.disabled = true;
        if (entregada) {
          btn.textContent = 'Entregado';
          btn.className = 'px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-100 text-green-700 border border-green-200 cursor-not-allowed';
        } else {
          btn.textContent = 'Vencida';
          btn.className = 'px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-600 border border-red-200 cursor-not-allowed';
        }
      } else {
        if (entregada) {
          btn.textContent = 'Editar entrega';
          btn.className = 'px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition cursor-pointer';
        } else {
          btn.textContent = 'Entregar';
          btn.className = 'px-3 py-1.5 text-xs font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition cursor-pointer';
        }
        btn.onclick = () => {
          sessionStorage.setItem('tarea_id', tarea.tarea_id);
          window.location.href = 'entregarTarea.html';
        };
      }

      tdBtn.appendChild(btn);
    });
  }
}

window.onload = function () {
  fetchTareas();
  document.getElementById('cambiarOrdenBtn').onclick = () => fetchTareas();
};
