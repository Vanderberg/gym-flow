import type { ProgramRepository } from '../domain/program/ProgramRepository';
import { buildAgendaView } from '../domain/sequence/agendaView';
import type { ScheduleRepository } from '../domain/sequence/ScheduleRepository';
import type { AgendaView } from '../domain/sequence/types';

export class GetProgramAgenda {
  constructor(
    private readonly deps: { programs: ProgramRepository; schedule: ScheduleRepository },
  ) {}

  async execute(programId: number): Promise<AgendaView> {
    const schedule = await this.deps.schedule.getSchedule(programId);
    const workouts = (await this.deps.programs.listWorkouts(programId)).filter((w) => w.active);
    return buildAgendaView(schedule, workouts);
  }
}
