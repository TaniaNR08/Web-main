/** Convierte fechas de la API (ISO o MySQL `YYYY-MM-DD HH:mm:ss`) a `Date`. */
export function parseFechaApi(value: string | Date | null | undefined): Date | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  const raw = String(value).trim();
  if (!raw) return null;

  const normalized = raw.includes(' ') && !raw.includes('T')
    ? raw.replace(' ', 'T')
    : raw;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}
