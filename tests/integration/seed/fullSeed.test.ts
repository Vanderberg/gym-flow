import type { Database } from '../../../src/data/database/Database';
import { createRepositories } from '../../../src/data/repositories';
import { runSeed } from '../../../src/data/seed/runSeed';
import { createTestDb } from '../helpers/testDb';

const count = async (db: Database, table: string, where = '1=1') =>
  (await db.getFirst<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table} WHERE ${where}`))!.n;

const counts = async (db: Database) => [
  await count(db, 'training_program'),
  await count(db, 'workout'),
  await count(db, 'exercise'),
  await count(db, 'workout_exercise'),
  await count(db, 'weekly_schedule'),
  await count(db, 'program_sequence_state'),
  await count(db, 'app_settings'),
];

describe('seed real', () => {
  it('carrega o conteúdo esperado e é idempotente', async () => {
    const { db, clock } = await createTestDb();
    const t0 = Date.now();
    await runSeed(db, { clock });
    expect(Date.now() - t0).toBeLessThan(2000);
    expect(await counts(db)).toEqual([2, 9, 59, 71, 7, 2, 1]);
    expect(await count(db, 'workout_exercise', "technique = 'BI-SET'")).toBe(12);
    await runSeed(db, { clock });
    expect(await counts(db)).toEqual([2, 9, 59, 71, 7, 2, 1]);
  });

  it('preserva configurações, sequência e histórico em nova execução', async () => {
    const { db, clock } = await createTestDb();
    await runSeed(db, { clock });
    const repos = createRepositories(db, clock);
    const monstro = (await db.getFirst<{ id: number }>(
      "SELECT id FROM training_program WHERE name='Treino Monstro'",
    ))!.id;
    const w = (await db.getFirst<{ id: number }>(
      'SELECT id FROM workout WHERE program_id = ? AND code = ?',
      [monstro, 'A'],
    ))!.id;
    const ex = (await db.getFirst<{ id: number }>(
      "SELECT id FROM exercise WHERE name='Elevação lateral'",
    ))!.id;
    await repos.settings.save({
      activeProgramId: monstro,
      sequenceType: 'WEEKLY',
      restTimerEnabled: true,
      restTimerSeconds: 120,
    });
    await repos.sequenceState.upsert(monstro, 3);
    await db.run(
      "INSERT INTO workout_session (program_id, workout_id, started_at, finished_at, completed, created_at, updated_at) VALUES (?, ?, 'a', 'b', 1, 'a', 'a')",
      [monstro, w],
    );
    await db.run(
      "INSERT INTO workout_session_exercise (session_id, exercise_id, completed, weight, updated_at) VALUES (1, ?, 1, 12.5, 'a')",
      [ex],
    );
    await runSeed(db, { clock });
    expect(await repos.settings.get()).toMatchObject({
      activeProgramId: monstro,
      sequenceType: 'WEEKLY',
      restTimerEnabled: true,
      restTimerSeconds: 120,
    });
    expect((await repos.sequenceState.get(monstro))!.currentPosition).toBe(3);
    expect(await count(db, 'workout_session_exercise', 'weight = 12.5')).toBe(1);
  });
});
