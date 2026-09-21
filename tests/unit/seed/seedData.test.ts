import { SEED_DATA } from '../../../src/data/seed/seedData';
import { PADRAO_PROGRAM } from '../../../src/data/seed/programs/padrao';
import { MONSTRO_PROGRAM } from '../../../src/data/seed/programs/monstro';
import { validateSeedData } from '../../../src/data/seed/validateSeedData';
import { normalizeName } from '../../../src/utils/normalizeName';

describe('SEED_DATA', () => {
  it('é válido e tem as contagens esperadas', () => {
    expect(() => validateSeedData(SEED_DATA)).not.toThrow();
    expect(new Set(SEED_DATA.exercises.map((e) => normalizeName(e.name))).size).toBe(59);
    expect(SEED_DATA.exercises).toHaveLength(59);
    expect(SEED_DATA.programs.flatMap((p) => p.workouts)).toHaveLength(9);
    expect(SEED_DATA.programs.flatMap((p) => p.workouts.flatMap((w) => w.items))).toHaveLength(71);
    expect(SEED_DATA.defaultSequenceType).toBe('CONTINUOUS');
  });

  it('todo exercício tem músculos e descrição informativos', () => {
    for (const e of SEED_DATA.exercises) {
      expect(e.primaryMuscle.trim()).not.toBe('');
      expect(e.secondaryMuscles.trim()).not.toBe('');
      expect(e.description.trim()).not.toBe('');
      expect(e.description.length).toBeLessThanOrEqual(300);
      expect(e.description).not.toMatch(/recomend|melhor|kg/i);
    }
  });

  it('um programa padrão e 6 exercícios compartilhados', () => {
    expect(SEED_DATA.programs.filter((p) => p.isDefault).map((p) => p.name)).toEqual([
      'Treino Padrão',
    ]);
    const used = (p: typeof PADRAO_PROGRAM) =>
      new Set(p.workouts.flatMap((w) => w.items.map((i) => normalizeName(i.exercise))));
    const a = used(PADRAO_PROGRAM);
    const b = used(MONSTRO_PROGRAM);
    expect([...a].filter((n) => b.has(n))).toHaveLength(6);
  });
});
