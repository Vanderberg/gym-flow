export interface WorkoutSession {
  id: number;
  programId: number;
  workoutId: number;
  startedAt: string;
  finishedAt: string | null;
  completed: boolean;
}

export interface WorkoutSessionExercise {
  id: number;
  sessionId: number;
  exerciseId: number;
  completed: boolean;
  weight: number | null;
}

export interface WorkoutSessionDetail extends WorkoutSession {
  exercises: WorkoutSessionExercise[];
}
