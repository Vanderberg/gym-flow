import { SetRestTimerDuration } from '../../../src/application/SetRestTimerDuration';
import { SetRestTimerEnabled } from '../../../src/application/SetRestTimerEnabled';
import { bootstrapDatabase } from '../../../src/data/bootstrap';
import { createRepositories } from '../../../src/data/repositories';
import * as machine from '../../../src/domain/restTimer/restTimerMachine';
import { createBetterSqliteDatabase } from '../helpers/betterSqliteDatabase';

describe('cronômetro é independente da sessão', () => {
  it('não altera sessão nem sequência', async () => {
    const db = createBetterSqliteDatabase();
    db.raw.pragma('foreign_keys = ON');
    expect(await bootstrapDatabase(db)).toEqual({ status: 'ready' });
    const repos = createRepositories(db);
    const snapshot = () => ({
      sessions: db.raw.prepare('SELECT * FROM workout_session').all(),
      exercises: db.raw.prepare('SELECT * FROM workout_session_exercise').all(),
      sequence: db.raw.prepare('SELECT * FROM program_sequence_state').all(),
    });
    const before = snapshot();
    let s = machine.start(90, 0);
    s = machine.pause(s, 1000);
    s = machine.resume(s, 2000);
    machine.evaluate(s, 999999);
    machine.stop(s);
    await new SetRestTimerEnabled(repos).execute(true);
    await new SetRestTimerDuration(repos).execute(120);
    expect(snapshot()).toEqual(before);
  });
});
