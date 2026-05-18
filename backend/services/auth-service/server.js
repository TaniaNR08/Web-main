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
    const token = jwt.sign({ user_id: user, rol: userType }, JWT_SECRET, { expiresIn: '1h' });

    // Llamar a groups-service para obtener grupos o asignaturas
    if (userType === 'profesor') {
      const response = await fetch(`${GROUPS_SERVICE}/grupos/profesor/${user}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { grupos } = await response.json();
      return res.json({ redirect: '/pages/gruposProfesor.html', grupos: grupos || [], token, rol: userType });
    }

    if (userType === 'estudiante') {
      const response = await fetch(`${GROUPS_SERVICE}/asignaturas/estudiante/${user}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { asignaturas } = await response.json();
      return res.json({ redirect: '/pages/asignaturasEstudiante.html', asignaturas: asignaturas || [], token, rol: userType });
    }

  } catch (err) {
    console.error('[auth-service] Error:', err.message);
    return res.status(500).json({ error: 'Error del servidor.' });
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
