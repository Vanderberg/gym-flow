import { WeeklyScheduleSequenceStrategy } from '../../../../src/domain/sequence/strategies/WeeklyScheduleSequenceStrategy';
import type { WeeklyDayEntry } from '../../../../src/domain/sequence/types';
import { makeContext, makeWorkouts } from './builders';

const s = new WeeklyScheduleSequenceStrategy();
const workouts = makeWorkouts(4);
const schedule: WeeklyDayEntry[] = [
  { weekday: 1, workoutId: 100, optional: false, note: null },
  { weekday: 2, workoutId: 101, optional: false, note: null },
  { weekday: 3, workoutId: null, optional: false, note: null },
  { weekday: 6, workoutId: null, optional: true, note: 'Abdominais' },
  { weekday: 7, workoutId: null, optional: false, note: null },
];
const at = (weekday: number, extra = {}) =>
  s.getNextWorkout(makeContext({ workouts, schedule, today: { weekday }, ...extra }));

describe('WeeklyScheduleSequenceStrategy', () => {
  it('dia com treino', () => {
    const r = at(2);
    expect(r.kind === 'WORKOUT' && r.workout.id).toBe(101);
  });
  it('descanso, opcional e domingo', () => {
    expect(at(3)).toEqual({ kind: 'NONE', reason: 'REST', note: null });
    expect(at(6)).toEqual({ kind: 'NONE', reason: 'OPTIONAL_DAY', note: 'Abdominais' });
    expect(at(7)).toEqual({ kind: 'NONE', reason: 'REST', note: null });
  });
  it('dia sem linha -> REST', () => {
    expect(at(4)).toEqual({ kind: 'NONE', reason: 'REST', note: null });
  });
  it('agenda vazia -> NO_SCHEDULE', () => {
    expect(at(1, { schedule: [] })).toEqual({ kind: 'NONE', reason: 'NO_SCHEDULE', note: null });
  });
  it('treino desativado -> REST', () => {
    expect(at(1, { workouts: workouts.slice(1) })).toEqual({
      kind: 'NONE',
      reason: 'REST',
      note: null,
    });
  });
  it('virada de semana e independência da posição', () => {
    const r7 = at(7, { currentPosition: 3 });
    const r1 = at(1, { currentPosition: 4 });
    expect(r7.kind).toBe('NONE');
    expect(r1.kind === 'WORKOUT' && r1.workout.id).toBe(100);
  });
});
