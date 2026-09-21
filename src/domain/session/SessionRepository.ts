import type { WorkoutSession, WorkoutSessionDetail } from './types';

export interface SessionRepository {
  startSession(programId: number, workoutId: number): Promise<WorkoutSession>;
  getInProgress(): Promise<WorkoutSessionDetail | null>;
  getSession(id: number): Promise<WorkoutSessionDetail | null>;
  listFinished(opts?: { programId?: number }): Promise<WorkoutSession[]>;
  setExerciseCompleted(sessionId: number, exerciseId: number, completed: boolean): Promise<void>;
  setExerciseWeight(sessionId: number, exerciseId: number, weight: number | null): Promise<void>;
  finishSession(sessionId: number, finishedAt?: string): Promise<void>;
  discardSession(sessionId: number): Promise<void>;
  getLastWeight(programId: number, exerciseId: number): Promise<number | null>;
}
