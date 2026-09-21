import { NotFoundError } from '../data/repositories/errors';
import type { SettingsRepository } from '../domain/settings/SettingsRepository';
import type { AppSettings } from '../domain/settings/types';

/** BL-043/BL-090: ativa ou desativa o cronômetro; só muda `rest_timer_enabled`. */
export class SetRestTimerEnabled {
  constructor(private readonly deps: { settings: SettingsRepository }) {}

  async execute(enabled: boolean): Promise<AppSettings> {
    const current = await this.deps.settings.get();
    if (!current) throw new NotFoundError('Configurações não encontradas');
    return this.deps.settings.save({ ...current, restTimerEnabled: enabled });
  }
}
