import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { BackupFileGateway } from '../../application/BackupFileGateway';
import { BackupValidationError } from '../../domain/backup/types';

/** Limite defensivo: um backup de anos de treino tem poucas centenas de KB. */
export const MAX_BACKUP_BYTES = 10 * 1024 * 1024;

export class SharingUnavailableError extends Error {
  constructor() {
    super('Compartilhamento indisponível neste aparelho');
    this.name = 'SharingUnavailableError';
  }
}

/** Compartilhamento e seleção do arquivo de backup via Expo. Nunca registra o conteúdo em log. */
export class ExpoBackupFileGateway implements BackupFileGateway {
  async shareBackup(fileName: string, text: string): Promise<void> {
    if (!(await Sharing.isAvailableAsync())) throw new SharingUnavailableError();
    const file = new File(Paths.cache, fileName);
    try {
      if (file.exists) file.delete();
      file.create();
      await file.write(text);
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        UTI: 'public.json',
        dialogTitle: 'Exportar dados',
      });
    } finally {
      // o backup não fica guardado no app: some do cache mesmo se o compartilhamento falhar
      try {
        if (file.exists) file.delete();
      } catch {
        // limpeza best-effort
      }
    }
  }

  async pickBackupText(): Promise<string | null> {
    const picked = await File.pickFileAsync();
    if (picked.canceled) return null;
    const file = picked.result;
    if ((file.size ?? 0) > MAX_BACKUP_BYTES) {
      throw new BackupValidationError('INVALID_FORMAT', 'Arquivo grande demais para ser um backup');
    }
    return file.text();
  }
}
