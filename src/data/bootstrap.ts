import type { Database } from './database/Database';
import { migrations } from './migrations';
import { runMigrations } from './migrations/runner';
import { runSeed } from './seed/runSeed';

export type BootstrapResult = { status: 'ready' } | { status: 'error'; error: Error };

/** Migrations + seed; nunca lança. */
export async function bootstrapDatabase(db: Database): Promise<BootstrapResult> {
  try {
    const result = await runMigrations(db, migrations);
    if (result.status !== 'ready') return { status: 'error', error: result.error };
    await runSeed(db);
    return { status: 'ready' };
  } catch (e) {
    return { status: 'error', error: e instanceof Error ? e : new Error(String(e)) };
  }
}
