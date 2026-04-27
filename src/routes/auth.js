const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM usuarios WHERE email = ? AND password = ?';

    db.query(query, [email, password], (err, results) => {
        if (err) {
            res.status(500).json({ message: 'Error del servidor' });
            return;
        }

        if (results.length > 0) {
            res.json({ message: 'Login exitoso ✅', user: results[0] });
        } else {
            res.status(401).json({ message: 'Credenciales incorrectas ❌' });
        }
    });
});

module.exports = router;