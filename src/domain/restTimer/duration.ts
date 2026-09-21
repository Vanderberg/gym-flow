import { MAX_REST_SECONDS, MIN_REST_SECONDS } from './types';
import type { DurationParse } from './types';

export function validateDuration(seconds: number): boolean {
  return Number.isInteger(seconds) && seconds >= MIN_REST_SECONDS && seconds <= MAX_REST_SECONDS;
}

/** Aceita "mm:ss", "m:ss" ou segundos puros. */
export function parseDurationInput(text: string): DurationParse {
  const t = text.trim();
  let total: number;
  if (/^\d+$/.test(t)) {
    total = Number(t);
  } else {
    const m = /^(\d+):(\d{1,2})$/.exec(t);
    if (!m) return { ok: false, reason: 'INVALID' };
    total = Number(m[1]) * 60 + Number(m[2]);
  }
  return validateDuration(total)
    ? { ok: true, seconds: total }
    : { ok: false, reason: 'OUT_OF_RANGE' };
}

/** mm:ss arredondando os milissegundos para cima. */
export function formatMmSs(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}
