import { backupFileName } from '../../../../src/domain/backup/backupFileName';

describe('backupFileName', () => {
  it('usa a data local com zeros à esquerda e extensão .json', () => {
    expect(backupFileName(new Date(2026, 0, 5, 10, 0, 0))).toBe('gymflow-backup-2026-01-05.json');
  });

  it('não desloca o dia perto da meia-noite local', () => {
    expect(backupFileName(new Date(2026, 9, 4, 23, 59, 59))).toBe('gymflow-backup-2026-10-04.json');
    expect(backupFileName(new Date(2026, 9, 4, 0, 0, 1))).toBe('gymflow-backup-2026-10-04.json');
  });
});
