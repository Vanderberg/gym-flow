import { runMigrations } from '../../src/data/migrations/runner';
import { migrations } from '../../src/data/migrations';
import type { Migration } from '../../src/data/migrations/types';
import { createBetterSqliteDatabase, type TestDatabase } from './helpers/betterSqliteDatabase';

const version = (db: TestDatabase) => db.raw.pragma('user_version', { simple: true });

const v1: Migration = {
  version: 1,
  async up(db) {
    await db.exec('CREATE TABLE t (id INTEGER PRIMARY KEY, name TEXT)');
    await db.run('INSERT INTO t (name) VALUES (?)', ['a']);
  },
};
const v2: Migration = {
  version: 2,
  async up(db) {
    await db.exec('ALTER TABLE t ADD COLUMN extra TEXT');
  },
};

describe('runMigrations', () => {
  it('banco novo fica ready na versão 2 com as migrations reais', async () => {
    const db = createBetterSqliteDatabase();
    expect(await runMigrations(db, migrations)).toEqual({ status: 'ready', version: 2 });
    expect(version(db)).toBe(2);
  });

  it('aplica só as pendentes preservando dados', async () => {
    const db = createBetterSqliteDatabase();
    await runMigrations(db, [v1]);
    expect(await runMigrations(db, [v1, v2])).toEqual({ status: 'ready', version: 2 });
    expect(await db.getAll('SELECT name, extra FROM t')).toEqual([{ name: 'a', extra: null }]);
  });

  it('é idempotente', async () => {
    const db = createBetterSqliteDatabase();
    await runMigrations(db, [v1, v2]);
    expect(await runMigrations(db, [v1, v2])).toEqual({ status: 'ready', version: 2 });
    expect(await db.getAll('SELECT * FROM t')).toHaveLength(1);
  });

  it('erro em migration faz rollback e preserva versão e dados', async () => {
    const db = createBetterSqliteDatabase();
    await runMigrations(db, [v1]);
    const bad: Migration = {
      version: 2,
      async up(tx) {
        await tx.exec('ALTER TABLE t ADD COLUMN x TEXT');
        throw new Error('falhou');
      },
    };
    const result = await runMigrations(db, [v1, bad]);
    expect(result.status).toBe('error');
    expect(result.version).toBe(1);
    expect(version(db)).toBe(1);
    expect(await db.getAll('SELECT * FROM t')).toEqual([{ id: 1, name: 'a' }]);
  });

  it('user_version maior que o conhecido gera erro sem alterar o banco', async () => {
    const db = createBetterSqliteDatabase();
    db.raw.pragma('user_version = 5');
    const result = await runMigrations(db, [v1]);
    expect(result.status).toBe('error');
    expect(version(db)).toBe(5);
  });

  it('versão duplicada ou com lacuna é detectada', async () => {
    const db = createBetterSqliteDatabase();
    expect((await runMigrations(db, [v1, v1])).status).toBe('error');
    expect((await runMigrations(db, [v2])).status).toBe('error');
  });
});
