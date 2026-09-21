import type { Database } from '../database/Database';
import type { ScheduleRepository } from '../../domain/sequence/ScheduleRepository';
import type { WeeklyScheduleEntry } from '../../domain/sequence/types';
import { guard, ValidationError } from './errors';
import { fromBoolean, toBoolean } from './mappers';

interface Row {
  program_id: number;
  weekday: number;
  workout_id: number | null;
  optional: number;
  note: string | null;
}
const map = (r: Row): WeeklyScheduleEntry => ({
  programId: r.program_id,
  weekday: r.weekday,
  workoutId: r.workout_id,
  optional: toBoolean(r.optional),
  note: r.note,
});

export class SqliteScheduleRepository implements ScheduleRepository {
  constructor(private readonly db: Database) {}

  async getSchedule(programId: number) {
    const rows = await this.db.getAll<Row>(
      'SELECT * FROM weekly_schedule WHERE program_id = ? ORDER BY weekday',
      [programId],
    );
    return rows.map(map);
  }

  async getEntry(programId: number, weekday: number) {
    const r = await this.db.getFirst<Row>(
      'SELECT * FROM weekly_schedule WHERE program_id = ? AND weekday = ?',
      [programId, weekday],
    );
    return r ? map(r) : null;
  }

  async upsertEntry(input: WeeklyScheduleEntry) {
    if (!Number.isInteger(input.weekday) || input.weekday < 1 || input.weekday > 7) {
      throw new ValidationError('Dia da semana inválido');
    }
    if (input.workoutId !== null) {
      const w = await this.db.getFirst<{ program_id: number }>(
        'SELECT program_id FROM workout WHERE id = ?',
        [input.workoutId],
      );
      if (!w || w.program_id !== input.programId) {
        throw new ValidationError('Treino não pertence ao programa');
      }
    }
    await guard(() =>
      this.db.run(
        `INSERT INTO weekly_schedule (program_id, weekday, workout_id, optional, note)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(program_id, weekday) DO UPDATE SET
           workout_id = excluded.workout_id, optional = excluded.optional, note = excluded.note`,
        [input.programId, input.weekday, input.workoutId, fromBoolean(input.optional), input.note],
      ),
    );
  }
}
