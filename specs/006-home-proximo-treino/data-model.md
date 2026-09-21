# Data Model: Home e Próximo Treino

Sem tabelas ou migrations novas. Somente leitura, exceto `startSession` e `discardSession` (spec 002). Tipos de domínio:

```ts
interface WorkoutSummary { id: number; code: string; name: string; exerciseCount: number }

type SequenceRailStep = { code: string; state: 'DONE' | 'CURRENT' | 'PENDING' }
type WeekStripDay = { weekday: number; label: string /* código | '—' | 'opc.' */; isToday: boolean; hasSession: boolean }

type HomeIndicator =
  | { kind: 'RAIL'; steps: SequenceRailStep[] }        // CONTINUOUS
  | { kind: 'WEEK'; days: WeekStripDay[] }             // WEEKLY com agenda
  | { kind: 'NONE' }                                   // WEEKLY sem agenda

type HomeCard =
  | { kind: 'IN_PROGRESS'; sessionId: number; workoutName: string; done: number; total: number }
  | { kind: 'WORKOUT'; workout: WorkoutSummary; dayLabel: string | null; doneToday: boolean }
  | { kind: 'REST'; dayLabel: string; canBrowseWorkouts: true }
  | { kind: 'OPTIONAL_DAY'; dayLabel: string; note: string | null; canBrowseWorkouts: true }
  | { kind: 'NO_SCHEDULE' }                            // atalho para a contínua; sem iniciar
  | { kind: 'NO_WORKOUTS' }

interface HomeView {
  program: { id: number; name: string }
  sequenceType: SequenceType
  indicator: HomeIndicator
  card: HomeCard
  suggestion: string | null                            // training_program.home_suggestion
  localDate: string                                    // "YYYY-MM-DD" usada na resolução
  browsableWorkouts: WorkoutSummary[]                  // para "Ver treinos do programa"
}
```

## Regras

- **Precedência**: sessão em andamento → `IN_PROGRESS` (sem botão de iniciar outro treino; `browsableWorkouts` vem vazio); senão o resultado de `GetNextWorkout`: `WORKOUT` → `WORKOUT`; `REST` → `REST`; `OPTIONAL_DAY` → `OPTIONAL_DAY`; `NO_SCHEDULE` → `NO_SCHEDULE`; `NO_WORKOUTS` → `NO_WORKOUTS`.
- **doneToday**: só na semanal; existe sessão finalizada do mesmo programa e treino com `localDateOf(finishedAt) = localDate`. Não bloqueia o início.
- **dayLabel**: presente na semanal (dia da semana local em caixa alta); nulo na contínua.
- **indicator**: contínua → `RAIL` (DONE antes da posição atual, CURRENT na atual, PENDING depois; posição ausente ou inválida → primeiro CURRENT); semanal com agenda → `WEEK` (7 dias SEG→DOM; `hasSession` se houve sessão finalizada do programa com data local naquele dia da semana corrente, segunda a domingo); semanal sem agenda → `NONE`.
- **suggestion**: `homeSuggestion` do programa ativo quando não vazio; nunca gerada pelo app. Texto do dia opcional = `note` da agenda como está.
- **Início**: `StartWorkout` só é chamado por toque explícito e cria `workout_session` com `program_id` = programa ativo e o `workout_id` escolhido; nenhuma escrita ocorre ao carregar a Home (SC-003).
