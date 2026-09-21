import { GetStatistics } from '../../../src/application/GetStatistics';
import { SqliteSessionRepository } from '../../../src/data/repositories/SqliteSessionRepository';
import { createTestDb } from '../helpers/testDb';

async function setup() {
  const t = await createTestDb();
  const repo = new SqliteSessionRepository(t.db, t.clock);
  const p1 = await t.insertProgram('Alfa');
  const p2 = await t.insertProgram('Beta');
  const w1 = await t.insertWorkout(p1, 'A', 1);
  const w2 = await t.insertWorkout(p2, 'A', 1);
  let n = 0;
  const add = async (p: number, w: number, finishedAt: string | null) => {
    n += 1;
    await t.db.run(
      `INSERT INTO workout_session (program_id, workout_id, started_at, finished_at, completed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'x', 'x')`,
      [p, w, `2026-01-0${(n % 9) + 1}T08:00:00-03:00`, finishedAt, finishedAt ? 1 : 0],
    );
  };
  return { t, repo, p1, p2, w1, w2, add };
}

describe('GetStatistics', () => {
  it('conta, média, intervalo e filtro (relógio fixo em 2026-09-20)', async () => {
    const { t, repo, p1, p2, w1, w2, add } = await setup();
    for (const d of ['01', '03', '07', '14', '16'])
      await add(p1, w1, `2026-09-${d}T10:00:00-03:00`);
    await add(p2, w2, '2026-09-10T23:30:00-03:00');
    await add(p2, w2, '2026-08-31T23:30:00-03:00');
    await add(p1, w1, null);
    const before = await t.db.getAll('SELECT * FROM workout_session');
    const svc = new GetStatistics({ sessions: repo, clock: t.clock });

    const month = await svc.execute({ period: 'MONTH', programId: null });
    expect(month.count).toBe(6);
    expect(month.weeksTouched).toBe(3);
    expect(month.hasAnySession).toBe(true);
    expect(month.programs.map((p) => p.name)).toEqual(['Alfa', 'Beta']);

    const alfa = await svc.execute({ period: 'MONTH', programId: p1 });
    expect(alfa.count).toBe(5);
    expect(alfa.averageIntervalDays).toBe((2 + 4 + 7 + 2) / 4);
    const beta = await svc.execute({ period: 'MONTH', programId: p2 });
    expect(beta.count).toBe(1);
    expect(beta.averageIntervalDays).toBeNull();
    expect(alfa.count + beta.count).toBe(month.count);

    const week = await svc.execute({ period: 'WEEK', programId: null });
    expect(week.count).toBe(2);
    expect(week.weeklyAverage).toBe(2);
    const year = await svc.execute({ period: 'YEAR', programId: null });
    expect(year.count).toBe(7);

    expect(await t.db.getAll('SELECT * FROM workout_session')).toEqual(before);
  });

  it('sem sessões finalizadas', async () => {
    const { t, repo, p1, w1, add } = await setup();
    await add(p1, w1, null);
    const svc = new GetStatistics({ sessions: repo, clock: t.clock });
    const v = await svc.execute({ period: 'MONTH', programId: null });
    expect(v.count).toBe(0);
    expect(v.hasAnySession).toBe(false);
    expect((await svc.execute({ period: 'MONTH', programId: p1 })).hasAnySession).toBe(false);
  });

  it('borda de mês e leitura rápida', async () => {
    const { t, repo, p1, w1, add } = await setup();
    await add(p1, w1, '2026-09-30T23:30:00-03:00');
    await add(p1, w1, '2026-09-20T00:10:00-03:00');
    expect(await repo.listFinishedDates({ from: '2026-09-01', to: '2026-09-30' })).toEqual([
      '2026-09-20',
      '2026-09-30',
    ]);
    const svc = new GetStatistics({ sessions: repo, clock: t.clock });
    const t0 = Date.now();
    await svc.execute({ period: 'YEAR', programId: p1 });
    expect(Date.now() - t0).toBeLessThan(100);
  });
});
