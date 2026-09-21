# Data Model: Histórico de Sessões

Sem tabelas ou migrations novas. Lê `workout_session`, `workout_session_exercise`, `training_program`, `workout`,
`workout_exercise` e `exercise`; escreve somente `workout_session_exercise.completed` e `.weight` (por `Salvar`). Tipos de
domínio:

```ts
interface SessionSummary {                 // linha da lista (consulta agregada)
  sessionId: number
  programId: number
  programName: string
  workoutCode: string
  workoutName: string
  startedAt: string                        // ISO local com deslocamento
  finishedAt: string
  done: number                             // linhas com completed = 1
  total: number                            // linhas da sessão
}

interface HistoryItem extends SessionSummary {
  localDate: string                        // "YYYY-MM-DD" de finishedAt
  durationLabel: string                    // "52 min" (formatDuration, 007)
  complete: boolean                        // done === total && total > 0
}

interface DetailRow {
  exerciseId: number
  name: string
  completed: boolean
  weight: number | null
  prescription: string | null              // da ficha atual; null se o exercício saiu do treino
  technique: string | null
  notes: string | null
  inWorkout: boolean                       // ainda existe em workout_exercise
}

interface SessionDetail {
  sessionId: number
  program: { id: number; name: string }
  workout: { id: number; code: string; name: string }
  finishedAt: string
  durationLabel: string
  done: number
  total: number
  rows: DetailRow[]                        // display_order da ficha; os que saíram, por nome, depois
}

interface FinishedSessionDetail {          // retorno da leitura do repositório (getFinishedDetail)
  sessionId: number
  programId: number
  programName: string
  workoutId: number
  workoutCode: string
  workoutName: string
  startedAt: string
  finishedAt: string
  rows: { exerciseId: number; name: string; completed: boolean; weight: number | null;
          prescription: string | null; technique: string | null; notes: string | null;
          displayOrder: number | null; inWorkout: boolean }[]
}
// GetSessionDetail converte FinishedSessionDetail em SessionDetail (data local, duração, done/total, ordem das linhas)

interface EditChanges {                    // só linhas alteradas
  rows: { exerciseId: number; completed?: boolean; weight?: number | null }[]
}

interface MonthSection { key: string /* "2026-09" */; label: string /* "SETEMBRO 2026" */; items: HistoryItem[] }
```

## Regras

- **Lista**: só sessões finalizadas (`finished_at IS NOT NULL`), ordem `finished_at DESC, id DESC`; filtro opcional por `programId`; agrupamento por mês local (`groupByMonth`); `done/total` e duração vêm da consulta agregada; `complete` mostra ✓.
- **Detalhe**: linhas por `display_order` quando o exercício ainda está no treino; as que saíram da ficha (`inWorkout = false`) vêm depois, por nome, sem prescrição. Feito = ✓ + peso ("sem carga" se nulo); não realizado = ○ + "não realizado". Nenhuma cópia da prescrição é guardada.
- **Edição**: `buildEditChanges(original, draft)` compara linha a linha; só entram diferenças de `completed` e `weight`; `hasChanges` decide se Cancelar pede confirmação. Valores de peso: nulo ou ≥ 0 (mesma regra da 007).
- **SaveSessionEdits** (uma transação): sessão precisa estar finalizada; cada mudança usa `setExerciseCompleted`/`setExerciseWeight`; falha desfaz tudo. Nunca escreve em `workout_session`, `program_sequence_state` nem `app_settings`.
- **Invariante (US2 cenários 2 e 4, constituição V)**: antes e depois de `Salvar`, programa, treino, `started_at`, `finished_at`, `completed` da sessão, posições das sequências e configurações permanecem idênticos; só mudam as linhas editadas.
- **Efeito derivado**: editar peso de uma sessão altera a "última carga" (007), que é derivada do histórico; não existe coluna `last_weight`.
- **Sem exclusão**: nenhuma operação apaga sessão nesta spec.
