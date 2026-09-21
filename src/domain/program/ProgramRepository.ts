import type {
  ProgramInput,
  TrainingProgram,
  Workout,
  WorkoutDetail,
  WorkoutExerciseInput,
  WorkoutInput,
} from './types';

export interface ProgramRepository {
  listPrograms(opts?: { includeInactive?: boolean }): Promise<TrainingProgram[]>;
  getProgram(id: number): Promise<TrainingProgram | null>;
  listWorkouts(programId: number): Promise<Workout[]>;
  getWorkoutWithExercises(workoutId: number): Promise<WorkoutDetail | null>;
  upsertProgram(input: ProgramInput): Promise<TrainingProgram>;
  upsertWorkout(input: WorkoutInput): Promise<Workout>;
  upsertWorkoutExercise(input: WorkoutExerciseInput): Promise<void>;
  deactivateProgram(id: number): Promise<void>;
  deactivateWorkout(id: number): Promise<void>;
}
