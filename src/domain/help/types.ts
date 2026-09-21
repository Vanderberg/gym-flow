export interface LegendEntry {
  title: string;
  description: string;
}

export interface MuscleInfo {
  exerciseId: number;
  name: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  description: string;
}

export type HelpSheetState =
  { kind: 'NONE' } | { kind: 'LEGEND'; term?: string } | { kind: 'EXERCISE'; exerciseId: number };
