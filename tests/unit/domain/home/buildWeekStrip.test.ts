import { buildWeekStrip } from '../../../../src/domain/home/buildWeekStrip';

const workouts = [
  { id: 1, code: 'A' },
  { id: 2, code: 'B' },
];
const schedule = [
  { weekday: 1, workoutId: 1, optional: false, note: null },
  { weekday: 2, workoutId: null, optional: false, note: null },
  { weekday: 6, workoutId: null, optional: true, note: 'x' },
  { weekday: 3, workoutId: 99, optional: false, note: null },
];

describe('buildWeekStrip', () => {
  it('7 dias SEG-DOM com rótulos', () => {
    const days = buildWeekStrip(schedule, workouts, 1, []);
    expect(days.map((d) => d.weekday)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(days.map((d) => d.label)).toEqual(['A', '—', '—', '—', '—', 'opc.', '—']);
  });
  it('isToday e hasSession', () => {
    const days = buildWeekStrip(schedule, workouts, 3, [1]);
    expect(days.filter((d) => d.isToday).map((d) => d.weekday)).toEqual([3]);
    expect(days.filter((d) => d.hasSession).map((d) => d.weekday)).toEqual([1]);
  });
});
