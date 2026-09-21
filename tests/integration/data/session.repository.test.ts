import type { Database } from '../../../src/data/database/Database';
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../src/data/repositories/errors';
import { SqliteSessionRepository } from '../../../src/data/repositories/SqliteSessionRepository';
import { localDateOf } from '../../../src/utils/localDate';
import { createTestDb } from '../helpers/testDb';

async function setup() {
  const t = await createTestDb();
  const repo = new SqliteSessionRepository(t.db, t.clock);
  const p = await t.insertProgram('P');
  const w = await t.insertWorkout(p, 'A', 1);
  const ex: number[] = [];
  for (let i = 1; i <= 3; i++) {
    const e = await t.insertExercise(`E${i}`);
    await t.linkExercise(w, e, i);
    ex.push(e);
  }
  return { t, repo, p, w, ex };
}

describe('SessionRepository', () => {
  it('(a) startSession cria sessão e linhas desmarcadas', async () => {
    const { repo, p, w, ex } = await setup();
    const s = await repo.startSession(p, w);
    expect(s.startedAt).toMatch(/^2026-09-\d\dT\d\d:\d\d:\d\d[+-]\d\d:\d\d$/);
    const d = await repo.getSession(s.id);
    expect(d?.exercises.map((l) => l.exerciseId)).toEqual(ex);
    expect(d?.exercises.every((l) => !l.completed && l.weight === null)).toBe(true);
  });

  it('(b) segunda sessão em andamento é conflito e nada é gravado', async () => {
    const { t, repo, p, w } = await setup();
    await repo.startSession(p, w);
    await expect(repo.startSession(p, w)).rejects.toThrow(ConflictError);
    const n = await t.db.getFirst<{ n: number }>('SELECT COUNT(*) AS n FROM workout_session');
    expect(n?.n).toBe(1);
    const l = await t.db.getFirst<{ n: number }>(
      'SELECT COUNT(*) AS n FROM workout_session_exercise',
    );
    expect(l?.n).toBe(3);
  });

  it('(c) peso: negativo rejeitado, null e 0 aceitos; completed alterna', async () => {
    const { repo, p, w, ex } = await setup();
    const s = await repo.startSession(p, w);
    await expect(repo.setExerciseWeight(s.id, ex[0]!, -1)).rejects.toThrow(ValidationError);
    await repo.setExerciseWeight(s.id, ex[0]!, 0);
    await repo.setExerciseWeight(s.id, ex[0]!, null);
    await repo.setExerciseCompleted(s.id, ex[0]!, true);
    expect((await repo.getSession(s.id))?.exercises[0]?.completed).toBe(true);
    await repo.setExerciseCompleted(s.id, ex[0]!, false);
    expect((await repo.getSession(s.id))?.exercises[0]?.completed).toBe(false);
  });

  it('(d) falha na 2ª linha desfaz a criação inteira', async () => {
    const { t, p, w } = await setup();
    let inserts = 0;
    const failing: Database = {
      ...t.db,
      transaction: (work) =>
        t.db.transaction((tx) =>
          work({
            ...tx,
            run: async (sql, params) => {
              if (sql.includes('INSERT INTO workout_session_exercise') && ++inserts === 2) {
                throw new Error('falha injetada');
              }
              return tx.run(sql, params);
            },
          }),
        ),
    };
    const repo = new SqliteSessionRepository(failing, t.clock);
    await expect(repo.startSession(p, w)).rejects.toThrow('falha injetada');
    const n = await t.db.getFirst<{ n: number }>('SELECT COUNT(*) AS n FROM workout_session');
    expect(n?.n).toBe(0);
    const l = await t.db.getFirst<{ n: number }>(
      'SELECT COUNT(*) AS n FROM workout_session_exercise',
    );
    expect(l?.n).toBe(0);
  });

  it('(e) finishSession com 0 marcados', async () => {
    const { repo, p, w } = await setup();
    const s = await repo.startSession(p, w);
    await repo.finishSession(s.id);
    const d = await repo.getSession(s.id);
    expect(d?.completed).toBe(true);
    expect(d?.finishedAt).not.toBeNull();
    expect(await repo.getInProgress()).toBeNull();
  });

  it('(f) discardSession apaga em andamento e conflita em finalizada', async () => {
    const { t, repo, p, w } = await setup();
    const s = await repo.startSession(p, w);
    await repo.discardSession(s.id);
    expect(await repo.getSession(s.id)).toBeNull();
    const l = await t.db.getFirst<{ n: number }>(
      'SELECT COUNT(*) AS n FROM workout_session_exercise',
    );
    expect(l?.n).toBe(0);
    const s2 = await repo.startSession(p, w);
    await repo.finishSession(s2.id);
    await expect(repo.discardSession(s2.id)).rejects.toThrow(ConflictError);
  });

  it('(g) getInProgress com linhas ou null', async () => {
    const { repo, p, w } = await setup();
    expect(await repo.getInProgress()).toBeNull();
    await repo.startSession(p, w);
    expect((await repo.getInProgress())?.exercises).toHaveLength(3);
  });

  it('(h) listFinished: mais recente primeiro, filtra programa, sem em andamento', async () => {
    const { t, repo, p, w } = await setup();
    const q = await t.insertProgram('Q');
    const wq = await t.insertWorkout(q, 'A', 1);
    const s1 = await repo.startSession(p, w);
    await repo.finishSession(s1.id, '2026-09-01T10:00:00-03:00');
    const s2 = await repo.startSession(q, wq);
    await repo.finishSession(s2.id, '2026-09-02T10:00:00-03:00');
    const s3 = await repo.startSession(p, w);
    await repo.finishSession(s3.id, '2026-09-03T10:00:00-03:00');
    await repo.startSession(p, w);
    expect((await repo.listFinished()).map((s) => s.id)).toEqual([s3.id, s2.id, s1.id]);
    expect((await repo.listFinished({ programId: p })).map((s) => s.id)).toEqual([s3.id, s1.id]);
  });

  it('(i) edita sessão finalizada sem mudar programa/treino', async () => {
    const { repo, p, w, ex } = await setup();
    const s = await repo.startSession(p, w);
    await repo.finishSession(s.id);
    await repo.setExerciseCompleted(s.id, ex[1]!, true);
    await repo.setExerciseWeight(s.id, ex[1]!, 42.5);
    const d = await repo.getSession(s.id);
    expect(d).toMatchObject({ programId: p, workoutId: w });
    expect(d?.exercises[1]).toMatchObject({ completed: true, weight: 42.5 });
  });

  it('(j) getLastWeight só finalizadas do mesmo programa com peso', async () => {
    const { t, repo, p, w, ex } = await setup();
    expect(await repo.getLastWeight(p, ex[0]!)).toBeNull();
    const s1 = await repo.startSession(p, w);
    await repo.setExerciseWeight(s1.id, ex[0]!, 30);
    await repo.finishSession(s1.id, '2026-09-01T10:00:00-03:00');
    const s2 = await repo.startSession(p, w); // sem peso
    await repo.finishSession(s2.id, '2026-09-02T10:00:00-03:00');
    expect(await repo.getLastWeight(p, ex[0]!)).toBe(30);
    const s3 = await repo.startSession(p, w); // em andamento
    await repo.setExerciseWeight(s3.id, ex[0]!, 99);
    expect(await repo.getLastWeight(p, ex[0]!)).toBe(30);
    const q = await t.insertProgram('Q');
    expect(await repo.getLastWeight(q, ex[0]!)).toBeNull();
    await repo.finishSession(s3.id, '2026-09-03T10:00:00-03:00');
    expect(await repo.getLastWeight(p, ex[0]!)).toBe(99);
  });

  it('(k) sessão de 23h30 -03:00 fica no dia local', async () => {
    const { repo, p, w } = await setup();
    const s = await repo.startSession(p, w);
    await repo.finishSession(s.id, '2026-09-20T23:30:00-03:00');
    const d = await repo.getSession(s.id);
    expect(localDateOf(d!.finishedAt!)).toBe('2026-09-20');
  });

  it('(l) treino de outro programa e (m) inativos ⇒ ValidationError', async () => {
    const { t, repo, p, w } = await setup();
    const q = await t.insertProgram('Q');
    await expect(repo.startSession(q, w)).rejects.toThrow(ValidationError);
    await t.db.run('UPDATE workout SET active = 0 WHERE id = ?', [w]);
    await expect(repo.startSession(p, w)).rejects.toThrow(ValidationError);
    await t.db.run('UPDATE workout SET active = 1 WHERE id = ?', [w]);
    await t.db.run('UPDATE training_program SET active = 0 WHERE id = ?', [p]);
    await expect(repo.startSession(p, w)).rejects.toThrow(ValidationError);
  });

  it('(n) exercício sem linha na sessão ⇒ NotFoundError', async () => {
    const { t, repo, p, w } = await setup();
    const s = await repo.startSession(p, w);
    const other = await t.insertExercise('Outro');
    await expect(repo.setExerciseCompleted(s.id, other, true)).rejects.toThrow(NotFoundError);
    await expect(repo.setExerciseWeight(s.id, other, 1)).rejects.toThrow(NotFoundError);
  });
});
