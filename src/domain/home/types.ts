import type { SequenceType } from '../settings/types';
import type { NextWorkoutResult, WeeklyDayEntry } from '../sequence/types';

export interface WorkoutSummary {
  id: number;
  code: string;
  name: string;
  exerciseCount: number;
}

export type SequenceRailStep = { code: string; state: 'DONE' | 'CURRENT' | 'PENDING' };
export type WeekStripDay = {
  weekday: number;
  label: string;
  isToday: boolean;
  hasSession: boolean;
};

export type HomeIndicator =
  | { kind: 'RAIL'; steps: SequenceRailStep[] }
  | { kind: 'WEEK'; days: WeekStripDay[] }
  | { kind: 'NONE' };

export type HomeCard =
  | { kind: 'IN_PROGRESS'; sessionId: number; workoutName: string; done: number; total: number }
  | { kind: 'WORKOUT'; workout: WorkoutSummary; dayLabel: string | null; doneToday: boolean }
  | { kind: 'REST'; dayLabel: string; canBrowseWorkouts: true }
  | { kind: 'OPTIONAL_DAY'; dayLabel: string; note: string | null; canBrowseWorkouts: true }
  | { kind: 'NO_SCHEDULE' }
  | { kind: 'NO_WORKOUTS' };

export interface HomeView {
  program: { id: number; name: string };
  sequenceType: SequenceType;
  indicator: HomeIndicator;
  card: HomeCard;
  suggestion: string | null;
  localDate: string;
  browsableWorkouts: WorkoutSummary[];
}

export interface HomeWorkoutInput extends WorkoutSummary {
  programId: number;
  position: number;
}

export interface HomeViewInput {
  program: { id: number; name: string; homeSuggestion: string | null };
  sequenceType: SequenceType;
  workouts: HomeWorkoutInput[];
  currentPosition: number | null;
  schedule: WeeklyDayEntry[];
  next: NextWorkoutResult;
  localDate: string;
  todayWeekday: number;
  /** Sessões finalizadas do programa ativo (data local de término). */
  finished: { workoutId: number; localDate: string; weekday: number }[];
  /** Datas locais (AAAA-MM-DD) da semana corrente, segunda a domingo (índice 0 = segunda). */
  weekDates: string[];
  inProgress: { sessionId: number; workoutName: string; done: number; total: number } | null;
}
