import type { Technique } from '../../constants/techniques';
import type { SequenceType } from '../../domain/settings/types';

export interface SeedExercise {
  name: string;
  muscleGroup: string;
  primaryMuscle: string;
  secondaryMuscles: string;
  description: string;
}

export interface SeedWorkoutExercise {
  exercise: string;
  prescription: string;
  technique: Technique | null;
  notes: string | null;
}

export interface SeedWorkout {
  code: string;
  name: string;
  items: SeedWorkoutExercise[];
}

export interface SeedScheduleDay {
  weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  workout: string | null;
  optional: boolean;
  note: string | null;
}

export interface SeedProgram {
  name: string;
  description: string | null;
  homeSuggestion: string | null;
  isDefault: boolean;
  workouts: SeedWorkout[];
  schedule: SeedScheduleDay[] | null;
}

export interface SeedData {
  exercises: SeedExercise[];
  programs: SeedProgram[];
  defaultSequenceType: SequenceType;
}
