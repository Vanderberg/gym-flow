import { buildAgendaView } from '../../../../src/domain/sequence/agendaView';
import type { WeeklyDayEntry } from '../../../../src/domain/sequence/types';

const workouts = [
  { id: 1, name: 'A Ombros' },
  { id: 2, name: 'B Costas' },
  { id: 3, name: 'C Pernas' },
  { id: 4, name: 'D Peito' },
];
const monstro: WeeklyDayEntry[] = [
  { weekday: 1, workoutId: 1, optional: false, note: null },
  { weekday: 2, workoutId: 2, optional: false, note: null },
  { weekday: 3, workoutId: null, optional: false, note: null },
  { weekday: 4, workoutId: 3, optional: false, note: null },
  { weekday: 5, workoutId: 4, optional: false, note: null },
  { weekday: 6, workoutId: null, optional: true, note: 'Abdominais' },
  { weekday: 7, workoutId: null, optional: true, note: 'Abdominais' },
];

describe('buildAgendaView', () => {
  it('agenda vazia é NO_SCHEDULE', () => {
    expect(buildAgendaView([], workouts)).toEqual({ kind: 'NO_SCHEDULE' });
  });

  it('monta 7 dias SEG a DOM', () => {
    const v = buildAgendaView(monstro, workouts);
    if (v.kind !== 'DAYS') throw new Error('esperava DAYS');
    expect(v.days.map((d) => d.weekday)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(v.days[0]).toEqual({ weekday: 1, kind: 'WORKOUT', workoutName: 'A Ombros' });
    expect(v.days[2]).toEqual({ weekday: 3, kind: 'REST' });
    expect(v.days[5]).toEqual({ weekday: 6, kind: 'OPTIONAL', note: 'Abdominais' });
  });

  it('dia sem linha, treino ausente e workoutId nulo não opcional viram REST', () => {
    const v = buildAgendaView(
      [
        { weekday: 1, workoutId: 99, optional: false, note: null },
        { weekday: 2, workoutId: null, optional: false, note: 'x' },
      ],
      workouts,
    );
    if (v.kind !== 'DAYS') throw new Error('esperava DAYS');
    expect(v.days).toHaveLength(7);
    expect(v.days.every((d) => d.kind === 'REST')).toBe(true);
  });
});
