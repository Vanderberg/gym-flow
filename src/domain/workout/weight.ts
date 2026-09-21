import type { WeightParse } from './types';

/** Aceita vírgula ou ponto; vazio vira null; nulo ou >= 0 com 2 casas. */
export function parseWeightInput(text: string): WeightParse {
  const t = text.trim();
  if (t === '') return { ok: true, value: null };
  if (!/^\d+([.,]\d+)?$/.test(t)) return { ok: false, reason: 'INVALID' };
  const n = Number(t.replace(',', '.'));
  if (!Number.isFinite(n) || n < 0) return { ok: false, reason: 'INVALID' };
  return { ok: true, value: Math.round(n * 100) / 100 };
}

export function formatWeight(value: number | null): string {
  if (value === null) return '';
  return String(value).replace('.', ',');
}
