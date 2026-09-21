import { ContinuousSequenceStrategy } from '../domain/sequence/strategies/ContinuousSequenceStrategy';
import { WeeklyScheduleSequenceStrategy } from '../domain/sequence/strategies/WeeklyScheduleSequenceStrategy';
import { NextWorkoutResolver } from '../domain/sequence/services/NextWorkoutResolver';

export function createSequenceResolver(): NextWorkoutResolver {
  return new NextWorkoutResolver([
    new ContinuousSequenceStrategy(),
    new WeeklyScheduleSequenceStrategy(),
  ]);
}
