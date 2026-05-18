export type Rol = 'administrador' | 'profesor' | 'estudiante';

export interface Usuario {
  user_id: number;
  nombre: string;
  rol: Rol;
}

export interface Grupo {
  group_id: number;
  nombre: string;
  profesor?: number;
}

export interface Tarea {
  tarea_id: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_final: string;
  group_id: number;
}

export interface Entrega {
  entrega_id?: number;
  tarea_id: number;
  user_id: number;
  fecha_entrega: string;
  nombre?: string;
}

export interface LoginResponse {
  redirect: string;
  token: string;
  rol: Rol;
  grupos?: Grupo[];
  asignaturas?: Grupo[];
  error?: string;
}

export interface ApiResponse {
  message?: string;
  error?: string;
}

export interface UsuariosResponse {
  usuarios: Usuario[];
  error?: string;
}

export interface GruposResponse {
  grupos: Grupo[];
}

export interface TareasResponse {
  tareas: Tarea[];
}

export interface EstudiantesResponse {
  estudiantes: Array<{ user_id: number }>;
}

export interface EntregasResponse {
  entregas: Entrega[];
}

export interface IsEntregadaResponse {
  success: boolean;
}
