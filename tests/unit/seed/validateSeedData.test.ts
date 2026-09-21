import { ValidationError } from '../../../src/data/repositories/errors';
import { validateSeedData } from '../../../src/data/seed/validateSeedData';
import type { SeedData } from '../../../src/data/seed/types';
import { makeFixture } from './fixtures';

const mutate = (fn: (d: SeedData) => void) => {
  const d = makeFixture();
  fn(d);
  return d;
};

describe('validateSeedData', () => {
  it('aceita dataset válido', () => {
    expect(() => validateSeedData(makeFixture())).not.toThrow();
  });

  const cases: [string, (d: SeedData) => void][] = [
    ['exercício fora do catálogo', (d) => (d.programs[0].workouts[1].items[0].exercise = 'Nada')],
    ['nomes duplicados', (d) => d.exercises.push({ ...d.exercises[0], name: ' EX1 ' })],
    ['primaryMuscle vazio', (d) => (d.exercises[0].primaryMuscle = ' ')],
    ['secondaryMuscles vazio', (d) => (d.exercises[0].secondaryMuscles = '')],
    ['description vazia', (d) => (d.exercises[0].description = '')],
    ['nenhum isDefault', (d) => (d.programs[0].isDefault = false)],
    ['dois isDefault', (d) => (d.programs[1].isDefault = true)],
    ['code duplicado', (d) => (d.programs[0].workouts[1].code = 'A')],
    ['bi-set sem par', (d) => (d.programs[0].workouts[0].items[2].technique = null)],
    ['bi-set sem notas', (d) => (d.programs[0].workouts[0].items[1].notes = null)],
    ['bi-set sem a palavra bi-set', (d) => (d.programs[0].workouts[0].items[1].notes = 'Com Ex3')],
    ['weekday repetido', (d) => (d.programs[1].schedule![1].weekday = 1)],
    ['weekday fora de 1..7', (d) => (d.programs[1].schedule![1].weekday = 8 as never)],
    ['agenda com treino inexistente', (d) => (d.programs[1].schedule![0].workout = 'Z')],
  ];
  it.each(cases)('rejeita: %s', (_name, fn) => {
    expect(() => validateSeedData(mutate(fn))).toThrow(ValidationError);
  });
});
