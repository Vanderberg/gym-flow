import { weekdayOfLocalDate } from '../../../src/utils/weekday';

describe('weekdayOfLocalDate', () => {
  it.each([
    ['2026-09-21', 1],
    ['2026-09-27', 7],
    ['2026-09-30', 3],
    ['2026-10-01', 4],
    ['2025-12-31', 3],
    ['2026-01-01', 4],
    ['2024-02-29', 4],
    ['2024-03-01', 5],
  ])('%s -> %i', (d, w) => {
    expect(weekdayOfLocalDate(d)).toBe(w);
  });
});
