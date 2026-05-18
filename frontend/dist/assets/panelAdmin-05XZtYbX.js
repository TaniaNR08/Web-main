import"./auth-Dhq6riO7.js";import{r as b,b as u,s as n,S as c,c as p}from"./swal-IefjTSjp.js";import{a as l}from"./api-BZCA1UKH.js";const x={administrador:"bg-purple-100 text-purple-700",profesor:"bg-blue-100 text-blue-700",estudiante:"bg-green-100 text-green-700"};b({showBack:!1});async function d(){try{const{usuarios:t,error:o}=await l.get("/usuarios");if(o){await n("Error",o);return}const e=document.querySelector("#usuariosTable tbody");e.innerHTML="",t.forEach(r=>{const a=document.createElement("tr");a.className="hover:bg-gray-50 transition",a.innerHTML=`
        <td class="px-4 py-3 text-gray-700 font-mono">${r.user_id}</td>
        <td class="px-4 py-3 text-gray-800 font-medium">${r.nombre}</td>
        <td class="px-4 py-3">
          <span class="px-2 py-1 rounded-full text-xs font-semibold capitalize ${x[r.rol]??""}">
            ${r.rol}
          </span>
        </td>
        <td class="px-4 py-3">
          <div class="flex gap-2">
            <button data-action="editar" class="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition">Editar</button>
            <button data-action="eliminar" class="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition">Eliminar</button>
          </div>
        </td>
      `,a.querySelector('[data-action="editar"]').addEventListener("click",()=>f(r)),a.querySelector('[data-action="eliminar"]').addEventListener("click",()=>g(r)),e.appendChild(a)})}catch{await n("Error","No se pudo cargar los usuarios.")}}async function f(t){const{value:o}=await c.fire({title:"Editar usuario",width:480,html:`
      <div class="flex flex-col gap-3 text-left mt-2">
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">ID</label>
          <input disabled value="${t.user_id}" class="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-400">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">Nombre</label>
          <input id="swal-nombre" value="${t.nombre}" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">Contrasena</label>
          <input id="swal-passwd" placeholder="Nueva contrasena" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 mb-1">Rol</label>
          <select id="swal-rol" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black bg-white">
            <option value="estudiante" ${t.rol==="estudiante"?"selected":""}>Estudiante</option>
            <option value="profesor"   ${t.rol==="profesor"?"selected":""}>Profesor</option>
            <option value="administrador" ${t.rol==="administrador"?"selected":""}>Administrador</option>
          </select>
        </div>
      </div>`,confirmButtonText:"Guardar cambios",confirmButtonColor:"#000",cancelButtonText:"Cancelar",showCancelButton:!0,customClass:{popup:"rounded-2xl"},preConfirm:()=>{const e=document.getElementById("swal-nombre").value,r=document.getElementById("swal-passwd").value,a=document.getElementById("swal-rol").value;return!e||!r?(c.showValidationMessage("Nombre y contrasena son requeridos"),!1):{nombre:e,passwd:r,rol:a}}});if(o)try{const e=await l.patch(`/usuarios/${t.user_id}`,o);if(e.error){await n("Error",e.error);return}await u("Actualizado",e.message),d()}catch{await n("Error","No se pudo actualizar el usuario.")}}async function g(t){if(await p(`Seguro que deseas eliminar a ${t.nombre}?`))try{const e=await l.delete(`/usuarios/${t.user_id}`);if(e.error){await n("Error",e.error);return}await u("Eliminado",e.message),d()}catch{await n("Error","No se pudo eliminar el usuario.")}}document.getElementById("crearUsuarioForm").addEventListener("submit",async t=>{t.preventDefault();const o=t.target,e=document.getElementById("user_id").value,r=document.getElementById("nombre").value,a=document.getElementById("passwd").value,m=document.getElementById("rol").value,s=document.getElementById("formFeedback");try{const i=await l.post("/usuarios",{user_id:e,nombre:r,passwd:a,rol:m});i.error?(s.textContent=i.error,s.className="text-sm font-medium text-red-500"):(s.textContent=i.message??"Usuario creado correctamente",s.className="text-sm font-medium text-green-600",o.reset(),await u("Usuario creado"),d())}catch{s.textContent="Error al crear usuario",s.className="text-sm font-medium text-red-500"}});d();
