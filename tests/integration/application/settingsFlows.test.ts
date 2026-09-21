import { GetNextWorkout } from '../../../src/application/GetNextWorkout';
import { GetProgramAgenda } from '../../../src/application/GetProgramAgenda';
import { ResetSequence } from '../../../src/application/ResetSequence';
import { SelectProgram } from '../../../src/application/SelectProgram';
import { SelectSequenceStrategy } from '../../../src/application/SelectSequenceStrategy';
import { DiscardInProgressSession } from '../../../src/application/DiscardInProgressSession';
import { createSequenceResolver } from '../../../src/application/composition';
import { SessionInProgressError } from '../../../src/application/errors';
import { bootstrapDatabase } from '../../../src/data/bootstrap';
import { createRepositories, NotFoundError, ValidationError } from '../../../src/data/repositories';
import type { SequenceType } from '../../../src/domain/settings/types';
import { createBetterSqliteDatabase } from '../helpers/betterSqliteDatabase';

async function setup() {
  const db = createBetterSqliteDatabase();
  db.raw.pragma('foreign_keys = ON');
  expect(await bootstrapDatabase(db)).toEqual({ status: 'ready' });
  const repos = createRepositories(db);
  const programs = await repos.programs.listPrograms();
  const padrao = programs.find((p) => p.name === 'Treino Padrão')!;
  const monstro = programs.find((p) => p.name === 'Treino Monstro')!;
  const settings = (await repos.settings.get())!;
  await repos.settings.save({
    ...settings,
    activeProgramId: padrao.id,
    sequenceType: 'CONTINUOUS',
  });
  return { db, repos, padrao, monstro };
}

type Ctx = Awaited<ReturnType<typeof setup>>;
const snapshot = async ({ db }: Ctx) => ({
  sessions: await db.getAll('SELECT * FROM workout_session ORDER BY id'),
  exercises: await db.getAll('SELECT * FROM workout_session_exercise ORDER BY id'),
  state: await db.getAll(
    'SELECT program_id, current_position FROM program_sequence_state ORDER BY program_id',
  ),
});

async function finishOne(c: Ctx, programId: number) {
  const w = (await c.repos.programs.listWorkouts(programId))[0];
  const s = await c.repos.sessions.startSession(programId, w.id);
  await c.repos.sessions.finishSession(s.id);
  return { s, w };
}

describe('GetProgramAgenda', () => {
  it('Monstro tem 7 dias; Padrão é NO_SCHEDULE; não escreve', async () => {
    const c = await setup();
    const before = await snapshot(c);
    const uc = new GetProgramAgenda(c.repos);
    const m = await uc.execute(c.monstro.id);
    expect(m.kind === 'DAYS' && m.days.length).toBe(7);
    expect(await uc.execute(c.padrao.id)).toEqual({ kind: 'NO_SCHEDULE' });
    expect(await snapshot(c)).toEqual(before);
  });
});

