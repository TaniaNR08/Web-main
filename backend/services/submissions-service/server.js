const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const db = require('./config/database');

const app = express();
const PORT = 3005;
const JWT_SECRET = 'secreto';
const TASKS_SERVICE = 'http://localhost:3004';
const GROUPS_SERVICE = 'http://localhost:3003';
const upload = multer({ storage: multer.memoryStorage() });

const MIME_BY_EXT = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  txt: 'text/plain; charset=utf-8',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  zip: 'application/zip',
};

function mimeFromFilename(filename) {
  const ext = String(filename || '').split('.').pop()?.toLowerCase();
  return MIME_BY_EXT[ext] || 'application/octet-stream';
}

function contentDisposition(filename, inline) {
  const name = filename || 'entrega';
  const safe = name.replace(/[^\w\s.\-áéíóúÁÉÍÓÚñÑ]/gi, '_') || 'entrega';
  const mode = inline ? 'inline' : 'attachment';
  return `${mode}; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

async function assertPuedeAccederEntrega(req, entrega) {
  const { rol, user_id } = req.user;
  if (rol === 'administrador') return;

  const authHeader = req.headers.authorization || '';
  const tareaRes = await fetch(`${TASKS_SERVICE}/tareas/${entrega.tarea_id}`, {
    headers: { Authorization: authHeader },
  });
  if (!tareaRes.ok) {
    const err = new Error('Tarea no encontrada');
    err.status = 404;
    throw err;
  }
  const { tarea } = await tareaRes.json();
  if (!tarea?.group_id) {
    const err = new Error('Tarea no encontrada');
    err.status = 404;
    throw err;
  }

  if (rol === 'estudiante') {
    if (Number(entrega.user_id) === Number(user_id)) return;
    const err = new Error('No autorizado');
    err.status = 403;
    throw err;
  }

  if (rol === 'profesor') {
    const grupoRes = await fetch(`${GROUPS_SERVICE}/grupos/${tarea.group_id}`, {
      headers: { Authorization: authHeader },
    });
    if (!grupoRes.ok) {
      const err = new Error('Grupo no encontrado');
      err.status = 404;
      throw err;
    }
    const { grupo } = await grupoRes.json();
    if (grupo?.profesor === Number(user_id)) return;
  }

  const err = new Error('No autorizado');
  err.status = 403;
  throw err;
}

const SELECT_ENTREGA_BASE = `
  entrega_id, tarea_id, user_id, fecha_entrega, nombre
`;

const SELECT_ENTREGA_CALIFICACION = `,
  nota, comentario, fecha_calificacion
`;

let tieneColumnasCalificacion = false;

async function ensureColumnasCalificacion() {
  const alters = [
    'ALTER TABLE Entregas ADD COLUMN nota DECIMAL(5,2) NULL',
    'ALTER TABLE Entregas ADD COLUMN comentario VARCHAR(500) NULL',
    'ALTER TABLE Entregas ADD COLUMN fecha_calificacion DATETIME NULL',
  ];
  for (const sql of alters) {
    try {
      await db.promise().execute(sql);
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') throw err;
    }
  }
  tieneColumnasCalificacion = true;
}

function selectEntregaCampos() {
  return tieneColumnasCalificacion
    ? `${SELECT_ENTREGA_BASE}${SELECT_ENTREGA_CALIFICACION}`
    : SELECT_ENTREGA_BASE;
}

function estaCalificada(entrega) {
  return tieneColumnasCalificacion && entrega != null && entrega.nota != null;
}

app.use(cors({ origin: '*' }));
app.use(express.json());

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

// POST /crearEntrega — crea o actualiza; no permite cambios si ya fue calificada
app.post('/crearEntrega', upload.single('archivo_entrega'), async (req, res) => {
  const { tarea_id, user_id, fecha_entrega, nombre } = req.body;
  const archivo = req.file?.buffer;
  if (!archivo) {
    return res.status(400).json({ success: false, error: 'Archivo requerido' });
  }
  try {
    const camposId = tieneColumnasCalificacion ? 'entrega_id, nota' : 'entrega_id';
    const [existentes] = await db.promise().execute(
      `SELECT ${camposId}
       FROM Entregas
       WHERE tarea_id = ? AND user_id = ?
       ORDER BY fecha_entrega DESC
       LIMIT 1`,
      [tarea_id, user_id]
    );

    if (existentes.length) {
      const previa = existentes[0];
      if (estaCalificada(previa)) {
        return res.status(403).json({
          success: false,
          error: 'Esta entrega ya fue calificada y no puede modificarse.',
        });
      }
      await db.promise().execute(
        `UPDATE Entregas
         SET fecha_entrega = ?, nombre = ?, archivo_entrega = ?
         WHERE entrega_id = ?`,
        [fecha_entrega, nombre, archivo, previa.entrega_id]
      );
      return res.json({ success: true, actualizada: true });
    }

    await db.promise().execute(
      'INSERT INTO Entregas (tarea_id, user_id, fecha_entrega, nombre, archivo_entrega) VALUES (?, ?, ?, ?, ?)',
      [tarea_id, user_id, fecha_entrega, nombre, archivo]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /verEntregas
app.post('/verEntregas', authenticate, async (req, res) => {
  const tareaId = req.body.tarea_id;
  if (tareaId == null || tareaId === '') {
    return res.status(400).json({ error: 'tarea_id es requerido' });
  }
  try {
    const [entregas] = await db.promise().execute(
      `SELECT ${selectEntregaCampos()}
       FROM Entregas WHERE tarea_id = ? ORDER BY fecha_entrega DESC`,
      [tareaId]
    );
    res.json({ entregas });
  } catch (err) {
    console.error('[submissions-service] verEntregas:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /calificarEntrega — profesor califica una entrega (nota 0–100)
app.post('/calificarEntrega', authenticate, async (req, res) => {
  if (req.user.rol !== 'profesor' && req.user.rol !== 'administrador') {
    return res.status(403).json({ error: 'Solo el profesor puede calificar entregas' });
  }

  const entregaId = Number(req.body.entrega_id);
  const nota = Number(req.body.nota);
  const comentario = String(req.body.comentario ?? '').trim().slice(0, 500);

  if (!Number.isFinite(entregaId)) {
    return res.status(400).json({ error: 'ID de entrega inválido' });
  }
  if (!Number.isFinite(nota) || nota < 0 || nota > 100) {
    return res.status(400).json({ error: 'La nota debe estar entre 0 y 100' });
  }

  try {
    const [rows] = await db.promise().execute(
      `SELECT entrega_id, tarea_id, user_id, nombre
       FROM Entregas WHERE entrega_id = ?`,
      [entregaId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Entrega no encontrada' });

    await assertPuedeAccederEntrega(req, rows[0]);

    if (!tieneColumnasCalificacion) {
      return res.status(503).json({
        error: 'Calificaciones no disponibles: reinicie submissions-service para aplicar migración',
      });
    }

    await db.promise().execute(
      `UPDATE Entregas
       SET nota = ?, comentario = ?, fecha_calificacion = NOW()
       WHERE entrega_id = ?`,
      [nota, comentario || null, entregaId]
    );

    const [actualizada] = await db.promise().execute(
      `SELECT ${selectEntregaCampos()}
       FROM Entregas WHERE entrega_id = ?`,
      [entregaId]
    );
    res.json({ success: true, entrega: actualizada[0] });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'No se pudo guardar la calificación' });
  }
});

// GET /entregas/:entregaId/archivo?inline=1 — descargar o previsualizar
app.get('/entregas/:entregaId/archivo', authenticate, async (req, res) => {
  const entregaId = Number(req.params.entregaId);
  if (!Number.isFinite(entregaId)) {
    return res.status(400).json({ error: 'ID de entrega inválido' });
  }
  const inline = req.query.inline === '1' || req.query.inline === 'true';

  try {
    const [rows] = await db.promise().execute(
      'SELECT entrega_id, tarea_id, user_id, nombre, archivo_entrega FROM Entregas WHERE entrega_id = ?',
      [entregaId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Entrega no encontrada' });

    const entrega = rows[0];
    await assertPuedeAccederEntrega(req, entrega);

    const filename = entrega.nombre || `entrega-${entregaId}`;
    const mime = mimeFromFilename(filename);
    res.setHeader('Content-Type', mime);
    res.setHeader('Content-Disposition', contentDisposition(filename, inline));
    res.send(entrega.archivo_entrega);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ error: err.message || 'Error al obtener el archivo' });
  }
});

// POST /isEntregada — estado de entrega del estudiante (sin archivo binario)
app.post('/isEntregada', authenticate, async (req, res) => {
  const { tarea_id, user_id } = req.body;
  try {
    const [entregas] = await db.promise().execute(
      `SELECT ${selectEntregaCampos()}
       FROM Entregas
       WHERE tarea_id = ? AND user_id = ?
       ORDER BY fecha_entrega DESC
       LIMIT 1`,
      [tarea_id, user_id]
    );
    const entrega = entregas[0] ?? null;
    const calificada = estaCalificada(entrega);
    res.json({
      success: !!entrega,
      entrega,
      entregas: entrega ? [entrega] : [],
      calificada,
      editable: !!entrega && !calificada,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function start() {
  try {
    await ensureColumnasCalificacion();
    console.log('[submissions-service] columnas de calificación listas');
  } catch (err) {
    console.warn('[submissions-service] migración calificaciones:', err.message);
    tieneColumnasCalificacion = false;
  }

  app.listen(PORT, () => console.log(`[submissions-service] corriendo en puerto ${PORT}`));
}

start();
