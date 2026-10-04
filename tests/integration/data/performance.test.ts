import { buildBackupDocument } from '../../../src/domain/backup/buildBackupDocument';
import { parseBackup } from '../../../src/domain/backup/parseBackup';
import { createRepositories } from '../../../src/data/repositories';
import { SqliteBackupRepository } from '../../../src/data/repositories/SqliteBackupRepository';
import { setupWorkout } from '../application/workoutHelpers';
import { createTestDb } from '../helpers/testDb';

describe('desempenho (SC-002)', () => {
  it('sessão de 15 exercícios grava e relê em menos de 1 s', async () => {
    const t = await createTestDb();
    const { sessions } = createRepositories(t.db, t.clock);
    const p = await t.insertProgram('P');
    const w = await t.insertWorkout(p, 'A', 1);
    const ids: number[] = [];
    for (let i = 0; i < 15; i++) {
      const e = await t.insertExercise(`E${i}`);
      await t.linkExercise(w, e, i + 1);
      ids.push(e);
    }
    const start = Date.now();
    const s = await sessions.startSession(p, w);
    for (const e of ids) {
      await sessions.setExerciseCompleted(s.id, e, true);
      await sessions.setExerciseWeight(s.id, e, 20);
    }
    await sessions.finishSession(s.id);
    const d = await sessions.getSession(s.id);
    expect(d?.exercises).toHaveLength(15);
    expect(Date.now() - start).toBeLessThan(1000);
  });
});

describe('desempenho do backup (SC-005)', () => {
  it('exporta e restaura ~400 sessões (2 anos) em menos de 5 s cada', async () => {
    const s = await setupWorkout();
    const programId = await s.use('Treino Padrão', 'CONTINUOUS');
    const workout = await s.workoutId(programId, '1');
    const exercises = await s.db.getAll<{ exercise_id: number }>(
      'SELECT exercise_id FROM workout_exercise WHERE workout_id = ?',
      [workout],
    );
    for (let i = 0; i < 400; i++) {
      const day = new Date(Date.UTC(2025, 0, 1 + i)).toISOString().slice(0, 10);
      await s.db.run(
        `INSERT INTO workout_session (program_id, workout_id, started_at, finished_at, completed, created_at, updated_at)
         VALUES (?, ?, ?, ?, 1, ?, ?)`,
        [
          programId,
          workout,
          `${day}T18:00:00-03:00`,
          `${day}T19:00:00-03:00`,
          `${day}T18:00:00-03:00`,
          `${day}T19:00:00-03:00`,
        ],
      );
      const id = (await s.db.getFirst<{ id: number }>('SELECT last_insert_rowid() AS id'))!.id;
      for (const e of exercises) {
        await s.db.run(
          'INSERT INTO workout_session_exercise (session_id, exercise_id, completed, weight, updated_at) VALUES (?, ?, 1, 40, ?)',
          [id, e.exercise_id, `${day}T19:00:00-03:00`],
        );
      }
    }
    const backup = new SqliteBackupRepository(s.db, s.clock);

    const exportStart = Date.now();
    const text = JSON.stringify(
      buildBackupDocument(await backup.readSnapshot(), '2026-10-04T10:00:00-03:00'),
      null,
      2,
    );
    expect(Date.now() - exportStart).toBeLessThan(5000);

    const document = parseBackup(text);
    expect(document.sessions).toHaveLength(400);
    const restoreStart = Date.now();
    await backup.replaceAll(document);
    expect(Date.now() - restoreStart).toBeLessThan(5000);
    expect((await backup.readSnapshot()).sessions).toHaveLength(400);
  });
});
