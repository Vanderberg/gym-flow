import { GetSessionDetail } from '../../../src/application/GetSessionDetail';
import { ListHistory } from '../../../src/application/ListHistory';
import { SaveSessionEdits } from '../../../src/application/SaveSessionEdits';
import { NotFoundError, ValidationError } from '../../../src/data/repositories/errors';
import type { Database, SqlValue } from '../../../src/data/database/Database';
import { setupWorkout } from './workoutHelpers';

jest.setTimeout(30000);

async function fixture() {
  const s = await setupWorkout();
  const p1 = await s.use('Treino Padrão', 'CONTINUOUS');
  s.clock.set('2026-09-10T23:30:00-03:00');
  const a = await s.start(p1, '1');
  const exs = (await s.repos.sessions.getSession(a))!.exercises.map((e) => e.exerciseId);
  await s.repos.sessions.setExerciseCompleted(a, exs[0], true);
  await s.repos.sessions.setExerciseWeight(a, exs[0], 40);
  s.clock.set('2026-09-10T23:59:00-03:00');
  await s.repos.sessions.finishSession(a);
  const p2 = await s.use('Treino Monstro', 'CONTINUOUS');
  s.clock.set('2026-09-12T10:00:00-03:00');
  const b = await s.start(p2, 'A');
  s.clock.set('2026-09-12T10:52:00-03:00');
  await s.repos.sessions.finishSession(b);
  s.clock.set('2026-09-13T10:00:00-03:00');
  await s.use('Treino Padrão', 'CONTINUOUS');
  await s.start(p1, '2'); // em andamento
  return { s, p1, p2, a, b, exs };
}
type Ctx = Awaited<ReturnType<typeof fixture>>['s'];
const snap = async (s: Ctx) => ({
  sess: await s.db.getAll('SELECT * FROM workout_session ORDER BY id'),
  seq: await s.db.getAll('SELECT * FROM program_sequence_state ORDER BY 1'),
  set: await s.db.getAll('SELECT * FROM app_settings'),
});
const openId = async (s: Ctx) =>
  (await s.db.getFirst<{ id: number }>('SELECT id FROM workout_session WHERE finished_at IS NULL'))!
    .id;

describe('histórico', () => {
  it('lista só finalizadas, mais recentes primeiro, com filtro e dia local', async () => {
    const { s, p1, a, b } = await fixture();
    const before = await snap(s);
    const list = await new ListHistory(s.repos).execute();
    expect(list.map((i) => i.sessionId)).toEqual([b, a]);
    expect(list[1]).toMatchObject({ localDate: '2026-09-10', done: 1, complete: false });
    expect(list[0].durationLabel).toBe('52 min');
    expect(list[0].programName).toBe('Treino Monstro');
    const filtered = await new ListHistory(s.repos).execute({ programId: p1 });
    expect(filtered.map((i) => i.sessionId)).toEqual([a]);
    expect(await s.repos.sessions.listProgramsWithFinished()).toHaveLength(2);
    expect(await snap(s)).toEqual(before);
  });

  it('detalhe: linhas, prescrição e exercício removido da ficha', async () => {
    const { s, a, exs } = await fixture();
    const d = await new GetSessionDetail(s.repos).execute(a);
    expect(d.total).toBe(exs.length);
    expect(d.rows[0]).toMatchObject({ completed: true, weight: 40, inWorkout: true });
    await s.db.run('DELETE FROM workout_exercise WHERE exercise_id = ?', [exs[1]]);
    const d2 = await new GetSessionDetail(s.repos).execute(a);
    const last = d2.rows[d2.rows.length - 1];
    expect(last).toMatchObject({ exerciseId: exs[1], inWorkout: false, prescription: null });
    await expect(new GetSessionDetail(s.repos).execute(999)).rejects.toBeInstanceOf(NotFoundError);
    await expect(new GetSessionDetail(s.repos).execute(await openId(s))).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('salvar edições: transacional, preserva sessão/sequência/settings, reflete na última carga', async () => {
    const { s, p1, a, exs } = await fixture();
    const before = await snap(s);
    const save = new SaveSessionEdits({ db: s.db });
    await save.execute({
      sessionId: a,
      changes: {
        rows: [
          { exerciseId: exs[0], weight: 55 },
          { exerciseId: exs[2], completed: true },
        ],
      },
    });
    expect(await snap(s)).toEqual(before);
    const d = await new GetSessionDetail(s.repos).execute(a);
    expect(d.done).toBe(2);
    expect(d.rows.find((r) => r.exerciseId === exs[0])!.weight).toBe(55);
    expect(await s.repos.sessions.getLastWeight(p1, exs[0])).toBe(55);

    await expect(
      save.execute({ sessionId: a, changes: { rows: [{ exerciseId: exs[0], weight: -1 }] } }),
    ).rejects.toBeInstanceOf(ValidationError);
    await expect(
      save.execute({ sessionId: a, changes: { rows: [{ exerciseId: 999999, completed: true }] } }),
    ).rejects.toBeInstanceOf(NotFoundError);
    await expect(
      save.execute({ sessionId: await openId(s), changes: { rows: [] } }),
    ).rejects.toBeInstanceOf(ValidationError);

    const failing: Database = {
      ...s.db,
      transaction: (work) =>
        s.db.transaction((tx) =>
          work({
            ...tx,
            run: async (sql: string, p?: SqlValue[]) => {
              if (sql.includes('SET weight')) throw new Error('boom');
              return tx.run(sql, p);
            },
          }),
        ),
    };
    await expect(
      new SaveSessionEdits({ db: failing }).execute({
        sessionId: a,
        changes: {
          rows: [
            { exerciseId: exs[3], completed: true },
            { exerciseId: exs[3], weight: 9 },
          ],
        },
      }),
    ).rejects.toThrow();
    const d3 = await new GetSessionDetail(s.repos).execute(a);
    expect(d3.rows.find((r) => r.exerciseId === exs[3])!.completed).toBe(false);
  });
});
