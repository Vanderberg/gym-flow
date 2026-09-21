import type { SequenceType } from '../../settings/types';
import type { SequenceStrategy } from '../SequenceStrategy';
import type { NextWorkoutResult, SequenceContext } from '../types';

export class NextWorkoutResolver {
  private readonly byType = new Map<SequenceType, SequenceStrategy>();

  constructor(strategies: SequenceStrategy[]) {
    for (const s of strategies) {
      if (this.byType.has(s.type)) throw new Error(`Estratégia duplicada: ${s.type}`);
      this.byType.set(s.type, s);
    }
  }

  resolve(type: SequenceType, context: SequenceContext): NextWorkoutResult {
    const s = this.byType.get(type);
    if (!s) throw new Error(`Sem estratégia para o tipo: ${type}`);
    return s.getNextWorkout(context);
  }
}
