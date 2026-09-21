import { ValidationError } from '../../../src/data/repositories/errors';
import type { Database } from '../../../src/data/database/Database';
import { runSeed } from '../../../src/data/seed/runSeed';
import { WARMUP_NOTE } from '../../../src/data/seed/warmup';
import { createTestDb } from '../helpers/testDb';
import { makeFixture } from '../../unit/seed/fixtures';

const count = async (db: Database, table: string, where = '1=1') =>
  (await db.getFirst<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table} WHERE ${where}`))!.n;

describe('runSeed (fixture)', () => {
  it('cria conteúdo, aquecimento, sequência, configurações e agenda', async () => {
    const { db, clock } = await createTestDb();
    await runSeed(db, { data: makeFixture(), clock });
    expect(await count(db, 'training_program')).toBe(2);
    expect(await count(db, 'workout')).toBe(3);
    expect(await count(db, 'exercise')).toBe(5);
    expect(await count(db, 'workout_exercise')).toBe(6);
    expect(await count(db, 'workout', `warmup_note = '${WARMUP_NOTE}'`)).toBe(3);
    expect(await count(db, 'program_sequence_state', 'current_position = 1')).toBe(2);
    expect(await count(db, 'weekly_schedule')).toBe(2);
    const s = await db.getFirst<Record<string, unknown>>('SELECT * FROM app_settings');
    expect(s).toMatchObject({
      id: 1,
      sequence_type: 'CONTINUOUS',
      rest_timer_enabled: 0,
      rest_timer_seconds: 90,
    });
    const def = await db.getFirst<{ id: number }>(
      "SELECT id FROM training_program WHERE name='P1'",
    );
    expect(s!.active_program_id).toBe(def!.id);
  });

  it('é idempotente', async () => {
    const { db, clock } = await createTestDb();
    await runSeed(db, { data: makeFixture(), clock });
    await runSeed(db, { data: makeFixture(), clock });
    expect(await count(db, 'workout_exercise')).toBe(6);
    expect(await count(db, 'exercise')).toBe(5);
    expect(await count(db, 'weekly_schedule')).toBe(2);
    expect(await count(db, 'app_settings')).toBe(1);
  });

  it('atualiza prescrição mantendo o id do exercício', async () => {
    const { db, clock } = await createTestDb();
    await runSeed(db, { data: makeFixture(), clock });
    const before = await db.getFirst<{ id: number }>("SELECT id FROM exercise WHERE name='Ex1'");
    const d = makeFixture();
    d.programs[0].workouts[0].items[0].prescription = '4 × 6';
    d.exercises[0].description = 'Nova descrição';
    await runSeed(db, { data: d, clock });
    const after = await db.getFirst<{ id: number; description: string }>(
      "SELECT id, description FROM exercise WHERE name='Ex1'",
    );
    expect(after!.id).toBe(before!.id);
    expect(after!.description).toBe('Nova descrição');
    expect(await count(db, 'workout_exercise', "prescription = '4 × 6'")).toBe(1);
  });

  it('remove item, desativa treino, exercício, dia de agenda e programa fora do seed', async () => {
    const { db, clock } = await createTestDb();
    await runSeed(db, { data: makeFixture(), clock });
    const d = makeFixture();
    d.programs[0].workouts[0].items.pop();
    d.programs[0].workouts[0].items[1].technique = null;
    d.programs[0].workouts[0].items[1].notes = null;
    d.programs[0].workouts.pop();
    d.programs[1].schedule!.pop();
    d.exercises = d.exercises.filter((e) => e.name !== 'Ex5');
    d.programs[1].workouts[0].items.pop();
    await runSeed(db, { data: d, clock });
    expect(
      await count(db, 'workout_exercise', "workout_id = (SELECT id FROM workout WHERE code='A')"),
    ).toBe(2);
    expect(await count(db, 'workout', "code='B' AND active = 0")).toBe(1);
    expect(await count(db, 'exercise', "name='Ex5' AND active = 0")).toBe(1);
    expect(await count(db, 'weekly_schedule')).toBe(1);

    const d2 = makeFixture();
    d2.programs = [d2.programs[0]];
    await runSeed(db, { data: d2, clock });
    expect(await count(db, 'training_program', "name='P2' AND active = 0")).toBe(1);
  });

  it('preserva estado do usuário e sessões', async () => {
    const { db, clock } = await createTestDb();
    await runSeed(db, { data: makeFixture(), clock });
    const p2 = (await db.getFirst<{ id: number }>(
      "SELECT id FROM training_program WHERE name='P2'",
    ))!.id;
    const w = (await db.getFirst<{ id: number }>("SELECT id FROM workout WHERE code='X'"))!.id;
    const e1 = (await db.getFirst<{ id: number }>("SELECT id FROM exercise WHERE name='Ex1'"))!.id;
    await db.run('UPDATE program_sequence_state SET current_position = 3 WHERE program_id = ?', [
      p2,
    ]);
    await db.run(
      "UPDATE app_settings SET active_program_id = ?, sequence_type = 'WEEKLY', rest_timer_enabled = 1, rest_timer_seconds = 120",
      [p2],
    );
    await db.run(
      "INSERT INTO workout_session (program_id, workout_id, started_at, created_at, updated_at) VALUES (?, ?, 'a', 'a', 'a')",
      [p2, w],
    );
    await db.run(
      "INSERT INTO workout_session_exercise (session_id, exercise_id, completed, weight, updated_at) VALUES (1, ?, 1, 20, 'a')",
      [e1],
    );
    const snap = async () => [
      await db.getAll('SELECT * FROM workout_session'),
      await db.getAll('SELECT * FROM workout_session_exercise'),
    ];
    const before = await snap();
    // remove um item de treino usado pela sessão em andamento
    const d = makeFixture();
    d.programs[1].workouts[0].items.shift();
    await runSeed(db, { data: d, clock });
    expect(await snap()).toEqual(before);
    expect(
      (await db.getFirst<{ current_position: number }>(
        'SELECT current_position FROM program_sequence_state WHERE program_id = ?',
        [p2],
      ))!.current_position,
    ).toBe(3);
    expect(await db.getFirst('SELECT * FROM app_settings')).toMatchObject({
      active_program_id: p2,
      sequence_type: 'WEEKLY',
      rest_timer_enabled: 1,
      rest_timer_seconds: 120,
    });
  });

  it('erro no meio faz rollback total', async () => {
    const { db, clock } = await createTestDb();
    let inserts = 0;
    const failing: Database = {
      ...db,
      run: async (sql, params) => {
        if (/^\s*INSERT/i.test(sql) && ++inserts === 3) throw new Error('boom');
        return db.run(sql, params);
      },
      transaction: (work) => db.transaction(() => work(failing)),
    };
    await expect(runSeed(failing, { data: makeFixture(), clock })).rejects.toThrow('boom');
    expect(await count(db, 'exercise')).toBe(0);
    expect(await count(db, 'training_program')).toBe(0);
  });

  it('dataset inválido lança ValidationError sem escrever', async () => {
    const { db, clock } = await createTestDb();
    const d = makeFixture();
    d.programs[0].isDefault = false;
    await expect(runSeed(db, { data: d, clock })).rejects.toThrow(ValidationError);
    expect(await count(db, 'exercise')).toBe(0);
  });
});
