import { MONSTRO_EXERCISES } from '../../../src/data/seed/exercisesMonstro';
import { SHARED_EXERCISES } from '../../../src/data/seed/exercisesShared';
import { MONSTRO_PROGRAM } from '../../../src/data/seed/programs/monstro';
import { parseFichaMonstro } from './helpers/parseFichaMonstro';

describe('MONSTRO_PROGRAM', () => {
  const ficha = parseFichaMonstro();

  it('confere item a item com a ficha', () => {
    expect(MONSTRO_PROGRAM.workouts.map((w) => w.items.length)).toEqual([11, 10, 10, 12]);
    for (const w of MONSTRO_PROGRAM.workouts) {
      const rows = ficha[w.code];
      expect(w.items).toHaveLength(rows.length);
      w.items.forEach((it, i) => {
        expect(it.exercise).toBe(rows[i].name);
        expect(it.prescription).toBe(rows[i].prescription);
        expect(it.technique).toBe(rows[i].technique);
        expect(it.notes).toBe(rows[i].notes);
      });
    }
  });

  it('tem 6 pares de bi-set em posições vizinhas', () => {
    const expected: Record<string, number[]> = { A: [1], B: [2, 7], C: [9], D: [2, 10] };
    let total = 0;
    for (const w of MONSTRO_PROGRAM.workouts) {
      const idx = w.items.flatMap((it, i) => (it.technique === 'BI-SET' ? [i + 1] : []));
      total += idx.length;
      expect(idx).toEqual(expected[w.code].flatMap((p) => [p, p + 1]));
      for (const i of idx) expect(w.items[i - 1].notes).toMatch(/bi-set/i);
    }
    expect(total).toBe(12);
  });

  it('agenda, sugestão e padrão', () => {
    const s = MONSTRO_PROGRAM.schedule!;
    expect(s.map((d) => d.workout)).toEqual(['A', 'B', null, 'C', 'D', null, null]);
    expect(s.map((d) => d.optional)).toEqual([false, false, false, false, false, true, true]);
    expect(s[2].note).toBeNull();
    expect(s[5].note).toBe('Abdominais supra/infra e oblíquos');
    expect(s[6].note).toBe('Abdominais supra/infra e oblíquos');
    expect(MONSTRO_PROGRAM.homeSuggestion).toBe(
      'Caminhada ligeira, sem correr: 30 min de manhã e 30 min à noite, ou 1 h, longe do treino resistido.',
    );
    expect(MONSTRO_PROGRAM.isDefault).toBe(false);
    const names = new Set([...SHARED_EXERCISES, ...MONSTRO_EXERCISES].map((e) => e.name));
    for (const w of MONSTRO_PROGRAM.workouts)
      for (const it of w.items) expect(names.has(it.exercise)).toBe(true);
  });
});
