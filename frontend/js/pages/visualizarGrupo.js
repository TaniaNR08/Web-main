const BTN_BLUE = 'px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition cursor-pointer';
const BTN_RED  = 'px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition cursor-pointer';

function verEntregas(tarea_id) {
  sessionStorage.setItem('tarea_id', tarea_id);
  window.location.href = 'verEntregas.html';
}

function editarTarea(tarea_id) {
  sessionStorage.setItem('tarea_id', tarea_id);
  window.location.href = 'editarTarea.html';
}

async function eliminarTarea(tarea_id) {
  const result = await Swal.fire({
    title: 'Eliminar tarea',
    text: 'Seguro que deseas eliminar esta tarea?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Si, eliminar',
    cancelButtonText: 'Cancelar',
    customClass: { popup: 'rounded-2xl' }
  });

  if (!result.isConfirmed) return;

  try {
    const res = await fetch('http://localhost:3001/eliminarTarea', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('token')}`
      },
      body: JSON.stringify({ tarea_id })
    });
    const data = await res.json();
    Swal.fire({ icon: 'success', title: 'Tarea eliminada', timer: 1500, showConfirmButton: false });
    location.reload();
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar la tarea.' });
  }
}

function fetchEstudiantes() {
  const group_id = sessionStorage.getItem('group_id');
  fetch('http://localhost:3001/listarEstudiantes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('token')}`
    },
    body: JSON.stringify({ group_id })
  })
    .then(res => res.json())
    .then(data => {
      if (data.estudiantes && data.estudiantes.length > 0) {
        const tbody = document.querySelector('#estudiantesTable tbody');
        data.estudiantes.forEach(estudiante => {
          const tr = document.createElement('tr');
          tr.className = 'hover:bg-gray-50 transition';
          tr.innerHTML = `<td class="px-4 py-3 text-gray-700 font-mono">${estudiante.user_id}</td>`;
          tbody.appendChild(tr);
        });
      }
    })
    .catch(err => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar los estudiantes.' }));
}

function fetchTareas() {
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
    .then(data => {
      if (data.tareas && data.tareas.length > 0) {
        const tbody = document.querySelector('#tareasTable tbody');
        data.tareas.forEach(tarea => {
          const tr = document.createElement('tr');
          tr.className = 'hover:bg-gray-50 transition';

          const verBtn = document.createElement('button');
          verBtn.innerText = 'Ver Entregas';
          verBtn.className = BTN_BLUE;
          verBtn.onclick = () => verEntregas(tarea.tarea_id);

          const editBtn = document.createElement('button');
          editBtn.innerText = 'Editar';
          editBtn.className = BTN_BLUE;
          editBtn.onclick = () => editarTarea(tarea.tarea_id);

          const elimBtn = document.createElement('button');
          elimBtn.innerText = 'Eliminar';
          elimBtn.className = BTN_RED;
          elimBtn.onclick = () => eliminarTarea(tarea.tarea_id);

          const tdVer   = document.createElement('td'); tdVer.className   = 'px-4 py-3'; tdVer.appendChild(verBtn);
          const tdEdit  = document.createElement('td'); tdEdit.className  = 'px-4 py-3'; tdEdit.appendChild(editBtn);
          const tdElim  = document.createElement('td'); tdElim.className  = 'px-4 py-3'; tdElim.appendChild(elimBtn);

          tr.innerHTML = `
            <td class="px-4 py-3 text-gray-800 font-medium">${tarea.titulo}</td>
            <td class="px-4 py-3 text-gray-600 max-w-xs truncate">${tarea.descripcion}</td>
            <td class="px-4 py-3 text-gray-600 text-xs">${tarea.fecha_inicio}</td>
            <td class="px-4 py-3 text-gray-600 text-xs">${tarea.fecha_final}</td>
          `;
          tr.appendChild(tdVer);
          tr.appendChild(tdEdit);
          tr.appendChild(tdElim);
          tbody.appendChild(tr);
        });
      }
    })
    .catch(err => Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar las tareas.' }));
}

window.onload = function () {
  fetchEstudiantes();
  fetchTareas();
  document.getElementById('inscribirEstudianteBtn').addEventListener('click', () => {
    window.location.href = 'inscribirEstudiante.html';
  });
  document.getElementById('asignarTareaBtn').addEventListener('click', () => {
    window.location.href = 'asignarTarea.html';
  });
};
