import { buildEditChanges, hasChanges } from '../../../../src/domain/history/editChanges';
import { groupByMonth } from '../../../../src/domain/history/groupByMonth';
import type { DetailRow, HistoryItem } from '../../../../src/domain/history/types';
import { monthLabel } from '../../../../src/utils/monthLabel';

const item = (id: number, d: string) => ({ sessionId: id, localDate: d }) as HistoryItem;
const row = (id: number, completed: boolean, weight: number | null): DetailRow => ({
  exerciseId: id,
  name: `E${id}`,
  completed,
  weight,
  prescription: null,
  technique: null,
  notes: null,
  inWorkout: true,
});

describe('monthLabel / groupByMonth', () => {
  it('rotula em pt-BR', () => {
    expect(monthLabel('2026-09')).toBe('SETEMBRO 2026');
    expect(monthLabel('2026-03')).toBe('MARÇO 2026');
  });
  it('agrupa do mais recente ao mais antigo, com virada de ano', () => {
    const s = groupByMonth([item(1, '2026-01-02'), item(2, '2026-01-01'), item(3, '2025-12-31')]);
    expect(s.map((x) => x.key)).toEqual(['2026-01', '2025-12']);
    expect(s[0].items.map((i) => i.sessionId)).toEqual([1, 2]);
    expect(groupByMonth([])).toEqual([]);
  });
});

describe('buildEditChanges', () => {
  it('só diferenças', () => {
    const o = [row(1, false, null), row(2, true, 60)];
    const c = buildEditChanges(o, [row(1, true, null), row(2, true, null)]);
    expect(c.rows).toEqual([
      { exerciseId: 1, completed: true },
      { exerciseId: 2, weight: null },
    ]);
    expect(hasChanges(c)).toBe(true);
    expect(hasChanges(buildEditChanges(o, o))).toBe(false);
  });
});
