import { GetContributionGrid } from '../../../src/application/GetContributionGrid';
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

// Relógio fixo do helper: 2026-09-20 (domingo) → semana atual começa em 2026-09-14.
describe('GetContributionGrid', () => {
  it('12 semanas por padrão, terminando na semana de hoje', async () => {
    const { t, repo, p1, w1, add } = await setup();
    await add(p1, w1, '2026-09-16T10:00:00-03:00');
    const svc = new GetContributionGrid({ sessions: repo, clock: t.clock });

    const grid = await svc.execute({ programId: null });
    expect(grid.weeks).toHaveLength(12);
    expect(grid.weeks[11]?.start).toBe('2026-09-14');
    const active = grid.weeks.flatMap((w) => w.days.filter((d) => d.active).map((d) => d.date));
    expect(active).toEqual(['2026-09-16']);
  });

  it('filtra por programa', async () => {
    const { t, repo, p1, p2, w1, w2, add } = await setup();
    await add(p1, w1, '2026-09-15T10:00:00-03:00');
    await add(p2, w2, '2026-09-16T10:00:00-03:00');
    const svc = new GetContributionGrid({ sessions: repo, clock: t.clock });

    const alfa = await svc.execute({ programId: p1 });
    const alfaActive = alfa.weeks.flatMap((w) => w.days.filter((d) => d.active).map((d) => d.date));
    expect(alfaActive).toEqual(['2026-09-15']);

    const all = await svc.execute({ programId: null });
    const allActive = all.weeks.flatMap((w) => w.days.filter((d) => d.active).map((d) => d.date));
    expect(allActive).toEqual(['2026-09-15', '2026-09-16']);
  });

  it('ignora sessões não finalizadas e respeita weekCount customizado', async () => {
    const { t, repo, p1, w1, add } = await setup();
    await add(p1, w1, null);
    await add(p1, w1, '2026-09-20T09:00:00-03:00');
    const svc = new GetContributionGrid({ sessions: repo, clock: t.clock });

    const grid = await svc.execute({ programId: null, weeks: 1 });
    expect(grid.weeks).toHaveLength(1);
    expect(grid.weeks[0]?.days.filter((d) => d.active).map((d) => d.date)).toEqual(['2026-09-20']);
  });
});
