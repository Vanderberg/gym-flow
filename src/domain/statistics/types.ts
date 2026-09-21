export type Period = 'WEEK' | 'MONTH' | 'QUARTER' | 'SEMESTER' | 'YEAR';

export interface PeriodRange {
  period: Period;
  start: string;
  end: string;
  label: string;
}

export interface StatsResult {
  count: number;
  weeksTouched: number;
  weeklyAverage: number | null;
  averageIntervalDays: number | null;
}

export interface StatisticsView extends StatsResult {
  range: PeriodRange;
  programFilter: number | null;
  programs: { id: number; name: string }[];
  hasAnySession: boolean;
}
