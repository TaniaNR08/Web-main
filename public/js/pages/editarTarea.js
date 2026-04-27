document.getElementById("tareaForm").addEventListener("submit",function(event){
  event.preventDefault()
  const tarea_id=sessionStorage.getItem('tarea_id')
  let titulo=document.getElementById("titulo").value
  let descripcion=document.getElementById("descripcion").value
  let fecha_inicio=document.getElementById("fecha_inicio").value
  let fecha_final=document.getElementById("fecha_final").value
  let group_id=sessionStorage.getItem('group_id')
  fetch("http://localhost:3000/editarTarea",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${sessionStorage.getItem('token')}`
    },
    body:JSON.stringify({
      tarea_id,
      titulo,
      descripcion,
      fecha_inicio,
      fecha_final,
    })
  })
    .then(response=>response.json())
    .then(data=>{
      console.log(data)
      alert(data.message)
      window.history.back()
    })
    .catch(error=>{
      console.error("Error al editar tarea:",error)
      alert("Error al editar tarea (Conexion con el servidor)")
    })
})
