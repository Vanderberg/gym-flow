import { DiscardInProgressSession } from '../../../src/application/DiscardInProgressSession';
import { GetHomeState } from '../../../src/application/GetHomeState';
import { StartWorkout } from '../../../src/application/StartWorkout';
import { createSequenceResolver } from '../../../src/application/composition';
import { ConflictError, ValidationError } from '../../../src/data/repositories/errors';
import { createRepositories } from '../../../src/data/repositories';
import { runSeed } from '../../../src/data/seed/runSeed';
import type { Database } from '../../../src/data/database/Database';
import { createTestDb } from '../helpers/testDb';

async function setup() {
  const t = await createTestDb();
  await runSeed(t.db, { clock: t.clock });
  const repos = createRepositories(t.db, t.clock);
  const home = () =>
    new GetHomeState({ ...repos, resolver: createSequenceResolver(), clock: t.clock }).execute();
  const programId = async (name: string) =>
    (await t.db.getFirst<{ id: number }>('SELECT id FROM training_program WHERE name = ?', [name]))!
      .id;
  const workoutId = async (pid: number, code: string) =>
    (await t.db.getFirst<{ id: number }>(
      'SELECT id FROM workout WHERE program_id = ? AND code = ?',
      [pid, code],
    ))!.id;
  const select = async (name: string, sequenceType: 'CONTINUOUS' | 'WEEKLY') => {
    const id = await programId(name);
    await repos.settings.save({ activeProgramId: id, sequenceType });
    return id;
  };
  return { ...t, repos, home, programId, workoutId, select };
}

const writes = async (db: Database) => [
  (await db.getFirst<{ n: number }>('SELECT COUNT(*) AS n FROM workout_session'))!.n,
  (await db.getFirst<{ n: number }>('SELECT COUNT(*) AS n FROM workout_session_exercise'))!.n,
];

