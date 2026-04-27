document.getElementById("tareaForm").addEventListener("submit",function(event){
  event.preventDefault()
  let titulo=document.getElementById("titulo").value
  let descripcion=document.getElementById("descripcion").value
  let fecha_inicio=document.getElementById("fecha_inicio").value
  let fecha_final=document.getElementById("fecha_final").value
  let group_id=sessionStorage.getItem('group_id')
  fetch("http://localhost:3000/asignarTarea",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${sessionStorage.getItem('token')}`
    },
    body:JSON.stringify({
      titulo,
      descripcion,
      fecha_inicio,
      fecha_final,
      group_id
    })
  })
  .then(response=>response.json())
  .then(data=>{
    if(data.success){
      alert("Tarea asignada correctamente.")
    }else{
      alert("Error al asignar la tarea.")
    }
    window.history.back()
  })
  .catch(error=>alert("Error al asignar tarea:",error))
})
