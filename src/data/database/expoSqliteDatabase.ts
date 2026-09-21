import type { SQLiteDatabase } from 'expo-sqlite';
import type { Database, SqlValue } from './Database';

type Runner = Pick<SQLiteDatabase, 'execAsync' | 'runAsync' | 'getAllAsync' | 'getFirstAsync'>;

function wrap(runner: Runner, root: SQLiteDatabase): Database {
  return {
    exec: (sql) => runner.execAsync(sql),
    run: async (sql, params = []) => {
      await runner.runAsync(sql, params);
    },
    getAll: <T>(sql: string, params: SqlValue[] = []) => runner.getAllAsync<T>(sql, params),
    getFirst: <T>(sql: string, params: SqlValue[] = []) => runner.getFirstAsync<T>(sql, params),
    transaction: async <T>(work: (tx: Database) => Promise<T>) => {
      let result!: T;
      // Transação exclusiva: consultas concorrentes não entram na transação da migration.
      await root.withExclusiveTransactionAsync(async (txn) => {
        result = await work(wrap(txn as unknown as Runner, root));
      });
      return result;
    },
  };
}

export function createExpoSqliteDatabase(native: SQLiteDatabase): Database {
  return wrap(native, native);
}
