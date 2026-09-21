export interface WeeklyScheduleEntry {
  programId: number;
  weekday: number;
  workoutId: number | null;
  optional: boolean;
  note: string | null;
}

export interface ProgramSequenceState {
  programId: number;
  currentPosition: number;
}

export interface WorkoutRef {
  id: number;
  programId: number;
  code: string;
  name: string;
  position: number;
}

export interface WeeklyDayEntry {
  weekday: number;
  workoutId: number | null;
  optional: boolean;
  note: string | null;
}

export interface SequenceContext {
  programId: number;
  workouts: WorkoutRef[];
  currentPosition: number | null;
  schedule: WeeklyDayEntry[];
  today: { weekday: number };
}

export type NoneReason = 'REST' | 'OPTIONAL_DAY' | 'NO_SCHEDULE' | 'NO_WORKOUTS';

export type NextWorkoutResult =
  | { kind: 'WORKOUT'; workout: WorkoutRef }
  | { kind: 'NONE'; reason: NoneReason; note: string | null };
