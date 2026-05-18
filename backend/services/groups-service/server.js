const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const db = require('./config/database');

const app = express();
const PORT = 3003;
const JWT_SECRET = 'secreto';
const AUTH_SERVICE = 'http://localhost:3002';

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

// GET /grupos/profesor/:id — debe ir antes de /grupos/:groupId
app.get('/grupos/profesor/:id', authenticate, async (req, res) => {
  try {
    const [grupos] = await db.promise().execute(
      `SELECT g.group_id, g.nombre, g.profesor,
              (SELECT COUNT(*) FROM Estudiantes_por_Grupo epg WHERE epg.group_id = g.group_id) AS total_estudiantes
       FROM Grupos g
       WHERE g.profesor = ?
       ORDER BY g.nombre`,
      [req.params.id]
    );
    res.json({ grupos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /grupos/:groupId — detalle del grupo (profesor del grupo o admin)
app.get('/grupos/:groupId', authenticate, async (req, res) => {
  const groupId = Number(req.params.groupId);
  if (!Number.isFinite(groupId)) {
    return res.status(400).json({ error: 'ID de grupo inválido' });
  }
  try {
    const [rows] = await db.promise().execute(
      'SELECT group_id, nombre, profesor FROM Grupos WHERE group_id = ?',
      [groupId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Grupo no encontrado' });

    const grupo = rows[0];
    if (req.user.rol === 'profesor' && grupo.profesor !== Number(req.user.user_id)) {
      return res.status(403).json({ error: 'No autorizado para este grupo' });
    }
    res.json({ grupo });
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

// GET /estudiantes/disponibles/:groupId — estudiantes no inscritos en el grupo
app.get('/estudiantes/disponibles/:groupId', authenticate, async (req, res) => {
  if (req.user.rol !== 'profesor') {
    return res.status(403).json({ error: 'Solo profesores pueden consultar esta lista' });
  }
  const groupId = Number(req.params.groupId);
  const q = encodeURIComponent(String(req.query.q || '').trim());
  try {
    const [grupo] = await db.promise().execute(
      'SELECT group_id FROM Grupos WHERE group_id = ? AND profesor = ?',
      [groupId, Number(req.user.user_id)]
    );
    if (!grupo.length) return res.status(403).json({ error: 'No autorizado para este grupo' });

    const authResp = await fetch(`${AUTH_SERVICE}/estudiantes?q=${q}`, {
      headers: { Authorization: req.headers['authorization'] },
    });
    if (!authResp.ok) {
      return res.status(authResp.status).json({ error: 'No se pudo obtener la lista de estudiantes' });
    }
    const { estudiantes = [] } = await authResp.json();

    const [inscritos] = await db.promise().execute(
      'SELECT user_id FROM Estudiantes_por_Grupo WHERE group_id = ?',
      [groupId]
    );
    const inscritosIds = new Set(inscritos.map((r) => r.user_id));

    const disponibles = estudiantes.filter((e) => !inscritosIds.has(e.user_id));
    res.json({ estudiantes: disponibles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /listarEstudiantes — inscritos del grupo con nombre desde auth-service
app.post('/listarEstudiantes', authenticate, async (req, res) => {
  const groupId = req.body.group_id;
  try {
    const [inscritos] = await db.promise().execute(
      'SELECT user_id FROM Estudiantes_por_Grupo WHERE group_id = ? ORDER BY user_id',
      [groupId]
    );
    if (!inscritos.length) return res.json({ estudiantes: [] });

    const authResp = await fetch(`${AUTH_SERVICE}/estudiantes`, {
      headers: { Authorization: req.headers.authorization || '' },
    });
    if (!authResp.ok) {
      return res.status(authResp.status).json({ error: 'No se pudo obtener nombres de estudiantes' });
    }
    const { estudiantes: catalogo = [] } = await authResp.json();
    const nombresPorId = new Map(catalogo.map((e) => [Number(e.user_id), e.nombre]));

    const estudiantes = inscritos.map((r) => ({
      user_id: r.user_id,
      nombre: nombresPorId.get(Number(r.user_id)) || 'Sin nombre',
    }));
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
