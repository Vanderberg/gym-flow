import type { BackupRepository } from '../../domain/backup/BackupRepository';
import {
  BackupBlockedByInProgressSessionError,
  BackupValidationError,
  type BackupCatalog,
  type BackupDocument,
  type BackupSession,
  type BackupSnapshot,
} from '../../domain/backup/types';
import type { SequenceType } from '../../domain/settings/types';
import { nowLocalIso, type Clock } from '../../utils/localDate';
import type { Database } from '../database/Database';
import { guard } from './errors';
import { fromBoolean, toBoolean } from './mappers';

interface SessionRow {
  id: number;
  program: string;
  workout: string;
  started_at: string;
  finished_at: string;
  completed: number;
}

interface LineRow {
  session_id: number;
  name_key: string;
  completed: number;
  weight: number | null;
}

export class SqliteBackupRepository implements BackupRepository {
  constructor(
    private readonly db: Database,
    private readonly clock?: Clock,
  ) {}

  async readSnapshot(): Promise<BackupSnapshot> {
    const settings = await this.db.getFirst<{
      program: string;
      sequence_type: SequenceType;
      rest_timer_enabled: number;
      rest_timer_seconds: number;
    }>(
      `SELECT p.name AS program, s.sequence_type, s.rest_timer_enabled, s.rest_timer_seconds
         FROM app_settings s JOIN training_program p ON p.id = s.active_program_id
        WHERE s.id = 1`,
    );
    if (!settings) throw new Error('Configurações não encontradas');

    const sequence = await this.db.getAll<{ program: string; current_position: number }>(
      `SELECT p.name AS program, s.current_position
         FROM program_sequence_state s JOIN training_program p ON p.id = s.program_id
        ORDER BY p.name`,
    );

    const sessionRows = await this.db.getAll<SessionRow>(
      `SELECT ws.id, p.name AS program, w.code AS workout, ws.started_at, ws.finished_at,
              ws.completed
         FROM workout_session ws
         JOIN training_program p ON p.id = ws.program_id
         JOIN workout w ON w.id = ws.workout_id
        WHERE ws.finished_at IS NOT NULL
        ORDER BY ws.started_at, ws.id`,
    );
    const lineRows = await this.db.getAll<LineRow>(
      `SELECT wse.session_id, e.name_key, wse.completed, wse.weight
         FROM workout_session_exercise wse
         JOIN workout_session ws ON ws.id = wse.session_id
         JOIN exercise e ON e.id = wse.exercise_id
        WHERE ws.finished_at IS NOT NULL
        ORDER BY wse.session_id, wse.id`,
    );
    const linesBySession = new Map<number, BackupSession['exercises']>();
    for (const l of lineRows) {
      const list = linesBySession.get(l.session_id) ?? [];
      list.push({ exercise: l.name_key, completed: toBoolean(l.completed), weight: l.weight });
      linesBySession.set(l.session_id, list);
    }

    return {
      settings: {
        activeProgram: settings.program,
        sequenceType: settings.sequence_type,
        restTimerEnabled: toBoolean(settings.rest_timer_enabled),
        restTimerSeconds: settings.rest_timer_seconds,
      },
      sequenceState: sequence.map((s) => ({
        program: s.program,
        currentPosition: s.current_position,
      })),
      sessions: sessionRows.map((r) => ({
        program: r.program,
        workout: r.workout,
        startedAt: r.started_at,
        finishedAt: r.finished_at,
        completed: toBoolean(r.completed),
        exercises: linesBySession.get(r.id) ?? [],
      })),
    };
  }

  async readCatalog(): Promise<BackupCatalog> {
    const workouts = await this.db.getAll<{ program: string; code: string }>(
      `SELECT p.name AS program, w.code
         FROM workout w JOIN training_program p ON p.id = w.program_id`,
    );
    const programs = await this.db.getAll<{ name: string }>('SELECT name FROM training_program');
    const exercises = await this.db.getAll<{ name_key: string }>('SELECT name_key FROM exercise');

    const workoutsByProgram = new Map<string, Set<string>>();
    for (const p of programs) workoutsByProgram.set(p.name, new Set());
    for (const w of workouts) workoutsByProgram.get(w.program)?.add(w.code);

    return {
      programs: new Set(programs.map((p) => p.name)),
      workoutsByProgram,
      exerciseKeys: new Set(exercises.map((e) => e.name_key)),
    };
  }

