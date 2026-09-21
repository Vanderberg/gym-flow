/** Aritmética de datas "YYYY-MM-DD" por componentes (ano/mês/dia), sem UTC nem fuso. */
const pad = (n: number) => String(n).padStart(2, '0');

function parse(date: string): [number, number, number] {
  const [y, m, d] = date.split('-').map(Number);
  return [y as number, m as number, d as number];
}

/** Dias desde 1970-01-01 (algoritmo de calendário civil proléptico). */
function toDayNumber(date: string): number {
  const [y0, m, d] = parse(date);
  const y = m <= 2 ? y0 - 1 : y0;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

function fromDayNumber(n: number): string {
  const z = n + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor(
    (doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365,
  );
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp < 10 ? mp + 3 : mp - 9;
  const y = yoe + era * 400 + (m <= 2 ? 1 : 0);
  return `${y}-${pad(m)}-${pad(d)}`;
}

/** Diferença em dias corridos: b - a. */
export function daysBetween(a: string, b: string): number {
  return toDayNumber(b) - toDayNumber(a);
}

export function addDays(date: string, n: number): string {
  return fromDayNumber(toDayNumber(date) + n);
}

/** Segunda-feira da semana (seg–dom) que contém a data. */
export function mondayOf(date: string): string {
  const n = toDayNumber(date);
  // 1970-01-01 foi quinta-feira; (n + 3) mod 7 = 0 para segunda.
  const offset = (((n + 3) % 7) + 7) % 7;
  return fromDayNumber(n - offset);
}

export function daysInMonth(year: number, month: number): number {
  const next = month === 12 ? `${year + 1}-01-01` : `${year}-${pad(month + 1)}-01`;
  return daysBetween(`${year}-${pad(month)}-01`, next);
}
