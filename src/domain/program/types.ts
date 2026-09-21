import type { Exercise } from '../exercise/types';

export interface TrainingProgram {
  id: number;
  name: string;
  description: string | null;
  homeSuggestion: string | null;
  active: boolean;
}

export interface Workout {
  id: number;
  programId: number;
  code: string;
  name: string;
  position: number;
  warmupNote: string | null;
  active: boolean;
}

export interface WorkoutExercise {
  id: number;
  workoutId: number;
  exerciseId: number;
  displayOrder: number;
  prescription: string | null;
  technique: string | null;
  notes: string | null;
  exercise: Exercise;
}

export interface WorkoutDetail extends Workout {
  exercises: WorkoutExercise[];
}

export interface ProgramInput {
  name: string;
  description?: string | null;
  homeSuggestion?: string | null;
}

export interface WorkoutInput {
  programId: number;
  code: string;
  name: string;
  position: number;
  warmupNote?: string | null;
}

export interface WorkoutExerciseInput {
  workoutId: number;
  exerciseId: number;
  displayOrder: number;
  prescription?: string | null;
  technique?: string | null;
  notes?: string | null;
}
