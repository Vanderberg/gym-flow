import { summarizeBackup } from '../../../../src/domain/backup/summarizeBackup';
import type { BackupDocument, BackupSession } from '../../../../src/domain/backup/types';

const session = (startedAt: string): BackupSession => ({
  program: 'Treino Padrão',
  workout: '1',
  startedAt,
  finishedAt: startedAt,
  completed: true,
  exercises: [],
});

const doc = (sessions: BackupSession[]): BackupDocument => ({
  format: 'gymflow-backup',
  schemaVersion: 1,
  exportedAt: 'x',
  settings: {
    activeProgram: 'Treino Padrão',
    sequenceType: 'CONTINUOUS',
    restTimerEnabled: false,
    restTimerSeconds: 90,
  },
  sequenceState: [],
  sessions,
});

describe('summarizeBackup', () => {
  it('conta as sessões e devolve primeira e última data local, em qualquer ordem', () => {
    const summary = summarizeBackup(
      doc([
        session('2026-09-30T23:30:00-03:00'),
        session('2026-09-01T07:00:00-03:00'),
        session('2026-09-15T18:00:00-03:00'),
      ]),
    );
    expect(summary).toEqual({
      sessionCount: 3,
      firstDate: '2026-09-01',
      lastDate: '2026-09-30',
    });
  });

  it('usa o dia local da string, sem conversão de fuso', () => {
    // 23:30 em -03:00 é 02:30 UTC do dia seguinte: o dia local continua 30/09
    expect(summarizeBackup(doc([session('2026-09-30T23:30:00-03:00')])).lastDate).toBe(
      '2026-09-30',
    );
  });

  it('sem sessões: quantidade 0 e datas nulas', () => {
    expect(summarizeBackup(doc([]))).toEqual({ sessionCount: 0, firstDate: null, lastDate: null });
  });
});
