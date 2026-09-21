import { FinishWorkout } from '../../../src/application/FinishWorkout';
import { GetFinishSummary } from '../../../src/application/GetFinishSummary';
import { GetWorkoutSession } from '../../../src/application/GetWorkoutSession';
import { ConflictError, NotFoundError } from '../../../src/data/repositories/errors';
import type { Database, SqlValue } from '../../../src/data/database/Database';
import { setupWorkout } from './workoutHelpers';

jest.setTimeout(30000);

async function open(type: 'CONTINUOUS' | 'WEEKLY' = 'CONTINUOUS', code = '1') {
  const s = await setupWorkout();
  const pid = await s.use('Treino Padrão', type);
  const sid = await s.start(pid, code);
  const finish = (db: Database = s.db) =>
    new FinishWorkout({ db, settings: s.repos.settings, clock: s.clock });
  const pos = async () => (await s.repos.sequenceState.get(pid))?.currentPosition;
  return { s, pid, sid, finish, pos };
}

describe('FinishWorkout', () => {
  it('finaliza com 0, alguns e todos marcados', async () => {
    for (const marks of [0, 2, 6]) {
      const { s, sid, finish } = await open();
      const v = (await new GetWorkoutSession(s.repos).execute())!;
      for (const it of v.items.slice(0, marks)) {
        await s.repos.sessions.setExerciseCompleted(sid, it.exerciseId, true);
      }
      s.clock.set('2026-09-20T10:52:00-03:00');
      const r = await finish().execute({ sessionId: sid });
      expect(r).toMatchObject({ done: marks, total: 6, durationMinutes: 52 });
      const d = (await s.repos.sessions.getSession(sid))!;
      expect(d.finishedAt).not.toBeNull();
      expect(d.completed).toBe(true);
      expect(d.exercises.filter((e) => e.completed)).toHaveLength(marks);
      expect(await s.repos.sessions.getInProgress()).toBeNull();
    }
  });

  it('contínua avança; último volta ao 1; reinício respeita o treino finalizado', async () => {
    const a = await open('CONTINUOUS', '3');
    await a.s.repos.sequenceState.upsert(a.pid, 3);
    await a.finish().execute({ sessionId: a.sid });
    expect(await a.pos()).toBe(4);
    const b = await open('CONTINUOUS', '5');
    await b.finish().execute({ sessionId: b.sid });
    expect(await b.pos()).toBe(1);
    const c = await open('CONTINUOUS', '3');
    await c.s.repos.sequenceState.upsert(c.pid, 1);
    await c.finish().execute({ sessionId: c.sid });
    expect(await c.pos()).toBe(4);
  });

  it('semanal não escreve em program_sequence_state', async () => {
    const { s, sid, finish } = await open('WEEKLY');
    const before = await s.db.getAll('SELECT * FROM program_sequence_state ORDER BY program_id');
    await finish().execute({ sessionId: sid });
    expect(await s.db.getAll('SELECT * FROM program_sequence_state ORDER BY program_id')).toEqual(
      before,
    );
  });

  it('pesos pendentes gravados na transação; falha desfaz tudo', async () => {
    const { s, sid, pid, finish, pos } = await open('CONTINUOUS', '3');
    await s.repos.sequenceState.upsert(pid, 3);
    const v = (await new GetWorkoutSession(s.repos).execute())!;
    const ex = v.items[0].exerciseId;
    const failing: Database = {
      ...s.db,
      transaction: (work) =>
        s.db.transaction((tx) =>
          work({
            ...tx,
            run: async (sql: string, p?: SqlValue[]) => {
              if (sql.includes('program_sequence_state')) throw new Error('boom');
              return tx.run(sql, p);
            },
          }),
        ),
    };
    await expect(
      finish(failing).execute({ sessionId: sid, pendingWeights: { [ex]: 30 } }),
    ).rejects.toThrow();
    const d = (await s.repos.sessions.getSession(sid))!;
    expect(d.finishedAt).toBeNull();
    expect(d.exercises.find((e) => e.exerciseId === ex)!.weight).toBeNull();
    expect(await pos()).toBe(3);
    await finish().execute({ sessionId: sid, pendingWeights: { [ex]: 30 } });
    expect(
      (await s.repos.sessions.getSession(sid))!.exercises.find((e) => e.exerciseId === ex)!.weight,
    ).toBe(30);
  });

  it('segunda finalização dá ConflictError sem alterar nada', async () => {
    const { sid, finish, pos } = await open();
    await finish().execute({ sessionId: sid });
    const p = await pos();
    await expect(finish().execute({ sessionId: sid })).rejects.toBeInstanceOf(ConflictError);
    expect(await pos()).toBe(p);
  });
});

describe('GetFinishSummary', () => {
  it('resume sessão finalizada; em andamento dá NotFoundError', async () => {
    const { s, sid, finish } = await open();
    const get = new GetFinishSummary(s.repos);
    await expect(get.execute(sid)).rejects.toBeInstanceOf(NotFoundError);
    const v = (await new GetWorkoutSession(s.repos).execute())!;
    await s.repos.sessions.setExerciseCompleted(sid, v.items[0].exerciseId, true);
    s.clock.set('2026-09-20T10:30:00-03:00');
    await finish().execute({ sessionId: sid });
    expect(await get.execute(sid)).toEqual({
      sessionId: sid,
      done: 1,
      total: 6,
      durationMinutes: 30,
    });
    await expect(get.execute(9999)).rejects.toBeInstanceOf(NotFoundError);
  });
});
