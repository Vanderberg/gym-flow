import type { Database } from '../database/Database';

const placeholders = (n: number) => Array(n).fill('?').join(',');

export async function removeStaleContent(
  db: Database,
  programId: number,
  keep: { workoutCodes: string[]; itemsByWorkoutCode: Record<string, number[]> },
): Promise<void> {
  const workouts = await db.getAll<{ id: number; code: string }>(
    'SELECT id, code FROM workout WHERE program_id = ?',
    [programId],
  );
  for (const w of workouts) {
    if (!keep.workoutCodes.includes(w.code)) {
      await db.run('UPDATE workout SET active = 0 WHERE id = ?', [w.id]);
      continue;
    }
    await db.run('UPDATE workout SET active = 1 WHERE id = ?', [w.id]);
    const ids = keep.itemsByWorkoutCode[w.code] ?? [];
    await db.run(
      `DELETE FROM workout_exercise WHERE workout_id = ?${
        ids.length ? ` AND exercise_id NOT IN (${placeholders(ids.length)})` : ''
      }`,
      [w.id, ...ids],
    );
  }
}

export async function deactivateMissingExercises(
  db: Database,
  keptExerciseIds: number[],
): Promise<void> {
  await db.run(
    `UPDATE exercise SET active = CASE WHEN id IN (${placeholders(keptExerciseIds.length)}) THEN 1 ELSE 0 END`,
    keptExerciseIds,
  );
}

export async function removeStaleSchedule(
  db: Database,
  programId: number,
  keptWeekdays: number[],
): Promise<void> {
  await db.run(
    `DELETE FROM weekly_schedule WHERE program_id = ?${
      keptWeekdays.length ? ` AND weekday NOT IN (${placeholders(keptWeekdays.length)})` : ''
    }`,
    [programId, ...keptWeekdays],
  );
}

export async function deactivateMissingPrograms(
  db: Database,
  keptProgramIds: number[],
): Promise<void> {
  await db.run(
    `UPDATE training_program SET active = CASE WHEN id IN (${placeholders(keptProgramIds.length)}) THEN 1 ELSE 0 END`,
    keptProgramIds,
  );
}
