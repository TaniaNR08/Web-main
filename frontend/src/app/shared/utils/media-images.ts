/** URLs Pexels por título — respaldo si falla la URL en BD */
export const GALERIA_POR_TITULO: Record<string, string> = {
  'Fachada principal': pexels(207691),
  'Biblioteca': pexels(256455),
  'Laboratorio de ciencias': pexels(2280571),
  'Salón de informática': pexels(442150),
  'Torneo de fútbol 2025': pexels(4679800),
  'Equipo de baloncesto': pexels(1752757),
  'Graduación promoción 2025': pexels(267885),
  'Acto cívico 20 de julio': pexels(5212345),
  'Obra de teatro estudiantil': pexels(109669),
  'Club de robótica': pexels(8294555),
  'Patio principal': pexels(207691),
};

export const NOTICIA_DEFAULT = pexels(207691);

export const NOTICIAS_POR_TITULO: Record<string, string> = {
  'Bienvenidos al año escolar 2026': pexels(207691),
  'Inicio de clases presenciales': pexels(5212345),
  'Feria de la Ciencia 2026': pexels(2280571),
  'Jornada de puertas abiertas': pexels(8199562),
  'Entrega de boletines primer período': pexels(5905708),
  'Campeonato interclases de deportes': pexels(4679800),
  'Taller para padres: Uso responsable de tecnología': pexels(1181395),
  'Suspensión de clases día de ascensión': pexels(590022),
};

function claveTitulo(titulo: string): string {
  return titulo.trim().split('—')[0].trim();
}

function buscarEnMapa(map: Record<string, string>, titulo: string): string | undefined {
  const clave = claveTitulo(titulo);
  if (map[clave]) return map[clave];
  const norm = clave.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  for (const [k, v] of Object.entries(map)) {
    if (k.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase() === norm) return v;
  }
  return undefined;
}

export function urlImagenGaleria(titulo: string, urlDb?: string | null): string {
  // Prioridad: URL guardada en BD → mapa de respaldo por título → imagen por defecto
  if (urlDb?.trim()) return urlDb.trim();
  return buscarEnMapa(GALERIA_POR_TITULO, titulo) ?? NOTICIA_DEFAULT;
}

export function urlImagenNoticia(titulo: string, urlDb?: string | null): string {
  // Prioridad: URL guardada en BD → mapa de respaldo por título → imagen por defecto
  if (urlDb?.trim()) return urlDb.trim();
  return buscarEnMapa(NOTICIAS_POR_TITULO, titulo) ?? NOTICIA_DEFAULT;
}

function pexels(id: number): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop`;
}
