import { daysBetween, mondayOf } from '../../utils/dateMath';
import type { PeriodRange } from './types';

/** Semanas de calendário (seg–dom) que o período já tocou até hoje; sempre >= 1. */
export function weeksTouched(range: PeriodRange, today: string): number {
  const last = today < range.end ? today : range.end;
  const weeks = daysBetween(mondayOf(range.start), mondayOf(last)) / 7 + 1;
  return Math.max(1, weeks);
}
