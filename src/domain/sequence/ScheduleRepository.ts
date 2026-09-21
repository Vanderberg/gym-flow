import type { WeeklyScheduleEntry } from './types';

export interface ScheduleRepository {
  getSchedule(programId: number): Promise<WeeklyScheduleEntry[]>;
  getEntry(programId: number, weekday: number): Promise<WeeklyScheduleEntry | null>;
  upsertEntry(input: WeeklyScheduleEntry): Promise<void>;
}
