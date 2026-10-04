import { buildBackupDocument } from '../../../../src/domain/backup/buildBackupDocument';
import type { BackupSnapshot } from '../../../../src/domain/backup/types';

const settings = {
  activeProgram: 'Treino Monstro',
  sequenceType: 'WEEKLY' as const,
  restTimerEnabled: true,
  restTimerSeconds: 90,
};
const session = (startedAt: string, weight: number | null = null) => ({
  program: 'Treino Padrão',
  workout: '1',
  startedAt,
  finishedAt: startedAt.replace('18:00', '19:05'),
  completed: true,
  exercises: [{ exercise: 'supino reto', completed: true, weight }],
});

describe('buildBackupDocument', () => {
  it('monta o cabeçalho do formato v1 e preserva os dados', () => {
    const snapshot: BackupSnapshot = {
      settings,
      sequenceState: [{ program: 'Treino Padrão', currentPosition: 3 }],
      sessions: [session('2026-09-28T18:00:00-03:00', 32.5)],
    };
    const doc = buildBackupDocument(snapshot, '2026-10-04T10:00:00-03:00');
    expect(doc).toEqual({
      format: 'gymflow-backup',
      schemaVersion: 1,
      exportedAt: '2026-10-04T10:00:00-03:00',
      ...snapshot,
    });
  });

  it('ordena sessões por início e estado de sequência por nome do programa', () => {
    const doc = buildBackupDocument(
      {
        settings,
        sequenceState: [
          { program: 'Treino Padrão', currentPosition: 2 },
          { program: 'Treino Monstro', currentPosition: 1 },
        ],
        sessions: [session('2026-09-30T18:00:00-03:00'), session('2026-09-28T18:00:00-03:00')],
      },
      'x',
    );
    expect(doc.sessions.map((s) => s.startedAt)).toEqual([
      '2026-09-28T18:00:00-03:00',
      '2026-09-30T18:00:00-03:00',
    ]);
    expect(doc.sequenceState.map((s) => s.program)).toEqual(['Treino Monstro', 'Treino Padrão']);
  });

  it('aceita zero sessões e peso nulo, e não altera a entrada', () => {
    const empty: BackupSnapshot = { settings, sequenceState: [], sessions: [] };
    expect(buildBackupDocument(empty, 'x').sessions).toEqual([]);
    const withNull: BackupSnapshot = {
      ...empty,
      sessions: [session('2026-09-28T18:00:00-03:00')],
    };
    const copy = JSON.stringify(withNull);
    const doc = buildBackupDocument(withNull, 'x');
    expect(doc.sessions[0].exercises[0].weight).toBeNull();
    expect(JSON.stringify(withNull)).toBe(copy);
  });
});
