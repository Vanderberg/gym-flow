import { migrations } from '../../../src/data/migrations';
import { runMigrations } from '../../../src/data/migrations/runner';
import type { Clock } from '../../../src/utils/localDate';
import { createBetterSqliteDatabase, type TestDatabase } from './betterSqliteDatabase';

export interface TestClock extends Clock {
  set(iso: string): void;
}

export interface TestContext {
  db: TestDatabase;
  clock: TestClock;
  insertProgram(name: string): Promise<number>;
  insertWorkout(programId: number, code: string, position: number): Promise<number>;
  insertExercise(name: string): Promise<number>;
  linkExercise(workoutId: number, exerciseId: number, displayOrder: number): Promise<void>;
}

export async function createTestDb(): Promise<TestContext> {
  const raw = createBetterSqliteDatabase();
  raw.raw.pragma('foreign_keys = ON');
  const result = await runMigrations(raw, migrations);
  if (result.status !== 'ready') throw result.error;
  let current = new Date('2026-09-20T10:00:00-03:00');
  const clock = Object.assign((() => current) as Clock, {
    set(iso: string) {
      current = new Date(iso);
    },
  }) as TestClock;
  const db = raw;
  const lastId = async () =>
    (await db.getFirst<{ id: number }>('SELECT last_insert_rowid() AS id'))!.id;
  return {
    db,
    clock,
    async insertProgram(name) {
      await db.run('INSERT INTO training_program (name, created_at, updated_at) VALUES (?, ?, ?)', [
        name,
        'x',
        'x',
      ]);
      return lastId();
    },
    async insertWorkout(programId, code, position) {
      await db.run('INSERT INTO workout (program_id, code, name, position) VALUES (?, ?, ?, ?)', [
        programId,
        code,
        `Treino ${code}`,
        position,
      ]);
      return lastId();
    },
    async insertExercise(name) {
      await db.run('INSERT INTO exercise (name, name_key) VALUES (?, ?)', [
        name,
        name.toLowerCase(),
      ]);
      return lastId();
    },
    async linkExercise(workoutId, exerciseId, displayOrder) {
      await db.run(
        'INSERT INTO workout_exercise (workout_id, exercise_id, display_order) VALUES (?, ?, ?)',
        [workoutId, exerciseId, displayOrder],
      );
    },
  };
}
