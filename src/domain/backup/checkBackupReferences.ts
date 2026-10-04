import { BackupValidationError, type BackupCatalog, type BackupDocument } from './types';

const unknown = (what: string) =>
  new BackupValidationError(
    'UNKNOWN_REFERENCE',
    `${what} do backup não existe nesta versão do app`,
  );

/**
 * Confere as referências do documento contra o catálogo do app (programas, treinos por programa,
 * exercícios e quantidade de treinos). Lança `BackupValidationError`; nunca toca o banco.
 */
export function checkBackupReferences(document: BackupDocument, catalog: BackupCatalog): void {
  if (!catalog.programs.has(document.settings.activeProgram)) throw unknown('O programa ativo');

  for (const state of document.sequenceState) {
    const workouts = catalog.workoutsByProgram.get(state.program);
    if (!workouts) throw unknown('Um programa da sequência');
    if (state.currentPosition > workouts.size) {
      throw new BackupValidationError(
        'INVALID_VALUE',
        'A posição da sequência é maior que a quantidade de treinos do programa',
      );
    }
  }

  for (const session of document.sessions) {
    const workouts = catalog.workoutsByProgram.get(session.program);
    if (!workouts) throw unknown('Um programa');
    if (!workouts.has(session.workout)) throw unknown('Um treino');
    for (const line of session.exercises) {
      if (!catalog.exerciseKeys.has(line.exercise)) throw unknown('Um exercício');
    }
  }
}
