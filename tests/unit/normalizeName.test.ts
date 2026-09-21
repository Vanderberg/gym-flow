import { ValidationError } from '../../src/data/repositories/errors';
import { normalizeName } from '../../src/utils/normalizeName';

describe('normalizeName', () => {
  it('remove espaços extras e ignora caixa', () => {
    expect(normalizeName('  Tríceps   TESTA ')).toBe('tríceps testa');
    expect(normalizeName('ELEVAÇÃO lateral')).toBe('elevação lateral');
  });
  it('unifica NFD e NFC', () => {
    expect(normalizeName('Elevação')).toBe(normalizeName('Elevação'));
  });
  it('rejeita nome vazio', () => {
    expect(() => normalizeName('   ')).toThrow(ValidationError);
  });
});
