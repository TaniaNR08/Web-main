const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3001;

const AUTH_SERVICE        = 'http://localhost:3002';
const GROUPS_SERVICE      = 'http://localhost:3003';
const TASKS_SERVICE       = 'http://localhost:3004';
const SUBMISSIONS_SERVICE = 'http://localhost:3005';
const CONTENT_SERVICE     = 'http://localhost:3006';

const CONTENT_PREFIXES = [
  '/institucional',
  '/noticias',
  '/eventos',
  '/documentos',
  '/contacto',
  '/admisiones',
  '/galeria',
];

const DEFAULT_ORIGINS = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5173',
  'http://localhost:4200',
];
const ALLOWED_ORIGINS = [
  ...DEFAULT_ORIGINS,
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()) : []),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`Origen no permitido: ${origin}`));
  },
  credentials: true,
}));

const proxyTo = (target) => createProxyMiddleware({
  target,
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      console.error(`[gateway] Error al conectar con ${target}:`, err.message);
      if (!res.headersSent) {
        res.status(503).json({ error: 'Servicio no disponible' });
      }
    },
  },
});

const isContentPath = (pathname) =>
  CONTENT_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

// Content — pathFilter conserva /eventos completo (app.use('/eventos') lo cortaba → 404)
app.use(createProxyMiddleware({
  target: CONTENT_SERVICE,
  changeOrigin: true,
  pathFilter: (pathname) => isContentPath(pathname),
  on: {
    error: (err, req, res) => {
      console.error(`[gateway] content-service:`, err.message);
      if (!res.headersSent) res.status(503).json({ error: 'Servicio de contenido no disponible' });
    },
  },
}));

// Auth
app.use(createProxyMiddleware({
  target: AUTH_SERVICE,
  changeOrigin: true,
  pathFilter: (pathname) =>
    pathname === '/login'
    || pathname === '/estudiantes'
    || pathname.startsWith('/usuarios')
    || pathname.startsWith('/usuario'),
}));

// Groups
app.use(createProxyMiddleware({
  target: GROUPS_SERVICE,
  changeOrigin: true,
  pathFilter: (pathname) =>
    ['/crearGrupo', '/listarEstudiantes', '/inscribirEstudiante', '/grupos', '/asignaturas', '/estudiantes/disponibles']
      .some((p) => pathname === p || pathname.startsWith(`${p}/`)),
}));

// Tasks
app.use(createProxyMiddleware({
  target: TASKS_SERVICE,
  changeOrigin: true,
  pathFilter: (pathname) =>
    ['/listarTareas', '/asignarTarea', '/editarTarea', '/eliminarTarea', '/entregasProximas', '/tareas']
      .some((p) => pathname === p || pathname.startsWith(`${p}/`)),
}));

// Submissions
app.use(createProxyMiddleware({
  target: SUBMISSIONS_SERVICE,
  changeOrigin: true,
  pathFilter: (pathname) =>
    ['/crearEntrega', '/verEntregas', '/isEntregada', '/calificarEntrega', '/entregas']
      .some((p) => pathname === p || pathname.startsWith(`${p}/`)),
}));

app.listen(PORT, () => {
  console.log(`[api-gateway] corriendo en puerto ${PORT}`);
  console.log(`  → auth-service:        ${AUTH_SERVICE}`);
  console.log(`  → groups-service:      ${GROUPS_SERVICE}`);
  console.log(`  → tasks-service:       ${TASKS_SERVICE}`);
  console.log(`  → submissions-service: ${SUBMISSIONS_SERVICE}`);
  console.log(`  → content-service:     ${CONTENT_SERVICE}`);
});
