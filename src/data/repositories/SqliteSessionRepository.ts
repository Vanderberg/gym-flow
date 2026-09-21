import type { Database } from '../database/Database';
import type { FinishedSessionDetail, SessionSummary } from '../../domain/history/types';
import type { SessionRepository } from '../../domain/session/SessionRepository';
import type {
  WorkoutSession,
  WorkoutSessionDetail,
  WorkoutSessionExercise,
} from '../../domain/session/types';
import { nowLocalIso, type Clock } from '../../utils/localDate';
import { ConflictError, guard, NotFoundError, ValidationError } from './errors';
import { toBoolean } from './mappers';

interface SessionRow {
  id: number;
  program_id: number;
  workout_id: number;
  started_at: string;
  finished_at: string | null;
  completed: number;
}
interface LineRow {
  id: number;
  session_id: number;
  exercise_id: number;
  completed: number;
  weight: number | null;
}

const mapSession = (r: SessionRow): WorkoutSession => ({
  id: r.id,
  programId: r.program_id,
  workoutId: r.workout_id,
  startedAt: r.started_at,
  finishedAt: r.finished_at,
  completed: toBoolean(r.completed),
});
const mapLine = (r: LineRow): WorkoutSessionExercise => ({
  id: r.id,
  sessionId: r.session_id,
  exerciseId: r.exercise_id,
  completed: toBoolean(r.completed),
  weight: r.weight,
});

export class SqliteSessionRepository implements SessionRepository {
  constructor(
    private readonly db: Database,
    private readonly clock?: Clock,
  ) {}

  private async detail(row: SessionRow | null): Promise<WorkoutSessionDetail | null> {
    if (!row) return null;
    const lines = await this.db.getAll<LineRow>(
      `SELECT wse.* FROM workout_session_exercise wse
         LEFT JOIN workout_exercise we ON we.workout_id = ? AND we.exercise_id = wse.exercise_id
        WHERE wse.session_id = ? ORDER BY we.display_order, wse.id`,
      [row.workout_id, row.id],
    );
    return { ...mapSession(row), exercises: lines.map(mapLine) };
  }

  async startSession(programId: number, workoutId: number): Promise<WorkoutSession> {
    const w = await this.db.getFirst<{ program_id: number; active: number; p_active: number }>(
      `SELECT w.program_id, w.active, p.active AS p_active FROM workout w
         JOIN training_program p ON p.id = w.program_id WHERE w.id = ?`,
      [workoutId],
    );
    if (!w || w.program_id !== programId) {
      throw new ValidationError('Treino não pertence ao programa');
    }
    if (!w.active || !w.p_active) throw new ValidationError('Programa ou treino inativo');
    const now = nowLocalIso(this.clock);
    const id = await guard(() =>
      this.db.transaction(async (tx) => {
        const open = await tx.getFirst('SELECT id FROM workout_session WHERE finished_at IS NULL');
        if (open) throw new ConflictError('Já existe sessão em andamento');
        await tx.run(
          `INSERT INTO workout_session (program_id, workout_id, started_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?)`,
          [programId, workoutId, now, now, now],
        );
        const created = await tx.getFirst<{ id: number }>('SELECT last_insert_rowid() AS id');
        const sid = created!.id;
        const items = await tx.getAll<{ exercise_id: number }>(
          'SELECT exercise_id FROM workout_exercise WHERE workout_id = ? ORDER BY display_order, id',
          [workoutId],
        );
        for (const it of items) {
          await tx.run(
            'INSERT INTO workout_session_exercise (session_id, exercise_id, updated_at) VALUES (?, ?, ?)',
            [sid, it.exercise_id, now],
          );
        }
        return sid;
      }),
    );
    const s = await this.db.getFirst<SessionRow>('SELECT * FROM workout_session WHERE id = ?', [
      id,
    ]);
    return mapSession(s!);
  }

  getInProgress() {
    return this.db
      .getFirst<SessionRow>('SELECT * FROM workout_session WHERE finished_at IS NULL')
      .then((r) => this.detail(r));
  }

  getSession(id: number) {
    return this.db
      .getFirst<SessionRow>('SELECT * FROM workout_session WHERE id = ?', [id])
      .then((r) => this.detail(r));
  }

  async listFinished(opts?: { programId?: number }) {
    const filter = opts?.programId !== undefined;
    const rows = await this.db.getAll<SessionRow>(
      `SELECT * FROM workout_session WHERE finished_at IS NOT NULL
         ${filter ? 'AND program_id = ?' : ''}
         ORDER BY finished_at DESC, id DESC`,
      filter ? [opts.programId as number] : [],
    );
    return rows.map(mapSession);
  }

  async listFinishedSummaries(opts?: { programId?: number }): Promise<SessionSummary[]> {
    const filter = opts?.programId !== undefined;
    const rows = await this.db.getAll<{
      id: number;
      program_id: number;
      program_name: string;
      code: string;
      workout_name: string;
      started_at: string;
      finished_at: string;
      done: number;
      total: number;
    }>(
      `SELECT s.id, s.program_id, p.name AS program_name, w.code, w.name AS workout_name,
              s.started_at, s.finished_at,
              COALESCE(SUM(wse.completed), 0) AS done, COUNT(wse.id) AS total
         FROM workout_session s
         JOIN training_program p ON p.id = s.program_id
         JOIN workout w ON w.id = s.workout_id
         LEFT JOIN workout_session_exercise wse ON wse.session_id = s.id
        WHERE s.finished_at IS NOT NULL ${filter ? 'AND s.program_id = ?' : ''}
        GROUP BY s.id
        ORDER BY s.finished_at DESC, s.id DESC`,
      filter ? [opts.programId as number] : [],
    );
    return rows.map((r) => ({
      sessionId: r.id,
      programId: r.program_id,
      programName: r.program_name,
      workoutCode: r.code,
      workoutName: r.workout_name,
      startedAt: r.started_at,
      finishedAt: r.finished_at,
      done: r.done,
      total: r.total,
    }));
  }

