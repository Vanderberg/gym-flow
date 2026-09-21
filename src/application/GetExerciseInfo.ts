import { NotFoundError } from '../data/repositories/errors';
import type { ExerciseRepository } from '../domain/exercise/ExerciseRepository';
import { buildMuscleInfo } from '../domain/help/muscleInfo';
import type { MuscleInfo } from '../domain/help/types';

/** Somente leitura (BL-113/114). */
export class GetExerciseInfo {
  constructor(private readonly deps: { exercises: ExerciseRepository }) {}

  async execute(exerciseId: number): Promise<MuscleInfo> {
    const e = await this.deps.exercises.getById(exerciseId);
    if (!e) throw new NotFoundError('Exercício não encontrado');
    return buildMuscleInfo(e);
  }
}