describe('GetHomeState (seed real)', () => {
  it('Padrão contínuo na posição 3: Perna Completo com rail de 5 passos', async () => {
    const s = await setup();
    const pid = await s.select('Treino Padrão', 'CONTINUOUS');
    await s.repos.sequenceState.upsert(pid, 3);
    const before = await writes(s.db);
    const v = await s.home();
    expect(v.card).toMatchObject({ kind: 'WORKOUT', workout: { code: '3' }, dayLabel: null });
    if (v.card.kind === 'WORKOUT') {
      expect(v.card.workout.name).toMatch(/Perna/);
      expect(v.card.workout.exerciseCount).toBeGreaterThan(0);
    }
    expect(v.indicator.kind).toBe('RAIL');
    if (v.indicator.kind === 'RAIL') {
      expect(v.indicator.steps.map((x) => x.state)).toEqual([
        'DONE',
        'DONE',
        'CURRENT',
        'PENDING',
        'PENDING',
      ]);
    }
    expect(v.suggestion).toBeNull();
    expect(await writes(s.db)).toEqual(before);
  });

  it('Monstro semanal: cada dia da semana (treino, descanso, opcionais) e sugestão', async () => {
    const s = await setup();
    await s.select('Treino Monstro', 'WEEKLY');
    const kinds: string[] = [];
    for (let day = 14; day <= 20; day++) {
      s.clock.set(`2026-09-${day}T10:00:00-03:00`);
      const v = await s.home();
      kinds.push(v.card.kind);
      expect(v.indicator.kind).toBe('WEEK');
      expect(v.suggestion).toBeTruthy();
    }
    expect(kinds).toContain('WORKOUT');
    expect(kinds.some((k) => k === 'REST' || k === 'OPTIONAL_DAY')).toBe(true);
    expect(await writes(s.db)).toEqual([0, 0]);
  });

  it('Padrão semanal: NO_SCHEDULE sem erro', async () => {
    const s = await setup();
    await s.select('Treino Padrão', 'WEEKLY');
    const v = await s.home();
    expect(v.card).toEqual({ kind: 'NO_SCHEDULE' });
    expect(v.indicator).toEqual({ kind: 'NONE' });
  });

  it('doneToday após finalizar o treino do dia', async () => {
    const s = await setup();
    await s.select('Treino Monstro', 'WEEKLY');
    let card = (await s.home()).card;
    for (let day = 14; day <= 20 && card.kind !== 'WORKOUT'; day++) {
      s.clock.set(`2026-09-${day}T10:00:00-03:00`);
      card = (await s.home()).card;
    }
    if (card.kind !== 'WORKOUT') throw new Error('sem treino na semana');
    const { sessionId } = await new StartWorkout(s.repos).execute(card.workout.id);
    await s.repos.sessions.finishSession(sessionId);
    const v = await s.home();
    expect(v.card).toMatchObject({ kind: 'WORKOUT', doneToday: true });
    if (v.indicator.kind === 'WEEK') expect(v.indicator.days.some((d) => d.hasSession)).toBe(true);
  });

  it('sessão em andamento tem precedência e sobrevive a nova leitura; descartar volta ao normal', async () => {
    const s = await setup();
    const pid = await s.select('Treino Padrão', 'CONTINUOUS');
    const w = await s.workoutId(pid, '1');
    const { sessionId } = await new StartWorkout(s.repos).execute(w);
    const line = (await s.db.getFirst<{ exercise_id: number }>(
      'SELECT exercise_id FROM workout_session_exercise WHERE session_id = ?',
      [sessionId],
    ))!;
    await s.repos.sessions.setExerciseCompleted(sessionId, line.exercise_id, true);
    const v = await s.home();
    expect(v.card).toMatchObject({ kind: 'IN_PROGRESS', sessionId, done: 1 });
    if (v.card.kind === 'IN_PROGRESS') expect(v.card.total).toBeGreaterThan(1);
    expect(v.browsableWorkouts).toEqual([]);

    const stateBefore = await s.repos.sequenceState.get(pid);
    await new DiscardInProgressSession(s.repos).execute();
    expect(await s.repos.sequenceState.get(pid)).toEqual(stateBefore);
    expect((await s.home()).card.kind).toBe('WORKOUT');
    await new DiscardInProgressSession(s.repos).execute();
  });

  it('responde rápido com 500 sessões finalizadas', async () => {
    const s = await setup();
    const pid = await s.select('Treino Padrão', 'CONTINUOUS');
    const w = await s.workoutId(pid, '1');
    for (let i = 0; i < 500; i++) {
      await s.db.run(
        `INSERT INTO workout_session (program_id, workout_id, started_at, finished_at, completed, created_at, updated_at)
         VALUES (?, ?, '2026-01-01T10:00:00-03:00', '2026-01-01T11:00:00-03:00', 1, 'x', 'x')`,
        [pid, w],
      );
    }
    const t0 = Date.now();
    await s.home();
    expect(Date.now() - t0).toBeLessThan(150);
  });
});

describe('StartWorkout', () => {
  it('cria sessão com programa ativo e uma linha por exercício', async () => {
    const s = await setup();
    const pid = await s.select('Treino Padrão', 'CONTINUOUS');
    const w = await s.workoutId(pid, '2');
    const { sessionId } = await new StartWorkout(s.repos).execute(w);
    const sess = await s.repos.sessions.getSession(sessionId);
    expect(sess).toMatchObject({ programId: pid, workoutId: w, finishedAt: null });
    const detail = await s.repos.programs.getWorkoutWithExercises(w);
    expect(sess!.exercises).toHaveLength(detail!.exercises.length);
  });

  it('treino de outro programa: ValidationError sem criar nada', async () => {
    const s = await setup();
    await s.select('Treino Padrão', 'CONTINUOUS');
    const other = await s.workoutId(await s.programId('Treino Monstro'), 'A');
    await expect(new StartWorkout(s.repos).execute(other)).rejects.toBeInstanceOf(ValidationError);
    expect(await writes(s.db)).toEqual([0, 0]);
  });

  it('com sessão em andamento: ConflictError e nada muda', async () => {
    const s = await setup();
    const pid = await s.select('Treino Padrão', 'CONTINUOUS');
    const uc = new StartWorkout(s.repos);
    await uc.execute(await s.workoutId(pid, '1'));
    const before = await writes(s.db);
    await expect(uc.execute(await s.workoutId(pid, '2'))).rejects.toBeInstanceOf(ConflictError);
    expect(await writes(s.db)).toEqual(before);
  });
});
