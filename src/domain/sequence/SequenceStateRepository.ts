import type { ProgramSequenceState } from './types';

export interface SequenceStateRepository {
  get(programId: number): Promise<ProgramSequenceState | null>;
  upsert(programId: number, currentPosition: number): Promise<void>;
}
