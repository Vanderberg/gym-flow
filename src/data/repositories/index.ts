import type { Database } from '../database/Database';
import type { Clock } from '../../utils/localDate';
import { SqliteExerciseRepository } from './SqliteExerciseRepository';
import { SqliteProgramRepository } from './SqliteProgramRepository';
import { SqliteScheduleRepository } from './SqliteScheduleRepository';
import { SqliteSequenceStateRepository } from './SqliteSequenceStateRepository';
import { SqliteSessionRepository } from './SqliteSessionRepository';
import { SqliteSettingsRepository } from './SqliteSettingsRepository';

/** Constrói todos os repositórios sobre um Database (inclusive um transacional). */
export function createRepositories(db: Database, clock?: Clock) {
  return {
    exercises: new SqliteExerciseRepository(db, clock),
    programs: new SqliteProgramRepository(db, clock),
    schedule: new SqliteScheduleRepository(db),
    sequenceState: new SqliteSequenceStateRepository(db, clock),
    sessions: new SqliteSessionRepository(db, clock),
    settings: new SqliteSettingsRepository(db, clock),
  };
}

export * from './errors';
