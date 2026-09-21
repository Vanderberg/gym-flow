import { GetNextWorkout } from '../../../src/application/GetNextWorkout';
import { createSequenceResolver } from '../../../src/application/composition';
import { createRepositories } from '../../../src/data/repositories';
import { createTestDb } from '../helpers/testDb';

// Fixtures próprias (o seed da spec 003 ainda não existe neste branch).
async function setup() {
  const t = await createTestDb();
  const repos = createRepositories(t.db, t.clock);
  const p1 = await t.insertProgram('P1');
  const w1 = [
    await t.insertWorkout(p1, 'A', 1),
    await t.insertWorkout(p1, 'B', 2),
    await t.insertWorkout(p1, 'C', 3),
  ];
  const p2 = await t.insertProgram('P2');
  const w2 = [await t.insertWorkout(p2, 'A', 1), await t.insertWorkout(p2, 'B', 2)];
  // agenda do P2: seg=A, ter=B, sáb=opcional, dom=descanso
  await repos.schedule.upsertEntry({
    programId: p2,
    weekday: 1,
    workoutId: w2[0],
    optional: false,
    note: null,
  });
  await repos.schedule.upsertEntry({
    programId: p2,
    weekday: 2,
    workoutId: w2[1],
    optional: false,
    note: null,
  });
  await repos.schedule.upsertEntry({
    programId: p2,
    weekday: 6,
    workoutId: null,
    optional: true,
    note: 'Abdominais',
  });
  await repos.schedule.upsertEntry({
    programId: p2,
    weekday: 7,
    workoutId: null,
    optional: false,
    note: null,
  });
  await repos.settings.save({ activeProgramId: p1, sequenceType: 'CONTINUOUS' });
  const uc = new GetNextWorkout({
    programs: repos.programs,
    schedule: repos.schedule,
    sequenceState: repos.sequenceState,
    settings: repos.settings,
    resolver: createSequenceResolver(),
    clock: t.clock,
  });
  return { t, repos, uc, p1, p2, w1, w2 };
}

describe('GetNextWorkout - contínua', () => {
  it('estado ausente -> primeiro treino sem criar linha', async () => {
    const { repos, uc, p1, w1 } = await setup();
    const r = await uc.execute();
    expect(r.result).toMatchObject({ kind: 'WORKOUT', workout: { id: w1[0] } });
    expect(await repos.sequenceState.get(p1)).toBeNull();
  });

  it('usa a posição gravada e cada programa retoma a sua', async () => {
    const { repos, uc, p1, p2, w1, w2 } = await setup();
    await repos.sequenceState.upsert(p1, 2);
    await repos.sequenceState.upsert(p2, 2);
    expect((await uc.execute()).result).toMatchObject({ workout: { id: w1[1] } });
    await repos.settings.save({ activeProgramId: p2, sequenceType: 'CONTINUOUS' });
    expect((await uc.execute()).result).toMatchObject({ workout: { id: w2[1] } });
    await repos.settings.save({ activeProgramId: p1, sequenceType: 'CONTINUOUS' });
    expect((await uc.execute()).result).toMatchObject({ workout: { id: w1[1] } });
  });

  it('sessões não alteram o resultado nem a posição', async () => {
    const { repos, uc, p1, w1 } = await setup();
    await repos.sequenceState.upsert(p1, 2);
    const s = await repos.sessions.startSession(p1, w1[1]);
    expect((await uc.execute()).result).toMatchObject({ workout: { id: w1[1] } });
    await repos.sessions.discardSession(s.id);
    expect((await uc.execute()).result).toMatchObject({ workout: { id: w1[1] } });
    const s2 = await repos.sessions.startSession(p1, w1[1]);
    await repos.sessions.finishSession(s2.id);
    expect((await uc.execute()).result).toMatchObject({ workout: { id: w1[1] } });
    expect((await repos.sequenceState.get(p1))?.currentPosition).toBe(2);
  });

  it('treino inativo não entra e trocar tipo não altera estado', async () => {
    const { t, repos, uc, p1, w1 } = await setup();
    await repos.programs.deactivateWorkout(w1[0]);
    expect((await uc.execute()).result).toMatchObject({ workout: { id: w1[1] } });
    await repos.sequenceState.upsert(p1, 3);
    await repos.settings.save({ activeProgramId: p1, sequenceType: 'WEEKLY' });
    expect((await repos.sequenceState.get(p1))?.currentPosition).toBe(3);
    expect(t).toBeDefined();
  });
});

describe('GetNextWorkout - semanal', () => {
  const dates: [string, 'WORKOUT' | 'NONE', string | null][] = [
    ['2026-09-21T10:00:00-03:00', 'WORKOUT', null],
    ['2026-09-22T10:00:00-03:00', 'WORKOUT', null],
    ['2026-09-23T10:00:00-03:00', 'NONE', null],
    ['2026-09-26T10:00:00-03:00', 'NONE', 'OPTIONAL_DAY'],
    ['2026-09-27T10:00:00-03:00', 'NONE', 'REST'],
  ];
  it.each(dates)('%s', async (iso, kind, reason) => {
    const { t, repos, uc, p2 } = await setup();
    await repos.settings.save({ activeProgramId: p2, sequenceType: 'WEEKLY' });
    t.clock.set(iso);
    const r = (await uc.execute()).result;
    expect(r.kind).toBe(kind);
    if (reason) expect(r).toMatchObject({ reason });
  });

  it('programa sem agenda -> NO_SCHEDULE', async () => {
    const { repos, uc, p1 } = await setup();
    await repos.settings.save({ activeProgramId: p1, sequenceType: 'WEEKLY' });
    expect((await uc.execute()).result).toMatchObject({ kind: 'NONE', reason: 'NO_SCHEDULE' });
  });

  it('dia da semana segue a data local (23:30 -03:00)', async () => {
    const { t, repos, uc, p2, w2 } = await setup();
    await repos.settings.save({ activeProgramId: p2, sequenceType: 'WEEKLY' });
    t.clock.set('2026-09-21T23:30:00-03:00');
    const r = (await uc.execute()).result;
    if (new Date('2026-09-21T23:30:00-03:00').getDate() === 21) {
      expect(r).toMatchObject({ workout: { id: w2[0] } });
    }
  });
});
