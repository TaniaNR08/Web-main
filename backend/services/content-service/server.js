const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const db = require('./config/database');

const app = express();
const PORT = 3006;
const JWT_SECRET = 'secreto';
const MAX_FILE_BYTES = 10 * 1024 * 1024;

function safeLimit(raw, fallback = 50, max = 100) {
  const n = Number(raw);
  const value = Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
  return Math.min(value, max);
}
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES },
});

app.use(cors({ origin: '*' }));
app.use(express.json({ type: ['application/json', 'application/json; charset=utf-8'] }));
app.use((_req, res, next) => {
  const json = res.json.bind(res);
  res.json = (body) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return json(body);
  };
  next();
});

function authenticate(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ error: 'Token inválido' });
  }
}

function soloAdmin(req, res, next) {
  if (req.user?.rol !== 'administrador') return res.status(403).json({ error: 'Acceso denegado' });
  next();
}

/* ── INSTITUCIONAL (RF02) ─────────────────────────────────── */
app.get('/institucional', async (_req, res) => {
  try {
    const [filas] = await db.promise().execute(
      'SELECT clave, titulo, contenido FROM Contenido_Institucional ORDER BY clave'
    );
    res.json({ secciones: filas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/institucional/:clave', authenticate, soloAdmin, async (req, res) => {
  const { titulo, contenido } = req.body;
  if (!contenido) return res.status(400).json({ error: 'Contenido requerido' });
  try {
    await db.promise().execute(
      'UPDATE Contenido_Institucional SET titulo = ?, contenido = ? WHERE clave = ?',
      [titulo ?? '', contenido, req.params.clave]
    );
    res.json({ message: 'Contenido actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── NOTICIAS (RF03) ──────────────────────────────────────── */
app.get('/noticias', async (req, res) => {
  const limite = safeLimit(req.query.limite);
  try {
    const [noticias] = await db.promise().query(
      `SELECT noticia_id, titulo, contenido, imagen_url, tipo, fecha_publicacion
       FROM Noticias WHERE activo = TRUE ORDER BY fecha_publicacion DESC LIMIT ${limite}`
    );
    res.json({ noticias });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/noticias/:id', async (req, res) => {
  try {
    const [rows] = await db.promise().execute(
      'SELECT * FROM Noticias WHERE noticia_id = ? AND activo = TRUE',
      [Number(req.params.id)]
    );
    if (!rows.length) return res.status(404).json({ error: 'No encontrada' });
    res.json({ noticia: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/noticias', authenticate, soloAdmin, async (req, res) => {
  const { titulo, contenido, imagen_url, tipo } = req.body;
  if (!titulo || !contenido) return res.status(400).json({ error: 'Título y contenido requeridos' });
  try {
    const [r] = await db.promise().execute(
      'INSERT INTO Noticias (titulo, contenido, imagen_url, tipo) VALUES (?, ?, ?, ?)',
      [titulo, contenido, imagen_url ?? null, tipo ?? 'noticia']
    );
    res.json({ message: 'Noticia creada', noticia_id: r.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/noticias/:id', authenticate, soloAdmin, async (req, res) => {
  const { titulo, contenido, imagen_url, tipo, activo } = req.body;
  try {
    await db.promise().execute(
      `UPDATE Noticias SET titulo = COALESCE(?, titulo), contenido = COALESCE(?, contenido),
       imagen_url = COALESCE(?, imagen_url), tipo = COALESCE(?, tipo), activo = COALESCE(?, activo)
       WHERE noticia_id = ?`,
      [titulo, contenido, imagen_url, tipo, activo, Number(req.params.id)]
    );
    res.json({ message: 'Noticia actualizada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/noticias/:id', authenticate, soloAdmin, async (req, res) => {
  try {
    await db.promise().execute('UPDATE Noticias SET activo = FALSE WHERE noticia_id = ?', [
      Number(req.params.id),
    ]);
    res.json({ message: 'Noticia eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── EVENTOS / CALENDARIO (RF04) ────────────────────────────── */
app.get('/eventos', async (req, res) => {
  const mes = req.query.mes;
  const anio = req.query.anio;
  try {
    let sql = 'SELECT * FROM Eventos_Calendario ORDER BY fecha ASC';
    const params = [];
    if (mes && anio) {
      sql = `SELECT * FROM Eventos_Calendario
             WHERE MONTH(fecha) = ? AND YEAR(fecha) = ? ORDER BY fecha ASC`;
      params.push(Number(mes), Number(anio));
    }
    const [eventos] = await db.promise().execute(sql, params);
    res.json({ eventos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/eventos', authenticate, soloAdmin, async (req, res) => {
  const { titulo, descripcion, fecha, tipo, color } = req.body;
  if (!titulo || !fecha) return res.status(400).json({ error: 'Título y fecha requeridos' });
  try {
    const [r] = await db.promise().execute(
      'INSERT INTO Eventos_Calendario (titulo, descripcion, fecha, tipo, color) VALUES (?, ?, ?, ?, ?)',
      [titulo, descripcion ?? '', fecha, tipo ?? 'general', color ?? '#374151']
    );
    res.json({ message: 'Evento creado', evento_id: r.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/eventos/:id', authenticate, soloAdmin, async (req, res) => {
  const { titulo, descripcion, fecha, tipo, color } = req.body;
  try {
    await db.promise().execute(
      `UPDATE Eventos_Calendario SET titulo = COALESCE(?, titulo), descripcion = COALESCE(?, descripcion),
       fecha = COALESCE(?, fecha), tipo = COALESCE(?, tipo), color = COALESCE(?, color)
       WHERE evento_id = ?`,
      [titulo, descripcion, fecha, tipo, color, Number(req.params.id)]
    );
    res.json({ message: 'Evento actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/eventos/:id', authenticate, soloAdmin, async (req, res) => {
  try {
    await db.promise().execute('DELETE FROM Eventos_Calendario WHERE evento_id = ?', [
      Number(req.params.id),
    ]);
    res.json({ message: 'Evento eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── DOCUMENTOS / DESCARGAS (RF06) ──────────────────────────── */
app.get('/documentos', async (_req, res) => {
  try {
    const [documentos] = await db.promise().execute(
      `SELECT doc_id, nombre, categoria, nombre_archivo, fecha_subida
       FROM Documentos WHERE activo = TRUE ORDER BY fecha_subida DESC`
    );
    res.json({ documentos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/documentos/:id/descargar', async (req, res) => {
  try {
    const [rows] = await db.promise().execute(
      'SELECT nombre, nombre_archivo, archivo FROM Documentos WHERE doc_id = ? AND activo = TRUE',
      [Number(req.params.id)]
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

app.post('/documentos', authenticate, soloAdmin, upload.single('archivo'), async (req, res) => {
  const { nombre, categoria } = req.body;
  const file = req.file;
  if (!nombre || !file) return res.status(400).json({ error: 'Nombre y archivo requeridos' });
  if (!ALLOWED_DOC_TYPES.includes(file.mimetype) && !file.originalname.match(/\.(pdf|doc|docx)$/i)) {
    return res.status(400).json({ error: 'Tipo de archivo no permitido (PDF, DOC, DOCX)' });
  }
  try {
    const [r] = await db.promise().execute(
      'INSERT INTO Documentos (nombre, categoria, nombre_archivo, archivo) VALUES (?, ?, ?, ?)',
      [nombre, categoria ?? 'otro', file.originalname, file.buffer]
    );
    res.json({ message: 'Documento subido', doc_id: r.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/documentos/:id', authenticate, soloAdmin, async (req, res) => {
  try {
    await db.promise().execute('UPDATE Documentos SET activo = FALSE WHERE doc_id = ?', [
      Number(req.params.id),
    ]);
    res.json({ message: 'Documento eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── CONTACTO (RF13) ────────────────────────────────────────── */
app.post('/contacto', async (req, res) => {
  const { nombre, email, asunto, mensaje } = req.body;
  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Nombre, email y mensaje son requeridos' });
  }
  try {
    await db.promise().execute(
      'INSERT INTO Mensajes_Contacto (nombre, email, asunto, mensaje) VALUES (?, ?, ?, ?)',
      [nombre, email, asunto ?? '', mensaje]
    );
    console.log(`[content-service] Nuevo mensaje de contacto: ${email} — ${asunto ?? '(sin asunto)'}`);
    res.json({
      message: 'Mensaje enviado correctamente. Recibirá confirmación de recepción.',
      confirmacion: true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

app.patch('/contacto/:id/leido', authenticate, soloAdmin, async (req, res) => {
  try {
    await db.promise().execute('UPDATE Mensajes_Contacto SET leido = TRUE WHERE mensaje_id = ?', [
      Number(req.params.id),
    ]);
    res.json({ message: 'Marcado como leido' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── ADMISIONES (RF05) ──────────────────────────────────────── */
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
  if (!nombre_estudiante || !nombre_acudiente || !email) {
    return res.status(400).json({ error: 'Datos del estudiante y acudiente requeridos' });
  }
  try {
    const [r] = await db.promise().execute(
      `INSERT INTO Admisiones
       (nombre_estudiante, fecha_nacimiento, grado_solicitado, nombre_acudiente, parentesco, email, telefono, mensaje)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre_estudiante,
        fecha_nacimiento || null,
        grado_solicitado ?? '',
        nombre_acudiente,
        parentesco ?? '',
        email,
        telefono ?? '',
        mensaje ?? '',
      ]
    );
    res.json({
      message: 'Solicitud de admisión registrada. La institución revisará su información.',
      admision_id: r.insertId,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

app.patch('/admisiones/:id', authenticate, soloAdmin, async (req, res) => {
  const { estado } = req.body;
  if (!estado) return res.status(400).json({ error: 'Estado requerido' });
  try {
    await db.promise().execute('UPDATE Admisiones SET estado = ? WHERE admision_id = ?', [
      estado,
      Number(req.params.id),
    ]);
    res.json({ message: 'Estado actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ── GALERIA (RF15) ─────────────────────────────────────────── */
app.get('/galeria', async (req, res) => {
  const categoria = req.query.categoria;
  try {
    let sql = 'SELECT * FROM Galeria WHERE activo = TRUE ORDER BY fecha DESC';
    const params = [];
    if (categoria) {
      sql = 'SELECT * FROM Galeria WHERE activo = TRUE AND categoria = ? ORDER BY fecha DESC';
      params.push(categoria);
    }
    const [items] = await db.promise().execute(sql, params);
    res.json({ galeria: items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/galeria/categorias', async (_req, res) => {
  try {
    const [rows] = await db.promise().execute(
      'SELECT DISTINCT categoria FROM Galeria WHERE activo = TRUE ORDER BY categoria'
    );
    res.json({ categorias: rows.map((r) => r.categoria) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/galeria', authenticate, soloAdmin, async (req, res) => {
  const { titulo, url, tipo, categoria } = req.body;
  if (!titulo || !url) return res.status(400).json({ error: 'Título y URL requeridos' });
  try {
    const [r] = await db.promise().execute(
      'INSERT INTO Galeria (titulo, url, tipo, categoria) VALUES (?, ?, ?, ?)',
      [titulo, url, tipo ?? 'imagen', categoria ?? 'general']
    );
    res.json({ message: 'Item agregado', media_id: r.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/galeria/:id', authenticate, soloAdmin, async (req, res) => {
  try {
    await db.promise().execute('UPDATE Galeria SET activo = FALSE WHERE media_id = ?', [
      Number(req.params.id),
    ]);
    res.json({ message: 'Item eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`[content-service] corriendo en puerto ${PORT}`));
