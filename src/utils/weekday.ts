/** Dia da semana de uma data local "AAAA-MM-DD": 1=segunda ... 7=domingo (sem UTC). */
export function weekdayOfLocalDate(localDate: string): number {
  const [y, m, d] = localDate.split('-').map(Number);
  const js = new Date(y, m - 1, d).getDay();
  return js === 0 ? 7 : js;
}
