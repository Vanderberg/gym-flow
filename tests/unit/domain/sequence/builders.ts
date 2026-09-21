import type { SequenceContext, WorkoutRef } from '../../../../src/domain/sequence/types';

export function makeWorkouts(n: number, positions?: number[]): WorkoutRef[] {
  const pos = positions ?? Array.from({ length: n }, (_, i) => i + 1);
  return pos.map((p, i) => ({
    id: 100 + i,
    programId: 1,
    code: String.fromCharCode(65 + i),
    name: `Treino ${i + 1}`,
    position: p,
  }));
}

export function makeContext(overrides: Partial<SequenceContext> = {}): SequenceContext {
  return {
    programId: 1,
    workouts: makeWorkouts(5),
    currentPosition: 1,
    schedule: [],
    today: { weekday: 1 },
    ...overrides,
  };
}
