import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { rolGuard } from './core/guards/rol.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/public/public-layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/public/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'institucional',
        loadComponent: () =>
          import('./features/public/institucional/institucional.component').then(m => m.InstitucionalComponent),
      },
      {
        path: 'noticias',
        loadComponent: () =>
          import('./features/public/noticias/noticias.component').then(m => m.NoticiasComponent),
      },
      {
        path: 'calendario',
        loadComponent: () =>
          import('./features/public/calendario/calendario.component').then(m => m.CalendarioComponent),
      },
      {
        path: 'admisiones',
        loadComponent: () =>
          import('./features/public/admisiones/admisiones.component').then(m => m.AdmisionesComponent),
      },
      {
        path: 'descargas',
        loadComponent: () =>
          import('./features/public/descargas/descargas.component').then(m => m.DescargasComponent),
      },
      {
        path: 'contacto',
        loadComponent: () =>
          import('./features/public/contacto/contacto.component').then(m => m.ContactoComponent),
      },
      {
        path: 'galeria',
        loadComponent: () =>
          import('./features/public/galeria/galeria.component').then(m => m.GaleriaComponent),
      },
    ],
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },

  /* ── ADMIN ─────────────────────────────────────────────── */
  {
    path: 'admin',
    canActivate: [authGuard, rolGuard('administrador')],
    loadComponent: () =>
      import('./features/admin/panel-admin/panel-admin.component').then(m => m.PanelAdminComponent),
  },
  {
    path: 'admin/contenido',
    canActivate: [authGuard, rolGuard('administrador')],
    loadComponent: () =>
      import('./features/admin/admin-contenido/admin-contenido.component').then(m => m.AdminContenidoComponent),
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
