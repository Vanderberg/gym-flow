import type { Database } from '../database/Database';
import type { ProgramRepository } from '../../domain/program/ProgramRepository';
import type {
  ProgramInput,
  TrainingProgram,
  Workout,
  WorkoutDetail,
  WorkoutExercise,
  WorkoutExerciseInput,
  WorkoutInput,
} from '../../domain/program/types';
import { nowLocalIso, type Clock } from '../../utils/localDate';
import { guard, NotFoundError } from './errors';
import { toBoolean } from './mappers';
import { mapExercise, type ExerciseRow } from './SqliteExerciseRepository';

interface ProgramRow {
  id: number;
  name: string;
  description: string | null;
  home_suggestion: string | null;
  active: number;
}
interface WorkoutRow {
  id: number;
  program_id: number;
  code: string;
  name: string;
  position: number;
  warmup_note: string | null;
  active: number;
}

const mapProgram = (r: ProgramRow): TrainingProgram => ({
  id: r.id,
  name: r.name,
  description: r.description,
  homeSuggestion: r.home_suggestion,
  active: toBoolean(r.active),
});
const mapWorkout = (r: WorkoutRow): Workout => ({
  id: r.id,
  programId: r.program_id,
  code: r.code,
  name: r.name,
  position: r.position,
  warmupNote: r.warmup_note,
  active: toBoolean(r.active),
});

export class SqliteProgramRepository implements ProgramRepository {
  constructor(
    private readonly db: Database,
    private readonly clock?: Clock,
  ) {}

  async listPrograms(opts?: { includeInactive?: boolean }) {
    const rows = await this.db.getAll<ProgramRow>(
      `SELECT * FROM training_program ${opts?.includeInactive ? '' : 'WHERE active = 1'} ORDER BY id`,
    );
    return rows.map(mapProgram);
  }

  async getProgram(id: number) {
    const r = await this.db.getFirst<ProgramRow>('SELECT * FROM training_program WHERE id = ?', [
      id,
    ]);
    return r ? mapProgram(r) : null;
  }

  async listWorkouts(programId: number) {
    const rows = await this.db.getAll<WorkoutRow>(
      'SELECT * FROM workout WHERE program_id = ? ORDER BY position',
      [programId],
    );
    return rows.map(mapWorkout);
  }

  async getWorkoutWithExercises(workoutId: number): Promise<WorkoutDetail | null> {
    const w = await this.db.getFirst<WorkoutRow>('SELECT * FROM workout WHERE id = ?', [workoutId]);
    if (!w) return null;
    const rows = await this.db.getAll<
      {
        we_id: number;
        display_order: number;
        prescription: string | null;
        technique: string | null;
        notes: string | null;
      } & ExerciseRow
    >(
      `SELECT we.id AS we_id, we.display_order, we.prescription, we.technique, we.notes, e.*
         FROM workout_exercise we JOIN exercise e ON e.id = we.exercise_id
        WHERE we.workout_id = ? ORDER BY we.display_order, we.id`,
      [workoutId],
    );
    const exercises: WorkoutExercise[] = rows.map((r) => ({
      id: r.we_id,
      workoutId,
      exerciseId: r.id,
      displayOrder: r.display_order,
      prescription: r.prescription,
      technique: r.technique,
      notes: r.notes,
      exercise: mapExercise(r),
    }));
    return { ...mapWorkout(w), exercises };
  }

  async upsertProgram(input: ProgramInput): Promise<TrainingProgram> {
    const now = nowLocalIso(this.clock);
    const existing = await this.db.getFirst<ProgramRow>(
      'SELECT * FROM training_program WHERE name = ?',
      [input.name],
    );
    await guard(async () => {
      if (existing) {
        await this.db.run(
          'UPDATE training_program SET description = ?, home_suggestion = ?, updated_at = ? WHERE id = ?',
          [input.description ?? null, input.homeSuggestion ?? null, now, existing.id],
        );
      } else {
        await this.db.run(
          'INSERT INTO training_program (name, description, home_suggestion, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
          [input.name, input.description ?? null, input.homeSuggestion ?? null, now, now],
        );
      }
    });
    const r = await this.db.getFirst<ProgramRow>('SELECT * FROM training_program WHERE name = ?', [
      input.name,
    ]);
    if (!r) throw new NotFoundError('Programa não encontrado');
    return mapProgram(r);
  }

  async upsertWorkout(input: WorkoutInput): Promise<Workout> {
    await guard(() =>
      this.db.run(
        `INSERT INTO workout (program_id, code, name, position, warmup_note) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(program_id, code) DO UPDATE SET
           name = excluded.name, position = excluded.position, warmup_note = excluded.warmup_note`,
        [input.programId, input.code, input.name, input.position, input.warmupNote ?? null],
      ),
    );
    const r = await this.db.getFirst<WorkoutRow>(
      'SELECT * FROM workout WHERE program_id = ? AND code = ?',
      [input.programId, input.code],
    );
    if (!r) throw new NotFoundError('Treino não encontrado');
    return mapWorkout(r);
  }

  async upsertWorkoutExercise(input: WorkoutExerciseInput) {
    await guard(() =>
      this.db.run(
        `INSERT INTO workout_exercise (workout_id, exercise_id, display_order, prescription, technique, notes)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(workout_id, exercise_id) DO UPDATE SET
           display_order = excluded.display_order, prescription = excluded.prescription,
           technique = excluded.technique, notes = excluded.notes`,
        [
          input.workoutId,
          input.exerciseId,
          input.displayOrder,
          input.prescription ?? null,
          input.technique ?? null,
          input.notes ?? null,
        ],
      ),
    );
  }

  async deactivateProgram(id: number) {
    await this.db.run('UPDATE training_program SET active = 0, updated_at = ? WHERE id = ?', [
      nowLocalIso(this.clock),
      id,
    ]);
  }

  async deactivateWorkout(id: number) {
    await this.db.run('UPDATE workout SET active = 0 WHERE id = ?', [id]);
  }
}
