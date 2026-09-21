# Contrato: leituras, casos de uso e domínio (spec 009)

## Porta `SessionRepository` (002) — leituras novas, somente consulta

```ts
listFinishedSummaries(opts?: { programId?: number }): Promise<SessionSummary[]>
   // uma consulta agregada; só finalizadas; ordem finished_at DESC, id DESC
getFinishedDetail(sessionId: number): Promise<FinishedSessionDetail | null>
   // sessão finalizada + programa + treino + linhas (nome do exercício; prescrição/técnica/notas/display_order por LEFT JOIN em workout_exercise); null se não existe ou não está finalizada
```

Implementadas em `SqliteSessionRepository` (`src/data/repositories/`); não alteram schema.

## Domínio (`src/domain/history/`)

```ts
groupByMonth(items: HistoryItem[]): MonthSection[]                          // meses locais, mais recente primeiro, rótulo "SETEMBRO 2026"
buildEditChanges(original: DetailRow[], draft: DetailRow[]): EditChanges    // só completed e weight que diferem
hasChanges(changes: EditChanges): boolean
```

## Aplicação (`src/application/`)

```ts
ListHistory(deps: { sessions, clock })
  execute(opts?: { programId?: number }): Promise<HistoryItem[]>
  // listFinishedSummaries + duração (formatDuration da 007) + localDate + complete; nenhuma escrita

GetSessionDetail(deps: { sessions })
  execute(sessionId: number): Promise<SessionDetail>
  // getFinishedDetail → SessionDetail; NotFoundError se não existe ou não está finalizada; nenhuma escrita

SaveSessionEdits(deps: { db })
  execute(input: { sessionId: number; changes: EditChanges }): Promise<void>
  // uma transação (repositórios sobre a transação); ValidationError se a sessão não está finalizada ou se weight < 0;
  // NotFoundError se um exercício não pertence à sessão; nunca escreve em workout_session, program_sequence_state nem app_settings
```

Reutilizados: `parseWeightInput` e `formatDuration` (spec 007).
