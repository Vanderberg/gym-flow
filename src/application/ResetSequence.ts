import { ValidationError } from '../data/repositories/errors';
import type { SequenceStateRepository } from '../domain/sequence/SequenceStateRepository';
import type { SettingsRepository } from '../domain/settings/SettingsRepository';

export class ResetSequence {
  constructor(
    private readonly deps: { settings: SettingsRepository; sequenceState: SequenceStateRepository },
  ) {}

  async execute(programId: number): Promise<void> {
    const s = await this.deps.settings.get();
    if (!s || s.sequenceType !== 'CONTINUOUS') {
      throw new ValidationError('Reiniciar só existe para a sequência contínua');
    }
    await this.deps.sequenceState.upsert(programId, 1);
  }
}
