export type SequenceType = 'CONTINUOUS' | 'WEEKLY';

export interface AppSettings {
  activeProgramId: number;
  sequenceType: SequenceType;
  restTimerEnabled: boolean;
  restTimerSeconds: number;
}

export interface AppSettingsInput {
  activeProgramId: number;
  sequenceType: SequenceType;
  restTimerEnabled?: boolean;
  restTimerSeconds?: number;
}
