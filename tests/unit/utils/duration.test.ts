import { formatDuration } from '../../../src/utils/duration';

describe('formatDuration', () => {
  it('minutos', () =>
    expect(formatDuration('2026-09-20T18:00:00-03:00', '2026-09-20T18:52:10-03:00')).toBe(
      '52 min',
    ));
  it('menos de 1 min', () =>
    expect(formatDuration('2026-09-20T18:00:00-03:00', '2026-09-20T18:00:30-03:00')).toBe(
      'menos de 1 min',
    ));
  it('1 h 05 min', () =>
    expect(formatDuration('2026-09-20T18:00:00-03:00', '2026-09-20T19:05:00-03:00')).toBe(
      '65 min',
    ));
});
