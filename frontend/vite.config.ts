import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  server: { port: 5173 },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index:                resolve(__dirname, 'index.html'),
        panelAdmin:           resolve(__dirname, 'pages/panelAdmin.html'),
        gruposProfesor:       resolve(__dirname, 'pages/gruposProfesor.html'),
        asignaturasEstudiante:resolve(__dirname, 'pages/asignaturasEstudiante.html'),
        visualizarGrupo:      resolve(__dirname, 'pages/visualizarGrupo.html'),
        visualizarAsignatura: resolve(__dirname, 'pages/visualizarAsignatura.html'),
        asignarTarea:         resolve(__dirname, 'pages/asignarTarea.html'),
        editarTarea:          resolve(__dirname, 'pages/editarTarea.html'),
        verEntregas:          resolve(__dirname, 'pages/verEntregas.html'),
        entregarTarea:        resolve(__dirname, 'pages/entregarTarea.html'),
        inscribirEstudiante:  resolve(__dirname, 'pages/inscribirEstudiante.html'),
        crearGrupo:           resolve(__dirname, 'pages/crearGrupo.html'),
      },
    },
  },
});
