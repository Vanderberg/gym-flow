import { NotFoundError, ValidationError } from '../data/repositories/errors';
import type { ProgramRepository } from '../domain/program/ProgramRepository';
import type { SessionRepository } from '../domain/session/SessionRepository';
import type { SettingsRepository } from '../domain/settings/SettingsRepository';

/** Inicia um treino do programa ativo por toque explícito (BL-051). */
export class StartWorkout {
  constructor(
    private readonly deps: {
      settings: SettingsRepository;
      programs: ProgramRepository;
      sessions: SessionRepository;
    },
  ) {}

  async execute(workoutId: number): Promise<{ sessionId: number }> {
    const { settings, programs, sessions } = this.deps;
    const s = await settings.get();
    if (!s) throw new NotFoundError('Configurações não encontradas');
    const workouts = await programs.listWorkouts(s.activeProgramId);
    if (!workouts.some((w) => w.id === workoutId && w.active)) {
      throw new ValidationError('Treino inválido para o programa ativo');
    }
    const session = await sessions.startSession(s.activeProgramId, workoutId);
    return { sessionId: session.id };
  }
}
