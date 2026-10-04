import type { BackupFileGateway } from '../../../src/application/BackupFileGateway';
import { ConfirmImportBackup } from '../../../src/application/ConfirmImportBackup';
import { createSequenceResolver } from '../../../src/application/composition';
import { ExportBackup } from '../../../src/application/ExportBackup';
import { GetNextWorkout } from '../../../src/application/GetNextWorkout';
import { GetStatistics } from '../../../src/application/GetStatistics';
import { ListHistory } from '../../../src/application/ListHistory';
import { PrepareImportBackup } from '../../../src/application/PrepareImportBackup';
import { BackupBlockedByInProgressSessionError } from '../../../src/domain/backup/types';
import { SqliteBackupRepository } from '../../../src/data/repositories/SqliteBackupRepository';
import { setupWorkout } from './workoutHelpers';

jest.setTimeout(30000);

function fakeGateway(overrides: Partial<BackupFileGateway> = {}) {
  const shared: { fileName: string; text: string }[] = [];
  const gateway: BackupFileGateway = {
    async shareBackup(fileName, text) {
      shared.push({ fileName, text });
    },
    async pickBackupText() {
      return null;
    },
    ...overrides,
  };
  return { gateway, shared };
}

async function fixture() {
  const s = await setupWorkout();
  const padrao = await s.use('Treino Padrão', 'CONTINUOUS');
  s.clock.set('2026-09-10T18:00:00-03:00');
  const a = await s.start(padrao, '1');
  const items = (await s.repos.sessions.getSession(a))!.exercises;
  await s.repos.sessions.setExerciseCompleted(a, items[0].exerciseId, true);
  await s.repos.sessions.setExerciseWeight(a, items[0].exerciseId, 32.5);
  s.clock.set('2026-09-10T19:05:00-03:00');
  await s.repos.sessions.finishSession(a);
  const backup = new SqliteBackupRepository(s.db, s.clock);
  return { s, padrao, backup };
}

const tables = async (s: Awaited<ReturnType<typeof setupWorkout>>) => ({
  sessions: await s.db.getAll('SELECT * FROM workout_session ORDER BY id'),
  items: await s.db.getAll('SELECT * FROM workout_session_exercise ORDER BY id'),
  seq: await s.db.getAll('SELECT * FROM program_sequence_state ORDER BY id'),
  settings: await s.db.getAll('SELECT * FROM app_settings'),
});

describe('exportar', () => {
  it('entrega ao gateway o nome com a data local e o JSON v1', async () => {
    const { s, backup } = await fixture();
    s.clock.set('2026-10-04T23:50:00-03:00');
    const { gateway, shared } = fakeGateway();

    await new ExportBackup({ backup, gateway, clock: s.clock }).execute();

    expect(shared).toHaveLength(1);
    expect(shared[0].fileName).toBe('gymflow-backup-2026-10-04.json');
    const doc = JSON.parse(shared[0].text);
    expect(doc).toMatchObject({
      format: 'gymflow-backup',
      schemaVersion: 1,
      exportedAt: '2026-10-04T23:50:00-03:00',
    });
    expect(doc.sessions).toHaveLength(1);
    expect(doc.sessions[0].exercises.find((e: { completed: boolean }) => e.completed).weight).toBe(
      32.5,
    );
  });

  it('exporta histórico vazio como arquivo válido e deixa a sessão em andamento de fora', async () => {
    const s = await setupWorkout();
    const padrao = await s.use('Treino Padrão', 'CONTINUOUS');
    await s.start(padrao, '1'); // em andamento
    const backup = new SqliteBackupRepository(s.db, s.clock);
    const { gateway, shared } = fakeGateway();

    await new ExportBackup({ backup, gateway, clock: s.clock }).execute();

    const doc = JSON.parse(shared[0].text);
    expect(doc.sessions).toEqual([]);
    expect(doc.sequenceState).toHaveLength(2);
    expect(doc.settings.activeProgram).toBe('Treino Padrão');
  });

  it('não altera nenhum dado e propaga a falha do gateway', async () => {
    const { s, backup } = await fixture();
    const before = await tables(s);
    const { gateway } = fakeGateway({
      async shareBackup() {
        throw new Error('sem compartilhamento');
      },
    });

    await expect(new ExportBackup({ backup, gateway, clock: s.clock }).execute()).rejects.toThrow(
      'sem compartilhamento',
    );
    expect(await tables(s)).toEqual(before);
  });
});

type Setup = Awaited<ReturnType<typeof setupWorkout>>;

