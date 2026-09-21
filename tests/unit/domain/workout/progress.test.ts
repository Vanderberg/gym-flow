import { computeProgress } from '../../../../src/domain/workout/progress';

describe('computeProgress', () => {
  it('sem itens', () => expect(computeProgress([])).toEqual({ done: 0, total: 0 }));
  it('nenhum marcado', () =>
    expect(computeProgress([{ completed: false }, { completed: false }])).toEqual({
      done: 0,
      total: 2,
    }));
  it('parcial e total', () => {
    expect(computeProgress([{ completed: true }, { completed: false }])).toEqual({
      done: 1,
      total: 2,
    });
    expect(computeProgress([{ completed: true }, { completed: true }])).toEqual({
      done: 2,
      total: 2,
    });
  });
});
