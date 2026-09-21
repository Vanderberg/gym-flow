import { openDatabaseAsync } from 'expo-sqlite';
import type { Database } from './Database';
import { createExpoSqliteDatabase } from './expoSqliteDatabase';

export async function openDatabase(): Promise<Database> {
  const native = await openDatabaseAsync('gymflow.db');
  // Fora de transação: PRAGMA foreign_keys é ignorado dentro de uma.
  await native.execAsync('PRAGMA foreign_keys = ON');
  return createExpoSqliteDatabase(native);
}
