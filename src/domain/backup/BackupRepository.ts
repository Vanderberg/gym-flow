import type { BackupCatalog, BackupDocument, BackupSnapshot } from './types';

export interface BackupRepository {
  /** Sessões finalizadas, estado de sequência e configurações, com chaves estáveis. */
  readSnapshot(): Promise<BackupSnapshot>;
  readCatalog(): Promise<BackupCatalog>;
  hasInProgressSession(): Promise<boolean>;
  /**
   * Substitui sessões finalizadas, estado de sequência e configurações pelos do documento, em uma
   * única transação. Lança se houver sessão em andamento; qualquer falha faz rollback.
   */
  replaceAll(document: BackupDocument): Promise<void>;
}