/** Histórico rico: 2 programas, pesos, sequência fora do início e cronômetro configurado. */
async function richHistory() {
  const s = await setupWorkout();
  const padrao = await s.use('Treino Padrão', 'CONTINUOUS');
  s.clock.set('2026-09-10T18:00:00-03:00');
  const a = await s.start(padrao, '1');
  const items = (await s.repos.sessions.getSession(a))!.exercises;
  await s.repos.sessions.setExerciseCompleted(a, items[0].exerciseId, true);
  await s.repos.sessions.setExerciseWeight(a, items[0].exerciseId, 32.5);
  s.clock.set('2026-09-10T19:05:00-03:00');
  await s.repos.sessions.finishSession(a);
  const monstro = await s.use('Treino Monstro', 'CONTINUOUS');
  s.clock.set('2026-09-12T07:00:00-03:00');
  const b = await s.start(monstro, 'A');
  s.clock.set('2026-09-12T07:50:00-03:00');
  await s.repos.sessions.finishSession(b);
  await s.repos.sequenceState.upsert(padrao, 4);
  await s.repos.settings.save({
    activeProgramId: monstro,
    sequenceType: 'WEEKLY',
    restTimerEnabled: true,
    restTimerSeconds: 120,
  });
  s.clock.set('2026-09-20T10:00:00-03:00');
  return { s, padrao, monstro, first: items[0].exerciseId };
}

/** Tudo o que o usuário enxerga, sem ids de sessão (que mudam ao restaurar). */
async function observable(s: Setup, padrao: number, first: number) {
  const backup = new SqliteBackupRepository(s.db, s.clock);
  const stats = new GetStatistics({ sessions: s.repos.sessions, clock: s.clock });
  const { repos } = s;
  return {
    snapshot: await backup.readSnapshot(),
    history: (await new ListHistory(repos).execute()).map(({ sessionId: _id, ...rest }) => rest),
    weekStats: await stats.execute({ period: 'WEEK', programId: null }),
    monthStats: await stats.execute({ period: 'MONTH', programId: null }),
    yearStats: await stats.execute({ period: 'YEAR', programId: padrao }),
    next: await new GetNextWorkout({
      ...repos,
      resolver: createSequenceResolver(),
      clock: s.clock,
    }).execute(),
    lastWeight: await repos.sessions.getLastWeight(padrao, first),
  };
}

async function wipeUserData(s: Setup, padrao: number) {
  await s.db.run('DELETE FROM workout_session_exercise');
  await s.db.run('DELETE FROM workout_session');
  await s.repos.sequenceState.upsert(padrao, 1);
  await s.repos.settings.save({ activeProgramId: padrao, sequenceType: 'CONTINUOUS' });
}

describe('restaurar', () => {
  it('ida e volta: exportar, apagar e importar devolve tudo idêntico', async () => {
    const { s, padrao, first } = await richHistory();
    const backup = new SqliteBackupRepository(s.db, s.clock);
    const before = await observable(s, padrao, first);
    expect(before.lastWeight).toBe(32.5);
    expect(before.history).toHaveLength(2);

    const { gateway, shared } = fakeGateway();
    await new ExportBackup({ backup, gateway, clock: s.clock }).execute();
    await wipeUserData(s, padrao);
    expect((await observable(s, padrao, first)).history).toHaveLength(0);

    const picker = fakeGateway({ pickBackupText: async () => shared[0].text });
    const prepared = await new PrepareImportBackup({ backup, gateway: picker.gateway }).execute();
    if (prepared.status !== 'READY') throw new Error('esperava READY');
    expect(prepared.summary).toEqual({
      sessionCount: 2,
      firstDate: '2026-09-10',
      lastDate: '2026-09-12',
    });
    await new ConfirmImportBackup({ backup }).execute(prepared.document);

    expect(await observable(s, padrao, first)).toEqual(before);
  });

  it('importar duas vezes seguidas não duplica sessões', async () => {
    const { s, padrao, first } = await richHistory();
    const backup = new SqliteBackupRepository(s.db, s.clock);
    const { gateway, shared } = fakeGateway();
    await new ExportBackup({ backup, gateway, clock: s.clock }).execute();
    const before = await observable(s, padrao, first);
    const picker = fakeGateway({ pickBackupText: async () => shared[0].text });
    for (let i = 0; i < 2; i++) {
      const p = await new PrepareImportBackup({ backup, gateway: picker.gateway }).execute();
      if (p.status !== 'READY') throw new Error('esperava READY');
      await new ConfirmImportBackup({ backup }).execute(p.document);
    }
    expect(await observable(s, padrao, first)).toEqual(before);
  });

  it('cancelar o seletor não altera nada', async () => {
    const { s, padrao, first } = await richHistory();
    const backup = new SqliteBackupRepository(s.db, s.clock);
    const before = await observable(s, padrao, first);
    const prepared = await new PrepareImportBackup({
      backup,
      gateway: fakeGateway().gateway, // pickBackupText devolve null
    }).execute();
    expect(prepared).toEqual({ status: 'CANCELLED' });
    expect(await observable(s, padrao, first)).toEqual(before);
  });

  it('datas ficam como gravadas, sem deslocar o dia por fuso', async () => {
    const { s, padrao, first } = await richHistory();
    const backup = new SqliteBackupRepository(s.db, s.clock);
    const { gateway, shared } = fakeGateway();
    await new ExportBackup({ backup, gateway, clock: s.clock }).execute();
    await wipeUserData(s, padrao);
    const picker = fakeGateway({ pickBackupText: async () => shared[0].text });
    const p = await new PrepareImportBackup({ backup, gateway: picker.gateway }).execute();
    if (p.status !== 'READY') throw new Error('esperava READY');
    await new ConfirmImportBackup({ backup }).execute(p.document);
    const dates = (await observable(s, padrao, first)).snapshot.sessions.map((x) => x.startedAt);
    expect(dates).toEqual(['2026-09-10T18:00:00-03:00', '2026-09-12T07:00:00-03:00']);
  });
});

