# Data Model: Execução do Treino

Sem tabelas ou migrations novas. Escreve em `workout_session_exercise` (`completed`, `weight`), `workout_session`
(`finished_at`, `completed`) e `program_sequence_state` (`current_position`), sempre pelos repositórios da 002 e da 004.
Tipos de domínio:

```ts
type WeightParse =
  | { ok: true; value: number | null }        // vazio → null; ≥ 0, 2 casas
  | { ok: false; reason: 'INVALID' }          // negativo, não numérico, NaN, Infinity

interface WorkoutScreenItem {
  exerciseId: number
  name: string
  displayOrder: number
  prescription: string | null
  technique: string | null                    // ex.: 'BI-SET', 'DROP-SET'
  notes: string | null
  completed: boolean
  weight: number | null                       // da sessão em andamento
  lastWeight: number | null                   // última carga do mesmo programa (derivada)
}

interface WorkoutScreenView {
  sessionId: number
  program: { id: number; name: string }
  workout: { id: number; code: string; name: string; position: number; warmupNote: string | null }
  items: WorkoutScreenItem[]                  // por display_order
  progress: { done: number; total: number }   // só exercícios; aquecimento fora
}

interface FinishSummary {
  sessionId: number
  done: number
  total: number
  durationMinutes: number                     // started_at → finished_at
}
```

## Regras

- **Marcação**: `SetExerciseCompleted(sessionId, exerciseId, completed, pendingWeight?)` define o estado alvo (idempotente); `pendingWeight` (já validado) grava peso e marcação numa transação; sessão finalizada não é editada por esta spec (edição de histórico é da spec 010).
- **Peso**: `SetExerciseWeight(sessionId, exerciseId, text)` faz `parseWeightInput`; inválido → `ValidationError` sem gravar; válido → `setExerciseWeight` (nulo ou ≥ 0).
- **Ordem livre**: nenhuma regra usa `displayOrder` além de ordenar a lista.
- **Progresso**: `done` = itens com `completed`; `total` = número de itens; aquecimento nunca entra.
- **Finalização** (transação): 1) pesos pendentes; 2) `finishSession(sessionId, nowLocalIso())`; 3) se `sequenceType = CONTINUOUS`: `upsert(programId, advancePosition(workout.position, activePositions))`; 4) resumo. Falha em qualquer passo desfaz tudo (SC-004). Finalizar com 0 marcados é permitido. Tipo `WEEKLY`: passo 3 não escreve.
- **Última carga**: `getLastWeight(programId, exerciseId)` (002): última sessão finalizada do mesmo programa e exercício com peso; nunca coluna própria.
- **Bi-set**: dois itens independentes, cada um com `completed`, `weight`, `technique` e `notes` próprios; nenhum vínculo é derivado de `technique`.
- **Finalizar duas vezes**: sessão já finalizada → `ConflictError`; a UI navega ao resumo sem alterar nada.
- **Sessão inexistente**: `GetWorkoutSession` devolve `null`; a UI volta à Home.
