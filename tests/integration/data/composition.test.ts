import { createRepositories } from '../../../src/data/repositories';
import { createTestDb } from '../helpers/testDb';

describe('composição transacional', () => {
  it('finishSession + sequência: erro no segundo passo desfaz o primeiro', async () => {
    const t = await createTestDb();
    const repos = createRepositories(t.db, t.clock);
    const p = await t.insertProgram('P');
    const w = await t.insertWorkout(p, 'A', 1);
    const s = await repos.sessions.startSession(p, w);
    await expect(
      t.db.transaction(async (tx) => {
        const r = createRepositories(tx, t.clock);
        await r.sessions.finishSession(s.id);
        await r.sequenceState.upsert(p, 0); // inválido
      }),
    ).rejects.toThrow();
    expect((await repos.sessions.getInProgress())?.id).toBe(s.id);
    expect(await repos.sequenceState.get(p)).toBeNull();
  });

  it('sucesso confirma os dois passos', async () => {
    const t = await createTestDb();
    const repos = createRepositories(t.db, t.clock);
    const p = await t.insertProgram('P');
    const w = await t.insertWorkout(p, 'A', 1);
    const s = await repos.sessions.startSession(p, w);
    await t.db.transaction(async (tx) => {
      const r = createRepositories(tx, t.clock);
      await r.sessions.finishSession(s.id);
      await r.sequenceState.upsert(p, 2);
    });
    expect(await repos.sessions.getInProgress()).toBeNull();
    expect((await repos.sequenceState.get(p))?.currentPosition).toBe(2);
  });
});
