import { backupFileName } from '../domain/backup/backupFileName';
import type { BackupRepository } from '../domain/backup/BackupRepository';
import { buildBackupDocument } from '../domain/backup/buildBackupDocument';
import { nowLocalIso, type Clock } from '../utils/localDate';
import type { BackupFileGateway } from './BackupFileGateway';

/** BL-140: exporta o histórico para a folha de compartilhamento. Só lê; nunca altera dados. */
export class ExportBackup {
  constructor(
    private readonly deps: { backup: BackupRepository; gateway: BackupFileGateway; clock?: Clock },
  ) {}

  async execute(): Promise<void> {
    const clock = this.deps.clock ?? (() => new Date());
    const snapshot = await this.deps.backup.readSnapshot();
    const document = buildBackupDocument(snapshot, nowLocalIso(clock));
    await this.deps.gateway.shareBackup(backupFileName(clock()), JSON.stringify(document, null, 2));
  }
}
