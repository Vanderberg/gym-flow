import { SetRestTimerDuration } from '../../../src/application/SetRestTimerDuration';
import { SetRestTimerEnabled } from '../../../src/application/SetRestTimerEnabled';
import { bootstrapDatabase } from '../../../src/data/bootstrap';
import { createRepositories, ValidationError } from '../../../src/data/repositories';
import { createBetterSqliteDatabase } from '../helpers/betterSqliteDatabase';

async function setup() {
  const db = createBetterSqliteDatabase();
  db.raw.pragma('foreign_keys = ON');
  expect(await bootstrapDatabase(db)).toEqual({ status: 'ready' });
  return { db, repos: createRepositories(db) };
}

describe('configurações do cronômetro', () => {
  it('padrões: desativado e 90 s', async () => {
    const { repos } = await setup();
    const s = (await repos.settings.get())!;
    expect(s.restTimerEnabled).toBe(false);
    expect(s.restTimerSeconds).toBe(90);
  });
  it('habilitar persiste e só muda o seu campo', async () => {
    const { db, repos } = await setup();
    const before = (await repos.settings.get())!;
    await new SetRestTimerEnabled(repos).execute(true);
    const after = (await createRepositories(db).settings.get())!;
    expect(after).toEqual({ ...before, restTimerEnabled: true });
  });
  it('duração persiste e só muda o seu campo; limites aceitos', async () => {
    const { repos } = await setup();
    const before = (await repos.settings.get())!;
    for (const secs of [5, 3600, 90]) {
      await new SetRestTimerDuration(repos).execute(secs);
      expect((await repos.settings.get())!.restTimerSeconds).toBe(secs);
    }
    expect(await repos.settings.get()).toEqual(before);
  });
  it.each([0, -1, 4, 3601, 1.5])('duração inválida %s não grava', async (secs) => {
    const { repos } = await setup();
    const before = await repos.settings.get();
    await expect(new SetRestTimerDuration(repos).execute(secs)).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(await repos.settings.get()).toEqual(before);
  });
});
