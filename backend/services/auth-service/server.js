const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/database');

const app = express();
const PORT = 3002;
const JWT_SECRET = 'secreto';
const GROUPS_SERVICE = 'http://localhost:3003';

app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

// POST /login
app.post('/login', async (req, res) => {
  const { user, passwd } = req.body;

  try {
    const [results] = await db.promise().execute(
      'SELECT * FROM Usuarios WHERE user_id = ? AND passwd = ?',
      [Number(user), passwd]
    );

    if (results.length === 0) {
      return res.json({ error: 'Usuario o Contrasena Incorrectos.' });
    }

    const userType = results[0].rol;
    const nombre   = results[0].nombre;
    const token = jwt.sign({ user_id: user, rol: userType }, JWT_SECRET, { expiresIn: '1h' });

    // Llamar a groups-service para obtener grupos o asignaturas
    if (userType === 'profesor') {
      const response = await fetch(`${GROUPS_SERVICE}/grupos/profesor/${user}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { grupos } = await response.json();
      return res.json({ redirect: '/pages/gruposProfesor.html', grupos: grupos || [], token, rol: userType, nombre });
    }

    if (userType === 'estudiante') {
      const response = await fetch(`${GROUPS_SERVICE}/asignaturas/estudiante/${user}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { asignaturas } = await response.json();
      return res.json({ redirect: '/pages/asignaturasEstudiante.html', asignaturas: asignaturas || [], token, rol: userType, nombre });
    }

    if (userType === 'administrador') {
      return res.json({ redirect: '/pages/panelAdmin.html', token, rol: userType, nombre });
    }

  } catch (err) {
    console.error('[auth-service] Error:', err.message);
    return res.status(500).json({ error: 'Error del servidor.' });
  }
});

// Middleware de autenticacion
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

function soloAdmin(req, res, next) {
  if (req.user?.rol !== 'administrador') return res.status(403).json({ error: 'Acceso denegado' });
  next();
}

// GET /usuarios  — listar todos
app.get('/usuarios', authenticate, soloAdmin, async (req, res) => {
  try {
    const [usuarios] = await db.promise().execute(
      'SELECT user_id, nombre, rol FROM Usuarios ORDER BY rol, user_id'
    );
    res.json({ usuarios });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /usuarios  — crear usuario
app.post('/usuarios', authenticate, soloAdmin, async (req, res) => {
  const { user_id, nombre, passwd, rol } = req.body;
  if (!user_id || !nombre || !passwd || !rol) return res.status(400).json({ error: 'Todos los campos son requeridos' });
  try {
    const [existe] = await db.promise().execute(
      'SELECT user_id FROM Usuarios WHERE user_id = ?', [Number(user_id)]
    );
    if (existe.length > 0) return res.json({ error: 'El usuario ya existe' });
    await db.promise().execute(
      'INSERT INTO Usuarios (user_id, nombre, passwd, rol) VALUES (?, ?, ?, ?)',
      [Number(user_id), nombre, passwd, rol]
    );
    res.json({ message: 'Usuario creado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /usuarios/:id  — editar usuario
app.patch('/usuarios/:id', authenticate, soloAdmin, async (req, res) => {
  const { nombre, passwd, rol } = req.body;
  if (!nombre || !passwd || !rol) return res.status(400).json({ error: 'Todos los campos son requeridos' });
  try {
    await db.promise().execute(
      'UPDATE Usuarios SET nombre = ?, passwd = ?, rol = ? WHERE user_id = ?',
      [nombre, passwd, rol, Number(req.params.id)]
    );
    res.json({ message: 'Usuario actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /usuarios/:id  — eliminar usuario
app.delete('/usuarios/:id', authenticate, soloAdmin, async (req, res) => {
  try {
    await db.promise().execute(
      'DELETE FROM Usuarios WHERE user_id = ?', [Number(req.params.id)]
    );
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /estudiantes — listar estudiantes (profesor o administrador)
app.get('/estudiantes', authenticate, async (req, res) => {
  if (req.user.rol !== 'profesor' && req.user.rol !== 'administrador') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  const q = String(req.query.q || '').trim();
  try {
    let sql = 'SELECT user_id, nombre FROM Usuarios WHERE rol = ?';
    const params = ['estudiante'];
    if (q) {
      sql += ' AND (CAST(user_id AS CHAR) LIKE ? OR nombre LIKE ?)';
      const like = `%${q}%`;
      params.push(like, like);
    }
    sql += ' ORDER BY nombre ASC';
    const [estudiantes] = await db.promise().execute(sql, params);
    res.json({ estudiantes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /usuario/:id  (uso interno entre servicios)
app.get('/usuario/:id', async (req, res) => {
  try {
    const [results] = await db.promise().execute(
      'SELECT user_id, rol FROM Usuarios WHERE user_id = ?',
      [Number(req.params.id)]
    );
    res.json({ usuario: results[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`[auth-service] corriendo en puerto ${PORT}`));
