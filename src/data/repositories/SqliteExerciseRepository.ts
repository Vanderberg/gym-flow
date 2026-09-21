import type { Database } from '../database/Database';
import type { ExerciseRepository } from '../../domain/exercise/ExerciseRepository';
import type { Exercise, ExerciseInput } from '../../domain/exercise/types';
import { normalizeName } from '../../utils/normalizeName';
import type { Clock } from '../../utils/localDate';
import { guard, NotFoundError } from './errors';
import { toBoolean } from './mappers';

export interface ExerciseRow {
  id: number;
  name: string;
  muscle_group: string | null;
  primary_muscle: string | null;
  secondary_muscles: string | null;
  description: string | null;
  active: number;
}

export const mapExercise = (r: ExerciseRow): Exercise => ({
  id: r.id,
  name: r.name,
  muscleGroup: r.muscle_group,
  primaryMuscle: r.primary_muscle,
  secondaryMuscles: r.secondary_muscles,
  description: r.description,
  active: toBoolean(r.active),
});

export class SqliteExerciseRepository implements ExerciseRepository {
  constructor(
    private readonly db: Database,
    // Reservado para consistência com os demais repositórios.
    readonly clock?: Clock,
  ) {}

  async getById(id: number) {
    const r = await this.db.getFirst<ExerciseRow>('SELECT * FROM exercise WHERE id = ?', [id]);
    return r ? mapExercise(r) : null;
  }

  async findByName(name: string) {
    const r = await this.db.getFirst<ExerciseRow>('SELECT * FROM exercise WHERE name_key = ?', [
      normalizeName(name),
    ]);
    return r ? mapExercise(r) : null;
  }

  async upsertByName(input: ExerciseInput): Promise<Exercise> {
    const key = normalizeName(input.name);
    await guard(() =>
      this.db.run(
        `INSERT INTO exercise (name, name_key, muscle_group, primary_muscle, secondary_muscles, description)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(name_key) DO UPDATE SET
           muscle_group = COALESCE(excluded.muscle_group, muscle_group),
           primary_muscle = COALESCE(excluded.primary_muscle, primary_muscle),
           secondary_muscles = COALESCE(excluded.secondary_muscles, secondary_muscles),
           description = COALESCE(excluded.description, description)`,
        [
          input.name.trim().replace(/\s+/g, ' '),
          key,
          input.muscleGroup ?? null,
          input.primaryMuscle ?? null,
          input.secondaryMuscles ?? null,
          input.description ?? null,
        ],
      ),
    );
    const found = await this.findByName(input.name);
    if (!found) throw new NotFoundError('Exercício não encontrado');
    return found;
  }

  async deactivate(id: number) {
    await this.db.run('UPDATE exercise SET active = 0 WHERE id = ?', [id]);
  }
}
