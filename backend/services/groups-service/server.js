const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const db = require('./config/database');

const app = express();
const PORT = 3003;
const JWT_SECRET = 'secreto';

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

function authenticate(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ error: 'Token invalido' });
  }
}

// GET /grupos/profesor/:id
app.get('/grupos/profesor/:id', authenticate, async (req, res) => {
  try {
    const [grupos] = await db.promise().execute(
      'SELECT * FROM Grupos WHERE profesor = ?',
      [req.params.id]
    );
    res.json({ grupos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /asignaturas/estudiante/:id
app.get('/asignaturas/estudiante/:id', authenticate, async (req, res) => {
  try {
    const [asignaturas] = await db.promise().execute(
      `SELECT epg.*, g.nombre AS nombre
       FROM Estudiantes_por_Grupo epg
       INNER JOIN Grupos g ON epg.group_id = g.group_id
       WHERE epg.user_id = ?`,
      [req.params.id]
    );
    res.json({ asignaturas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /listarEstudiantes
app.post('/listarEstudiantes', authenticate, async (req, res) => {
  try {
    const [estudiantes] = await db.promise().execute(
      'SELECT * FROM Estudiantes_por_Grupo WHERE group_id = ?',
      [req.body.group_id]
    );
    res.json({ estudiantes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /crearGrupo
app.post('/crearGrupo', authenticate, async (req, res) => {
  const { nombre, profesor } = req.body;
  try {
    const [existe] = await db.promise().execute(
      'SELECT * FROM Grupos WHERE nombre = ?', [nombre]
    );
    if (existe.length > 0) return res.json({ message: 'El grupo ya existe.' });
    await db.promise().execute(
      'INSERT INTO Grupos (nombre, profesor) VALUES (?, ?)', [nombre, profesor]
    );
    res.json({ message: 'Grupo creado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /inscribirEstudiante
app.post('/inscribirEstudiante', authenticate, async (req, res) => {
  const { estudiante_id, group_id } = req.body;
  try {
    // Verificar que el usuario no sea profesor (consultamos auth-service)
    const authResp = await fetch(`http://localhost:3002/usuario/${estudiante_id}`, {
      headers: { Authorization: req.headers['authorization'] }
    });
    const { usuario } = await authResp.json();

    if (!usuario) return res.json({ message: 'Usuario no existe.' });
    if (usuario.rol !== 'estudiante') return res.json({ message: 'El usuario es profesor.' });

    const [yaInscrito] = await db.promise().execute(
      'SELECT * FROM Estudiantes_por_Grupo WHERE user_id = ? AND group_id = ?',
      [estudiante_id, group_id]
    );
    if (yaInscrito.length > 0) return res.json({ message: 'Estudiante ya inscrito.' });

    await db.promise().execute(
      'INSERT INTO Estudiantes_por_Grupo (user_id, group_id) VALUES (?, ?)',
      [estudiante_id, group_id]
    );
    res.json({ message: 'Estudiante inscrito correctamente.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`[groups-service] corriendo en puerto ${PORT}`));
