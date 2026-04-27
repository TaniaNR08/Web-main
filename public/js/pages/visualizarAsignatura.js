var ordenInicial=true
function isEntregada(tarea_id){
  const user_id=sessionStorage.getItem('user')
  return fetch('http://localhost:3000/isEntregada',{
    method:'POST',
    headers:{
      'Content-Type':'application/json',
      "Authorization":`Bearer ${sessionStorage.getItem('token')}`
    },
    body:JSON.stringify({
      tarea_id:tarea_id,
      user_id:user_id
    }),
  })
  .then(response=>response.json())
  .then(data=>data.success)
}
function ordenarPorFechaFinalAscendente(tareas){
  return tareas.sort((a,b)=>new Date(a.fecha_final)-new Date(b.fecha_final))
}
async function ordenarPorEstado(tareas){
  const tareasConEstado=await Promise.all(tareas.map(async(tarea)=>{
    const entregada=await isEntregada(tarea.tarea_id)
    return {tarea,entregada}
  }))
  const tareasOrdenadas=tareasConEstado.sort((a,b)=>{
    if(a.entregada && !b.entregada){
      return 1
    }else if(!a.entregada && b.entregada){
      return -1
    }else{
      return 0
    }
  }).map((tareaConEstado)=>tareaConEstado.tarea)
  return tareasOrdenadas
}
async function aplicarStrategy(tareas,estrategia){
  return await estrategia(tareas)
}
async function fetchTareas(){
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
  .then(async(data)=>{
    if(data.tareas&&data.tareas.length>0){
      renderizarTareas(data.tareas,ordenarPorFechaFinalAscendente)
      if(ordenInicial){
        document.getElementById('cambiarOrdenBtn').innerHTML='Cambiar Orden: Por Estado'
        ordenInicial=false
        renderizarTareas(data.tareas,ordenarPorEstado)
      }else{
        document.getElementById('cambiarOrdenBtn').innerHTML='Cambiar Orden: Por Fecha'
        ordenInicial=true
        renderizarTareas(data.tareas,ordenarPorFechaFinalAscendente)
      }
    }else{
      console.log("No hay tareas asignadas.")
    }
  })
  .catch((error)=>alert('Error al cargar tareas:',error))
}
async function renderizarTareas(dataTareas,orden){
  const tareasOrdenadas=await aplicarStrategy(dataTareas,orden)
  let table=document.getElementById("tareasTable").getElementsByTagName('tbody')[0]
  table.innerHTML=''
  for(const tarea of tareasOrdenadas){
    let row=table.insertRow()
    let cell1=row.insertCell(0)
    let cell2=row.insertCell(1)
    let cell3=row.insertCell(2)
    let cell4=row.insertCell(3)
    let cell5=row.insertCell(4)
    cell1.innerHTML=tarea.titulo
    cell2.innerHTML=tarea.descripcion
    cell3.innerHTML=tarea.fecha_inicio
    cell4.innerHTML=tarea.fecha_final
    const fechaFinal=new Date(tarea.fecha_final)
    const fechaActual=new Date()
    isEntregada(tarea.tarea_id).then(entregada=>{
      let entregarTareaBtn=document.createElement('button')
      entregarTareaBtn.style.width='100px'
      entregarTareaBtn.style.height='50px'
      if(fechaFinal<fechaActual){
        entregarTareaBtn.disabled=true
        if(entregada){
          entregarTareaBtn.style.backgroundColor='green'
        }else{
          entregarTareaBtn.style.backgroundColor='red'
        }
      }else{
        entregarTareaBtn.innerText='Entregar'
        entregarTareaBtn.style.backgroundColor='white'
        entregarTareaBtn.style.color='black'
        if(entregada){
          entregarTareaBtn.innerText='Editar'
          entregarTareaBtn.style.backgroundColor=''
          entregarTareaBtn.style.color='white'
        }
      }
      entregarTareaBtn.id='entregarTareaBtn_'+tarea.tarea_id
      entregarTareaBtn.className='submit-task-button'
      entregarTareaBtn.onclick=function(){
        sessionStorage.setItem('tarea_id',tarea.tarea_id)
        window.location.href='entregarTarea.html'
      }
      cell5.appendChild(entregarTareaBtn)
    })
  }
}
window.onload=function(){
  fetchTareas()
  document.getElementById('cambiarOrdenBtn').onclick=async function(){
    fetchTareas()
  }
}
