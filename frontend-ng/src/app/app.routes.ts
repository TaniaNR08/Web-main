import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { rolGuard } from './core/guards/rol.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },

  /* ── ADMIN ─────────────────────────────────────────────── */
  {
    path: 'admin',
    canActivate: [authGuard, rolGuard('administrador')],
    loadComponent: () => import('./features/admin/panel-admin/panel-admin.component').then(m => m.PanelAdminComponent),
  },

  /* ── PROFESOR ───────────────────────────────────────────── */
  {
    path: 'profesor',
    canActivate: [authGuard, rolGuard('profesor')],
    children: [
      { path: '', redirectTo: 'grupos', pathMatch: 'full' },
      {
        path: 'grupos',
        loadComponent: () => import('./features/profesor/grupos/grupos.component').then(m => m.GruposComponent),
      },
      {
        path: 'grupos/crear',
        loadComponent: () => import('./features/profesor/crear-grupo/crear-grupo.component').then(m => m.CrearGrupoComponent),
      },
      {
        path: 'grupos/:id',
        loadComponent: () => import('./features/profesor/visualizar-grupo/visualizar-grupo.component').then(m => m.VisualizarGrupoComponent),
      },
      {
        path: 'grupos/:id/inscribir',
        loadComponent: () => import('./features/profesor/inscribir-estudiante/inscribir-estudiante.component').then(m => m.InscribirEstudianteComponent),
      },
      {
        path: 'grupos/:id/asignar-tarea',
        loadComponent: () => import('./features/profesor/asignar-tarea/asignar-tarea.component').then(m => m.AsignarTareaComponent),
      },
      {
        path: 'grupos/:id/tareas/:tareaId/editar',
        loadComponent: () => import('./features/profesor/editar-tarea/editar-tarea.component').then(m => m.EditarTareaComponent),
      },
      {
        path: 'grupos/:id/tareas/:tareaId/entregas',
        loadComponent: () => import('./features/profesor/ver-entregas/ver-entregas.component').then(m => m.VerEntregasComponent),
      },
    ],
  },

  /* ── ESTUDIANTE ─────────────────────────────────────────── */
  {
    path: 'estudiante',
    canActivate: [authGuard, rolGuard('estudiante')],
    children: [
      { path: '', redirectTo: 'asignaturas', pathMatch: 'full' },
      {
        path: 'asignaturas',
        loadComponent: () => import('./features/estudiante/asignaturas/asignaturas.component').then(m => m.AsignaturasComponent),
      },
      {
        path: 'asignaturas/:id',
        loadComponent: () => import('./features/estudiante/visualizar-asignatura/visualizar-asignatura.component').then(m => m.VisualizarAsignaturaComponent),
      },
      {
        path: 'asignaturas/:id/tareas/:tareaId/entregar',
        loadComponent: () => import('./features/estudiante/entregar-tarea/entregar-tarea.component').then(m => m.EntregarTareaComponent),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
