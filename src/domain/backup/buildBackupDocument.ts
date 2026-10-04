import {
  BACKUP_FORMAT,
  BACKUP_SCHEMA_VERSION,
  type BackupDocument,
  type BackupSnapshot,
} from './types';

/** Snapshot do banco → documento v1, com ordenação estável (sessões por início, sequência por nome). */
export function buildBackupDocument(snapshot: BackupSnapshot, exportedAt: string): BackupDocument {
  return {
    format: BACKUP_FORMAT,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt,
    settings: snapshot.settings,
    sequenceState: [...snapshot.sequenceState].sort((a, b) => a.program.localeCompare(b.program)),
    sessions: [...snapshot.sessions].sort((a, b) => a.startedAt.localeCompare(b.startedAt)),
  };
}
