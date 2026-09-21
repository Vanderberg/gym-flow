import type { MuscleInfo } from './types';

const NOT_INFORMED = 'Não informado';
const filled = (v: string | null): string => (v && v.trim() ? v.trim() : NOT_INFORMED);

export function buildMuscleInfo(exercise: {
  id: number;
  name: string;
  primaryMuscle: string | null;
  secondaryMuscles: string | null;
  description: string | null;
}): MuscleInfo {
  const secondary = (exercise.secondaryMuscles ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    exerciseId: exercise.id,
    name: exercise.name,
    primaryMuscle: filled(exercise.primaryMuscle),
    secondaryMuscles: secondary.length ? secondary : [NOT_INFORMED],
    description: filled(exercise.description),
  };
}
