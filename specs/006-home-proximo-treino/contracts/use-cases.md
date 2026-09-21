# Contrato: casos de uso e domínio (spec 006)

Repositórios da 002 injetados; `GetNextWorkout` da 004. Todos assíncronos, exceto as funções puras.

## Domínio (`src/domain/home/`)

```ts
buildHomeView(input: HomeViewInput): HomeView            // pura; precedência em data-model.md
buildSequenceRail(workouts: WorkoutRef[], currentPosition: number | null): SequenceRailStep[]
buildWeekStrip(schedule: WeeklyDayEntry[], workouts: WorkoutRef[], todayWeekday: number, doneWeekdays: number[]): WeekStripDay[]
```

## Aplicação (`src/application/`)

```ts
GetHomeState(deps: { settings, programs, schedule, sequenceState, sessions, getNextWorkout, clock })
  execute(): Promise<HomeView>
  // lê tudo; NÃO escreve; sessão em andamento tem precedência; doneToday e doneWeekdays vêm de sessions.listFinished({ programId })

StartWorkout(deps: { settings, programs, sessions })
  execute(workoutId: number): Promise<{ sessionId: number }>
  // programa = settings.activeProgramId; treino deve ser ativo e do programa (ValidationError); ConflictError se já há sessão em andamento

DiscardInProgressSession(deps: { sessions })
  execute(): Promise<void>
  // getInProgress() → discardSession(id); sem sessão = no-op; nunca toca sequência nem estatísticas
```

Utilitário: `weekdayLabel(weekday: number, form: 'LONG' | 'SHORT'): string` em `src/utils/weekdayLabel.ts` ("QUINTA-FEIRA" / "QUI").
