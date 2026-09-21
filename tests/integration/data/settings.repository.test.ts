import { ConflictError, ValidationError } from '../../../src/data/repositories/errors';
import { SqliteSettingsRepository } from '../../../src/data/repositories/SqliteSettingsRepository';
import type { SequenceType } from '../../../src/domain/settings/types';
import { createTestDb } from '../helpers/testDb';

describe('SettingsRepository', () => {
  it('get null antes de salvar; save cria e depois atualiza o registro único', async () => {
    const t = await createTestDb();
    const repo = new SqliteSettingsRepository(t.db, t.clock);
    const p = await t.insertProgram('P');
    const q = await t.insertProgram('Q');
    expect(await repo.get()).toBeNull();
    expect(await repo.save({ activeProgramId: p, sequenceType: 'CONTINUOUS' })).toEqual({
      activeProgramId: p,
      sequenceType: 'CONTINUOUS',
      restTimerEnabled: false,
      restTimerSeconds: 90,
    });
    await repo.save({ activeProgramId: q, sequenceType: 'WEEKLY', restTimerEnabled: true });
    expect((await repo.get())?.activeProgramId).toBe(q);
    const n = await t.db.getFirst<{ n: number }>('SELECT COUNT(*) AS n FROM app_settings');
    expect(n?.n).toBe(1);
  });

  it('valida tipo de sequência e programa inexistente', async () => {
    const t = await createTestDb();
    const repo = new SqliteSettingsRepository(t.db, t.clock);
    const p = await t.insertProgram('P');
    await expect(
      repo.save({ activeProgramId: p, sequenceType: 'X' as SequenceType }),
    ).rejects.toThrow(ValidationError);
    await expect(repo.save({ activeProgramId: 999, sequenceType: 'WEEKLY' })).rejects.toThrow(
      ConflictError,
    );
  });
});
