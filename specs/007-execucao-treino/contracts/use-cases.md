# Contrato: casos de uso e domínio (spec 007)

Repositórios da 002 injetados; `advancePosition` da 004. Erros da 002 (`ValidationError`, `ConflictError`, `NotFoundError`).

## Domínio (`src/domain/workout/`)

```ts
parseWeightInput(text: string): WeightParse              // vírgula ou ponto; vazio → null; ≥ 0
formatWeight(value: number | null): string               // "60" | "62,5" | ""
computeProgress(items: { completed: boolean }[]): { done: number; total: number }
```

Utilitário: `formatDuration(startedAtIso: string, finishedAtIso: string): string` em `src/utils/duration.ts` ("52 min"; menos de 1 min → "menos de 1 min").

## Aplicação (`src/application/`)

```ts
GetWorkoutSession(deps: { sessions, programs })
  execute(): Promise<WorkoutScreenView | null>
  // sessão em andamento + treino + itens (prescrição, técnica, notas) + peso da sessão + última carga; null se não há sessão

SetExerciseCompleted(deps: { sessions })
  execute(input: { sessionId: number; exerciseId: number; completed: boolean; pendingWeight?: number | null }): Promise<void>
  // idempotente; com pendingWeight grava peso e marcação numa transação; NotFoundError se a sessão não tem o exercício

SetExerciseWeight(deps: { sessions })
  execute(input: { sessionId: number; exerciseId: number; text: string }): Promise<{ weight: number | null }>
  // ValidationError se inválido (nada gravado)

FinishWorkout(deps: { db, settings, clock })   // Session/SequenceState/Program repositories são construídos sobre a transação
  execute(input: { sessionId: number; pendingWeights?: Record<number, number | null> }): Promise<FinishSummary>
  // uma transação: pesos pendentes → finishSession → posição (só CONTINUOUS) → resumo; rollback total em falha;
  // sessão já finalizada → ConflictError (a UI navega ao resumo)

GetFinishSummary(deps: { sessions })
  execute(sessionId: number): Promise<FinishSummary>      // NotFoundError se a sessão não existe ou não está finalizada
```

`StartWorkout` e `DiscardInProgressSession` pertencem à 006 (não alterados aqui).
