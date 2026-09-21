/** Uma casa decimal com vírgula; meio para cima; null vira "—". */
export function formatDecimal(value: number | null, opts?: { suffix?: string }): string {
  if (value === null) return '—';
  const tenths = Math.floor(Math.round(value * 1e6) / 1e5 + 0.5 + 1e-9);
  const text = `${Math.floor(tenths / 10)},${tenths % 10}`;
  return opts?.suffix ? `${text} ${opts.suffix}` : text;
}
