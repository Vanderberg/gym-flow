export type Clock = () => Date;

const pad = (n: number) => String(n).padStart(2, '0');

/** Data/hora local em ISO com deslocamento de fuso, ex.: 2026-09-20T18:30:00-03:00 (sem UTC). */
export function nowLocalIso(clock: Clock = () => new Date()): string {
  const d = clock();
  const offsetMin = -d.getTimezoneOffset();
  const sign = offsetMin >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMin);
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  );
}

/** Dia local (AAAA-MM-DD) de um ISO com deslocamento; fatia da string, sem conversão. */
export function localDateOf(iso: string): string {
  return iso.slice(0, 10);
}
