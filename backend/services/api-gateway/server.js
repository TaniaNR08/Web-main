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
  'http://127.0.0.1:5500'
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

// Auth
app.use('/login', createProxyMiddleware(proxyOptions(AUTH_SERVICE)));

// Groups
app.use('/crearGrupo',          createProxyMiddleware(proxyOptions(GROUPS_SERVICE)));
app.use('/listarEstudiantes',   createProxyMiddleware(proxyOptions(GROUPS_SERVICE)));
app.use('/inscribirEstudiante', createProxyMiddleware(proxyOptions(GROUPS_SERVICE)));
app.use('/grupos',              createProxyMiddleware(proxyOptions(GROUPS_SERVICE)));
app.use('/asignaturas',         createProxyMiddleware(proxyOptions(GROUPS_SERVICE)));

// Tasks
app.use('/listarTareas',      createProxyMiddleware(proxyOptions(TASKS_SERVICE)));
app.use('/asignarTarea',      createProxyMiddleware(proxyOptions(TASKS_SERVICE)));
app.use('/editarTarea',       createProxyMiddleware(proxyOptions(TASKS_SERVICE)));
app.use('/eliminarTarea',     createProxyMiddleware(proxyOptions(TASKS_SERVICE)));
app.use('/entregasProximas',  createProxyMiddleware(proxyOptions(TASKS_SERVICE)));

// Submissions
app.use('/crearEntrega', createProxyMiddleware({
  ...proxyOptions(SUBMISSIONS_SERVICE),
  // Necesario para multipart/form-data
  selfHandleResponse: false
}));
app.use('/verEntregas',  createProxyMiddleware(proxyOptions(SUBMISSIONS_SERVICE)));
app.use('/isEntregada',  createProxyMiddleware(proxyOptions(SUBMISSIONS_SERVICE)));

app.listen(PORT, () => {
  console.log(`[api-gateway] corriendo en puerto ${PORT}`);
  console.log(`  → auth-service:        ${AUTH_SERVICE}`);
  console.log(`  → groups-service:      ${GROUPS_SERVICE}`);
  console.log(`  → tasks-service:       ${TASKS_SERVICE}`);
  console.log(`  → submissions-service: ${SUBMISSIONS_SERVICE}`);
});
