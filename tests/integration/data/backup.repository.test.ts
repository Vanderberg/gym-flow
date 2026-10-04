import { SqliteBackupRepository } from '../../../src/data/repositories/SqliteBackupRepository';
import type { BackupDocument } from '../../../src/domain/backup/types';
import { setupWorkout } from '../application/workoutHelpers';

jest.setTimeout(30000);

async function fixture() {
  const s = await setupWorkout();
  const padrao = await s.use('Treino Padrão', 'CONTINUOUS');
  s.clock.set('2026-09-10T18:00:00-03:00');
  const a = await s.start(padrao, '1');
  const items = (await s.repos.sessions.getSession(a))!.exercises;
  await s.repos.sessions.setExerciseCompleted(a, items[0].exerciseId, true);
  await s.repos.sessions.setExerciseWeight(a, items[0].exerciseId, 32.5);
  s.clock.set('2026-09-10T19:05:00-03:00');
  await s.repos.sessions.finishSession(a);
  const repo = new SqliteBackupRepository(s.db, s.clock);
  return { s, repo, padrao, a, items };
}

describe('SqliteBackupRepository.readSnapshot', () => {
  it('lê só sessões finalizadas, com chaves estáveis e datas como gravadas', async () => {
    const { s, repo, padrao, items } = await fixture();
    s.clock.set('2026-09-11T08:00:00-03:00');
    await s.start(padrao, '2'); // em andamento: não entra

    const snap = await repo.readSnapshot();

    expect(snap.sessions).toHaveLength(1);
    const first = snap.sessions[0];
    expect(first).toMatchObject({
      program: 'Treino Padrão',
      workout: '1',
      startedAt: '2026-09-10T18:00:00-03:00',
      finishedAt: '2026-09-10T19:05:00-03:00',
      completed: true, // finalizada (mesmo com exercícios não marcados)
    });
    expect(first.exercises).toHaveLength(items.length);
    const done = first.exercises.filter((e) => e.completed);
    expect(done).toHaveLength(1);
    expect(done[0].weight).toBe(32.5);
    const key = (await s.db.getFirst<{ name_key: string }>(
      'SELECT name_key FROM exercise WHERE id = ?',
      [items[0].exerciseId],
    ))!.name_key;
    expect(first.exercises.map((e) => e.exercise)).toContain(key);
    expect(JSON.stringify(snap)).not.toMatch(/"(id|programId|workoutId|exerciseId)"/);
  });

  it('lê configurações e estado de sequência de todos os programas por nome', async () => {
    const { repo } = await fixture();
    const snap = await repo.readSnapshot();
    expect(snap.settings).toEqual({
      activeProgram: 'Treino Padrão',
      sequenceType: 'CONTINUOUS',
      restTimerEnabled: false,
      restTimerSeconds: 90,
    });
    expect(snap.sequenceState.map((x) => x.program).sort()).toEqual([
      'Treino Monstro',
      'Treino Padrão',
    ]);
    expect(snap.sequenceState.find((x) => x.program === 'Treino Padrão')!.currentPosition).toBe(1);
  });

  it('readCatalog expõe programas, treinos por programa e exercícios', async () => {
    const { repo } = await fixture();
    const catalog = await repo.readCatalog();
    expect(catalog.programs.has('Treino Padrão')).toBe(true);
    expect(catalog.workoutsByProgram.get('Treino Padrão')!.size).toBe(5);
    expect(catalog.workoutsByProgram.get('Treino Monstro')!.has('A')).toBe(true);
    expect(catalog.exerciseKeys.size).toBeGreaterThan(50);
  });

  it('hasInProgressSession reflete a sessão em andamento', async () => {
    const { s, repo, padrao } = await fixture();
    expect(await repo.hasInProgressSession()).toBe(false);
    await s.start(padrao, '2');
    expect(await repo.hasInProgressSession()).toBe(true);
  });
});

const seedTables = [
  'training_program',
  'workout',
  'exercise',
  'workout_exercise',
  'weekly_schedule',
];

describe('SqliteBackupRepository.replaceAll', () => {
  async function seedSnapshot(s: Awaited<ReturnType<typeof setupWorkout>>) {
    const out: Record<string, unknown[]> = {};
    for (const t of seedTables) out[t] = await s.db.getAll(`SELECT * FROM ${t} ORDER BY 1`);
    return out;
  }

  async function documentFor(s: Awaited<ReturnType<typeof setupWorkout>>): Promise<BackupDocument> {
    const keys = await s.db.getAll<{ name_key: string }>(
      `SELECT e.name_key FROM workout_exercise we
         JOIN exercise e ON e.id = we.exercise_id
         JOIN workout w ON w.id = we.workout_id
        WHERE w.code = '2' ORDER BY we.display_order LIMIT 2`,
    );
    return {
      format: 'gymflow-backup',
      schemaVersion: 1,
      exportedAt: '2026-10-04T10:00:00-03:00',
      settings: {
        activeProgram: 'Treino Monstro',
        sequenceType: 'WEEKLY',
        restTimerEnabled: true,
        restTimerSeconds: 120,
      },
      sequenceState: [{ program: 'Treino Padrão', currentPosition: 3 }],
      sessions: [
        {
          program: 'Treino Padrão',
          workout: '2',
          startedAt: '2026-08-01T18:00:00-03:00',
          finishedAt: '2026-08-01T19:00:00-03:00',
          completed: true,
          exercises: [
            { exercise: keys[0].name_key, completed: true, weight: 40 },
            { exercise: keys[1].name_key, completed: false, weight: null },
          ],
        },
        {
          program: 'Treino Monstro',
          workout: 'A',
          startedAt: '2026-08-03T07:00:00-03:00',
          finishedAt: '2026-08-03T08:00:00-03:00',
          completed: true,
          exercises: [],
        },
      ],
    };
  }

  it('substitui sessões, sequência e configurações pelos do documento', async () => {
    const { s, repo } = await fixture(); // já há 1 sessão finalizada, que deve sumir
    const doc = await documentFor(s);

    await repo.replaceAll(doc);

    const after = await repo.readSnapshot();
    expect(after.sessions).toEqual(doc.sessions);
    expect(after.settings).toEqual(doc.settings);
    const seq = Object.fromEntries(after.sequenceState.map((x) => [x.program, x.currentPosition]));
    expect(seq).toEqual({ 'Treino Padrão': 3, 'Treino Monstro': 1 }); // ausente no arquivo → 1
    expect(await s.db.getAll('SELECT * FROM workout_session WHERE finished_at IS NULL')).toEqual(
      [],
    );
  });

  it('é idempotente: importar o mesmo documento duas vezes não duplica nada', async () => {
    const { s, repo } = await fixture();
    const doc = await documentFor(s);
    await repo.replaceAll(doc);
    await repo.replaceAll(doc);
    expect((await repo.readSnapshot()).sessions).toHaveLength(2);
  });

  it('não toca programas, treinos, exercícios, fichas nem agenda do seed', async () => {
    const { s, repo } = await fixture();
    const before = await seedSnapshot(s);
    await repo.replaceAll(await documentFor(s));
    expect(await seedSnapshot(s)).toEqual(before);
  });
});
