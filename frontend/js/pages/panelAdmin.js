const API = 'http://localhost:3001';

const ROL_STYLES = {
  administrador: 'bg-purple-100 text-purple-700',
  profesor:      'bg-blue-100 text-blue-700',
  estudiante:    'bg-green-100 text-green-700'
};

function getToken() {
  return sessionStorage.getItem('token');
}

async function cargarUsuarios() {
  try {
    const res = await fetch(`${API}/usuarios`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const { usuarios, error } = await res.json();
    if (error) return console.error(error);

    const tbody = document.querySelector('#usuariosTable tbody');
    tbody.innerHTML = '';

    usuarios.forEach(u => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-gray-50 transition';
      tr.innerHTML = `
        <td class="px-4 py-3 text-gray-700 font-mono">${u.user_id}</td>
        <td class="px-4 py-3 text-gray-800 font-medium">${u.nombre}</td>
        <td class="px-4 py-3">
          <span class="px-2 py-1 rounded-full text-xs font-semibold capitalize ${ROL_STYLES[u.rol] || ''}">
            ${u.rol}
          </span>
        </td>
        <td class="px-4 py-3">
          <div class="flex gap-2">
            <button onclick="editarUsuario(${JSON.stringify(u).replace(/"/g, '&quot;')})"
              class="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition">
              Editar
            </button>
            <button onclick="eliminarUsuario(${u.user_id}, '${u.nombre}')"
              class="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition">
              Eliminar
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error al cargar usuarios:', err);
  }
}

async function editarUsuario(u) {
  const { value: formValues } = await Swal.fire({
    title: `Editar usuario`,
    width: 480,
    html: `
      <div class="flex flex-col gap-3 text-left mt-2">
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">ID</label>
          <input disabled value="${u.user_id}"
            class="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-400">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">Nombre</label>
          <input id="swal-nombre" value="${u.nombre}"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">Contrasena</label>
          <input id="swal-passwd" placeholder="Nueva contrasena"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">Rol</label>
          <select id="swal-rol"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black bg-white">
            <option value="estudiante" ${u.rol === 'estudiante' ? 'selected' : ''}>Estudiante</option>
            <option value="profesor" ${u.rol === 'profesor' ? 'selected' : ''}>Profesor</option>
            <option value="administrador" ${u.rol === 'administrador' ? 'selected' : ''}>Administrador</option>
          </select>
        </div>
      </div>
    `,
    confirmButtonText: 'Guardar cambios',
    confirmButtonColor: '#000',
    cancelButtonText: 'Cancelar',
    showCancelButton: true,
    customClass: { popup: 'rounded-2xl' },
    preConfirm: () => {
      const nombre = document.getElementById('swal-nombre').value;
      const passwd = document.getElementById('swal-passwd').value;
      const rol    = document.getElementById('swal-rol').value;
      if (!nombre || !passwd) {
        Swal.showValidationMessage('Nombre y contrasena son requeridos');
        return false;
      }
      return { nombre, passwd, rol };
    }
  });

  if (!formValues) return;

  try {
    const res = await fetch(`${API}/usuarios/${u.user_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(formValues)
    });
    const data = await res.json();
    if (data.error) {
      Swal.fire({ icon: 'error', title: 'Error', text: data.error });
    } else {
      Swal.fire({ icon: 'success', title: 'Actualizado', text: data.message, timer: 1500, showConfirmButton: false });
      cargarUsuarios();
    }
  } catch {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el usuario.' });
  }
}

async function eliminarUsuario(user_id, nombre) {
  const result = await Swal.fire({
    title: 'Eliminar usuario',
    text: `Seguro que deseas eliminar a ${nombre}?`,
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
    const res = await fetch(`${API}/usuarios/${user_id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    const data = await res.json();
    if (data.error) {
      Swal.fire({ icon: 'error', title: 'Error', text: data.error });
    } else {
      Swal.fire({ icon: 'success', title: 'Eliminado', text: data.message, timer: 1500, showConfirmButton: false });
      cargarUsuarios();
    }
  } catch {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el usuario.' });
  }
}

document.getElementById('crearUsuarioForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const user_id = document.getElementById('user_id').value;
  const nombre  = document.getElementById('nombre').value;
  const passwd  = document.getElementById('passwd').value;
  const rol     = document.getElementById('rol').value;
  const feedback = document.getElementById('formFeedback');

  try {
    const res = await fetch(`${API}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ user_id, nombre, passwd, rol })
    });
    const data = await res.json();
    if (data.error) {
      feedback.textContent = data.error;
      feedback.className = 'text-sm font-medium text-red-500';
    } else {
      feedback.textContent = data.message;
      feedback.className = 'text-sm font-medium text-green-600';
      e.target.reset();
      cargarUsuarios();
      Swal.fire({ icon: 'success', title: 'Usuario creado', timer: 1500, showConfirmButton: false });
    }
  } catch {
    feedback.textContent = 'Error al crear usuario';
    feedback.className = 'text-sm font-medium text-red-500';
  }
});

window.onload = cargarUsuarios;
