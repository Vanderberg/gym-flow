import { NotFoundError, ValidationError } from '../data/repositories/errors';
import { validateDuration } from '../domain/restTimer/duration';
import type { SettingsRepository } from '../domain/settings/SettingsRepository';
import type { AppSettings } from '../domain/settings/types';

/** BL-091: define a duração do descanso (5..3600 s); só muda `rest_timer_seconds`. */
export class SetRestTimerDuration {
  constructor(private readonly deps: { settings: SettingsRepository }) {}

  async execute(seconds: number): Promise<AppSettings> {
    if (!validateDuration(seconds)) {
      throw new ValidationError('Informe um tempo entre 00:05 e 60:00');
    }
    const current = await this.deps.settings.get();
    if (!current) throw new NotFoundError('Configurações não encontradas');
    return this.deps.settings.save({ ...current, restTimerSeconds: seconds });
  }
}
