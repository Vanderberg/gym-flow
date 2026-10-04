import type { BackupFileGateway } from '../../../src/application/BackupFileGateway';
import { ConfirmImportBackup } from '../../../src/application/ConfirmImportBackup';
import { ExportBackup } from '../../../src/application/ExportBackup';
import { PrepareImportBackup } from '../../../src/application/PrepareImportBackup';
import { SqliteBackupRepository } from '../../../src/data/repositories/SqliteBackupRepository';
import { setupWorkout } from './workoutHelpers';

jest.setTimeout(30000);

/** FR-007 / SC-006 e parecer LGPD: sem rede e sem escrever o conteúdo do backup em log. */
describe('backup — privacidade', () => {
  const consoleMethods = ['log', 'info', 'warn', 'error', 'debug'] as const;

  afterEach(() => jest.restoreAllMocks());

  it('exportar e importar não usam a rede nem escrevem nada em log', async () => {
    const s = await setupWorkout();
    const padrao = await s.use('Treino Padrão', 'CONTINUOUS');
    s.clock.set('2026-09-10T18:00:00-03:00');
    const a = await s.start(padrao, '1');
    const first = (await s.repos.sessions.getSession(a))!.exercises[0].exerciseId;
    await s.repos.sessions.setExerciseWeight(a, first, 77.7);
    s.clock.set('2026-09-10T19:00:00-03:00');
    await s.repos.sessions.finishSession(a);

    const network = [
      jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('rede proibida')),
      ...(typeof XMLHttpRequest === 'undefined'
        ? []
        : [
            jest.spyOn(XMLHttpRequest.prototype, 'open').mockImplementation(() => {
              throw new Error('rede proibida');
            }),
          ]),
    ];
    const logs = consoleMethods.map((m) => jest.spyOn(console, m).mockImplementation(() => {}));

    const backup = new SqliteBackupRepository(s.db, s.clock);
    let shared = '';
    const gateway: BackupFileGateway = {
      async shareBackup(_name, text) {
        shared = text;
      },
      async pickBackupText() {
        return shared;
      },
    };
    await new ExportBackup({ backup, gateway, clock: s.clock }).execute();
    const prepared = await new PrepareImportBackup({ backup, gateway }).execute();
    if (prepared.status !== 'READY') throw new Error('esperava READY');
    await new ConfirmImportBackup({ backup }).execute(prepared.document);

    expect(shared).toContain('77.7'); // o conteúdo existe...
    for (const spy of network) expect(spy).not.toHaveBeenCalled();
    for (const spy of logs) expect(spy).not.toHaveBeenCalled(); // ...mas nunca vai para log
  });
});
