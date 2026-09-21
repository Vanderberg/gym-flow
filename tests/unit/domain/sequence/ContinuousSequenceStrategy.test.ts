import { ContinuousSequenceStrategy } from '../../../../src/domain/sequence/strategies/ContinuousSequenceStrategy';
import type { NextWorkoutResult } from '../../../../src/domain/sequence/types';
import { makeContext, makeWorkouts } from './builders';

const s = new ContinuousSequenceStrategy();
const pos = (r: NextWorkoutResult) => (r.kind === 'WORKOUT' ? r.workout.position : -1);

describe('ContinuousSequenceStrategy', () => {
  it('primeiro, meio e último', () => {
    expect(pos(s.getNextWorkout(makeContext({ currentPosition: 1 })))).toBe(1);
    expect(pos(s.getNextWorkout(makeContext({ currentPosition: 3 })))).toBe(3);
    expect(pos(s.getNextWorkout(makeContext({ currentPosition: 5 })))).toBe(5);
  });
  it('consultas repetidas retornam o mesmo treino', () => {
    const c = makeContext({ currentPosition: 2, today: { weekday: 3 } });
    expect(s.getNextWorkout(c)).toEqual(s.getNextWorkout({ ...c, today: { weekday: 6 } }));
  });
  it.each([null, 0, -1, 99])('posição %s -> primeiro', (p) => {
    expect(pos(s.getNextWorkout(makeContext({ currentPosition: p })))).toBe(1);
  });
  it('treino desativado no meio -> primeiro', () => {
    const c = makeContext({ workouts: makeWorkouts(4, [1, 2, 4, 5]), currentPosition: 3 });
    expect(pos(s.getNextWorkout(c))).toBe(1);
  });
  it('lista vazia', () => {
    expect(s.getNextWorkout(makeContext({ workouts: [] }))).toEqual({
      kind: 'NONE',
      reason: 'NO_WORKOUTS',
      note: null,
    });
  });
});
