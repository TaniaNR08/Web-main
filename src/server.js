const db = require('./config/database');
const jwt = require('jsonwebtoken');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');

const JWT_SECRET = 'secreto';
const app = express();
const port = 3001;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {
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
} = require("./dbQueries/dbQueries");

app.use(cors({ origin: "*" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const path = require("path");

// ✅ Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "../public")));

/* ===================== LOGIN ===================== */
app.post("/login", async (req, res) => {
  const { user, passwd } = req.body;

  try {
    const results = await verifyUser(user, passwd);

    if (results.length > 0) {
      const userType = results[0].rol;
      const payload = { user_id: user, rol: userType };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

      if (userType === "profesor") {
        getGruposByProfesor(user, (err, grupos) => {
          if (err) {
            console.error("Error al consultar los grupos:", err);
          }
          return res.json({
            redirect: "/pages/gruposProfesor.html",
            grupos: grupos || [],
            token,
            rol: 'profesor'
          });
        });
      }

      else if (userType === "estudiante") {
        getAsignaturasByEstudiante(user, (err, asignaturas) => {
          if (err) {
            console.error("Error al consultar las asignaturas:", err);
          }
          return res.json({
            redirect: "/pages/asignaturasEstudiante.html",
            asignaturas: asignaturas || [],
            token,
            rol: 'estudiante'
          });
        });
      }

    } else {
      return res.json({ error: "Usuario o Contraseña Incorrectos." });
    }
  } catch (err) {
    console.error("Error al consultar la base de datos:", err);
    return res.status(500).json({ error: "Error del servidor." });
  }
});

/* ===================== MIDDLEWARE TOKEN ===================== */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).send({ error: 'Token requerido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

/* ===================== ENDPOINTS ===================== */

app.post("/listarTareas", authenticateToken, async (req, res) => {
  const group_id = req.body.group_id;
  try {
    const data = await getTareasByAsignatura(group_id);
    return res.send({ tareas: data || [] });
  } catch {
    console.log("Error al consultar las tareas");
  }
});

app.post("/listarEstudiantes", authenticateToken, async (req, res) => {
  const group_id = req.body.group_id;
  try {
    const data = await getEstudiantesByGrupo(group_id);
    return res.send({ estudiantes: data || [] });
  } catch {
    return res.status(500).send({ message: 'Error al listar estudiantes.' });
  }
});

app.post("/asignarTarea", authenticateToken, async (req, res) => {
  const { titulo, descripcion, fecha_inicio, fecha_final, group_id } = req.body;
  try {
    await asignarTareaQuery(titulo, descripcion, fecha_inicio, fecha_final, group_id);
    return res.send({ success: true });
  } catch {
    return res.send({ success: false });
  }
});

app.post("/inscribirEstudiante", authenticateToken, async (req, res) => {
  const { estudiante_id, group_id } = req.body;
  try {
    const data = await isProfesorQuery(estudiante_id);
    if (data.length === 0) return res.send({ message: 'Usuario no existe.' });

    if (data[0].rol === 'estudiante') {
      inscribirEstudianteQuery(estudiante_id, group_id, () => {
        res.send({ message: 'Estudiante inscrito correctamente.' });
      });
    } else {
      res.send({ message: 'El usuario es profesor.' });
    }
  } catch {
    res.send({ message: 'Error al insertar estudiante.' });
  }
});

app.post("/crearGrupo", authenticateToken, async (req, res) => {
  const { nombre, profesor } = req.body;
  try {
    const data = await isGrupoQuery(nombre);
    if (data.length === 0) {
      crearGrupoQuery(nombre, profesor, () => {
        res.send({ message: 'Grupo creado correctamente.' });
      });
    } else {
      res.send({ message: 'El grupo ya existe.' });
    }
  } catch {
    res.send({ message: 'Error al consultar grupos.' });
  }
});

/* ===================== SERVER ===================== */
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
``