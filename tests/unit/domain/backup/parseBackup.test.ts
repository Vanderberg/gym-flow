import { parseBackup } from '../../../../src/domain/backup/parseBackup';

const valid = {
  format: 'gymflow-backup',
  schemaVersion: 1,
  exportedAt: '2026-10-04T10:00:00-03:00',
  settings: {
    activeProgram: 'Treino Monstro',
    sequenceType: 'WEEKLY',
    restTimerEnabled: true,
    restTimerSeconds: 120,
  },
  sequenceState: [{ program: 'Treino Padrão', currentPosition: 3 }],
  sessions: [
    {
      program: 'Treino Padrão',
      workout: '1',
      startedAt: '2026-09-28T18:00:00-03:00',
      finishedAt: '2026-09-28T19:05:00-03:00',
      completed: true,
      exercises: [
        { exercise: 'supino reto', completed: true, weight: 32.5 },
        { exercise: 'crucifixo', completed: false, weight: null },
      ],
    },
  ],
};

describe('parseBackup — arquivo válido', () => {
  it('devolve o documento v1 tipado', () => {
    expect(parseBackup(JSON.stringify(valid))).toEqual(valid);
  });

  it('aceita zero sessões', () => {
    const doc = parseBackup(JSON.stringify({ ...valid, sessions: [], sequenceState: [] }));
    expect(doc.sessions).toEqual([]);
  });

  it('ignora campos desconhecidos (compatibilidade dentro da mesma versão)', () => {
    const doc = parseBackup(
      JSON.stringify({
        ...valid,
        extra: 'x',
        settings: { ...valid.settings, novo: 1 },
        sessions: [{ ...valid.sessions[0], nota: 'y' }],
      }),
    );
    expect(doc).toEqual(valid);
    expect(doc).not.toHaveProperty('extra');
  });
});

const clone = () => JSON.parse(JSON.stringify(valid));
const parse = (doc: unknown) => parseBackup(JSON.stringify(doc));
const rejects = (doc: unknown, kind: string) =>
  expect(() => parse(doc)).toThrow(
    expect.objectContaining({ name: 'BackupValidationError', kind }),
  );

describe('parseBackup — formato', () => {
  it.each([
    ['vazio', ''],
    ['texto livre', 'olá, mundo'],
    ['JSON truncado', '{"format":"gymflow-backup","schemaVersion":1,'],
    ['raiz que não é objeto', '[1,2,3]'],
    ['null', 'null'],
    ['outro formato', '{"format":"outro","schemaVersion":1}'],
  ])('recusa %s como arquivo que não é backup', (_nome, text) => {
    expect(() => parseBackup(text)).toThrow(
      expect.objectContaining({ name: 'BackupValidationError', kind: 'INVALID_FORMAT' }),
    );
  });

  it('recusa versão do formato maior que a suportada', () => {
    rejects({ ...valid, schemaVersion: 2 }, 'UNSUPPORTED_VERSION');
    rejects({ ...valid, schemaVersion: 99 }, 'UNSUPPORTED_VERSION');
  });

  it.each([
    ['ausente', undefined],
    ['texto', '1'],
    ['fracionária', 1.5],
    ['zero', 0],
    ['negativa', -1],
  ])('recusa versão %s', (_nome, schemaVersion) => {
    rejects({ ...valid, schemaVersion }, 'INVALID_VALUE');
  });
});

describe('parseBackup — valores inválidos', () => {
  it.each(['settings', 'sequenceState', 'sessions', 'exportedAt'])(
    'recusa quando falta %s',
    (campo) => {
      const doc = clone();
      delete doc[campo];
      rejects(doc, 'INVALID_VALUE');
    },
  );

  it('recusa tipos errados nos campos', () => {
    const casos: ((d: ReturnType<typeof clone>) => void)[] = [
      (d) => (d.settings.activeProgram = 7),
      (d) => (d.settings.sequenceType = 'MENSAL'),
      (d) => (d.settings.restTimerEnabled = 'sim'),
      (d) => (d.sessions[0].completed = 'true'),
      (d) => (d.sessions[0].exercises = {}),
      (d) => (d.sessions[0].exercises[0].weight = '30'),
      (d) => (d.sequenceState = 'x'),
    ];
    for (const caso of casos) {
      const doc = clone();
      caso(doc);
      rejects(doc, 'INVALID_VALUE');
    }
  });

  it('recusa datas fora do formato local com deslocamento ou inexistentes', () => {
    for (const data of [
      '2026-09-28',
      '28/09/2026',
      '2026-09-28 18:00:00',
      '2026-13-40T18:00:00-03:00',
    ]) {
      const doc = clone();
      doc.sessions[0].startedAt = data;
      rejects(doc, 'INVALID_VALUE');
    }
  });

  it('recusa término antes do início', () => {
    const doc = clone();
    doc.sessions[0].finishedAt = '2026-09-28T17:00:00-03:00';
    rejects(doc, 'INVALID_VALUE');
  });

  it('recusa peso negativo', () => {
    const doc = clone();
    doc.sessions[0].exercises[0].weight = -1;
    rejects(doc, 'INVALID_VALUE');
  });

  it('aceita peso zero', () => {
    const doc = clone();
    doc.sessions[0].exercises[0].weight = 0;
    expect(parse(doc).sessions[0].exercises[0].weight).toBe(0);
  });

  it('recusa tempo de descanso e posição de sequência inválidos', () => {
    for (const seconds of [0, -5, 1.5]) {
      const doc = clone();
      doc.settings.restTimerSeconds = seconds;
      rejects(doc, 'INVALID_VALUE');
    }
    for (const position of [0, -1, 2.5]) {
      const doc = clone();
      doc.sequenceState[0].currentPosition = position;
      rejects(doc, 'INVALID_VALUE');
    }
  });

  it('recusa programa repetido em sequenceState', () => {
    const doc = clone();
    doc.sequenceState.push({ program: 'Treino Padrão', currentPosition: 1 });
    rejects(doc, 'INVALID_VALUE');
  });

  it('recusa exercício repetido na mesma sessão', () => {
    const doc = clone();
    doc.sessions[0].exercises.push({ exercise: 'supino reto', completed: false, weight: null });
    rejects(doc, 'INVALID_VALUE');
  });

  it('recusa sessão repetida (mesmo programa, treino e início)', () => {
    const doc = clone();
    doc.sessions.push(clone().sessions[0]);
    rejects(doc, 'INVALID_VALUE');
  });

  it('aceita sessões do mesmo treino em inícios diferentes', () => {
    const doc = clone();
    const outra = clone().sessions[0];
    outra.startedAt = '2026-09-29T18:00:00-03:00';
    outra.finishedAt = '2026-09-29T19:00:00-03:00';
    doc.sessions.push(outra);
    expect(parse(doc).sessions).toHaveLength(2);
  });
});
