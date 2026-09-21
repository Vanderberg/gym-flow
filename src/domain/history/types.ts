export interface SessionSummary {
  sessionId: number;
  programId: number;
  programName: string;
  workoutCode: string;
  workoutName: string;
  startedAt: string;
  finishedAt: string;
  done: number;
  total: number;
}

export interface HistoryItem extends SessionSummary {
  localDate: string;
  durationLabel: string;
  complete: boolean;
}

export interface DetailRow {
  exerciseId: number;
  name: string;
  completed: boolean;
  weight: number | null;
  prescription: string | null;
  technique: string | null;
  notes: string | null;
  inWorkout: boolean;
}

export interface SessionDetail {
  sessionId: number;
  program: { id: number; name: string };
  workout: { id: number; code: string; name: string };
  finishedAt: string;
  localDate: string;
  durationLabel: string;
  done: number;
  total: number;
  rows: DetailRow[];
}

export interface FinishedSessionDetail {
  sessionId: number;
  programId: number;
  programName: string;
  workoutId: number;
  workoutCode: string;
  workoutName: string;
  startedAt: string;
  finishedAt: string;
  rows: {
    exerciseId: number;
    name: string;
    completed: boolean;
    weight: number | null;
    prescription: string | null;
    technique: string | null;
    notes: string | null;
    displayOrder: number | null;
    inWorkout: boolean;
  }[];
}

export interface EditChanges {
  rows: { exerciseId: number; completed?: boolean; weight?: number | null }[];
}

export interface MonthSection {
  key: string;
  label: string;
  items: HistoryItem[];
}
