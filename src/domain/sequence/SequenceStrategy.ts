import type { SequenceType } from '../settings/types';
import type { NextWorkoutResult, SequenceContext } from './types';

export interface SequenceStrategy {
  readonly type: SequenceType;
  getNextWorkout(context: SequenceContext): NextWorkoutResult;
}
