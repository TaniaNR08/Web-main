export type Rol = 'administrador' | 'profesor' | 'estudiante';

export interface Usuario {
  user_id: number;
  nombre: string;
  rol: Rol;
}

export interface EstudianteListado {
  user_id: number;
  nombre: string;
}

export interface Grupo {
  group_id: number;
  nombre: string;
  profesor?: number;
  total_estudiantes?: number;
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
  entrega_id: number;
  tarea_id: number;
  user_id: number;
  fecha_entrega: string;
  nombre?: string;
  nota?: number | null;
  comentario?: string | null;
  fecha_calificacion?: string | null;
}

export interface LoginResponse {
  token: string;
  rol: Rol;
  nombre: string;
  redirect: string;
  grupos?: Grupo[];
  asignaturas?: Grupo[];
  error?: string;
}

export interface ApiResponse {
  message?: string;
  error?: string;
}

export interface Noticia {
  noticia_id: number;
  titulo: string;
  contenido: string;
  imagen_url?: string;
  tipo: 'noticia' | 'evento';
  fecha_publicacion: string;
  activo?: boolean;
}

export interface EventoCalendario {
  evento_id: number;
  titulo: string;
  descripcion?: string;
  fecha: string;
  tipo: string;
  color: string;
}

export interface Documento {
  doc_id: number;
  nombre: string;
  categoria: string;
  nombre_archivo: string;
  fecha_subida: string;
}

export interface MensajeContacto {
  mensaje_id: number;
  nombre: string;
  email: string;
  asunto?: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
}

export interface SolicitudAdmision {
  admision_id: number;
  nombre_estudiante: string;
  fecha_nacimiento?: string;
  grado_solicitado?: string;
  nombre_acudiente: string;
  parentesco?: string;
  email: string;
  telefono?: string;
  mensaje?: string;
  fecha: string;
  estado: 'pendiente' | 'revisada' | 'aceptada' | 'rechazada';
}

export interface ItemGaleria {
  media_id: number;
  titulo: string;
  url: string;
  tipo: 'imagen' | 'video';
  categoria: string;
  fecha: string;
}

export interface SeccionInstitucional {
  clave: string;
  titulo: string;
  contenido: string;
}
