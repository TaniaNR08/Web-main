/** Nota sobre 100 */
export function formatearNota(nota: number | null | undefined): string {
  if (nota == null || Number.isNaN(Number(nota))) return '—';
  return Number(nota).toFixed(1);
}

export function etiquetaNota(nota: number | null | undefined): string {
  if (nota == null) return 'Sin calificar';
  const n = Number(nota);
  if (n >= 90) return 'Excelente';
  if (n >= 70) return 'Aprobado';
  if (n >= 60) return 'En revisión';
  return 'Requiere mejorar';
}

export function claseNota(nota: number | null | undefined): string {
  if (nota == null) return 'nota-badge--pendiente';
  const n = Number(nota);
  if (n >= 90) return 'nota-badge--alta';
  if (n >= 70) return 'nota-badge--media';
  if (n >= 60) return 'nota-badge--baja';
  return 'nota-badge--insuficiente';
}