describe('SelectProgram', () => {
  it('troca, persiste e preserva histórico e posições', async () => {
    const c = await setup();
    await finishOne(c, c.padrao.id);
    await c.repos.sequenceState.upsert(c.padrao.id, 3);
    const before = await snapshot(c);
    const uc = new SelectProgram(c.repos);
    await uc.execute(c.monstro.id);
    expect((await c.repos.settings.get())!.activeProgramId).toBe(c.monstro.id);
    expect(await snapshot(c)).toEqual(before);
    await uc.execute(c.padrao.id);
    expect((await c.repos.sequenceState.get(c.padrao.id))!.currentPosition).toBe(3);
  });

  it('bloqueia com sessão em andamento; alvo igual ao ativo é no-op; descartar libera', async () => {
    const c = await setup();
    const w = (await c.repos.programs.listWorkouts(c.padrao.id))[0];
    const s = await c.repos.sessions.startSession(c.padrao.id, w.id);
    const uc = new SelectProgram(c.repos);
    const err = await uc.execute(c.monstro.id).catch((e) => e);
    expect(err).toBeInstanceOf(SessionInProgressError);
    expect(err).toMatchObject({ sessionId: s.id, programId: c.padrao.id, workoutName: w.name });
    expect((await c.repos.settings.get())!.activeProgramId).toBe(c.padrao.id);
    await expect(uc.execute(c.padrao.id)).resolves.toBeDefined();
    await new DiscardInProgressSession(c.repos).execute();
    await uc.execute(c.monstro.id);
    expect((await c.repos.settings.get())!.activeProgramId).toBe(c.monstro.id);
  });

  it('programa inexistente lança erro', async () => {
    const c = await setup();
    await expect(new SelectProgram(c.repos).execute(9999)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('SelectSequenceStrategy', () => {
  it('grava só sequence_type, mesmo com sessão em andamento', async () => {
    const c = await setup();
    const w = (await c.repos.programs.listWorkouts(c.padrao.id))[0];
    const s = await c.repos.sessions.startSession(c.padrao.id, w.id);
    const before = await snapshot(c);
    await new SelectSequenceStrategy(c.repos).execute('WEEKLY');
    expect((await c.repos.settings.get())!.sequenceType).toBe('WEEKLY');
    expect(await snapshot(c)).toEqual(before);
    expect((await c.repos.sessions.getInProgress())?.id).toBe(s.id);
  });

  it('WEEKLY sem agenda é aceito e a próxima é NO_SCHEDULE; tipo inválido falha', async () => {
    const c = await setup();
    await new SelectSequenceStrategy(c.repos).execute('WEEKLY');
    const next = await new GetNextWorkout({
      ...c.repos,
      resolver: createSequenceResolver(),
      clock: () => new Date(),
    }).execute();
    expect(next.result).toMatchObject({ kind: 'NONE', reason: 'NO_SCHEDULE' });
    await expect(
      new SelectSequenceStrategy(c.repos).execute('X' as unknown as SequenceType),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe('preservação (BL-102/BL-103)', () => {
  it('20 trocas pseudoaleatórias não alteram sessões nem posições', async () => {
    const c = await setup();
    await finishOne(c, c.padrao.id);
    await finishOne(c, c.monstro.id);
    await c.repos.sequenceState.upsert(c.padrao.id, 2);
    await c.repos.sequenceState.upsert(c.monstro.id, 3);
    const before = await snapshot(c);
    let seed = 42;
    const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) % 2;
    for (let i = 0; i < 20; i++) {
      if (rnd()) {
        await new SelectProgram(c.repos).execute(rnd() ? c.padrao.id : c.monstro.id);
      } else {
        await new SelectSequenceStrategy(c.repos).execute(rnd() ? 'CONTINUOUS' : 'WEEKLY');
      }
    }
    expect(await snapshot(c)).toEqual(before);
  });
});

describe('reiniciar pelas configurações', () => {
  it('reinicia só o programa ativo; WEEKLY lança ValidationError', async () => {
    const c = await setup();
    await finishOne(c, c.padrao.id);
    await c.repos.sequenceState.upsert(c.padrao.id, 3);
    await c.repos.sequenceState.upsert(c.monstro.id, 2);
    const w = (await c.repos.programs.listWorkouts(c.padrao.id))[0];
    const open = await c.repos.sessions.startSession(c.padrao.id, w.id);
    const sessionsBefore = (await snapshot(c)).sessions;
    const uc = new ResetSequence(c.repos);
    await uc.execute(c.padrao.id);
    expect((await c.repos.sequenceState.get(c.padrao.id))!.currentPosition).toBe(1);
    expect((await c.repos.sequenceState.get(c.monstro.id))!.currentPosition).toBe(2);
    expect((await snapshot(c)).sessions).toEqual(sessionsBefore);
    expect((await c.repos.sessions.getInProgress())?.id).toBe(open.id);
    await new SelectSequenceStrategy(c.repos).execute('WEEKLY');
    await expect(uc.execute(c.padrao.id)).rejects.toBeInstanceOf(ValidationError);
  });
});
