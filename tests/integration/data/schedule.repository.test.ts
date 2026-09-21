import { ValidationError } from '../../../src/data/repositories/errors';
import { SqliteScheduleRepository } from '../../../src/data/repositories/SqliteScheduleRepository';
import { createTestDb } from '../helpers/testDb';

describe('ScheduleRepository', () => {
  it('upsert por (programa, dia), null = sem treino, optional e note', async () => {
    const t = await createTestDb();
    const repo = new SqliteScheduleRepository(t.db);
    const p = await t.insertProgram('P');
    const w = await t.insertWorkout(p, 'A', 1);
    await repo.upsertEntry({ programId: p, weekday: 2, workoutId: w, optional: false, note: null });
    await repo.upsertEntry({
      programId: p,
      weekday: 2,
      workoutId: null,
      optional: true,
      note: 'abs',
    });
    await repo.upsertEntry({ programId: p, weekday: 1, workoutId: w, optional: false, note: null });
    expect(await repo.getEntry(p, 2)).toEqual({
      programId: p,
      weekday: 2,
      workoutId: null,
      optional: true,
      note: 'abs',
    });
    expect((await repo.getSchedule(p)).map((e) => e.weekday)).toEqual([1, 2]);
    expect(await repo.getEntry(p, 5)).toBeNull();
  });

  it('valida dia e treino de outro programa', async () => {
    const t = await createTestDb();
    const repo = new SqliteScheduleRepository(t.db);
    const p = await t.insertProgram('P');
    const q = await t.insertProgram('Q');
    const wq = await t.insertWorkout(q, 'A', 1);
    for (const weekday of [0, 8]) {
      await expect(
        repo.upsertEntry({ programId: p, weekday, workoutId: null, optional: false, note: null }),
      ).rejects.toThrow(ValidationError);
    }
    await expect(
      repo.upsertEntry({ programId: p, weekday: 1, workoutId: wq, optional: false, note: null }),
    ).rejects.toThrow(ValidationError);
  });

  it('agendas de programas diferentes não interferem', async () => {
    const t = await createTestDb();
    const repo = new SqliteScheduleRepository(t.db);
    const p = await t.insertProgram('P');
    const q = await t.insertProgram('Q');
    await repo.upsertEntry({
      programId: p,
      weekday: 1,
      workoutId: null,
      optional: false,
      note: 'x',
    });
    expect(await repo.getSchedule(q)).toEqual([]);
  });
});
