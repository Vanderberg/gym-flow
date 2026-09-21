import { create } from 'zustand';
import type { ProgramRepository } from '../domain/program/ProgramRepository';
import type { TrainingProgram } from '../domain/program/types';
import type { ScheduleRepository } from '../domain/sequence/ScheduleRepository';
import type { AgendaView } from '../domain/sequence/types';
import type { SessionRepository } from '../domain/session/SessionRepository';
import type { SettingsRepository } from '../domain/settings/SettingsRepository';
import type { AppSettings } from '../domain/settings/types';
import { GetProgramAgenda } from '../application/GetProgramAgenda';

export interface InProgressInfo {
  sessionId: number;
  programId: number;
  workoutName: string;
}

export interface SettingsDeps {
  settings: SettingsRepository;
  sessions: SessionRepository;
  programs: ProgramRepository;
  schedule: ScheduleRepository;
}

/** Estado só de UI: o SQLite é a fonte de verdade e o store apenas espelha a leitura. */
export interface SettingsState {
  settings: AppSettings | null;
  inProgress: InProgressInfo | null;
  programs: TrainingProgram[];
  agenda: AgendaView | null;
  reload(deps: SettingsDeps): Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  inProgress: null,
  programs: [],
  agenda: null,
  async reload(deps) {
    const settings = await deps.settings.get();
    const session = await deps.sessions.getInProgress();
    const programs = await deps.programs.listPrograms();
    let inProgress: InProgressInfo | null = null;
    if (session) {
      const workout = await deps.programs.getWorkoutWithExercises(session.workoutId);
      inProgress = {
        sessionId: session.id,
        programId: session.programId,
        workoutName: workout?.name ?? '',
      };
    }
    const agenda = settings
      ? await new GetProgramAgenda({ programs: deps.programs, schedule: deps.schedule }).execute(
          settings.activeProgramId,
        )
      : null;
    set({ settings, inProgress, programs, agenda });
  },
}));
