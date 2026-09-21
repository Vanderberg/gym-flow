export type WeightParse = { ok: true; value: number | null } | { ok: false; reason: 'INVALID' };

export interface WorkoutScreenItem {
  exerciseId: number;
  name: string;
  displayOrder: number;
  prescription: string | null;
  technique: string | null;
  notes: string | null;
  completed: boolean;
  weight: number | null;
  lastWeight: number | null;
}

export interface WorkoutScreenView {
  sessionId: number;
  program: { id: number; name: string };
  workout: { id: number; code: string; name: string; position: number; warmupNote: string | null };
  items: WorkoutScreenItem[];
  progress: { done: number; total: number };
}

export interface FinishSummary {
  sessionId: number;
  done: number;
  total: number;
  durationMinutes: number;
}
