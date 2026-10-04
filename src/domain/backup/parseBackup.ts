import {
  BACKUP_FORMAT,
  BACKUP_SCHEMA_VERSION,
  BackupValidationError,
  type BackupDocument,
  type BackupSequenceState,
  type BackupSession,
  type BackupSessionExercise,
  type BackupSettings,
} from './types';

type Json = Record<string, unknown>;

const invalid = (what: string) =>
  new BackupValidationError('INVALID_VALUE', `Valor inválido no backup: ${what}`);

function asObject(value: unknown, what: string): Json {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw invalid(what);
  return value as Json;
}

function asArray(value: unknown, what: string): unknown[] {
  if (!Array.isArray(value)) throw invalid(what);
  return value;
}

function asString(value: unknown, what: string): string {
  if (typeof value !== 'string') throw invalid(what);
  return value;
}

function asBoolean(value: unknown, what: string): boolean {
  if (typeof value !== 'boolean') throw invalid(what);
  return value;
}

function asNumber(value: unknown, what: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw invalid(what);
  return value;
}

function asPositiveInt(value: unknown, what: string): number {
  const n = asNumber(value, what);
  if (!Number.isInteger(n) || n < 1) throw invalid(what);
  return n;
}

const LOCAL_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;

/** Data/hora local com deslocamento (formato de `nowLocalIso`) e existente no calendário. */
function asLocalIso(value: unknown, what: string): string {
  const text = asString(value, what);
  if (!LOCAL_ISO.test(text) || Number.isNaN(Date.parse(text))) throw invalid(what);
  return text;
}

function asWeight(value: unknown): number {
  const n = asNumber(value, 'weight');
  if (n < 0) throw invalid('weight');
  return n;
}

function parseSettings(value: unknown): BackupSettings {
  const o = asObject(value, 'settings');
  const sequenceType = o.sequenceType;
  if (sequenceType !== 'CONTINUOUS' && sequenceType !== 'WEEKLY') throw invalid('sequenceType');
  return {
    activeProgram: asString(o.activeProgram, 'activeProgram'),
    sequenceType,
    restTimerEnabled: asBoolean(o.restTimerEnabled, 'restTimerEnabled'),
    restTimerSeconds: asPositiveInt(o.restTimerSeconds, 'restTimerSeconds'),
  };
}

function parseSequenceState(value: unknown): BackupSequenceState {
  const o = asObject(value, 'sequenceState');
  return {
    program: asString(o.program, 'sequenceState.program'),
    currentPosition: asPositiveInt(o.currentPosition, 'currentPosition'),
  };
}

function parseExercise(value: unknown): BackupSessionExercise {
  const o = asObject(value, 'exercises');
  return {
    exercise: asString(o.exercise, 'exercise'),
    completed: asBoolean(o.completed, 'exercise.completed'),
    weight: o.weight === null ? null : asWeight(o.weight),
  };
}

function parseSession(value: unknown): BackupSession {
  const o = asObject(value, 'sessions');
  const startedAt = asLocalIso(o.startedAt, 'startedAt');
  const finishedAt = asLocalIso(o.finishedAt, 'finishedAt');
  if (Date.parse(finishedAt) < Date.parse(startedAt)) throw invalid('finishedAt');
  const exercises = asArray(o.exercises, 'session.exercises').map(parseExercise);
  if (new Set(exercises.map((e) => e.exercise)).size !== exercises.length) {
    throw invalid('exercício repetido na sessão');
  }
  return {
    program: asString(o.program, 'session.program'),
    workout: asString(o.workout, 'session.workout'),
    startedAt,
    finishedAt,
    completed: asBoolean(o.completed, 'session.completed'),
    exercises,
  };
}

/** Texto do arquivo → documento v1 tipado. Lança `BackupValidationError`; nunca toca o banco. */
export function parseBackup(text: string): BackupDocument {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new BackupValidationError('INVALID_FORMAT', 'O arquivo não é um backup do Gym Flow');
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new BackupValidationError('INVALID_FORMAT', 'O arquivo não é um backup do Gym Flow');
  }
  const o = raw as Json;
  if (o.format !== BACKUP_FORMAT) {
    throw new BackupValidationError('INVALID_FORMAT', 'O arquivo não é um backup do Gym Flow');
  }
  const schemaVersion = asPositiveInt(o.schemaVersion, 'schemaVersion');
  if (schemaVersion > BACKUP_SCHEMA_VERSION) {
    throw new BackupValidationError(
      'UNSUPPORTED_VERSION',
      'O backup é de uma versão mais recente do app',
    );
  }
  const sequenceState = asArray(o.sequenceState, 'sequenceState').map(parseSequenceState);
  if (new Set(sequenceState.map((x) => x.program)).size !== sequenceState.length) {
    throw invalid('programa repetido na sequência');
  }
  const sessions = asArray(o.sessions, 'sessions').map(parseSession);
  const identities = sessions.map((x) => `${x.program}${x.workout}${x.startedAt}`);
  if (new Set(identities).size !== sessions.length) throw invalid('sessão repetida');
  return {
    format: BACKUP_FORMAT,
    schemaVersion,
    exportedAt: asString(o.exportedAt, 'exportedAt'),
    settings: parseSettings(o.settings),
    sequenceState,
    sessions,
  };
}
