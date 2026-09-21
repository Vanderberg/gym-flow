import type { Exercise, ExerciseInput } from './types';

export interface ExerciseRepository {
  getById(id: number): Promise<Exercise | null>;
  findByName(name: string): Promise<Exercise | null>;
  upsertByName(input: ExerciseInput): Promise<Exercise>;
  deactivate(id: number): Promise<void>;
}
