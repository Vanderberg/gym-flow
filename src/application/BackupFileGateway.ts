/** Porta para o sistema de arquivos do aparelho (compartilhar e escolher o arquivo de backup). */
export interface BackupFileGateway {
  /** Entrega o texto do backup pela folha de compartilhamento do sistema. */
  shareBackup(fileName: string, text: string): Promise<void>;
  /** Texto do arquivo escolhido pelo usuário; `null` se ele cancelar. */
  pickBackupText(): Promise<string | null>;
}
