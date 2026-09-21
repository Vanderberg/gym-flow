import { localDateOf, nowLocalIso } from '../../src/utils/localDate';

function fakeDate(offsetMinutes: number): Date {
  const d = new Date(2026, 8, 5, 3, 4, 7);
  d.getTimezoneOffset = () => offsetMinutes;
  return d;
}

describe('nowLocalIso', () => {
  it('formata com deslocamento -03:00 e zeros à esquerda', () => {
    expect(nowLocalIso(() => fakeDate(180))).toBe('2026-09-05T03:04:07-03:00');
  });
  it('formata com deslocamento +05:30', () => {
    expect(nowLocalIso(() => fakeDate(-330))).toBe('2026-09-05T03:04:07+05:30');
  });
});

describe('localDateOf', () => {
  it('não converte para UTC', () => {
    expect(localDateOf('2026-09-20T23:30:00-03:00')).toBe('2026-09-20');
  });
});
