export class SessionInProgressError extends Error {
  constructor(
    readonly sessionId: number,
    readonly programId: number,
    readonly workoutName: string,
  ) {
    super('Há um treino em andamento');
    this.name = 'SessionInProgressError';
  }
}
