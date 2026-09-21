import { SqliteExerciseRepository } from '../../../src/data/repositories/SqliteExerciseRepository';
import { createTestDb } from '../helpers/testDb';

async function setup() {
  const t = await createTestDb();
  return { t, repo: new SqliteExerciseRepository(t.db, t.clock) };
}

describe('ExerciseRepository', () => {
  it('upsertByName não duplica com outra caixa/espaços/acentos e mantém o nome original', async () => {
    const { repo } = await setup();
    const a = await repo.upsertByName({ name: 'Supino inclinado' });
    const b = await repo.upsertByName({ name: '  supino INCLINADO ' });
    expect(b.id).toBe(a.id);
    expect(b.name).toBe('Supino inclinado');
    const c = await repo.upsertByName({ name: 'Tríceps testa' });
    expect((await repo.upsertByName({ name: 'TRÍCEPS  TESTA' })).id).toBe(c.id);
    const d = await repo.upsertByName({ name: 'Elevação lateral' });
    expect((await repo.upsertByName({ name: 'ELEVAÇÃO LATERAL' })).id).toBe(d.id);
  });

  it('findByName usa name_key', async () => {
    const { repo } = await setup();
    const a = await repo.upsertByName({ name: 'Remada' });
    expect((await repo.findByName(' REMADA '))?.id).toBe(a.id);
    expect(await repo.findByName('nada')).toBeNull();
  });

  it('deactivate marca inativo sem excluir', async () => {
    const { repo } = await setup();
    const a = await repo.upsertByName({ name: 'Remada' });
    await repo.deactivate(a.id);
    expect((await repo.getById(a.id))?.active).toBe(false);
  });

  it('persiste campos de ajuda', async () => {
    const { repo } = await setup();
    const a = await repo.upsertByName({
      name: 'Supino',
      primaryMuscle: 'Peitoral',
      secondaryMuscles: 'Tríceps',
      description: 'Empurrar',
    });
    expect(await repo.getById(a.id)).toMatchObject({
      primaryMuscle: 'Peitoral',
      secondaryMuscles: 'Tríceps',
      description: 'Empurrar',
      active: true,
    });
  });
});
