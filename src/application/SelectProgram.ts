import { NotFoundError, ValidationError } from '../data/repositories/errors';
import type { ProgramRepository } from '../domain/program/ProgramRepository';
import type { SessionRepository } from '../domain/session/SessionRepository';
import type { SettingsRepository } from '../domain/settings/SettingsRepository';
import type { AppSettings } from '../domain/settings/types';
import { SessionInProgressError } from './errors';

export class SelectProgram {
  constructor(
    private readonly deps: {
      programs: ProgramRepository;
      settings: SettingsRepository;
      sessions: SessionRepository;
    },
  ) {}

  async execute(programId: number): Promise<AppSettings> {
    const { programs, settings, sessions } = this.deps;
    const current = await settings.get();
    if (!current) throw new NotFoundError('Configurações não encontradas');
    const program = await programs.getProgram(programId);
    if (!program) throw new NotFoundError('Programa não encontrado');
    if (!program.active) throw new ValidationError('Programa inativo');
    if (current.activeProgramId === programId) return current;
    const inProgress = await sessions.getInProgress();
    if (inProgress) {
      const workout = await programs.getWorkoutWithExercises(inProgress.workoutId);
      throw new SessionInProgressError(inProgress.id, inProgress.programId, workout?.name ?? '');
    }
    return settings.save({ ...current, activeProgramId: programId });
  }
}
