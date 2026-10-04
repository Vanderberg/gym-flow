import { checkBackupReferences } from '../../../../src/domain/backup/checkBackupReferences';
import type { BackupCatalog, BackupDocument } from '../../../../src/domain/backup/types';

const catalog: BackupCatalog = {
  programs: new Set(['Treino Padrão', 'Treino Monstro']),
  workoutsByProgram: new Map([
    ['Treino Padrão', new Set(['1', '2', '3', '4', '5'])],
    ['Treino Monstro', new Set(['A', 'B', 'C', 'D'])],
  ]),
  exerciseKeys: new Set(['supino reto', 'crucifixo']),
};

const doc = (): BackupDocument => ({
  format: 'gymflow-backup',
  schemaVersion: 1,
  exportedAt: 'x',
  settings: {
    activeProgram: 'Treino Monstro',
    sequenceType: 'WEEKLY',
    restTimerEnabled: false,
    restTimerSeconds: 90,
  },
  sequenceState: [{ program: 'Treino Padrão', currentPosition: 5 }],
  sessions: [
    {
      program: 'Treino Padrão',
      workout: '1',
      startedAt: '2026-09-28T18:00:00-03:00',
      finishedAt: '2026-09-28T19:00:00-03:00',
      completed: true,
      exercises: [{ exercise: 'supino reto', completed: true, weight: 30 }],
    },
  ],
});

const expectKind = (d: BackupDocument, kind: string) =>
  expect(() => checkBackupReferences(d, catalog)).toThrow(
    expect.objectContaining({ name: 'BackupValidationError', kind }),
  );

describe('checkBackupReferences', () => {
  it('aceita um documento cujas referências existem no app', () => {
    expect(() => checkBackupReferences(doc(), catalog)).not.toThrow();
  });

  it('recusa programa ativo desconhecido', () => {
    const d = doc();
    d.settings.activeProgram = 'Treino Fantasma';
    expectKind(d, 'UNKNOWN_REFERENCE');
  });

  it('recusa programa desconhecido na sequência e na sessão', () => {
    const a = doc();
    a.sequenceState[0].program = 'Treino Fantasma';
    expectKind(a, 'UNKNOWN_REFERENCE');
    const b = doc();
    b.sessions[0].program = 'Treino Fantasma';
    expectKind(b, 'UNKNOWN_REFERENCE');
  });

  it('recusa treino que não existe dentro do programa da sessão', () => {
    const d = doc();
    d.sessions[0].workout = 'A'; // existe no Monstro, não no Padrão
    expectKind(d, 'UNKNOWN_REFERENCE');
  });

  it('recusa exercício desconhecido', () => {
    const d = doc();
    d.sessions[0].exercises[0].exercise = 'exercicio inventado';
    expectKind(d, 'UNKNOWN_REFERENCE');
  });

  it('recusa posição de sequência maior que a quantidade de treinos do programa', () => {
    const d = doc();
    d.sequenceState[0].currentPosition = 6; // o Padrão tem 5 treinos
    expectKind(d, 'INVALID_VALUE');
  });

  it('aceita a posição igual à quantidade de treinos', () => {
    const d = doc();
    d.sequenceState[0].currentPosition = 5;
    expect(() => checkBackupReferences(d, catalog)).not.toThrow();
  });
});
