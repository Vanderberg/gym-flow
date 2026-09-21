import type { Database } from '../database/Database';
import type { SettingsRepository } from '../../domain/settings/SettingsRepository';
import type { AppSettings, AppSettingsInput } from '../../domain/settings/types';
import { nowLocalIso, type Clock } from '../../utils/localDate';
import { guard, NotFoundError, ValidationError } from './errors';
import { fromBoolean, toBoolean } from './mappers';

interface Row {
  active_program_id: number;
  sequence_type: 'CONTINUOUS' | 'WEEKLY';
  rest_timer_enabled: number;
  rest_timer_seconds: number;
}

export class SqliteSettingsRepository implements SettingsRepository {
  constructor(
    private readonly db: Database,
    private readonly clock?: Clock,
  ) {}

  async get(): Promise<AppSettings | null> {
    const r = await this.db.getFirst<Row>('SELECT * FROM app_settings WHERE id = 1');
    return r
      ? {
          activeProgramId: r.active_program_id,
          sequenceType: r.sequence_type,
          restTimerEnabled: toBoolean(r.rest_timer_enabled),
          restTimerSeconds: r.rest_timer_seconds,
        }
      : null;
  }

  async save(input: AppSettingsInput): Promise<AppSettings> {
    if (input.sequenceType !== 'CONTINUOUS' && input.sequenceType !== 'WEEKLY') {
      throw new ValidationError('Tipo de sequência inválido');
    }
    const seconds = input.restTimerSeconds ?? 90;
    if (!Number.isInteger(seconds) || seconds <= 0) {
      throw new ValidationError('Tempo de descanso inválido');
    }
    await guard(() =>
      this.db.run(
        `INSERT INTO app_settings (id, active_program_id, sequence_type, rest_timer_enabled, rest_timer_seconds, updated_at)
         VALUES (1, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           active_program_id = excluded.active_program_id, sequence_type = excluded.sequence_type,
           rest_timer_enabled = excluded.rest_timer_enabled,
           rest_timer_seconds = excluded.rest_timer_seconds, updated_at = excluded.updated_at`,
        [
          input.activeProgramId,
          input.sequenceType,
          fromBoolean(input.restTimerEnabled ?? false),
          seconds,
          nowLocalIso(this.clock),
        ],
      ),
    );
    const s = await this.get();
    if (!s) throw new NotFoundError('Configurações não encontradas');
    return s;
  }
}
