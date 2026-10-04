import type { SequenceType } from '../settings/types';

export const BACKUP_FORMAT = 'gymflow-backup';
/** Versão do formato de troca do arquivo de backup (ver contracts/backup-file-v1.md). */
export const BACKUP_SCHEMA_VERSION = 1;

export interface BackupSessionExercise {
  /** `exercise.name_key` */
  exercise: string;
  completed: boolean;
  weight: number | null;
}

export interface BackupSession {
  /** `training_program.name` */
  program: string;
  /** `workout.code`, dentro do programa */
  workout: string;
  startedAt: string;
  finishedAt: string;
  completed: boolean;
  exercises: BackupSessionExercise[];
}

export interface BackupSequenceState {
  program: string;
  currentPosition: number;
}

export interface BackupSettings {
  activeProgram: string;
  sequenceType: SequenceType;
  restTimerEnabled: boolean;
  restTimerSeconds: number;
}

/** Dados do usuário lidos do banco, já com chaves estáveis (sem ids autoincrementais). */
export interface BackupSnapshot {
  settings: BackupSettings;
  sequenceState: BackupSequenceState[];
  sessions: BackupSession[];
}

export interface BackupDocument extends BackupSnapshot {
  format: typeof BACKUP_FORMAT;
  schemaVersion: number;
  exportedAt: string;
}

/** Chaves válidas no app, para validar as referências de um backup. */
export interface BackupCatalog {
  programs: Set<string>;
  /** programa → códigos de treino; o tamanho do conjunto é a quantidade de treinos. */
  workoutsByProgram: Map<string, Set<string>>;
  exerciseKeys: Set<string>;
}

export interface BackupSummary {
  sessionCount: number;
  /** AAAA-MM-DD locais, fatiadas da string ISO; nulas sem sessões. */
  firstDate: string | null;
  lastDate: string | null;
}

export type BackupErrorKind =
  'INVALID_FORMAT' | 'INVALID_VALUE' | 'UNSUPPORTED_VERSION' | 'UNKNOWN_REFERENCE';

export class BackupValidationError extends Error {
  constructor(
    readonly kind: BackupErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'BackupValidationError';
  }
}

/** A restauração não pode acontecer enquanto houver um treino em andamento. */
export class BackupBlockedByInProgressSessionError extends Error {
  constructor() {
    super('Há um treino em andamento');
    this.name = 'BackupBlockedByInProgressSessionError';
  }
}
