import type { Database } from '../database/Database';

export interface Migration {
  version: number;
  up(db: Database): Promise<void>;
}

export type MigrationResult =
  { status: 'ready'; version: number } | { status: 'error'; error: Error; version: number };
