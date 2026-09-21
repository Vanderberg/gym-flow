import { formatMmSs, parseDurationInput, validateDuration } from '@/domain/restTimer/duration';

describe('parseDurationInput', () => {
  it.each([
    ['01:30', 90],
    ['1:30', 90],
    ['90', 90],
    ['00:05', 5],
    ['60:00', 3600],
  ])('aceita %s', (text, seconds) => {
    expect(parseDurationInput(text)).toEqual({ ok: true, seconds });
  });
  it.each(['00:04', '60:01', '0'])('OUT_OF_RANGE: %s', (text) => {
    expect(parseDurationInput(text)).toEqual({ ok: false, reason: 'OUT_OF_RANGE' });
  });
  it.each(['', 'abc', '1:2:3', '1,5', '-5'])('INVALID: "%s"', (text) => {
    expect(parseDurationInput(text)).toEqual({ ok: false, reason: 'INVALID' });
  });
});

describe('validateDuration / formatMmSs', () => {
  it('valida inteiros de 5 a 3600', () => {
    expect(validateDuration(5)).toBe(true);
    expect(validateDuration(3600)).toBe(true);
    expect(validateDuration(4)).toBe(false);
    expect(validateDuration(3601)).toBe(false);
    expect(validateDuration(5.5)).toBe(false);
  });
  it('formata mm:ss arredondando para cima', () => {
    expect(formatMmSs(90000)).toBe('01:30');
    expect(formatMmSs(0)).toBe('00:00');
    expect(formatMmSs(3600000)).toBe('60:00');
    expect(formatMmSs(89999)).toBe('01:30');
  });
});
