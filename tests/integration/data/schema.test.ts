import { createTestDb, type TestContext } from '../helpers/testDb';

let t: TestContext;
beforeEach(async () => {
  t = await createTestDb();
});

const now = 'x';

describe('schema', () => {
  it('cria as 9 tabelas', async () => {
    const rows = await t.db.getAll<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
    );
    expect(rows.map((r) => r.name).sort()).toEqual(
      [
        'app_settings',
        'exercise',
        'program_sequence_state',
        'training_program',
        'weekly_schedule',
        'workout',
        'workout_exercise',
        'workout_session',
        'workout_session_exercise',
      ].sort(),
    );
  });

  it('foreign keys ativas: FK inexistente é rejeitada', async () => {
    await expect(
      t.db.run('INSERT INTO workout (program_id, code, name, position) VALUES (99, ?, ?, 1)', [
        'A',
        'A',
      ]),
    ).rejects.toThrow(/FOREIGN KEY/);
  });

  it('name_key duplicado é rejeitado', async () => {
    await t.insertExercise('Supino');
    await expect(t.insertExercise('SUPINO')).rejects.toThrow(/UNIQUE/);
  });

  it('peso: -1 rejeitado, NULL e 0 aceitos', async () => {
    const p = await t.insertProgram('P');
    const w = await t.insertWorkout(p, 'A', 1);
    const e = await t.insertExercise('E');
    await t.db.run(
      'INSERT INTO workout_session (program_id, workout_id, started_at, finished_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      [p, w, now, now, now, now],
    );
    const ins = (weight: number | null, ex: number) =>
      t.db.run(
        'INSERT INTO workout_session_exercise (session_id, exercise_id, weight, updated_at) VALUES (1, ?, ?, ?)',
        [ex, weight, now],
      );
    await expect(ins(-1, e)).rejects.toThrow(/CHECK/);
    await ins(null, e);
    const e2 = await t.insertExercise('E2');
    await ins(0, e2);
  });

  it('CHECKs de sequence_type, weekday e id único de settings', async () => {
    const p = await t.insertProgram('P');
    const bad = (type: string, id = 1) =>
      t.db.run(
        'INSERT INTO app_settings (id, active_program_id, sequence_type, updated_at) VALUES (?, ?, ?, ?)',
        [id, p, type, now],
      );
    await expect(bad('X')).rejects.toThrow(/CHECK/);
    await bad('CONTINUOUS');
    await expect(bad('CONTINUOUS', 2)).rejects.toThrow(/CHECK/);
    for (const d of [0, 8]) {
      await expect(
        t.db.run('INSERT INTO weekly_schedule (program_id, weekday) VALUES (?, ?)', [p, d]),
      ).rejects.toThrow(/CHECK/);
    }
  });

  it('uma sessão em andamento e completed exige finished_at', async () => {
    const p = await t.insertProgram('P');
    const w = await t.insertWorkout(p, 'A', 1);
    const ins = (finished: string | null, completed = 0) =>
      t.db.run(
        'INSERT INTO workout_session (program_id, workout_id, started_at, finished_at, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [p, w, now, finished, completed, now, now],
      );
    await ins(null);
    await expect(ins(null)).rejects.toThrow(/UNIQUE/);
    await expect(ins(null, 1)).rejects.toThrow();
    await ins(now, 1);
  });

  it('exclusão de itens referenciados por sessão é rejeitada', async () => {
    const p = await t.insertProgram('P');
    const w = await t.insertWorkout(p, 'A', 1);
    const e = await t.insertExercise('E');
    await t.db.run(
      'INSERT INTO workout_session (program_id, workout_id, started_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [p, w, now, now, now],
    );
    await t.db.run(
      'INSERT INTO workout_session_exercise (session_id, exercise_id, updated_at) VALUES (1, ?, ?)',
      [e, now],
    );
    await expect(t.db.run('DELETE FROM exercise WHERE id = ?', [e])).rejects.toThrow(/FOREIGN KEY/);
    await expect(t.db.run('DELETE FROM workout WHERE id = ?', [w])).rejects.toThrow(/FOREIGN KEY/);
    await expect(t.db.run('DELETE FROM training_program WHERE id = ?', [p])).rejects.toThrow(
      /FOREIGN KEY/,
    );
  });

  it('UNIQUEs de workout_exercise, workout.position e program_sequence_state', async () => {
    const p = await t.insertProgram('P');
    const w = await t.insertWorkout(p, 'A', 1);
    const e = await t.insertExercise('E');
    await t.linkExercise(w, e, 1);
    await expect(t.linkExercise(w, e, 2)).rejects.toThrow(/UNIQUE/);
    await expect(t.insertWorkout(p, 'B', 1)).rejects.toThrow(/UNIQUE/);
    const st = () =>
      t.db.run(
        'INSERT INTO program_sequence_state (program_id, current_position, updated_at) VALUES (?, 1, ?)',
        [p, now],
      );
    await st();
    await expect(st()).rejects.toThrow(/UNIQUE/);
  });
});