  async getFinishedDetail(sessionId: number): Promise<FinishedSessionDetail | null> {
    const s = await this.db.getFirst<{
      id: number;
      program_id: number;
      program_name: string;
      workout_id: number;
      code: string;
      workout_name: string;
      started_at: string;
      finished_at: string;
    }>(
      `SELECT s.id, s.program_id, p.name AS program_name, s.workout_id, w.code,
              w.name AS workout_name, s.started_at, s.finished_at
         FROM workout_session s
         JOIN training_program p ON p.id = s.program_id
         JOIN workout w ON w.id = s.workout_id
        WHERE s.id = ? AND s.finished_at IS NOT NULL`,
      [sessionId],
    );
    if (!s) return null;
    const rows = await this.db.getAll<{
      exercise_id: number;
      name: string;
      completed: number;
      weight: number | null;
      prescription: string | null;
      technique: string | null;
      notes: string | null;
      display_order: number | null;
      we_id: number | null;
    }>(
      `SELECT wse.exercise_id, e.name, wse.completed, wse.weight,
              we.prescription, we.technique, we.notes, we.display_order, we.id AS we_id
         FROM workout_session_exercise wse
         JOIN exercise e ON e.id = wse.exercise_id
         LEFT JOIN workout_exercise we ON we.workout_id = ? AND we.exercise_id = wse.exercise_id
        WHERE wse.session_id = ?`,
      [s.workout_id, s.id],
    );
    return {
      sessionId: s.id,
      programId: s.program_id,
      programName: s.program_name,
      workoutId: s.workout_id,
      workoutCode: s.code,
      workoutName: s.workout_name,
      startedAt: s.started_at,
      finishedAt: s.finished_at,
      rows: rows.map((r) => ({
        exerciseId: r.exercise_id,
        name: r.name,
        completed: toBoolean(r.completed),
        weight: r.weight,
        prescription: r.prescription,
        technique: r.technique,
        notes: r.notes,
        displayOrder: r.display_order,
        inWorkout: r.we_id !== null,
      })),
    };
  }

  listProgramsWithFinished(): Promise<{ id: number; name: string }[]> {
    return this.db.getAll<{ id: number; name: string }>(
      `SELECT DISTINCT p.id, p.name FROM training_program p
         JOIN workout_session s ON s.program_id = p.id AND s.finished_at IS NOT NULL
        ORDER BY p.name`,
    );
  }

  private async updateLine(
    sessionId: number,
    exerciseId: number,
    col: string,
    value: number | null,
  ) {
    const line = await this.db.getFirst<{ id: number }>(
      'SELECT id FROM workout_session_exercise WHERE session_id = ? AND exercise_id = ?',
      [sessionId, exerciseId],
    );
    if (!line) throw new NotFoundError('Exercício não pertence à sessão');
    await guard(() =>
      this.db.run(`UPDATE workout_session_exercise SET ${col} = ?, updated_at = ? WHERE id = ?`, [
        value,
        nowLocalIso(this.clock),
        line.id,
      ]),
    );
  }

  setExerciseCompleted(sessionId: number, exerciseId: number, completed: boolean) {
    return this.updateLine(sessionId, exerciseId, 'completed', completed ? 1 : 0);
  }

  async setExerciseWeight(sessionId: number, exerciseId: number, weight: number | null) {
    if (weight !== null && (!Number.isFinite(weight) || weight < 0)) {
      throw new ValidationError('Peso deve ser vazio ou maior ou igual a zero');
    }
    await this.updateLine(sessionId, exerciseId, 'weight', weight);
  }

  async finishSession(sessionId: number, finishedAt?: string) {
    const now = nowLocalIso(this.clock);
    await guard(() =>
      this.db.run(
        'UPDATE workout_session SET finished_at = ?, completed = 1, updated_at = ? WHERE id = ?',
        [finishedAt ?? now, now, sessionId],
      ),
    );
  }

  async discardSession(sessionId: number) {
    await guard(() =>
      this.db.transaction(async (tx) => {
        const s = await tx.getFirst<{ finished_at: string | null }>(
          'SELECT finished_at FROM workout_session WHERE id = ?',
          [sessionId],
        );
        if (!s) throw new NotFoundError('Sessão não encontrada');
        if (s.finished_at !== null) {
          throw new ConflictError('Sessão finalizada não pode ser descartada');
        }
        await tx.run('DELETE FROM workout_session_exercise WHERE session_id = ?', [sessionId]);
        await tx.run('DELETE FROM workout_session WHERE id = ?', [sessionId]);
      }),
    );
  }

  async getLastWeight(programId: number, exerciseId: number) {
    const r = await this.db.getFirst<{ weight: number }>(
      `SELECT wse.weight FROM workout_session_exercise wse
         JOIN workout_session s ON s.id = wse.session_id
        WHERE s.program_id = ? AND s.finished_at IS NOT NULL
          AND wse.exercise_id = ? AND wse.weight IS NOT NULL
        ORDER BY s.finished_at DESC, s.id DESC LIMIT 1`,
      [programId, exerciseId],
    );
    return r ? r.weight : null;
  }
}