  async hasInProgressSession(): Promise<boolean> {
    const row = await this.db.getFirst<{ n: number }>(
      'SELECT COUNT(*) AS n FROM workout_session WHERE finished_at IS NULL',
    );
    return (row?.n ?? 0) > 0;
  }

  async replaceAll(document: BackupDocument): Promise<void> {
    const now = nowLocalIso(this.clock);
    await guard(() =>
      this.db.transaction(async (tx) => {
        const open = await tx.getFirst<{ n: number }>(
          'SELECT COUNT(*) AS n FROM workout_session WHERE finished_at IS NULL',
        );
        if ((open?.n ?? 0) > 0) throw new BackupBlockedByInProgressSessionError();

        const programIds = await idsByKey(tx, 'SELECT id, name AS k FROM training_program');
        const exerciseIds = await idsByKey(tx, 'SELECT id, name_key AS k FROM exercise');
        const workoutIds = await idsByKey(
          tx,
          `SELECT w.id, p.name || char(31) || w.code AS k
             FROM workout w JOIN training_program p ON p.id = w.program_id`,
        );
        const need = (map: Map<string, number>, key: string, what: string): number => {
          const id = map.get(key);
          if (id === undefined) {
            throw new BackupValidationError('UNKNOWN_REFERENCE', `${what} desconhecido no backup`);
          }
          return id;
        };

        await tx.run('DELETE FROM workout_session_exercise');
        await tx.run('DELETE FROM workout_session');

        // posição de cada programa: a do arquivo, ou a primeira se o arquivo não a traz
        const positions = new Map(
          document.sequenceState.map((x) => [x.program, x.currentPosition]),
        );
        for (const [name, id] of programIds) {
          await tx.run(
            `INSERT INTO program_sequence_state (program_id, current_position, updated_at)
             VALUES (?, ?, ?)
             ON CONFLICT(program_id) DO UPDATE SET
               current_position = excluded.current_position, updated_at = excluded.updated_at`,
            [id, positions.get(name) ?? 1, now],
          );
        }

        const s = document.settings;
        await tx.run(
          `INSERT INTO app_settings (id, active_program_id, sequence_type, rest_timer_enabled, rest_timer_seconds, updated_at)
           VALUES (1, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             active_program_id = excluded.active_program_id, sequence_type = excluded.sequence_type,
             rest_timer_enabled = excluded.rest_timer_enabled,
             rest_timer_seconds = excluded.rest_timer_seconds, updated_at = excluded.updated_at`,
          [
            need(programIds, s.activeProgram, 'Programa'),
            s.sequenceType,
            fromBoolean(s.restTimerEnabled),
            s.restTimerSeconds,
            now,
          ],
        );

        for (const session of document.sessions) {
          await tx.run(
            `INSERT INTO workout_session
               (program_id, workout_id, started_at, finished_at, completed, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              need(programIds, session.program, 'Programa'),
              need(workoutIds, `${session.program}${session.workout}`, 'Treino'),
              session.startedAt,
              session.finishedAt,
              fromBoolean(session.completed),
              session.startedAt,
              session.finishedAt,
            ],
          );
          const created = await tx.getFirst<{ id: number }>('SELECT last_insert_rowid() AS id');
          for (const line of session.exercises) {
            await tx.run(
              `INSERT INTO workout_session_exercise
                 (session_id, exercise_id, completed, weight, updated_at)
               VALUES (?, ?, ?, ?, ?)`,
              [
                created!.id,
                need(exerciseIds, line.exercise, 'Exercício'),
                fromBoolean(line.completed),
                line.weight,
                session.finishedAt,
              ],
            );
          }
        }
      }),
    );
  }
}

async function idsByKey(db: Database, sql: string): Promise<Map<string, number>> {
  const rows = await db.getAll<{ id: number; k: string }>(sql);
  return new Map(rows.map((r) => [r.k, r.id]));
}
