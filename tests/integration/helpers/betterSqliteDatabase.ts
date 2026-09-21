import BetterSqlite3 from 'better-sqlite3';
import type { Database, SqlValue } from '../../../src/data/database/Database';

export type TestDatabase = Database & { raw: BetterSqlite3.Database };

export function createBetterSqliteDatabase(
  raw: BetterSqlite3.Database = new BetterSqlite3(':memory:'),
): TestDatabase {
  const db: TestDatabase = {
    raw,
    async exec(sql) {
      raw.exec(sql);
    },
    async run(sql, params: SqlValue[] = []) {
      raw.prepare(sql).run(...params);
    },
    async getAll<T>(sql: string, params: SqlValue[] = []) {
      return raw.prepare(sql).all(...params) as T[];
    },
    async getFirst<T>(sql: string, params: SqlValue[] = []) {
      return (raw.prepare(sql).get(...params) as T | undefined) ?? null;
    },
    async transaction<T>(work: (tx: Database) => Promise<T>) {
      raw.exec('BEGIN');
      try {
        const result = await work(db);
        raw.exec('COMMIT');
        return result;
      } catch (e) {
        raw.exec('ROLLBACK');
        throw e;
      }
    },
  };
  return db;
}
