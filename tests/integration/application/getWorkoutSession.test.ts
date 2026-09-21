import { FinishWorkout } from '../../../src/application/FinishWorkout';
import { GetWorkoutSession } from '../../../src/application/GetWorkoutSession';
import { setupWorkout } from './workoutHelpers';

jest.setTimeout(30000);

describe('GetWorkoutSession', () => {
  it('sem sessão em andamento devolve null', async () => {
    const s = await setupWorkout();
    expect(await new GetWorkoutSession(s.repos).execute()).toBeNull();
  });

  it('Monstro A: 11 itens, sem escrita, rápido; aquecimento fora das contagens', async () => {
    const s = await setupWorkout();
    const pid = await s.use('Treino Monstro', 'CONTINUOUS');
    await s.start(pid, 'A');
    const count = async () =>
      (await s.db.getFirst<{ n: number }>('SELECT COUNT(*) AS n FROM workout_session_exercise'))!.n;
    const before = await count();
    const t0 = Date.now();
    const v = await new GetWorkoutSession(s.repos).execute();
    expect(Date.now() - t0).toBeLessThan(300);
    expect(v!.items).toHaveLength(11);
    expect(v!.progress).toEqual({ done: 0, total: 11 });
    expect(v!.program.name).toBe('Treino Monstro');
    expect(v!.workout.warmupNote).toMatch(/Aquecimento de manguito rotador/);
    const orders = v!.items.map((i) => i.displayOrder);
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(await count()).toBe(before);
  });

  it('Padrão Dia 1 tem 6 exercícios', async () => {
    const s = await setupWorkout();
    const pid = await s.use('Treino Padrão', 'CONTINUOUS');
    await s.start(pid, '1');
    const v = await new GetWorkoutSession(s.repos).execute();
    expect(v!.items).toHaveLength(6);
  });

  it('última carga vem do mesmo programa; sessão atual não conta', async () => {
    const s = await setupWorkout();
    const pid = await s.use('Treino Padrão', 'CONTINUOUS');
    const sid = await s.start(pid, '1');
    const v0 = await new GetWorkoutSession(s.repos).execute();
    const ex = v0!.items[0].exerciseId;
    await s.repos.sessions.setExerciseWeight(sid, ex, 60);
    expect((await new GetWorkoutSession(s.repos).execute())!.items[0].lastWeight).toBeNull();
    await new FinishWorkout({ db: s.db, settings: s.repos.settings, clock: s.clock }).execute({
      sessionId: sid,
    });
    await s.start(pid, '1');
    const v1 = await new GetWorkoutSession(s.repos).execute();
    expect(v1!.items[0].lastWeight).toBe(60);
    expect(v1!.items[0].weight).toBeNull();
  });

  it('bi-set do Monstro chega como itens independentes', async () => {
    const s = await setupWorkout();
    const pid = await s.use('Treino Monstro', 'CONTINUOUS');
    await s.start(pid, 'A');
    const v = await new GetWorkoutSession(s.repos).execute();
    const bi = v!.items.filter((i) => i.technique === 'BI-SET');
    expect(bi.length).toBeGreaterThanOrEqual(2);
    expect(new Set(bi.map((i) => i.exerciseId)).size).toBe(bi.length);
    for (const i of bi) expect(i.notes).toBeTruthy();
  });
});
