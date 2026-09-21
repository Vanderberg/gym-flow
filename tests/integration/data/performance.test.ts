import { createRepositories } from '../../../src/data/repositories';
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
