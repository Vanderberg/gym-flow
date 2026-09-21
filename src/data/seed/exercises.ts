import { MONSTRO_EXERCISES } from './exercisesMonstro';
import { PADRAO_EXERCISES } from './exercisesPadrao';
import { SHARED_EXERCISES } from './exercisesShared';
import type { SeedExercise } from './types';

export const EXERCISE_CATALOG: SeedExercise[] = [
  ...SHARED_EXERCISES,
  ...PADRAO_EXERCISES,
  ...MONSTRO_EXERCISES,
];
