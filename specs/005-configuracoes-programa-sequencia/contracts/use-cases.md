# Contrato: casos de uso (`src/application/`)

Dependências injetadas (repositórios da 002). Todos assíncronos; erros da 002 (`ValidationError`, `NotFoundError`) mais
`SessionInProgressError` (ver `data-model.md`).

```ts
SelectProgram(deps: { programs, settings, sessions })
  execute(programId: number): Promise<AppSettings>
  // ver regras: bloqueia com sessão em andamento (alvo ≠ ativo); alvo = ativo é no-op; não altera posições

SelectSequenceStrategy(deps: { settings })
  execute(type: SequenceType): Promise<AppSettings>
  // sem bloqueio; escreve só sequence_type

GetProgramAgenda(deps: { programs, schedule })
  execute(programId: number): Promise<AgendaView>
  // buildAgendaView(await schedule.getSchedule(id), await programs.listWorkouts(id))
```

Reutilizados: `ResetSequence.execute(programId)` (spec 004) e `SessionRepository.discardSession(sessionId)` (spec 002,
chamado pela UI após confirmação do usuário).

## Domínio (`src/domain/sequence/agendaView.ts`)

```ts
buildAgendaView(schedule: WeeklyDayEntry[], workouts: WorkoutRef[]): AgendaView   // pura
```
