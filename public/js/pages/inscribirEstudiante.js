document.getElementById("inscribirEstudianteForm").addEventListener("submit",function(event){
  event.preventDefault()
  let estudiante_id=document.getElementById("estudiante_id").value
  let group_id=sessionStorage.getItem('group_id')
  fetch("http://localhost:3000/inscribirEstudiante",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${sessionStorage.getItem('token')}`
    },
    body:JSON.stringify({
      estudiante_id,
      group_id
    })
  })
  .then(response=>response.json())
  .then(data=>{
    alert(data.message)
  })
  .catch(error=>alert("Error al inscribir estudiante:",error))
})
