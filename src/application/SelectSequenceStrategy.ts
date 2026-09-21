import { NotFoundError, ValidationError } from '../data/repositories/errors';
import type { SettingsRepository } from '../domain/settings/SettingsRepository';
import type { AppSettings, SequenceType } from '../domain/settings/types';

export class SelectSequenceStrategy {
  constructor(private readonly deps: { settings: SettingsRepository }) {}

  async execute(type: SequenceType): Promise<AppSettings> {
    if (type !== 'CONTINUOUS' && type !== 'WEEKLY') {
      throw new ValidationError('Tipo de sequência inválido');
    }
    const current = await this.deps.settings.get();
    if (!current) throw new NotFoundError('Configurações não encontradas');
    return this.deps.settings.save({ ...current, sequenceType: type });
  }
}
