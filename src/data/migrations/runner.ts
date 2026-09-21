import type { Database } from '../database/Database';
import type { Migration, MigrationResult } from './types';

function toError(e: unknown): Error {
  return e instanceof Error ? e : new Error(String(e));
}

export function validateMigrations(migrations: Migration[]): void {
  migrations.forEach((m, i) => {
    if (m.version !== i + 1) {
      throw new Error(
        `Lista de migrations inválida: esperado versão ${i + 1}, recebido ${m.version}`,
      );
    }
  });
}

async function readVersion(db: Database): Promise<number> {
  const row = await db.getFirst<{ user_version: number }>('PRAGMA user_version');
  return row?.user_version ?? 0;
}

export async function runMigrations(
  db: Database,
  migrations: Migration[],
): Promise<MigrationResult> {
  let current = 0;
  try {
    validateMigrations(migrations);
    current = await readVersion(db);
    const latest = migrations.length;
    if (current > latest) {
      throw new Error(`Versão do banco (${current}) é maior que a conhecida pelo app (${latest})`);
    }
    for (const m of migrations.filter((x) => x.version > current)) {
      await db.transaction(async (tx) => {
        await m.up(tx);
        await tx.exec(`PRAGMA user_version = ${m.version}`);
      });
      current = m.version;
    }
    return { status: 'ready', version: current };
  } catch (e) {
    return { status: 'error', error: toError(e), version: current };
  }
}
