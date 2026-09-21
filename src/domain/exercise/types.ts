export interface Exercise {
  id: number;
  name: string;
  muscleGroup: string | null;
  primaryMuscle: string | null;
  secondaryMuscles: string | null;
  description: string | null;
  active: boolean;
}

export interface ExerciseInput {
  name: string;
  muscleGroup?: string | null;
  primaryMuscle?: string | null;
  secondaryMuscles?: string | null;
  description?: string | null;
}
