import { buildContributionGrid } from '../../../../src/domain/statistics/contributionGrid';

describe('buildContributionGrid', () => {
  it('gera 12 semanas por padrão, cada uma com 7 dias seg-dom', () => {
    const grid = buildContributionGrid([], '2026-09-19');
    expect(grid.weeks).toHaveLength(12);
    for (const week of grid.weeks) {
      expect(week.days).toHaveLength(7);
      expect(week.start).toBe(week.days[0]?.date);
    }
    // última semana é a que contém "today" (2026-09-19, sábado) → segunda 2026-09-14
    expect(grid.weeks[11]?.start).toBe('2026-09-14');
    expect(grid.weeks[11]?.days.map((d) => d.date)).toEqual([
      '2026-09-14',
      '2026-09-15',
      '2026-09-16',
      '2026-09-17',
      '2026-09-18',
      '2026-09-19',
      '2026-09-20',
    ]);
  });

  it('marca active apenas nos dias presentes na lista de datas', () => {
    const grid = buildContributionGrid(['2026-09-15', '2026-09-20'], '2026-09-19');
    const lastWeek = grid.weeks[11]!;
    const activeDates = lastWeek.days.filter((d) => d.active).map((d) => d.date);
    expect(activeDates).toEqual(['2026-09-15', '2026-09-20']);
  });

  it('semanas mais antigas vêm primeiro, a semana atual é a última', () => {
    const grid = buildContributionGrid([], '2026-09-19', 3);
    expect(grid.weeks.map((w) => w.start)).toEqual(['2026-08-31', '2026-09-07', '2026-09-14']);
  });

  it('respeita weekCount customizado', () => {
    expect(buildContributionGrid([], '2026-09-19', 4).weeks).toHaveLength(4);
    expect(buildContributionGrid([], '2026-09-19', 1).weeks).toHaveLength(1);
  });

  it('não repete nem pula dias entre semanas consecutivas', () => {
    const grid = buildContributionGrid([], '2026-09-19');
    const allDates = grid.weeks.flatMap((w) => w.days.map((d) => d.date));
    const uniqueDates = new Set(allDates);
    expect(uniqueDates.size).toBe(allDates.length);
    for (let i = 1; i < allDates.length; i++) {
      expect((allDates[i] as string) > (allDates[i - 1] as string)).toBe(true);
    }
  });
});
