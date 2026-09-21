import { weekdayLabel } from '../../../src/utils/weekdayLabel';

describe('weekdayLabel', () => {
  it('rótulos longos e curtos', () => {
    expect(weekdayLabel(1, 'LONG')).toBe('SEGUNDA-FEIRA');
    expect(weekdayLabel(4, 'LONG')).toBe('QUINTA-FEIRA');
    expect(weekdayLabel(7, 'LONG')).toBe('DOMINGO');
    expect(weekdayLabel(1, 'SHORT')).toBe('SEG');
    expect(weekdayLabel(4, 'SHORT')).toBe('QUI');
    expect(weekdayLabel(7, 'SHORT')).toBe('DOM');
  });
  it('lança para valores fora de 1..7', () => {
    expect(() => weekdayLabel(0, 'LONG')).toThrow();
    expect(() => weekdayLabel(8, 'SHORT')).toThrow();
  });
});
