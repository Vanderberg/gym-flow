import { computeStats } from '../../../../src/domain/statistics/computeStats';
import { periodRange } from '../../../../src/domain/statistics/periodRange';
import { weeksTouched } from '../../../../src/domain/statistics/weeksTouched';

describe('periodRange', () => {
  it('semana seg-dom', () => {
    for (const t of ['2026-09-14', '2026-09-16', '2026-09-20']) {
      const r = periodRange('WEEK', t);
      expect([r.start, r.end, r.label]).toEqual(['2026-09-14', '2026-09-20', 'SEMANA 14–20 SET']);
    }
    expect(periodRange('WEEK', '2026-10-01').label).toBe('SEMANA 28 SET–04 OUT');
  });
  it('mês', () => {
    expect(periodRange('MONTH', '2026-09-19')).toMatchObject({
      start: '2026-09-01',
      end: '2026-09-30',
      label: 'SETEMBRO 2026',
    });
    expect(periodRange('MONTH', '2028-02-10').end).toBe('2028-02-29');
    expect(periodRange('MONTH', '2027-02-10').end).toBe('2027-02-28');
    expect(periodRange('MONTH', '2026-12-31').end).toBe('2026-12-31');
  });
  it('trimestre, semestre e ano', () => {
    expect(periodRange('QUARTER', '2026-02-01')).toMatchObject({
      start: '2026-01-01',
      end: '2026-03-31',
    });
    expect(periodRange('QUARTER', '2026-05-01')).toMatchObject({
      start: '2026-04-01',
      end: '2026-06-30',
    });
    expect(periodRange('QUARTER', '2026-09-19')).toMatchObject({
      start: '2026-07-01',
      end: '2026-09-30',
      label: '3º TRIMESTRE 2026',
    });
    expect(periodRange('QUARTER', '2026-12-01')).toMatchObject({
      start: '2026-10-01',
      end: '2026-12-31',
    });
    expect(periodRange('SEMESTER', '2026-03-01')).toMatchObject({
      start: '2026-01-01',
      end: '2026-06-30',
    });
    expect(periodRange('SEMESTER', '2026-09-19')).toMatchObject({
      start: '2026-07-01',
      end: '2026-12-31',
      label: '2º SEMESTRE 2026',
    });
    expect(periodRange('YEAR', '2027-01-01')).toMatchObject({
      start: '2027-01-01',
      end: '2027-12-31',
      label: '2027',
    });
  });
});

describe('weeksTouched', () => {
  it('semanas de calendário já tocadas', () => {
    expect(weeksTouched(periodRange('WEEK', '2026-09-16'), '2026-09-16')).toBe(1);
    expect(weeksTouched(periodRange('MONTH', '2026-09-30'), '2026-09-30')).toBe(5);
    expect(weeksTouched(periodRange('MONTH', '2026-09-19'), '2026-09-19')).toBe(3);
    expect(weeksTouched(periodRange('YEAR', '2026-01-01'), '2026-01-01')).toBe(1);
    // mês começando em segunda (junho de 2026), hoje numa segunda
    expect(weeksTouched(periodRange('MONTH', '2026-06-08'), '2026-06-08')).toBe(2);
  });
});

describe('computeStats', () => {
  const today = '2026-09-19';
  const month = periodRange('MONTH', today);
  it('conta só datas dentro do período até hoje', () => {
    const r = computeStats(
      ['2026-08-31', '2026-09-01', '2026-09-01', '2026-09-19', '2026-09-25'],
      month,
      today,
    );
    expect(r.count).toBe(3);
  });
  it('sem datas', () => {
    const r = computeStats([], month, today);
    expect(r.count).toBe(0);
    expect(r.averageIntervalDays).toBeNull();
  });
  it('média semanal sem arredondar', () => {
    const dates = Array.from({ length: 6 }, (_, i) => `2026-09-0${i + 1}`);
    const r = computeStats(dates, month, today);
    expect(r.weeklyAverage).toBe(6 / 3);
    const w = computeStats(
      ['2026-09-14', '2026-09-15', '2026-09-16'],
      periodRange('WEEK', today),
      today,
    );
    expect(w.weeklyAverage).toBe(3);
  });
  it('intervalo médio', () => {
    expect(
      computeStats(['2026-09-01', '2026-09-03', '2026-09-07'], month, today).averageIntervalDays,
    ).toBe(3);
    expect(computeStats(['2026-09-01', '2026-09-01'], month, today).averageIntervalDays).toBe(0);
    expect(computeStats(['2026-09-01'], month, today).averageIntervalDays).toBeNull();
    // ignora o treino anterior ao período
    expect(computeStats(['2026-08-01', '2026-09-05'], month, today).averageIntervalDays).toBeNull();
  });
});
