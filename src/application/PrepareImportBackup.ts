import { checkBackupReferences } from '../domain/backup/checkBackupReferences';
import { parseBackup } from '../domain/backup/parseBackup';
import type { BackupRepository } from '../domain/backup/BackupRepository';
import { summarizeBackup } from '../domain/backup/summarizeBackup';
import {
  BackupBlockedByInProgressSessionError,
  type BackupDocument,
  type BackupSummary,
} from '../domain/backup/types';
import type { BackupFileGateway } from './BackupFileGateway';

export type PrepareImportResult =
  { status: 'CANCELLED' } | { status: 'READY'; document: BackupDocument; summary: BackupSummary };

/**
 * BL-141: bloqueia com treino em andamento, lê e valida o arquivo escolhido e devolve o resumo.
 * Nunca altera dados.
 */
export class PrepareImportBackup {
  constructor(private readonly deps: { backup: BackupRepository; gateway: BackupFileGateway }) {}

  async execute(): Promise<PrepareImportResult> {
    const { backup, gateway } = this.deps;
    // antes de abrir o seletor: não faz sentido escolher um arquivo que não pode ser restaurado
    if (await backup.hasInProgressSession()) throw new BackupBlockedByInProgressSessionError();
    const text = await gateway.pickBackupText();
    if (text === null) return { status: 'CANCELLED' };
    const document = parseBackup(text);
    checkBackupReferences(document, await backup.readCatalog());
    return { status: 'READY', document, summary: summarizeBackup(document) };
  }
}
