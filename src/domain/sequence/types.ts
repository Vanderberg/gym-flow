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
