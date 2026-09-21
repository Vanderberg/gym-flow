import { openDatabaseAsync } from 'expo-sqlite';
import type { Database } from './Database';
import { createExpoSqliteDatabase } from './expoSqliteDatabase';

export async function openDatabase(): Promise<Database> {
  const native = await openDatabaseAsync('gymflow.db');
  return createExpoSqliteDatabase(native);
}
