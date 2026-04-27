function fetchGrupos(){
  const user=sessionStorage.getItem('user')
  const passwd=sessionStorage.getItem('passwd')
  fetch('http://localhost:3000/login',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      user:user,
      passwd:passwd,
    }),
  })
  .then((response)=>response.json())
  .then((data)=>{
    console.log("data:",data)
    if(data.grupos && data.grupos.length>0){
      let table=document.getElementById("gruposTable").getElementsByTagName('tbody')[0]
      data.grupos.forEach((grupo)=>{
        let row=table.insertRow()
        let cell1=row.insertCell(0)
        let cell2=row.insertCell(1)
        cell1.innerHTML=grupo.group_id
        cell2.innerHTML=grupo.nombre
        cell2.style.cursor='pointer'
        cell2.onclick=function(){
          sessionStorage.setItem('group_id',grupo.group_id)
          window.location.href='visualizarGrupo.html'
        }
      })
    }else{
      alert("No hay grupos disponibles.")
    }
})
.catch((error)=>console.error('Error al cargar los grupos:',error))
}
window.onload=function(){
  fetchGrupos()
  const crearGrupoBtn=document.getElementById('crearGrupoBtn')
  crearGrupoBtn.addEventListener('click',function(){
    window.location.href='crearGrupo.html'
  })
}
