export type VistaPreviaEntrega = 'pdf' | 'imagen' | 'texto' | null;

export function extensionArchivo(nombre?: string): string {
  if (!nombre?.includes('.')) return '';
  return nombre.split('.').pop()?.toLowerCase() ?? '';
}

export function tipoVistaPrevia(nombre?: string): VistaPreviaEntrega {
  const ext = extensionArchivo(nombre);
  if (ext === 'pdf') return 'pdf';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'imagen';
  if (ext === 'txt') return 'texto';
  return null;
}

export function puedePrevisualizar(nombre?: string): boolean {
  return tipoVistaPrevia(nombre) !== null;
}
