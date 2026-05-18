import{s}from"./auth-Dhq6riO7.js";import{r as o,s as n}from"./swal-IefjTSjp.js";import{a as c}from"./api-BZCA1UKH.js";o({showBack:!0});async function d(){try{const{entregas:t}=await c.post("/verEntregas",{tarea_id:s.getTareaId()});if(!(t!=null&&t.length))return;const e=document.querySelector("#entregasTable tbody");t.forEach(r=>{const a=document.createElement("tr");a.className="hover:bg-gray-50 transition",a.innerHTML=`
        <td class="px-4 py-3 text-gray-700 font-mono">${r.user_id}</td>
        <td class="px-4 py-3 text-gray-600 text-xs">${r.fecha_entrega}</td>
        <td class="px-4 py-3 text-gray-600">${r.nombre??"-"}</td>
      `,e.appendChild(a)})}catch{await n("Error","No se pudo cargar las entregas.")}}d();
