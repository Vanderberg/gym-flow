import { bootstrapDatabase } from '../../../src/data/bootstrap';
import * as seed from '../../../src/data/seed/runSeed';
import * as runner from '../../../src/data/migrations/runner';
import { createBetterSqliteDatabase } from '../helpers/betterSqliteDatabase';

const count = async (db: ReturnType<typeof createBetterSqliteDatabase>, table: string) =>
  (await db.getFirst<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`))!.n;

describe('bootstrapDatabase', () => {
  afterEach(() => jest.restoreAllMocks());

  it('banco novo fica pronto com seed', async () => {
    const db = createBetterSqliteDatabase();
    db.raw.pragma('foreign_keys = ON');
    expect(await bootstrapDatabase(db)).toEqual({ status: 'ready' });
    expect(await count(db, 'training_program')).toBe(2);
  });

  it('falha de migration devolve erro sem seed', async () => {
    const db = createBetterSqliteDatabase();
    const spy = jest.spyOn(seed, 'runSeed');
    jest
      .spyOn(runner, 'runMigrations')
      .mockResolvedValue({ status: 'error', error: new Error('m'), version: 0 });
    const r = await bootstrapDatabase(db);
    expect(r.status).toBe('error');
    expect(spy).not.toHaveBeenCalled();
  });

  it('falha do seed devolve erro, sem lançar', async () => {
    const db = createBetterSqliteDatabase();
    db.raw.pragma('foreign_keys = ON');
    jest.spyOn(seed, 'runSeed').mockRejectedValue(new Error('seed'));
    const r = await bootstrapDatabase(db);
    expect(r.status).toBe('error');
    expect(await count(db, 'training_program')).toBe(0);
  });
});
