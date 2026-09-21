# Data Model: Estratégias de Sequência

Sem tabelas ou migrations novas; usa `program_sequence_state` e `weekly_schedule` (spec 002). Tipos de domínio novos:

```ts
type SequenceType = 'CONTINUOUS' | 'WEEKLY'            // já em domain/settings (002)

interface WorkoutRef { id: number; programId: number; code: string; name: string; position: number }

interface WeeklyDayEntry { weekday: number /*1=seg..7=dom*/; workoutId: number | null; optional: boolean; note: string | null }

interface SequenceContext {
  programId: number
  workouts: WorkoutRef[]              // ativos, ordenados por position
  currentPosition: number | null      // program_sequence_state; null = sem estado
  schedule: WeeklyDayEntry[]          // vazio = programa sem agenda
  today: { weekday: number }          // derivado da data local
}

type NoneReason = 'REST' | 'OPTIONAL_DAY' | 'NO_SCHEDULE' | 'NO_WORKOUTS'

type NextWorkoutResult =
  | { kind: 'WORKOUT'; workout: WorkoutRef }
  | { kind: 'NONE'; reason: NoneReason; note: string | null }
```

## Regras

- **Contínua**: `position = currentPosition` se `1 ≤ p ≤ workouts.length`, senão 1; retorna o treino do índice `position - 1`. Sem treinos → `NONE/NO_WORKOUTS`.
- **Semanal**: `schedule` vazio → `NONE/NO_SCHEDULE`; entrada de `today.weekday` com `workoutId` → `WORKOUT` (o treino deve estar em `workouts`, senão `NONE/REST`); com `workoutId` nulo → `NONE/OPTIONAL_DAY` (se `optional`, com a `note` da linha) ou `NONE/REST`; sem linha para o dia → `NONE/REST`.
- **advancePosition(current, total)**: posição inválida → 1 antes de avançar; resultado `current % total + 1` (último → 1). `total = 0` é erro de programação (o chamador não invoca).
- **Reiniciar**: `current_position = 1`; só quando o tipo ativo é `CONTINUOUS`; nunca altera sessões nem outro programa.
