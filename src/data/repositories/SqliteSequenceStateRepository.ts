import type { Database } from '../database/Database';
import type { SequenceStateRepository } from '../../domain/sequence/SequenceStateRepository';
import type { ProgramSequenceState } from '../../domain/sequence/types';
import { nowLocalIso, type Clock } from '../../utils/localDate';
import { guard, ValidationError } from './errors';

export class SqliteSequenceStateRepository implements SequenceStateRepository {
  constructor(
    private readonly db: Database,
    private readonly clock?: Clock,
  ) {}

  async get(programId: number): Promise<ProgramSequenceState | null> {
    const r = await this.db.getFirst<{ program_id: number; current_position: number }>(
      'SELECT program_id, current_position FROM program_sequence_state WHERE program_id = ?',
      [programId],
    );
    return r ? { programId: r.program_id, currentPosition: r.current_position } : null;
  }

  async upsert(programId: number, currentPosition: number) {
    if (!Number.isInteger(currentPosition) || currentPosition < 1) {
      throw new ValidationError('Posição inválida');
    }
    await guard(() =>
      this.db.run(
        `INSERT INTO program_sequence_state (program_id, current_position, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(program_id) DO UPDATE SET
           current_position = excluded.current_position, updated_at = excluded.updated_at`,
        [programId, currentPosition, nowLocalIso(this.clock)],
      ),
    );
  }
}
