import type { AppSettings, AppSettingsInput } from './types';

export interface SettingsRepository {
  get(): Promise<AppSettings | null>;
  save(settings: AppSettingsInput): Promise<AppSettings>;
}
