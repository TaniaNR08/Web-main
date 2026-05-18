export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

export function coincideBusqueda(texto: string, consulta: string): boolean {
  const q = normalizarTexto(consulta);
  if (!q) return true;
  return normalizarTexto(texto).includes(q);
}
