import type { BackupRepository } from '../domain/backup/BackupRepository';
import type { BackupDocument } from '../domain/backup/types';

/** BL-142: substitui histórico, sequência e configurações pelo conteúdo já validado do backup. */
export class ConfirmImportBackup {
  constructor(private readonly deps: { backup: BackupRepository }) {}

  async execute(document: BackupDocument): Promise<void> {
    await this.deps.backup.replaceAll(document);
  }
}
