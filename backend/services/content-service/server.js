const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const db = require('./config/database');

const app = express();
const PORT = 3006;
const JWT_SECRET = 'secreto';

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({ origin: '*' }));
app.use(express.json());

/* ── MIDDLEWARES ─────────────────────────────────────────────── */

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido' });
  }
}

function soloAdmin(req, res, next) {
  if (req.user.rol !== 'administrador') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
}

/* ── INSTITUCIONAL ───────────────────────────────────────────── */

// GET /institucional — public
app.get('/institucional', async (_req, res) => {
  try {
    const [filas] = await db.promise().execute(
      'SELECT clave, titulo, contenido FROM Contenido_Institucional'
    );
    // Devuelve tanto { secciones } (frontend Angular) como { contenido } (legado)
    const secciones = filas.map(f => ({ clave: f.clave, titulo: f.titulo, contenido: f.contenido }));
    const contenido = {};
    for (const fila of filas) {
      contenido[fila.clave] = { titulo: fila.titulo, contenido: fila.contenido };
    }
    res.json({ secciones, contenido });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /institucional/:clave — upsert, admin only
app.patch('/institucional/:clave', authenticate, soloAdmin, async (req, res) => {
  const { clave } = req.params;
  const { titulo, contenido } = req.body;
  try {
    await db.promise().execute(
      `INSERT INTO Contenido_Institucional (clave, titulo, contenido)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE titulo = VALUES(titulo), contenido = VALUES(contenido)`,
      [clave, titulo ?? '', contenido ?? '']
    );
    res.json({ message: 'Contenido actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── NOTICIAS ────────────────────────────────────────────────── */

// GET /noticias?tipo=&limit=20&limite=20 — public
app.get('/noticias', async (req, res) => {
  const tipo = req.query.tipo;
  // Acepta tanto 'limit' como 'limite' (frontend Angular usa 'limite')
  const limit = parseInt(req.query.limit ?? req.query.limite, 10) || 20;
  // LIMIT embebido (seguro: ya es entero) porque mysql2 execute() no acepta LIMIT ?
  try {
    let sql;
    let params;
    if (tipo) {
      sql = `SELECT * FROM Noticias WHERE activo = TRUE AND tipo = ?
             ORDER BY fecha_publicacion DESC LIMIT ${limit}`;
      params = [tipo];
    } else {
      sql = `SELECT * FROM Noticias WHERE activo = TRUE
             ORDER BY fecha_publicacion DESC LIMIT ${limit}`;
      params = [];
    }
    const [noticias] = await db.promise().execute(sql, params);
    res.json({ noticias });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /noticias/:id — public
app.get('/noticias/:id', async (req, res) => {
  try {
    const [rows] = await db.promise().execute(
      'SELECT * FROM Noticias WHERE noticia_id = ? AND activo = TRUE',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Noticia no encontrada' });
    res.json({ noticia: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /noticias — admin only
app.post('/noticias', authenticate, soloAdmin, async (req, res) => {
  const { titulo, contenido, imagen_url, tipo } = req.body;
  if (!titulo?.trim() || !contenido?.trim()) {
    return res.status(400).json({ error: 'titulo y contenido son requeridos' });
  }
  try {
    const [result] = await db.promise().execute(
      `INSERT INTO Noticias (titulo, contenido, imagen_url, tipo)
       VALUES (?, ?, ?, ?)`,
      [titulo.trim(), contenido.trim(), imagen_url?.trim() || null, tipo || 'noticia']
    );
    res.json({ message: 'Noticia creada', noticia_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /noticias/:id — admin only
app.patch('/noticias/:id', authenticate, soloAdmin, async (req, res) => {
  const { titulo, contenido, imagen_url, tipo } = req.body;
  try {
    await db.promise().execute(
      `UPDATE Noticias SET titulo = ?, contenido = ?, imagen_url = ?, tipo = ?
       WHERE noticia_id = ?`,
      [titulo?.trim(), contenido?.trim(), imagen_url?.trim() || null, tipo, req.params.id]
    );
    res.json({ message: 'Noticia actualizada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /noticias/:id — soft delete, admin only
app.delete('/noticias/:id', authenticate, soloAdmin, async (req, res) => {
  try {
    await db.promise().execute(
      'UPDATE Noticias SET activo = FALSE WHERE noticia_id = ?',
      [req.params.id]
    );
    res.json({ message: 'Noticia eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── EVENTOS / CALENDARIO ────────────────────────────────────── */

// GET /eventos?anio= — public
app.get('/eventos', async (req, res) => {
  const anio = req.query.anio;
  try {
    let sql;
    let params;
    if (anio) {
      sql = 'SELECT * FROM Eventos_Calendario WHERE YEAR(fecha) = ? ORDER BY fecha ASC';
      params = [anio];
    } else {
      sql = 'SELECT * FROM Eventos_Calendario ORDER BY fecha ASC';
      params = [];
    }
    const [eventos] = await db.promise().execute(sql, params);
    res.json({ eventos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /eventos — admin only
app.post('/eventos', authenticate, soloAdmin, async (req, res) => {
  const { titulo, descripcion, fecha, tipo, color } = req.body;
  try {
    const [result] = await db.promise().execute(
      `INSERT INTO Eventos_Calendario (titulo, descripcion, fecha, tipo, color)
       VALUES (?, ?, ?, ?, ?)`,
      [titulo, descripcion ?? null, fecha, tipo ?? null, color ?? null]
    );
    res.json({ message: 'Evento creado', evento_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /eventos/:id — hard delete, admin only
app.delete('/eventos/:id', authenticate, soloAdmin, async (req, res) => {
  try {
    await db.promise().execute(
      'DELETE FROM Eventos_Calendario WHERE evento_id = ?',
      [req.params.id]
    );
    res.json({ message: 'Evento eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── GALERIA ─────────────────────────────────────────────────── */

// GET /galeria/categorias — public (debe ir antes de /galeria/:id si hubiera)
app.get('/galeria/categorias', async (_req, res) => {
  try {
    const [rows] = await db.promise().execute(
      'SELECT DISTINCT categoria FROM Galeria WHERE activo = TRUE AND categoria IS NOT NULL ORDER BY categoria'
    );
    res.json({ categorias: rows.map(r => r.categoria) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /galeria?categoria= — public
app.get('/galeria', async (req, res) => {
  const categoria = req.query.categoria;
  try {
    let sql;
    let params;
    if (categoria) {
      sql = 'SELECT * FROM Galeria WHERE activo = TRUE AND categoria = ? ORDER BY fecha DESC';
      params = [categoria];
    } else {
      sql = 'SELECT * FROM Galeria WHERE activo = TRUE ORDER BY fecha DESC';
      params = [];
    }
    const [galeria] = await db.promise().execute(sql, params);
    res.json({ galeria, items: galeria }); // items por compatibilidad
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /galeria — admin only
app.post('/galeria', authenticate, soloAdmin, async (req, res) => {
  const { titulo, url, tipo, categoria } = req.body;
  try {
    const [result] = await db.promise().execute(
      `INSERT INTO Galeria (titulo, url, tipo, categoria)
       VALUES (?, ?, ?, ?)`,
      [titulo, url, tipo ?? 'imagen', categoria ?? null]
    );
    res.json({ message: 'Item agregado', media_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /galeria/:id — soft delete, admin only
app.delete('/galeria/:id', authenticate, soloAdmin, async (req, res) => {
  try {
    await db.promise().execute(
      'UPDATE Galeria SET activo = FALSE WHERE media_id = ?',
      [req.params.id]
    );
    res.json({ message: 'Item eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── DOCUMENTOS ──────────────────────────────────────────────── */

// GET /documentos — public, metadata only
app.get('/documentos', async (_req, res) => {
  try {
    const [documentos] = await db.promise().execute(
      `SELECT doc_id, nombre, categoria, nombre_archivo, fecha_subida
       FROM Documentos WHERE activo = TRUE`
    );
    res.json({ documentos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /documentos/:id/descargar — public, binary download
app.get('/documentos/:id/descargar', async (req, res) => {
  try {
    const [rows] = await db.promise().execute(
      'SELECT nombre_archivo, archivo FROM Documentos WHERE doc_id = ? AND activo = TRUE',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Documento no encontrado' });
    const doc = rows[0];
    res.setHeader('Content-Disposition', `attachment; filename="${doc.nombre_archivo}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(doc.archivo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /documentos — multipart, admin only
app.post('/documentos', authenticate, soloAdmin, upload.single('archivo'), async (req, res) => {
  const { nombre, categoria } = req.body;
  const file = req.file;
  try {
    await db.promise().execute(
      `INSERT INTO Documentos (nombre, categoria, nombre_archivo, archivo)
       VALUES (?, ?, ?, ?)`,
      [nombre, categoria ?? null, file ? file.originalname : null, file ? file.buffer : null]
    );
    res.json({ message: 'Documento subido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /documentos/:id — soft delete, admin only
app.delete('/documentos/:id', authenticate, soloAdmin, async (req, res) => {
  try {
    await db.promise().execute(
      'UPDATE Documentos SET activo = FALSE WHERE doc_id = ?',
      [req.params.id]
    );
    res.json({ message: 'Documento eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── CONTACTO ────────────────────────────────────────────────── */

// POST /contacto — public
app.post('/contacto', async (req, res) => {
  const { nombre, email, asunto, mensaje } = req.body;
  if (!nombre?.trim() || !email?.trim() || !mensaje?.trim()) {
    return res.status(400).json({ error: 'nombre, email y mensaje son requeridos' });
  }
  try {
    await db.promise().execute(
      `INSERT INTO Mensajes_Contacto (nombre, email, asunto, mensaje)
       VALUES (?, ?, ?, ?)`,
      [nombre.trim(), email.trim(), asunto?.trim() || null, mensaje.trim()]
    );
    res.json({ message: 'Mensaje enviado correctamente', confirmacion: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /contacto/mensajes — admin only (el frontend Angular llama esta ruta)
app.get('/contacto/mensajes', authenticate, soloAdmin, async (_req, res) => {
  try {
    const [mensajes] = await db.promise().execute(
      'SELECT * FROM Mensajes_Contacto ORDER BY fecha DESC'
    );
    res.json({ mensajes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /contacto — admin only (alias para compatibilidad)
app.get('/contacto', authenticate, soloAdmin, async (_req, res) => {
  try {
    const [mensajes] = await db.promise().execute(
      'SELECT * FROM Mensajes_Contacto ORDER BY fecha DESC'
    );
    res.json({ mensajes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /contacto/:id/leido — admin only
app.patch('/contacto/:id/leido', authenticate, soloAdmin, async (req, res) => {
  try {
    await db.promise().execute(
      'UPDATE Mensajes_Contacto SET leido = TRUE WHERE mensaje_id = ?',
      [req.params.id]
    );
    res.json({ message: 'Mensaje marcado como leído' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── ADMISIONES ──────────────────────────────────────────────── */

// POST /admisiones — public
app.post('/admisiones', async (req, res) => {
  const {
    nombre_estudiante,
    fecha_nacimiento,
    grado_solicitado,
    nombre_acudiente,
    parentesco,
    email,
    telefono,
    mensaje,
  } = req.body;
  try {
    const [result] = await db.promise().execute(
      `INSERT INTO Admisiones
         (nombre_estudiante, fecha_nacimiento, grado_solicitado, nombre_acudiente,
          parentesco, email, telefono, mensaje)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre_estudiante,
        fecha_nacimiento ?? null,
        grado_solicitado ?? null,
        nombre_acudiente,
        parentesco ?? null,
        email,
        telefono ?? null,
        mensaje ?? null,
      ]
    );
    res.json({ message: 'Solicitud de admisión enviada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /admisiones — admin only
app.get('/admisiones', authenticate, soloAdmin, async (_req, res) => {
  try {
    const [admisiones] = await db.promise().execute(
      'SELECT * FROM Admisiones ORDER BY fecha DESC'
    );
    res.json({ admisiones });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /admisiones/:id/estado — admin only
app.patch('/admisiones/:id/estado', authenticate, soloAdmin, async (req, res) => {
  const { estado } = req.body;
  const estadosValidos = ['pendiente', 'revisada', 'aceptada', 'rechazada'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}` });
  }
  try {
    await db.promise().execute(
      'UPDATE Admisiones SET estado = ? WHERE admision_id = ?',
      [estado, req.params.id]
    );
    res.json({ message: 'Estado actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── START ───────────────────────────────────────────────────── */

app.listen(PORT, () => {
  console.log(`[content-service] corriendo en puerto ${PORT}`);
});
