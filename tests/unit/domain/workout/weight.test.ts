import { formatWeight, parseWeightInput } from '../../../../src/domain/workout/weight';

describe('parseWeightInput', () => {
  it.each([
    ['60', 60],
    ['62,5', 62.5],
    ['62.5', 62.5],
    [' 60 ', 60],
    ['0', 0],
    ['62,555', 62.56],
    ['999999', 999999],
    ['', null],
  ])('aceita %j', (text, value) => {
    expect(parseWeightInput(text)).toEqual({ ok: true, value });
  });
  it.each(['-1', '-0,5', 'abc', '1,2,3', 'NaN', 'Infinity'])('rejeita %j', (text) => {
    expect(parseWeightInput(text)).toEqual({ ok: false, reason: 'INVALID' });
  });
  it('formata', () => {
    expect(formatWeight(62.5)).toBe('62,5');
    expect(formatWeight(60)).toBe('60');
    expect(formatWeight(null)).toBe('');
  });
});
