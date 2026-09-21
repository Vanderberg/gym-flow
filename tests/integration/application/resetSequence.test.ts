import { GetNextWorkout } from '../../../src/application/GetNextWorkout';
import { ResetSequence } from '../../../src/application/ResetSequence';
import { createSequenceResolver } from '../../../src/application/composition';
import { createRepositories, ValidationError } from '../../../src/data/repositories';
import { createTestDb } from '../helpers/testDb';

async function setup() {
  const t = await createTestDb();
  const repos = createRepositories(t.db, t.clock);
  const pA = await t.insertProgram('A');
  const pB = await t.insertProgram('B');
  const wa = [await t.insertWorkout(pA, 'A', 1), await t.insertWorkout(pA, 'B', 2)];
  await t.insertWorkout(pB, 'A', 1);
  await repos.settings.save({ activeProgramId: pA, sequenceType: 'CONTINUOUS' });
  const reset = new ResetSequence({ settings: repos.settings, sequenceState: repos.sequenceState });
  const next = new GetNextWorkout({
    programs: repos.programs,
    schedule: repos.schedule,
    sequenceState: repos.sequenceState,
    settings: repos.settings,
    resolver: createSequenceResolver(),
    clock: t.clock,
  });
  return { t, repos, reset, next, pA, pB, wa };
}

describe('ResetSequence', () => {
  it('volta ao primeiro sem tocar no histórico nem em outro programa', async () => {
    const { t, repos, reset, next, pA, pB, wa } = await setup();
    await repos.sequenceState.upsert(pA, 2);
    await repos.sequenceState.upsert(pB, 1);
    const s = await repos.sessions.startSession(pA, wa[0]);
    await repos.sessions.finishSession(s.id);
    const before = await t.db.getAll('SELECT * FROM workout_session');
    await reset.execute(pA);
    expect((await repos.sequenceState.get(pA))?.currentPosition).toBe(1);
    expect((await next.execute()).result).toMatchObject({ workout: { id: wa[0] } });
    expect(await t.db.getAll('SELECT * FROM workout_session')).toEqual(before);
    expect((await repos.sequenceState.get(pB))?.currentPosition).toBe(1);
  });

  it('WEEKLY lança ValidationError e nada muda', async () => {
    const { repos, reset, pA } = await setup();
    await repos.sequenceState.upsert(pA, 2);
    await repos.settings.save({ activeProgramId: pA, sequenceType: 'WEEKLY' });
    await expect(reset.execute(pA)).rejects.toBeInstanceOf(ValidationError);
    expect((await repos.sequenceState.get(pA))?.currentPosition).toBe(2);
  });

  it('mantém sessão em andamento e cria estado ausente', async () => {
    const { repos, reset, pA, wa } = await setup();
    const s = await repos.sessions.startSession(pA, wa[1]);
    await reset.execute(pA);
    expect((await repos.sessions.getInProgress())?.id).toBe(s.id);
    expect((await repos.sequenceState.get(pA))?.currentPosition).toBe(1);
  });
});
