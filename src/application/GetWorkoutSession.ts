import type { ProgramRepository } from '../domain/program/ProgramRepository';
import type { SessionRepository } from '../domain/session/SessionRepository';
import { computeProgress } from '../domain/workout/progress';
import type { WorkoutScreenItem, WorkoutScreenView } from '../domain/workout/types';

/** Monta a tela de treino a partir da sessão em andamento (BL-060). Somente leitura. */
export class GetWorkoutSession {
  constructor(
    private readonly deps: { sessions: SessionRepository; programs: ProgramRepository },
  ) {}

  async execute(): Promise<WorkoutScreenView | null> {
    const { sessions, programs } = this.deps;
    const session = await sessions.getInProgress();
    if (!session) return null;
    const [workout, program] = await Promise.all([
      programs.getWorkoutWithExercises(session.workoutId),
      programs.getProgram(session.programId),
    ]);
    if (!workout || !program) return null;
    const lines = new Map(session.exercises.map((l) => [l.exerciseId, l]));
    const ordered = [...workout.exercises].sort((a, b) => a.displayOrder - b.displayOrder);
    const items: WorkoutScreenItem[] = [];
    for (const we of ordered) {
      const line = lines.get(we.exerciseId);
      if (!line) continue;
      items.push({
        exerciseId: we.exerciseId,
        name: we.exercise.name,
        displayOrder: we.displayOrder,
        prescription: we.prescription,
        technique: we.technique,
        notes: we.notes,
        completed: line.completed,
        weight: line.weight,
        lastWeight: await sessions.getLastWeight(session.programId, we.exerciseId),
      });
    }
    return {
      sessionId: session.id,
      program: { id: program.id, name: program.name },
      workout: {
        id: workout.id,
        code: workout.code,
        name: workout.name,
        position: workout.position,
        warmupNote: workout.warmupNote,
      },
      items,
      progress: computeProgress(items),
    };
  }
}
