import { buildHomeView } from '../../../../src/domain/home/buildHomeView';
import type { HomeViewInput } from '../../../../src/domain/home/types';

const workouts = [1, 2, 3].map((p) => ({
  id: p * 10,
  programId: 1,
  code: String(p),
  name: `Treino ${p}`,
  position: p,
  exerciseCount: 6,
}));
const week = [
  '2026-09-14',
  '2026-09-15',
  '2026-09-16',
  '2026-09-17',
  '2026-09-18',
  '2026-09-19',
  '2026-09-20',
];

function input(over: Partial<HomeViewInput> = {}): HomeViewInput {
  return {
    program: { id: 1, name: 'P', homeSuggestion: null },
    sequenceType: 'CONTINUOUS',
    workouts,
    currentPosition: 3,
    schedule: [],
    next: {
      kind: 'WORKOUT',
      workout: { id: 30, programId: 1, code: '3', name: 'Treino 3', position: 3 },
    },
    localDate: '2026-09-20',
    todayWeekday: 7,
    finished: [],
    weekDates: week,
    inProgress: null,
    ...over,
  };
}
const weekly = (over: Partial<HomeViewInput> = {}) =>
  input({
    sequenceType: 'WEEKLY',
    schedule: [{ weekday: 7, workoutId: 30, optional: false, note: null }],
    ...over,
  });
type Reason = 'REST' | 'OPTIONAL_DAY' | 'NO_SCHEDULE' | 'NO_WORKOUTS';
const none = (reason: Reason, note: string | null = null) =>
  ({ kind: 'NONE', reason, note }) as const;

describe('buildHomeView', () => {
  it('contínua com WORKOUT', () => {
    const v = buildHomeView(input());
    expect(v.card).toEqual({
      kind: 'WORKOUT',
      workout: { id: 30, code: '3', name: 'Treino 3', exerciseCount: 6 },
      dayLabel: null,
      doneToday: false,
    });
    expect(v.indicator.kind).toBe('RAIL');
    expect(v.program).toEqual({ id: 1, name: 'P' });
  });
  it('semanal: dayLabel, indicador WEEK e doneToday', () => {
    const v = buildHomeView(
      weekly({ finished: [{ workoutId: 30, localDate: '2026-09-20', weekday: 7 }] }),
    );
    expect(v.indicator.kind).toBe('WEEK');
    expect(v.card).toMatchObject({ kind: 'WORKOUT', dayLabel: 'DOMINGO', doneToday: true });
    if (v.indicator.kind === 'WEEK') expect(v.indicator.days[6].hasSession).toBe(true);
  });
  it('doneToday falso para outro treino, dia ou na contínua', () => {
    const other = (workoutId: number, localDate: string) => [{ workoutId, localDate, weekday: 7 }];
    expect(buildHomeView(weekly({ finished: other(10, '2026-09-20') })).card).toMatchObject({
      doneToday: false,
    });
    expect(buildHomeView(weekly({ finished: other(30, '2026-09-19') })).card).toMatchObject({
      doneToday: false,
    });
    expect(buildHomeView(input({ finished: other(30, '2026-09-20') })).card).toMatchObject({
      doneToday: false,
    });
  });
  it('semanal fora da semana corrente não marca o strip', () => {
    const v = buildHomeView(
      weekly({ finished: [{ workoutId: 30, localDate: '2026-09-13', weekday: 7 }] }),
    );
    if (v.indicator.kind === 'WEEK') expect(v.indicator.days[6].hasSession).toBe(false);
  });
  it('mapeia os resultados NONE', () => {
    expect(buildHomeView(weekly({ next: none('REST') })).card).toEqual({
      kind: 'REST',
      dayLabel: 'DOMINGO',
      canBrowseWorkouts: true,
    });
    expect(buildHomeView(weekly({ next: none('OPTIONAL_DAY', 'Abdominais') })).card).toEqual({
      kind: 'OPTIONAL_DAY',
      dayLabel: 'DOMINGO',
      note: 'Abdominais',
      canBrowseWorkouts: true,
    });
    const ns = buildHomeView(weekly({ schedule: [], next: none('NO_SCHEDULE') }));
    expect(ns.card).toEqual({ kind: 'NO_SCHEDULE' });
    expect(ns.indicator).toEqual({ kind: 'NONE' });
    expect(buildHomeView(weekly({ next: none('NO_WORKOUTS') })).card).toEqual({
      kind: 'NO_WORKOUTS',
    });
  });
  it('sugestão do programa; vazia vira nula', () => {
    expect(
      buildHomeView(input({ program: { id: 1, name: 'P', homeSuggestion: 'Cardio' } })).suggestion,
    ).toBe('Cardio');
    expect(
      buildHomeView(input({ program: { id: 1, name: 'P', homeSuggestion: '  ' } })).suggestion,
    ).toBeNull();
  });
  it('browsableWorkouts só em REST e OPTIONAL_DAY', () => {
    expect(buildHomeView(weekly({ next: none('REST') })).browsableWorkouts).toHaveLength(3);
    expect(buildHomeView(weekly({ next: none('NO_SCHEDULE') })).browsableWorkouts).toEqual([]);
    expect(buildHomeView(input()).browsableWorkouts).toEqual([]);
  });
  it('sessão em andamento tem precedência', () => {
    const inProgress = { sessionId: 5, workoutName: 'Treino 1', done: 4, total: 9 };
    for (const next of [input().next, none('REST'), none('NO_SCHEDULE')]) {
      const v = buildHomeView(weekly({ next, inProgress }));
      expect(v.card).toEqual({
        kind: 'IN_PROGRESS',
        sessionId: 5,
        workoutName: 'Treino 1',
        done: 4,
        total: 9,
      });
      expect(v.browsableWorkouts).toEqual([]);
    }
  });
});
