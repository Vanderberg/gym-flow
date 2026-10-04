import { File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  ExpoBackupFileGateway,
  MAX_BACKUP_BYTES,
  SharingUnavailableError,
} from '../../../src/data/backup/ExpoBackupFileGateway';
import { BackupValidationError } from '../../../src/domain/backup/types';

describe('ExpoBackupFileGateway.shareBackup', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
  });

  it('grava o arquivo no cache, compartilha como JSON e apaga o arquivo depois', async () => {
    const write = jest.spyOn(File.prototype, 'write');
    const del = jest.spyOn(File.prototype, 'delete');
    const create = jest.spyOn(File.prototype, 'create');

    await new ExpoBackupFileGateway().shareBackup('gymflow-backup-2026-10-04.json', '{"a":1}');

    expect(create).toHaveBeenCalledTimes(1);
    expect(write).toHaveBeenCalledWith('{"a":1}');
    const [uri, options] = (Sharing.shareAsync as jest.Mock).mock.calls[0];
    expect(uri).toContain('gymflow-backup-2026-10-04.json');
    expect(options).toMatchObject({ mimeType: 'application/json', UTI: 'public.json' });
    expect(del).toHaveBeenCalled();
  });

  it('apaga o arquivo temporário mesmo quando o compartilhamento falha', async () => {
    (Sharing.shareAsync as jest.Mock).mockRejectedValue(new Error('falhou'));
    const del = jest.spyOn(File.prototype, 'delete');

    await expect(new ExpoBackupFileGateway().shareBackup('x.json', '{}')).rejects.toThrow('falhou');
    expect(del).toHaveBeenCalled();
  });

  it('informa quando o compartilhamento não está disponível, sem gravar arquivo', async () => {
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);
    const create = jest.spyOn(File.prototype, 'create');

    await expect(new ExpoBackupFileGateway().shareBackup('x.json', '{}')).rejects.toBeInstanceOf(
      SharingUnavailableError,
    );
    expect(create).not.toHaveBeenCalled();
  });
});

// pickFileAsync tem sobrecargas; o spy tipa só a última (múltiplos arquivos), então tipamos à mão.
const mockPick = (value: unknown) =>
  (jest.spyOn(File, 'pickFileAsync') as unknown as jest.Mock).mockResolvedValue(value);

describe('ExpoBackupFileGateway.pickBackupText', () => {
  beforeEach(() => jest.restoreAllMocks());

  it('devolve null quando o usuário cancela o seletor', async () => {
    mockPick({ result: null, canceled: true });
    expect(await new ExpoBackupFileGateway().pickBackupText()).toBeNull();
  });

  it('lê o texto do arquivo escolhido', async () => {
    const file = new File('file:///cache/escolhido.json');
    Object.assign(file, { size: 20 });
    jest.spyOn(file, 'text').mockResolvedValue('{"ok":true}');
    mockPick({ result: file, canceled: false });
    expect(await new ExpoBackupFileGateway().pickBackupText()).toBe('{"ok":true}');
  });

  it('recusa arquivo maior que o limite sem ler o conteúdo', async () => {
    const file = new File('file:///cache/grande.bin');
    Object.assign(file, { size: MAX_BACKUP_BYTES + 1 });
    const text = jest.spyOn(file, 'text');
    mockPick({ result: file, canceled: false });
    await expect(new ExpoBackupFileGateway().pickBackupText()).rejects.toBeInstanceOf(
      BackupValidationError,
    );
    expect(text).not.toHaveBeenCalled();
  });
});
