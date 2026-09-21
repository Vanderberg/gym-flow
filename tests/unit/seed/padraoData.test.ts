import { EXERCISE_CATALOG } from '../../../src/data/seed/exercises';
import { PADRAO_EXERCISES } from '../../../src/data/seed/exercisesPadrao';
import { SHARED_EXERCISES } from '../../../src/data/seed/exercisesShared';
import { PADRAO_PROGRAM } from '../../../src/data/seed/programs/padrao';
import { parsePrdPadrao } from './helpers/parsePrdPadrao';

describe('PADRAO_PROGRAM', () => {
  const prd = parsePrdPadrao();

  it('confere com o PRD §7', () => {
    expect(prd).toHaveLength(5);
    expect(PADRAO_PROGRAM.workouts.map((w) => w.code)).toEqual(['1', '2', '3', '4', '5']);
    expect(PADRAO_PROGRAM.workouts.map((w) => w.items.length)).toEqual([6, 6, 6, 4, 6]);
    PADRAO_PROGRAM.workouts.forEach((w, i) => {
      expect(w.name).toBe(prd[i].title);
      expect(w.items.map((it) => it.exercise)).toEqual(prd[i].items.map((it) => it.name));
      w.items.forEach((it, j) => {
        expect(it.prescription).toBe(`${prd[i].items[j].series} × ${prd[i].items[j].reps}`);
        expect(it.technique).toBeNull();
        expect(it.notes).toBeNull();
      });
    });
  });

  it('usa só exercícios do catálogo, sem agenda nem sugestão', () => {
    const names = new Set([...SHARED_EXERCISES, ...PADRAO_EXERCISES].map((e) => e.name));
    for (const w of PADRAO_PROGRAM.workouts)
      for (const it of w.items) expect(names.has(it.exercise)).toBe(true);
    expect(PADRAO_PROGRAM.schedule).toBeNull();
    expect(PADRAO_PROGRAM.homeSuggestion).toBeNull();
    expect(EXERCISE_CATALOG.length).toBeGreaterThan(0);
  });
});
