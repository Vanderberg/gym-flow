import { advancePosition } from '../../../../src/domain/sequence/services/advancePosition';
import { ContinuousSequenceStrategy } from '../../../../src/domain/sequence/strategies/ContinuousSequenceStrategy';
import { makeContext, makeWorkouts } from './builders';

const s = new ContinuousSequenceStrategy();

describe.each([5, 4])('progressão contínua com N=%i', (n) => {
  it('1->...->N->1 por 2 ciclos e consulta não avança', () => {
    const workouts = makeWorkouts(n);
    let cur: number | null = null;
    const seen: number[] = [];
    for (let i = 0; i < n * 2; i++) {
      const r = s.getNextWorkout(makeContext({ workouts, currentPosition: cur }));
      const again = s.getNextWorkout(makeContext({ workouts, currentPosition: cur }));
      expect(again).toEqual(r);
      if (r.kind !== 'WORKOUT') throw new Error('esperado treino');
      seen.push(r.workout.position);
      cur = advancePosition(
        r.workout.position,
        workouts.map((w) => w.position),
      );
    }
    const cycle = Array.from({ length: n }, (_, i) => i + 1);
    expect(seen).toEqual([...cycle, ...cycle]);
  });
});
