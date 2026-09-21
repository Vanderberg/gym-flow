import { StartWorkout } from '../../../src/application/StartWorkout';
import { createRepositories } from '../../../src/data/repositories';
import { runSeed } from '../../../src/data/seed/runSeed';
import { createTestDb } from '../helpers/testDb';

export async function setupWorkout() {
  const t = await createTestDb();
  await runSeed(t.db, { clock: t.clock });
  const repos = createRepositories(t.db, t.clock);
  const programId = async (name: string) =>
    (await t.db.getFirst<{ id: number }>('SELECT id FROM training_program WHERE name = ?', [name]))!
      .id;
  const workoutId = async (pid: number, code: string) =>
    (await t.db.getFirst<{ id: number }>(
      'SELECT id FROM workout WHERE program_id = ? AND code = ?',
      [pid, code],
    ))!.id;
  const use = async (name: string, sequenceType: 'CONTINUOUS' | 'WEEKLY') => {
    const id = await programId(name);
    await repos.settings.save({ activeProgramId: id, sequenceType });
    return id;
  };
  const start = async (pid: number, code: string) => {
    const { sessionId } = await new StartWorkout(repos).execute(await workoutId(pid, code));
    return sessionId;
  };
  return { ...t, repos, programId, workoutId, use, start };
}
