const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3001;

const AUTH_SERVICE        = 'http://localhost:3002';
const GROUPS_SERVICE      = 'http://localhost:3003';
const TASKS_SERVICE       = 'http://localhost:3004';
const SUBMISSIONS_SERVICE = 'http://localhost:3005';

const ALLOWED_ORIGINS = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5173',
  'http://localhost:4200'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`Origen no permitido: ${origin}`));
  },
  credentials: true
}));

// Opciones de proxy comunes
const proxyOptions = (target) => ({
  target,
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      console.error(`[gateway] Error al conectar con ${target}:`, err.message);
      res.status(503).json({ error: 'Servicio no disponible' });
    }
  }
});

const proxy = (pathFilter, target) =>
  createProxyMiddleware({ pathFilter, target, changeOrigin: true,
    on: { error: (err, req, res) => res.status(503).json({ error: 'Servicio no disponible' }) }
  });

// Auth
app.use(proxy(['/login', '/usuarios', '/usuario'], AUTH_SERVICE));

// Groups
app.use(proxy(['/crearGrupo', '/listarEstudiantes', '/inscribirEstudiante', '/grupos', '/asignaturas'], GROUPS_SERVICE));

// Tasks
app.use(proxy(['/listarTareas', '/asignarTarea', '/editarTarea', '/eliminarTarea', '/entregasProximas'], TASKS_SERVICE));

// Submissions
app.use(proxy(['/crearEntrega', '/verEntregas', '/isEntregada'], SUBMISSIONS_SERVICE));

app.listen(PORT, () => {
  console.log(`[api-gateway] corriendo en puerto ${PORT}`);
  console.log(`  → auth-service:        ${AUTH_SERVICE}`);
  console.log(`  → groups-service:      ${GROUPS_SERVICE}`);
  console.log(`  → tasks-service:       ${TASKS_SERVICE}`);
  console.log(`  → submissions-service: ${SUBMISSIONS_SERVICE}`);
});
