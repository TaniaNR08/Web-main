function verEntregas(tarea_id){
  sessionStorage.setItem('tarea_id',tarea_id)
  window.location.href='verEntregas.html'
}
function editarTarea(tarea_id){
  sessionStorage.setItem('tarea_id',tarea_id)
  window.location.href='editarTarea.html'
}
function eliminarTarea(tarea_id){
  fetch('http://localhost:3000/eliminarTarea',{
    method:'POST',
    headers:{
      'Content-Type':"application/json",
      "Authorization":`Bearer ${sessionStorage.getItem('token')}`
    },
    body:JSON.stringify({tarea_id:tarea_id})
  })
  .then((response)=>response.json())
  .then((data)=>{
    if(data.data && data.data.length>0){
      alert(data.message)
    }
    location.reload()
  })
  .catch((error)=>alert('Error al eliminar tarea:',error))
}
function fetchEstudiantes(){
  var group_id=sessionStorage.getItem('group_id')
  fetch('http://localhost:3000/listarEstudiantes',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      "Authorization":`Bearer ${sessionStorage.getItem('token')}`
    },
    body:JSON.stringify({
      group_id:group_id,
    }),
  })
  .then((response)=>response.json())
  .then((data)=>{
    if(data.estudiantes && data.estudiantes.length>0){
      let table=document.getElementById("estudiantesTable").getElementsByTagName('tbody')[0]
      data.estudiantes.forEach((estudiante)=>{
        let row=table.insertRow()
        let cell1=row.insertCell(0)
        cell1.innerHTML=estudiante.user_id
      })
    } else{console.log("No hay estudiantes inscritos.")}
  })
  .catch((error)=>alert('Error al cargar estudiantes:',error))
}
function fetchTareas(){
  var group_id=sessionStorage.getItem('group_id')
  fetch('http://localhost:3000/listarTareas',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      "Authorization":`Bearer ${sessionStorage.getItem('token')}`
    },
    body:JSON.stringify({
      group_id:group_id
    }),
  })
    .then((response)=>response.json())
    .then((data)=>{
      if(data.tareas && data.tareas.length>0){
        let table=document.getElementById("tareasTable").getElementsByTagName('tbody')[0]
        data.tareas.forEach((tarea)=>{
          let row=table.insertRow()
          let cell1=row.insertCell(0)
          let cell2=row.insertCell(1)
          let cell3=row.insertCell(2)
          let cell4=row.insertCell(3)
          let cell5=row.insertCell(4)
          let cell6=row.insertCell(5)
          let cell7=row.insertCell(6)
          cell1.innerHTML=tarea.titulo
          cell2.innerHTML=tarea.descripcion
          cell3.innerHTML=tarea.fecha_inicio
          cell4.innerHTML=tarea.fecha_final
          let verEntregasBtn=document.createElement('button')
          verEntregasBtn.innerText='Ver Entregas'
          verEntregasBtn.className='submit-task-button'
          verEntregasBtn.onclick=function(){
            verEntregas(tarea.tarea_id)
          }
          let editBtn=document.createElement('button')
          editBtn.innerText='Editar'
          editBtn.className='submit-task-button'
          editBtn.onclick=function(){
            editarTarea(tarea.tarea_id)
          }
          let eliminarBtn=document.createElement('button')
          eliminarBtn.innerText='Eliminar'
          eliminarBtn.className='submit-task-button'
          eliminarBtn.onclick=function(){
            eliminarTarea(tarea.tarea_id)
          }
          cell5.appendChild(verEntregasBtn)
          cell6.appendChild(editBtn)
          cell7.appendChild(eliminarBtn)
        })
      }else{console.log("No hay tareas asignadas.")}
    })
    .catch((error)=>alert('Error al cargar tareas:',error))
}
window.onload=function(){
  fetchEstudiantes()
  fetchTareas()
  const inscribirEstudianteBtn=document.getElementById('inscribirEstudianteBtn')
  inscribirEstudianteBtn.addEventListener('click',function(){
    window.location.href='inscribirEstudiante.html'
  })
  const asignarTareaBtn=document.getElementById('asignarTareaBtn')
  asignarTareaBtn.addEventListener('click',function(){
    window.location.href='asignarTarea.html'
  })
}
