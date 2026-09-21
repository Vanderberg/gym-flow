import { ValidationError } from '../../../src/data/repositories/errors';
import { SqliteSequenceStateRepository } from '../../../src/data/repositories/SqliteSequenceStateRepository';
import { createTestDb } from '../helpers/testDb';

describe('SequenceStateRepository', () => {
  it('upsert, get e independência entre programas', async () => {
    const t = await createTestDb();
    const repo = new SqliteSequenceStateRepository(t.db, t.clock);
    const p = await t.insertProgram('P');
    const q = await t.insertProgram('Q');
    expect(await repo.get(p)).toBeNull();
    await repo.upsert(p, 1);
    await repo.upsert(q, 3);
    await repo.upsert(p, 2);
    expect(await repo.get(p)).toEqual({ programId: p, currentPosition: 2 });
    expect(await repo.get(q)).toEqual({ programId: q, currentPosition: 3 });
  });

  it('posição 0 é inválida', async () => {
    const t = await createTestDb();
    const repo = new SqliteSequenceStateRepository(t.db, t.clock);
    const p = await t.insertProgram('P');
    await expect(repo.upsert(p, 0)).rejects.toThrow(ValidationError);
  });
});
