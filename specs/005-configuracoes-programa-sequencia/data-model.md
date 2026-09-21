# Data Model: Configurações de Programa e Sequência

Sem tabelas ou migrations novas. Usa `app_settings` (`active_program_id`, `sequence_type`), `program_sequence_state`,
`weekly_schedule` e `workout_session` (spec 002). Tipos novos:

```ts
class SessionInProgressError extends Error {
  constructor(readonly sessionId: number, readonly programId: number, readonly workoutName: string)
}

type AgendaDay =
  | { weekday: number; kind: 'WORKOUT'; workoutName: string }
  | { weekday: number; kind: 'REST' }
  | { weekday: number; kind: 'OPTIONAL'; note: string | null }

type AgendaView =
  | { kind: 'NO_SCHEDULE' }
  | { kind: 'DAYS'; days: AgendaDay[] }          // sempre 7 itens, weekday 1..7 (SEG→DOM)

interface SettingsState {                          // settingsStore (só UI)
  settings: AppSettings | null
  inProgress: { sessionId: number; programId: number; workoutName: string } | null
}
```

## Regras

- **SelectProgram**: programa alvo deve existir e estar ativo (`NotFoundError`/`ValidationError` da 002); com sessão em andamento e alvo ≠ ativo → `SessionInProgressError`; alvo = ativo → no-op. Escreve só `active_program_id`. Nunca toca `program_sequence_state` nem sessões.
- **SelectSequenceStrategy**: aceita `CONTINUOUS | WEEKLY`; escreve só `sequence_type`; sem restrição por sessão; nunca toca posições nem sessões.
- **buildAgendaView**: `schedule` vazio → `NO_SCHEDULE`; senão 7 dias; linha com `workoutId` → `WORKOUT` (nome do treino; treino ausente/inativo → `REST`); `workoutId` nulo → `OPTIONAL` se `optional` (com `note`), senão `REST`; dia sem linha → `REST`.
- **Reiniciar**: delega a `ResetSequence` (004); só com tipo `CONTINUOUS`; só o programa ativo.
- **Invariante (SC-002)**: após qualquer combinação de trocas, `workout_session`, `workout_session_exercise` e `program_sequence_state` permanecem idênticos, exceto o descarte explícito da sessão em andamento e o reinício confirmado.
