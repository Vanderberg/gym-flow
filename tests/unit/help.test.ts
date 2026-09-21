import { TECHNIQUE_LEGEND } from '../../src/constants/techniqueLegend';
import { TECHNIQUES } from '../../src/constants/techniques';
import { findLegendEntry } from '../../src/domain/help/legend';
import { buildMuscleInfo } from '../../src/domain/help/muscleInfo';
import { useHelpStore } from '../../src/store/helpStore';

describe('legenda', () => {
  it('8 entradas únicas, curtas e sem recomendação', () => {
    expect(TECHNIQUE_LEGEND).toHaveLength(8);
    const titles = TECHNIQUE_LEGEND.map((e) => e.title);
    expect(new Set(titles).size).toBe(8);
    for (const e of TECHNIQUE_LEGEND) {
      expect(e.title).toBe(e.title.toUpperCase());
      expect(e.description.length).toBeGreaterThan(0);
      expect(e.description.length).toBeLessThanOrEqual(120);
      expect(e.description).not.toMatch(/recomend|deve usar|aumente|reduza a carga para/i);
    }
    for (const t of TECHNIQUES) expect(findLegendEntry(t)).not.toBeNull();
  });
  it('findLegendEntry é exato', () => {
    expect(findLegendEntry('DROP-SET')?.title).toBe('DROP-SET');
    expect(findLegendEntry(null)).toBeNull();
    expect(findLegendEntry('drop-set')).toBeNull();
    expect(findLegendEntry('DROP-SET ')).toBeNull();
    expect(findLegendEntry('DROP SET')).toBeNull();
  });
});

describe('buildMuscleInfo', () => {
  it('separa secundários e usa fallback', () => {
    const i = buildMuscleInfo({
      id: 1,
      name: 'X',
      primaryMuscle: 'Peito',
      secondaryMuscles: 'Tríceps,  Deltoide anterior , ',
      description: 'd',
    });
    expect(i.secondaryMuscles).toEqual(['Tríceps', 'Deltoide anterior']);
    const n = buildMuscleInfo({
      id: 1,
      name: 'X',
      primaryMuscle: null,
      secondaryMuscles: '',
      description: ' ',
    });
    expect(n.primaryMuscle).toBe('Não informado');
    expect(n.secondaryMuscles).toEqual(['Não informado']);
    expect(n.description).toBe('Não informado');
  });
});

describe('helpStore', () => {
  it('abrir/fechar e cancelar abertura', () => {
    const s = useHelpStore.getState();
    s.markOpening(3);
    s.cancelOpening();
    expect(useHelpStore.getState().opening).toBe(false);
    s.markOpening(3);
    s.openExercise(3);
    expect(useHelpStore.getState().sheet).toEqual({ kind: 'EXERCISE', exerciseId: 3 });
    s.openLegend('BI-SET');
    expect(useHelpStore.getState().sheet).toEqual({ kind: 'LEGEND', term: 'BI-SET' });
    s.close();
    expect(useHelpStore.getState().sheet.kind).toBe('NONE');
    expect(useHelpStore.getState().opening).toBe(false);
    expect(useHelpStore.getState().restoreFocusExerciseId).toBe(3);
  });
});
