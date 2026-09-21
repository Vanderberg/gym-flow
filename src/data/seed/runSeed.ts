import type { Database } from '../database/Database';
import { createRepositories } from '../repositories';
import type { Clock } from '../../utils/localDate';
import { normalizeName } from '../../utils/normalizeName';
import { SEED_DATA } from './seedData';
import {
  deactivateMissingExercises,
  deactivateMissingPrograms,
  removeStaleContent,
  removeStaleSchedule,
} from './sync';
import type { SeedData } from './types';
import { validateSeedData } from './validateSeedData';
import { WARMUP_NOTE } from './warmup';

/** Sincroniza o conteúdo do seed (idempotente, transacional). Nunca toca em sessões. */
export async function runSeed(
  db: Database,
  opts: { data?: SeedData; clock?: Clock } = {},
): Promise<void> {
  const data = opts.data ?? SEED_DATA;
  validateSeedData(data);

  await db.transaction(async (tx) => {
    const repos = createRepositories(tx, opts.clock);

    const exerciseIds = new Map<string, number>();
    for (const ex of data.exercises) {
      const saved = await repos.exercises.upsertByName(ex);
      exerciseIds.set(normalizeName(ex.name), saved.id);
    }
    await deactivateMissingExercises(tx, [...exerciseIds.values()]);

    const programIds: number[] = [];
    let defaultProgramId = 0;
    for (const program of data.programs) {
      const saved = await repos.programs.upsertProgram({
        name: program.name,
        description: program.description,
        homeSuggestion: program.homeSuggestion,
      });
      programIds.push(saved.id);
      if (program.isDefault) defaultProgramId = saved.id;

      const workoutIds = new Map<string, number>();
      const itemsByWorkoutCode: Record<string, number[]> = {};
      for (const [wi, workout] of program.workouts.entries()) {
        const w = await repos.programs.upsertWorkout({
          programId: saved.id,
          code: workout.code,
          name: workout.name,
          position: wi + 1,
          warmupNote: WARMUP_NOTE,
        });
        workoutIds.set(workout.code, w.id);
        itemsByWorkoutCode[workout.code] = [];
        for (const [ii, item] of workout.items.entries()) {
          const exerciseId = exerciseIds.get(normalizeName(item.exercise)) as number;
          itemsByWorkoutCode[workout.code].push(exerciseId);
          await repos.programs.upsertWorkoutExercise({
            workoutId: w.id,
            exerciseId,
            displayOrder: ii + 1,
            prescription: item.prescription,
            technique: item.technique,
            notes: item.notes,
          });
        }
      }
      await removeStaleContent(tx, saved.id, {
        workoutCodes: program.workouts.map((w) => w.code),
        itemsByWorkoutCode,
      });

      if (program.schedule) {
        for (const day of program.schedule) {
          await repos.schedule.upsertEntry({
            programId: saved.id,
            weekday: day.weekday,
            workoutId: day.workout === null ? null : (workoutIds.get(day.workout) as number),
            optional: day.optional,
            note: day.note,
          });
        }
        await removeStaleSchedule(
          tx,
          saved.id,
          program.schedule.map((d) => d.weekday),
        );
      }

      if ((await repos.sequenceState.get(saved.id)) === null) {
        await repos.sequenceState.upsert(saved.id, 1);
      }
    }
    await deactivateMissingPrograms(tx, programIds);

    if ((await repos.settings.get()) === null) {
      await repos.settings.save({
        activeProgramId: defaultProgramId,
        sequenceType: data.defaultSequenceType,
        restTimerEnabled: false,
        restTimerSeconds: 90,
      });
    }
  });
}
