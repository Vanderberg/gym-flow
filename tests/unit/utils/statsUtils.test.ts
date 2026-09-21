import { addDays, daysBetween, mondayOf } from '../../../src/utils/dateMath';
import { formatDecimal } from '../../../src/utils/formatDecimal';

describe('dateMath', () => {
  it('daysBetween', () => {
    expect(daysBetween('2026-09-10', '2026-09-10')).toBe(0);
    expect(daysBetween('2026-08-31', '2026-09-01')).toBe(1);
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
    expect(daysBetween('2028-02-28', '2028-03-01')).toBe(2);
    expect(daysBetween('2026-09-20', '2026-09-10')).toBe(-10);
  });
  it('addDays', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });
  it('mondayOf', () => {
    expect(mondayOf('2026-09-16')).toBe('2026-09-14');
    expect(mondayOf('2026-09-14')).toBe('2026-09-14');
    expect(mondayOf('2026-09-20')).toBe('2026-09-14');
    expect(mondayOf('2027-01-01')).toBe('2026-12-28');
  });
});

describe('formatDecimal', () => {
  it('formata com vírgula e meio para cima', () => {
    expect(formatDecimal(3.4)).toBe('3,4');
    expect(formatDecimal(2)).toBe('2,0');
    expect(formatDecimal(17 / 5)).toBe('3,4');
    expect(formatDecimal(3.45)).toBe('3,5');
    expect(formatDecimal(3.44)).toBe('3,4');
    expect(formatDecimal(2, { suffix: 'dias' })).toBe('2,0 dias');
    expect(formatDecimal(null)).toBe('—');
    expect(formatDecimal(0)).toBe('0,0');
  });
});
