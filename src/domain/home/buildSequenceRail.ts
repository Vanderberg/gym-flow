import type { SequenceRailStep } from './types';

export function buildSequenceRail(
  workouts: { code: string; position: number }[],
  currentPosition: number | null,
): SequenceRailStep[] {
  const sorted = [...workouts].sort((a, b) => a.position - b.position);
  if (sorted.length === 0) return [];
  const valid = sorted.some((w) => w.position === currentPosition);
  const current = valid ? (currentPosition as number) : sorted[0].position;
  return sorted.map((w) => ({
    code: w.code,
    state: w.position < current ? 'DONE' : w.position === current ? 'CURRENT' : 'PENDING',
  }));
}