describe('proteção', () => {
  const gatewayWith = (text: string | null) =>
    fakeGateway({ pickBackupText: async () => text }).gateway;

  /** Documento v1 válido e completo, gerado pelo próprio app. */
  async function validText(s: Setup) {
    const backup = new SqliteBackupRepository(s.db, s.clock);
    const { gateway, shared } = fakeGateway();
    await new ExportBackup({ backup, gateway, clock: s.clock }).execute();
    return { backup, text: shared[0].text, doc: JSON.parse(shared[0].text) };
  }

  it.each([
    ['arquivo vazio', () => ''],
    ['texto qualquer (como uma imagem)', () => '\u0089PNG\r\n\u001a\n\u0000\u0000'],
    ['JSON truncado', (t: string) => t.slice(0, Math.floor(t.length / 2))],
    ['versão futura', (t: string) => t.replace('"schemaVersion": 1', '"schemaVersion": 99')],
    ['programa desconhecido', (t: string) => t.replaceAll('"Treino Monstro"', '"Treino Fantasma"')],
    [
      'exercício desconhecido',
      (t: string) => t.replace(/"exercise": "[^"]+"/, '"exercise": "exercicio inventado"'),
    ],
  ])('recusa %s e deixa os dados idênticos', async (_nome, mutate) => {
    const { s } = await richHistory();
    const { backup, text } = await validText(s);
    const before = await tables(s);

    await expect(
      new PrepareImportBackup({ backup, gateway: gatewayWith(mutate(text)) }).execute(),
    ).rejects.toThrow(expect.objectContaining({ name: 'BackupValidationError' }));

    expect(await tables(s)).toEqual(before);
  });

  it('posição de sequência fora do número de treinos é recusada', async () => {
    const { s } = await richHistory();
    const { backup, doc } = await validText(s);
    doc.sequenceState[0].currentPosition = 99;
    await expect(
      new PrepareImportBackup({ backup, gateway: gatewayWith(JSON.stringify(doc)) }).execute(),
    ).rejects.toThrow(expect.objectContaining({ kind: 'INVALID_VALUE' }));
  });

  it('com sessão em andamento bloqueia antes de abrir o seletor de arquivos', async () => {
    const { s, monstro } = await richHistory();
    const { backup, text } = await validText(s);
    await s.start(monstro, 'B'); // em andamento (o Monstro é o programa ativo)
    const picker = jest.fn(async () => text);
    const before = await tables(s);

    await expect(
      new PrepareImportBackup({
        backup,
        gateway: fakeGateway({ pickBackupText: picker }).gateway,
      }).execute(),
    ).rejects.toBeInstanceOf(BackupBlockedByInProgressSessionError);

    expect(picker).not.toHaveBeenCalled();
    expect(await tables(s)).toEqual(before);
  });

  it('sessão iniciada entre o resumo e a confirmação também bloqueia, sem alterar nada', async () => {
    const { s, monstro } = await richHistory();
    const { backup, text } = await validText(s);
    const prepared = await new PrepareImportBackup({
      backup,
      gateway: gatewayWith(text),
    }).execute();
    if (prepared.status !== 'READY') throw new Error('esperava READY');
    await s.start(monstro, 'B'); // iniciou depois do resumo
    const before = await tables(s);

    await expect(
      new ConfirmImportBackup({ backup }).execute(prepared.document),
    ).rejects.toBeInstanceOf(BackupBlockedByInProgressSessionError);
    expect(await tables(s)).toEqual(before);
  });

  it('falha no meio da gravação faz rollback e mantém o estado anterior', async () => {
    const { s } = await richHistory();
    const { backup, doc } = await validText(s);
    // 2ª sessão referencia um exercício inexistente: a 1ª já foi inserida quando a falha acontece
    doc.sessions[1].exercises = [{ exercise: 'exercicio inventado', completed: true, weight: 1 }];
    const before = await tables(s);

    await expect(new ConfirmImportBackup({ backup }).execute(doc)).rejects.toThrow();

    expect(await tables(s)).toEqual(before);
  });
});
