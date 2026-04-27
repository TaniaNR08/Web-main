function fetchEntregas(){
  var tarea_id=sessionStorage.getItem('tarea_id')
  fetch('http://localhost:3000/verEntregas',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      "Authorization":`Bearer ${sessionStorage.getItem('token')}`
    },
    body:JSON.stringify({
      tarea_id:tarea_id
    }),
  })
    .then((response)=>response.json())
    .then((data)=>{
      if(data.entregas && data.entregas.length>0){
        let table=document.getElementById("entregasTable").getElementsByTagName('tbody')[0]
        data.entregas.forEach((entrega)=>{
          let row=table.insertRow()
          let cell1=row.insertCell(0)
          let cell2=row.insertCell(1)
          let cell3=row.insertCell(2)
          let cell4=row.insertCell(3)
          cell1.innerHTML=entrega.user_id
          cell2.innerHTML=entrega.fecha_entrega
          cell3.innerHTML=entrega.archivo_entrega
        })
      }else{console.log("No hay entregas por el momento.")}
    })
    .catch((error)=>alert('Error al cargar entregas:',error))
}
window.onload=fetchEntregas
