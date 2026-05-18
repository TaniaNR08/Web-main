const connection = require("../config/database");
const verifyUser = (user, passwd) => {
  const query = "SELECT * FROM Usuarios WHERE user_id = ? AND passwd = ?";

  return new Promise((resolve, reject) => {
    connection.execute(
      query,
      [Number(user), passwd], // 👈 importante
      (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      }
    );
  });
};
const getGruposByProfesor = (profesor, callback) => {
  const query = "SELECT * FROM Grupos WHERE profesor = ?";
  connection.execute(query, [profesor], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results);
  });
};
const getAsignaturasByEstudiante=(estudiante,callback)=>{
  const query="SELECT Estudiantes_por_Grupo.*, Grupos.nombre AS nombre FROM Estudiantes_por_Grupo INNER JOIN Grupos ON Estudiantes_por_Grupo.group_id=Grupos.group_id WHERE Estudiantes_por_Grupo.user_id=?;"
  connection.execute(query,[estudiante],(err,results)=>{
    if(err){
      return callback(err,null)
    }
    callback(null,results)
  })
}
const getTareasByAsignatura=(group_id)=>{
  const query="SELECT * FROM Tareas WHERE group_id=?"
  return new Promise((resolve,reject)=>{
    connection.execute(query,[group_id],(err,results)=>{
      if(err)reject(err)
      resolve(results)
    })
  })
}
const getEstudiantesByGrupo=(group_id)=>{
  const query="SELECT * FROM Estudiantes_por_Grupo WHERE group_id=?"
  return new Promise((resolve,reject)=>{
    connection.execute(query,[group_id],(err,results)=>{
      if(err)reject(err)
      resolve(results)
    })
  })
}
const asignarTareaQuery=(titulo,descripcion,fecha_inicio,fecha_final,group_id)=>{
  const query="INSERT INTO Tareas(titulo,descripcion,fecha_inicio,fecha_final,group_id) VALUES(?,?,?,?,?);"
  return new Promise((resolve,reject)=>{
    connection.execute(query,[titulo,descripcion,fecha_inicio,fecha_final,group_id],(err,results)=>{
      if(err) reject(err)
      resolve(results)
    })
  })
}
const isProfesorQuery=(user_id)=>{
  const query="SELECT * FROM Usuarios WHERE user_id=?"
  return new Promise((resolve,reject)=>{
    connection.execute(query,[user_id],(err,results)=>{
      if(err)reject(err)
      resolve(results)
    })
  })
}
const isGrupoQuery=(nombre)=>{
  const query="SELECT * FROM Grupos WHERE nombre=?"
  return new Promise((resolve,reject)=>{
    connection.execute(query,[nombre],(err,results)=>{
      if(err)reject(err)
      resolve(results)
    })
  })
}
const inscribirEstudianteQuery=(user_id,group_id,callback)=>{
  const query="SELECT * FROM Estudiantes_por_Grupo WHERE user_id=? AND group_id=?"
  connection.execute(query,[user_id,group_id],(err,results)=>{
    if(err){
      return callback(err,null)
    }
    if(results.length>0){
      return callback(null,results)
    }else{
      const query2="INSERT INTO Estudiantes_por_Grupo(user_id,group_id) VALUES(?,?);"
      connection.execute(query2,[user_id,group_id],(err,results)=>{
        if(err){
          return callback(err,null)
        }
        return callback(null,results)
      })
    }
  })
}
const crearGrupoQuery=(nombre,user_id,callback)=>{
  const query="INSERT INTO Grupos(nombre,profesor) VALUES(?,?);"
  connection.execute(query,[nombre,user_id],(err,results)=>{
    if(err){
      return callback(err,null)
    }else{
      return callback(null,results)
    }
  })
}
const verEntregasQuery=(tarea_id)=>{
  const query="SELECT * FROM Entregas WHERE tarea_id=?"
  return new Promise((resolve,reject)=>{
    connection.execute(query,[tarea_id],(err,results)=>{
      if(err)return reject(err)
      resolve(results)
    })
  })
}
const editarTareaQuery=(tarea_id,titulo,descripcion,fecha_inicio,fecha_final)=>{
  const query="UPDATE Tareas SET titulo=?,descripcion=?,fecha_inicio=?,fecha_final=? WHERE tarea_id=?"
  return new Promise((resolve,reject)=>{
    connection.execute(query,[titulo,descripcion,fecha_inicio,fecha_final,tarea_id],(err,results)=>{
      if(err)return reject(err)
      resolve(results)
    })
  })
}
const crearEntregaQuery=(tarea_id,user_id,fecha_entrega,nombre,archivo_entrega)=>{
  const query="INSERT INTO Entregas(tarea_id,user_id,fecha_entrega,nombre,archivo_entrega) VALUES(?,?,?,?,?);"
  return new Promise((resolve,reject)=>{
    connection.execute(query,[tarea_id,user_id,fecha_entrega,nombre,archivo_entrega],(err,results)=>{
      if(err)return reject(err)
      resolve(results)
    })
  })
}
const isEntregadaQuery=(tarea_id,user_id)=>{
  const query="SELECT * FROM Entregas WHERE tarea_id=? AND user_id=?"
  return new Promise((resolve,reject)=>{
    connection.execute(query,[tarea_id,user_id],(err,results)=>{
      if(err)return reject(err)
      resolve(results)
    })
  })
}
const entregasProximasQuery=(user_id,group_id)=>{
  return new Promise((resolve,reject)=>{
    const query="SELECT * FROM Tareas WHERE group_id=?"
    connection.execute(query,[group_id],async(err,results)=>{
      if(err)return reject(err)
      try{
        let resultados=[]
        await Promise.all(
          results.map((result)=>{
            return new Promise((resolveTarea,rejectTarea)=>{
              const query1="SELECT * FROM Entregas WHERE user_id=? AND tarea_id=?"
              connection.execute(query1,[user_id,result.tarea_id],(err,entregas)=>{
                if(err)return rejectTarea(err)
                resultados.push({result,entregas})
                resolveTarea()
              })
            })
          })
        )
        resolve(resultados)
      }catch(error){
        reject(error)
      }
    })
  })
}

const eliminarTareaQuery=(tarea_id)=>{
  const query="DELETE FROM Tareas WHERE tarea_id=?;"
  return new Promise((resolve,reject)=>{
    connection.execute(query,[tarea_id],(err,results)=>{
      if(err)return reject(err)
      resolve(results)
    })
  })
}
module.exports={
  verifyUser,
  getGruposByProfesor,
  getAsignaturasByEstudiante,
  getTareasByAsignatura,
  getEstudiantesByGrupo,
  asignarTareaQuery,
  inscribirEstudianteQuery,
  isProfesorQuery,
  isGrupoQuery,
  crearGrupoQuery,
  verEntregasQuery,
  editarTareaQuery,
  eliminarTareaQuery,
  crearEntregaQuery,
  isEntregadaQuery,
  entregasProximasQuery,
}
