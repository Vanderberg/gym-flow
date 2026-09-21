import { SqliteExerciseRepository } from '../../../src/data/repositories/SqliteExerciseRepository';
import { SqliteProgramRepository } from '../../../src/data/repositories/SqliteProgramRepository';
import { createTestDb } from '../helpers/testDb';

async function setup() {
  const t = await createTestDb();
  return {
    t,
    programs: new SqliteProgramRepository(t.db, t.clock),
    exercises: new SqliteExerciseRepository(t.db, t.clock),
  };
}

describe('ProgramRepository', () => {
  it('upsertProgram por nome não duplica e persiste homeSuggestion', async () => {
    const { programs } = await setup();
    const a = await programs.upsertProgram({ name: 'Padrão', homeSuggestion: 'Cardio' });
    const b = await programs.upsertProgram({ name: 'Padrão', homeSuggestion: 'Cardio 2' });
    expect(b.id).toBe(a.id);
    expect(b.homeSuggestion).toBe('Cardio 2');
    expect(await programs.listPrograms()).toHaveLength(1);
  });

  it('lista treinos por position e devolve exercícios por displayOrder com prescrição', async () => {
    const { programs, exercises } = await setup();
    const p = await programs.upsertProgram({ name: 'P' });
    const b = await programs.upsertWorkout({ programId: p.id, code: 'B', name: 'B', position: 2 });
    const a = await programs.upsertWorkout({
      programId: p.id,
      code: 'A',
      name: 'A',
      position: 1,
      warmupNote: 'Aquecimento',
    });
    expect((await programs.listWorkouts(p.id)).map((w) => w.code)).toEqual(['A', 'B']);
    const e1 = await exercises.upsertByName({ name: 'Supino' });
    const e2 = await exercises.upsertByName({ name: 'Crucifixo' });
    await programs.upsertWorkoutExercise({
      workoutId: a.id,
      exerciseId: e1.id,
      displayOrder: 2,
      prescription: '3x10',
      technique: 'BI-SET',
      notes: 'com crucifixo',
    });
    await programs.upsertWorkoutExercise({ workoutId: a.id, exerciseId: e2.id, displayOrder: 1 });
    // repetir o mesmo par não duplica
    await programs.upsertWorkoutExercise({
      workoutId: a.id,
      exerciseId: e1.id,
      displayOrder: 2,
      prescription: '4x8',
      technique: 'BI-SET',
      notes: 'com crucifixo',
    });
    // exercício reutilizado em outro treino
    await programs.upsertWorkoutExercise({ workoutId: b.id, exerciseId: e1.id, displayOrder: 1 });
    const detail = await programs.getWorkoutWithExercises(a.id);
    expect(detail?.warmupNote).toBe('Aquecimento');
    expect(detail?.exercises.map((x) => x.exercise.name)).toEqual(['Crucifixo', 'Supino']);
    expect(detail?.exercises[1]).toMatchObject({
      prescription: '4x8',
      technique: 'BI-SET',
      notes: 'com crucifixo',
    });
    expect(
      await t_count(programs, "SELECT COUNT(*) AS n FROM exercise WHERE name = 'Supino'"),
    ).toBe(1);
  });

  it('desativar não exclui e listPrograms oculta inativos', async () => {
    const { programs } = await setup();
    const p = await programs.upsertProgram({ name: 'P' });
    const w = await programs.upsertWorkout({ programId: p.id, code: 'A', name: 'A', position: 1 });
    await programs.deactivateWorkout(w.id);
    await programs.deactivateProgram(p.id);
    expect(await programs.listPrograms()).toHaveLength(0);
    expect(await programs.listPrograms({ includeInactive: true })).toHaveLength(1);
    expect((await programs.listWorkouts(p.id))[0]?.active).toBe(false);
  });
});

async function t_count(programs: SqliteProgramRepository, sql: string): Promise<number> {
  const db = (programs as unknown as { db: import('../../../src/data/database/Database').Database })
    .db;
  return (await db.getFirst<{ n: number }>(sql))!.n;
}
