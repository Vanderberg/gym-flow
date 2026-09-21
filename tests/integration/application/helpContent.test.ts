import { GetExerciseInfo } from '../../../src/application/GetExerciseInfo';
import { NotFoundError } from '../../../src/data/repositories/errors';
import { TECHNIQUE_LEGEND } from '../../../src/constants/techniqueLegend';
import { setupWorkout } from './workoutHelpers';

jest.setTimeout(30000);

describe('conteúdo de ajuda do seed', () => {
  it('toda técnica do seed tem entrada na legenda', async () => {
    const s = await setupWorkout();
    const rows = await s.db.getAll<{ technique: string }>(
      'SELECT DISTINCT technique FROM workout_exercise WHERE technique IS NOT NULL',
    );
    expect(rows.length).toBeGreaterThan(0);
    for (const r of rows) expect(TECHNIQUE_LEGEND.map((e) => e.title)).toContain(r.technique);
  });

  it('todo exercício tem informações completas; leitura sem escrita', async () => {
    const s = await setupWorkout();
    const pid = await s.use('Treino Monstro', 'CONTINUOUS');
    await s.start(pid, 'A');
    const snap = async () =>
      JSON.stringify([
        await s.db.getAll('SELECT * FROM workout_session'),
        await s.db.getAll('SELECT * FROM workout_session_exercise'),
        await s.db.getAll('SELECT * FROM program_sequence_state'),
        await s.db.getAll('SELECT * FROM app_settings'),
      ]);
    const before = await snap();
    const uc = new GetExerciseInfo(s.repos);
    const ids = await s.db.getAll<{ id: number }>('SELECT id FROM exercise');
    expect(ids.length).toBeGreaterThan(10);
    for (const { id } of ids) {
      const i = await uc.execute(id);
      expect(i.primaryMuscle).not.toBe('Não informado');
      expect(i.secondaryMuscles).not.toContain('Não informado');
      expect(i.description).not.toBe('Não informado');
    }
    await expect(uc.execute(999999)).rejects.toBeInstanceOf(NotFoundError);
    expect(await snap()).toBe(before);
  });
});
