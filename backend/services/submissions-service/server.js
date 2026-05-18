const express = require('express');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const db = require('./config/database');

const app = express();
const PORT = 3005;
const JWT_SECRET = 'secreto';
const upload = multer({ storage: multer.memoryStorage() });

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

// POST /crearEntrega
app.post('/crearEntrega', upload.single('archivo_entrega'), async (req, res) => {
  const { tarea_id, user_id, fecha_entrega, nombre } = req.body;
  const archivo = req.file?.buffer;
  if (!archivo) return res.status(400).json({ error: 'Archivo requerido' });
  try {
    await db.promise().execute(
      'INSERT INTO Entregas (tarea_id, user_id, fecha_entrega, nombre, archivo_entrega) VALUES (?, ?, ?, ?, ?)',
      [tarea_id, user_id, fecha_entrega, nombre, archivo]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /verEntregas
app.post('/verEntregas', authenticate, async (req, res) => {
  try {
    const [entregas] = await db.promise().execute(
      'SELECT tarea_id, user_id, fecha_entrega, nombre FROM Entregas WHERE tarea_id = ?',
      [req.body.tarea_id]
    );
    res.json({ entregas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /isEntregada
app.post('/isEntregada', authenticate, async (req, res) => {
  const { tarea_id, user_id } = req.body;
  try {
    const [entregas] = await db.promise().execute(
      'SELECT * FROM Entregas WHERE tarea_id = ? AND user_id = ?',
      [tarea_id, user_id]
    );
    res.json({ success: entregas.length > 0, entregas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`[submissions-service] corriendo en puerto ${PORT}`));
