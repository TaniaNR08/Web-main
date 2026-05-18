const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const db = require('./config/database');

const app = express();
const PORT = 3004;
const JWT_SECRET = 'secreto';
const SUBMISSIONS_SERVICE = 'http://localhost:3005';

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

// GET /tareas/:tareaId — metadatos (p. ej. autorización de entregas)
app.get('/tareas/:tareaId', authenticate, async (req, res) => {
  const tareaId = Number(req.params.tareaId);
  if (!Number.isFinite(tareaId)) {
    return res.status(400).json({ error: 'ID de tarea inválido' });
  }
  try {
    const [rows] = await db.promise().execute(
      'SELECT tarea_id, group_id, titulo FROM Tareas WHERE tarea_id = ?',
      [tareaId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json({ tarea: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /listarTareas
app.post('/listarTareas', authenticate, async (req, res) => {
  try {
    const [tareas] = await db.promise().execute(
      'SELECT * FROM Tareas WHERE group_id = ?',
      [req.body.group_id]
    );
    res.json({ tareas });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /asignarTarea
app.post('/asignarTarea', authenticate, async (req, res) => {
  const { titulo, descripcion, fecha_inicio, fecha_final, group_id } = req.body;
  try {
    await db.promise().execute(
      'INSERT INTO Tareas (titulo, descripcion, fecha_inicio, fecha_final, group_id) VALUES (?, ?, ?, ?, ?)',
      [titulo, descripcion, fecha_inicio, fecha_final, group_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false });
  }
});

// POST /editarTarea
app.post('/editarTarea', authenticate, async (req, res) => {
  const { tarea_id, titulo, descripcion, fecha_inicio, fecha_final } = req.body;
  try {
    await db.promise().execute(
      'UPDATE Tareas SET titulo = ?, descripcion = ?, fecha_inicio = ?, fecha_final = ? WHERE tarea_id = ?',
      [titulo, descripcion, fecha_inicio, fecha_final, tarea_id]
    );
    res.json({ message: 'Tarea actualizada.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /eliminarTarea
app.post('/eliminarTarea', authenticate, async (req, res) => {
  try {
    await db.promise().execute(
      'DELETE FROM Tareas WHERE tarea_id = ?',
      [req.body.tarea_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /entregasProximas  (comunicacion con submissions-service)
app.post('/entregasProximas', authenticate, async (req, res) => {
  const { user_id, group_id } = req.body;
  try {
    const [tareas] = await db.promise().execute(
      'SELECT * FROM Tareas WHERE group_id = ?',
      [group_id]
    );

    const resultados = await Promise.all(
      tareas.map(async (tarea) => {
        const response = await fetch(`${SUBMISSIONS_SERVICE}/isEntregada`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: req.headers['authorization']
          },
          body: JSON.stringify({ tarea_id: tarea.tarea_id, user_id })
        });
        const { entregas } = await response.json();
        return { result: tarea, entregas: entregas || [] };
      })
    );

    res.json({ success: true, data: resultados });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`[tasks-service] corriendo en puerto ${PORT}`));
