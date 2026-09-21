import { GetWorkoutSession } from '../../../src/application/GetWorkoutSession';
import { SetExerciseCompleted } from '../../../src/application/SetExerciseCompleted';
import { SetExerciseWeight } from '../../../src/application/SetExerciseWeight';
import { NotFoundError, ValidationError } from '../../../src/data/repositories/errors';
import type { Database, SqlValue } from '../../../src/data/database/Database';
import { setupWorkout } from './workoutHelpers';

jest.setTimeout(30000);

async function open() {
  const s = await setupWorkout();
  const pid = await s.use('Treino Padrão', 'CONTINUOUS');
  const sid = await s.start(pid, '1');
  const view = (await new GetWorkoutSession(s.repos).execute())!;
  const ids = view.items.map((i) => i.exerciseId);
  const done = new SetExerciseCompleted({ sessions: s.repos.sessions, db: s.db });
  const weight = new SetExerciseWeight({ sessions: s.repos.sessions });
  const line = async (ex: number) =>
    (await s.repos.sessions.getSession(sid))!.exercises.find((e) => e.exerciseId === ex)!;
  return { s, sid, ids, done, weight, line };
}

describe('SetExerciseCompleted', () => {
  it('marca e desmarca em qualquer ordem, idempotente', async () => {
    const { s, sid, ids, done } = await open();
    await done.execute({ sessionId: sid, exerciseId: ids[3], completed: true });
    await done.execute({ sessionId: sid, exerciseId: ids[3], completed: true });
    await done.execute({ sessionId: sid, exerciseId: ids[0], completed: false });
    const v = (await new GetWorkoutSession(s.repos).execute())!;
    expect(v.items.filter((i) => i.completed).map((i) => i.exerciseId)).toEqual([ids[3]]);
    await done.execute({ sessionId: sid, exerciseId: ids[3], completed: false });
    expect((await new GetWorkoutSession(s.repos).execute())!.progress.done).toBe(0);
  });

  it('exercício fora da sessão e sessão finalizada', async () => {
    const { s, sid, ids, done } = await open();
    await expect(
      done.execute({ sessionId: sid, exerciseId: 999999, completed: true }),
    ).rejects.toBeInstanceOf(NotFoundError);
    await s.repos.sessions.finishSession(sid);
    await expect(
      done.execute({ sessionId: sid, exerciseId: ids[0], completed: true }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('pendingWeight grava peso e marcação juntos; falha desfaz os dois', async () => {
    const { s, sid, ids, done, line } = await open();
    await done.execute({ sessionId: sid, exerciseId: ids[0], completed: true, pendingWeight: 40 });
    expect(await line(ids[0])).toMatchObject({ completed: true, weight: 40 });
    const failing: Database = {
      ...s.db,
      transaction: (work) =>
        s.db.transaction((tx) =>
          work({
            ...tx,
            run: async (sql: string, p?: SqlValue[]) => {
              if (sql.includes('SET completed')) throw new Error('boom');
              return tx.run(sql, p);
            },
          }),
        ),
    };
    await expect(
      new SetExerciseCompleted({ sessions: s.repos.sessions, db: failing }).execute({
        sessionId: sid,
        exerciseId: ids[1],
        completed: true,
        pendingWeight: 50,
      }),
    ).rejects.toThrow();
    expect(await line(ids[1])).toMatchObject({ completed: false, weight: null });
  });
});

describe('SetExerciseWeight', () => {
  it('grava vírgula e vazio; recusa inválidos sem gravar', async () => {
    const { s, sid, ids, weight, line } = await open();
    const r = await weight.execute({ sessionId: sid, exerciseId: ids[0], text: '62,5' });
    expect(r).toEqual({ weight: 62.5 });
    await expect(
      weight.execute({ sessionId: sid, exerciseId: ids[0], text: '-1' }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect((await line(ids[0])).weight).toBe(62.5);
    await weight.execute({ sessionId: sid, exerciseId: ids[0], text: '' });
    expect((await line(ids[0])).weight).toBeNull();
    await expect(
      weight.execute({ sessionId: sid, exerciseId: 999999, text: '10' }),
    ).rejects.toBeInstanceOf(NotFoundError);
    await s.repos.sessions.finishSession(sid);
    await expect(
      weight.execute({ sessionId: sid, exerciseId: ids[0], text: '10' }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
