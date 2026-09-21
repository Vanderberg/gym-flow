import { useStatisticsStore } from '../../../src/store/statisticsStore';

describe('statisticsStore', () => {
  it('padrões e ações', () => {
    const s = useStatisticsStore.getState();
    expect(s.period).toBe('MONTH');
    expect(s.programFilter).toBeNull();
    s.setPeriod('YEAR');
    s.setProgramFilter(3);
    expect(useStatisticsStore.getState()).toMatchObject({ period: 'YEAR', programFilter: 3 });
    s.setPeriod('MONTH');
    s.setProgramFilter(null);
  });
});
