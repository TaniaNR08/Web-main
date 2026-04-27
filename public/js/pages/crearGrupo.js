document.getElementById("crearGrupoForm").addEventListener("submit",function(event){
  event.preventDefault()
  let nombre=document.getElementById("nombre").value
  let profesor=sessionStorage.getItem('user')
  fetch("http://localhost:3000/crearGrupo",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${sessionStorage.getItem('token')}`
    },
    body:JSON.stringify({
      nombre,
      profesor,
    })
  })
  .then(response=>response.json())
  .then(data=>{
    alert(data.message)
  })
  .catch(error=>alert("Error al inscribir crear grupo: "+error))
})
