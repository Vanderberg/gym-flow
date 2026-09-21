import { FinishWorkout } from '../../../src/application/FinishWorkout';
import { GetWorkoutSession } from '../../../src/application/GetWorkoutSession';
import { createRepositories } from '../../../src/data/repositories';
import { setupWorkout } from './workoutHelpers';

jest.setTimeout(30000);

describe('recuperação de sessão (BL-104)', () => {
  it('marcações e pesos sobrevivem à reabertura e finalizar funciona depois', async () => {
    const s = await setupWorkout();
    const pid = await s.use('Treino Monstro', 'CONTINUOUS');
    const sid = await s.start(pid, 'A');
    const v = (await new GetWorkoutSession(s.repos).execute())!;
    await s.repos.sessions.setExerciseCompleted(sid, v.items[2].exerciseId, true);
    await s.repos.sessions.setExerciseWeight(sid, v.items[2].exerciseId, 45.5);
    await s.repos.sessions.setExerciseWeight(sid, v.items[4].exerciseId, 20);

    const reopened = createRepositories(s.db, s.clock);
    const r = (await new GetWorkoutSession(reopened).execute())!;
    expect(r.sessionId).toBe(sid);
    expect(r.items[2]).toMatchObject({ completed: true, weight: 45.5 });
    expect(r.items[4]).toMatchObject({ completed: false, weight: 20 });
    expect(r.progress.done).toBe(1);

    const settings = reopened.settings;
    await new FinishWorkout({ db: s.db, settings, clock: s.clock }).execute({ sessionId: sid });
    expect(await new GetWorkoutSession(reopened).execute()).toBeNull();
  });

  it('editar sessão finalizada não muda programa, treino nem data', async () => {
    const s = await setupWorkout();
    const pid = await s.use('Treino Padrão', 'CONTINUOUS');
    const sid = await s.start(pid, '1');
    const v = (await new GetWorkoutSession(s.repos).execute())!;
    await new FinishWorkout({ db: s.db, settings: s.repos.settings, clock: s.clock }).execute({
      sessionId: sid,
    });
    const before = (await s.repos.sessions.getSession(sid))!;
    await s.repos.sessions.setExerciseCompleted(sid, v.items[0].exerciseId, true);
    await s.repos.sessions.setExerciseWeight(sid, v.items[0].exerciseId, 33);
    const after = (await s.repos.sessions.getSession(sid))!;
    expect(after).toMatchObject({
      programId: before.programId,
      workoutId: before.workoutId,
      startedAt: before.startedAt,
      finishedAt: before.finishedAt,
    });
    expect(after.exercises[0]).toMatchObject({ completed: true, weight: 33 });
  });
});
