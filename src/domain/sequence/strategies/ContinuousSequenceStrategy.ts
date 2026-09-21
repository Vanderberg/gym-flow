import type { SequenceStrategy } from '../SequenceStrategy';
import type { NextWorkoutResult, SequenceContext } from '../types';

export class ContinuousSequenceStrategy implements SequenceStrategy {
  readonly type = 'CONTINUOUS' as const;

  getNextWorkout(context: SequenceContext): NextWorkoutResult {
    const { workouts, currentPosition } = context;
    if (workouts.length === 0) return { kind: 'NONE', reason: 'NO_WORKOUTS', note: null };
    const match = workouts.find((w) => w.position === currentPosition);
    return { kind: 'WORKOUT', workout: match ?? workouts[0] };
  }
}
