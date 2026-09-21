import { NextWorkoutResolver } from '../../../../src/domain/sequence/services/NextWorkoutResolver';
import type { SequenceStrategy } from '../../../../src/domain/sequence/SequenceStrategy';
import { makeContext } from './builders';

const fake = (type: 'CONTINUOUS' | 'WEEKLY', reason: 'REST' | 'NO_SCHEDULE'): SequenceStrategy => ({
  type,
  getNextWorkout: () => ({ kind: 'NONE', reason, note: null }),
});

describe('NextWorkoutResolver', () => {
  it('delega à estratégia do tipo', () => {
    const r = new NextWorkoutResolver([fake('CONTINUOUS', 'REST'), fake('WEEKLY', 'NO_SCHEDULE')]);
    expect(r.resolve('WEEKLY', makeContext())).toEqual({
      kind: 'NONE',
      reason: 'NO_SCHEDULE',
      note: null,
    });
    expect(r.resolve('CONTINUOUS', makeContext())).toMatchObject({ reason: 'REST' });
  });
  it('tipo sem estratégia lança', () => {
    const r = new NextWorkoutResolver([fake('CONTINUOUS', 'REST')]);
    expect(() => r.resolve('WEEKLY', makeContext())).toThrow();
  });
  it('tipo duplicado lança', () => {
    expect(
      () => new NextWorkoutResolver([fake('CONTINUOUS', 'REST'), fake('CONTINUOUS', 'REST')]),
    ).toThrow();
  });
});
