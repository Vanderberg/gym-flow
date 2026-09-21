# Research: Histórico de Sessões

## D1 — Leituras agregadas novas em `SessionRepository`
- **Decision**: acrescentar à porta e ao adaptador da 002 duas leituras somente de consulta:
  `listFinishedSummaries(opts?: { programId?: number }): Promise<SessionSummary[]>` (uma consulta com JOIN em `training_program` e `workout` e agregação de `workout_session_exercise`: total de linhas e linhas com `completed = 1`, ordenada por `finished_at DESC, id DESC`) e `getFinishedDetail(sessionId): Promise<FinishedSessionDetail | null>` (sessão + programa + treino + linhas com o nome do exercício e, por `LEFT JOIN` em `workout_exercise` pelo par `(workout_id, exercise_id)`, prescrição, técnica, observações e `display_order` quando o exercício ainda está no treino).
- **Rationale**: SC-003 (500 sessões) e a decisão de mostrar "N / M" e duração em cada item; evita N+1 (`getSession` por item). É extensão de leitura da 002, sem migration.
- **Alternatives**: chamar `getSession` para cada sessão (500 consultas); guardar contadores em colunas (duplicação de dado, risco de divergência).

## D2 — Data exibida e ordenação
- **Decision**: a data do item é `localDateOf(finished_at)`; a ordem é `finished_at DESC, id DESC`; os itens são agrupados por mês local ("SETEMBRO 2026").
- **Rationale**: constituição X (data local); consistente com "Concluído hoje" (006), que usa a data de finalização.
- **Alternatives**: `started_at` (diferiria em treinos que cruzam a meia-noite).

## D3 — Prescrição atual, sem cópia (clarificação 2)
- **Decision**: `GetSessionDetail` mostra a prescrição, a técnica e as observações do `workout_exercise` atual quando o exercício ainda está no treino; se saiu da ficha, a linha traz só nome, marcação e peso. Linhas ordenadas por `display_order` quando existe e, para as que saíram da ficha, por nome depois das demais. A sessão não guarda cópia.
- **Rationale**: FR-003 e edge case; nenhuma coluna nova; a sessão antiga continua legível.
- **Alternatives**: coluna de cópia da prescrição (mudança de schema e duplicação; rejeitada na clarificação).

## D4 — Edição em lote (clarificação 1)
- **Decision**: entrar em edição copia as linhas para um rascunho no `historyStore`; alternar ✓/○ e editar peso só mudam o rascunho. `buildEditChanges(original, draft)` produz só as linhas alteradas (`completed` e/ou `weight`). **Salvar** chama `SaveSessionEdits`, que roda em `db.transaction`: para cada mudança, `setExerciseCompleted` e `setExerciseWeight` (repositórios da 002 sobre a transação); qualquer falha desfaz tudo. **Cancelar** descarta o rascunho; com alterações pendentes pede confirmação. Qualquer outra saída da tela (voltar `‹`, gesto de voltar, troca de aba) passa pela mesma confirmação quando `hasChanges`; a navegação é interceptada no detalhe (`beforeRemove`).
- **Rationale**: FR-004; uma transação para todas as alterações evita edição parcial; o histórico não muda por toque acidental.
- **Alternatives**: gravar a cada toque como na 007 (rejeitado na clarificação).

## D5 — O que a edição nunca altera
- **Decision**: `SaveSessionEdits` só recebe mudanças de `completed` e `weight` por `exerciseId` e nunca escreve em `workout_session` (programa, treino, `started_at`, `finished_at`, `completed`), em `program_sequence_state` nem em `app_settings`. Sessão não finalizada → `ValidationError`; exercício que não pertence à sessão → `NotFoundError`; peso negativo → `ValidationError`.
- **Rationale**: FR-004, US2 cenários 2–4 e constituição V.

## D6 — Validação do peso na edição
- **Decision**: o campo usa `WeightInput` e `parseWeightInput` (007): vírgula ou ponto, vazio → sem carga, negativo/inválido → "Informe um valor maior ou igual a 0" ligada ao campo e **Salvar** bloqueado enquanto houver valor inválido. `SaveSessionEdits` revalida (`≥ 0` ou `null`).
- **Rationale**: US2 cenário 3; validação na apresentação e no caso de uso.

## D7 — Filtro só em memória (clarificação 4)
- **Decision**: `historyStore.programFilter: number | null` (null = "Todos"), sem persistência; volta a "Todos" ao reabrir o app; independente do filtro das estatísticas (010). `FilterSelect` lista "Todos" + programas ativos e inativos que tenham sessões.
- **Rationale**: FR-005; simplicidade; sem coluna em `app_settings`.
- **Alternatives**: persistir o filtro ou compartilhá-lo com as estatísticas (rejeitados na clarificação).

## D8 — Lista longa
- **Decision**: `FlatList` com altura de item fixa (72 dp) e `getItemLayout`; cabeçalhos de mês como itens de altura fixa na mesma lista; `keyExtractor` por id; a consulta traz tudo de uma vez (volume de até alguns milhares de linhas é adequado para SQLite local). Sem paginação nesta spec.
- **Rationale**: SC-003 e simplicidade; a virtualização cuida da renderização.
- **Alternatives**: paginação por cursor (complexidade sem necessidade no volume esperado).

## D9 — Atualização após editar
- **Decision**: ao salvar, o detalhe recarrega a sessão e a lista recarrega ao ganhar o foco (`useHistoryList`), refletindo "N / M". Editar o peso de uma sessão antiga altera a "última carga" derivada (007), sem colunas novas.
- **Rationale**: dados sempre vindos do SQLite (constituição I).

## D10 — Sem exclusão nesta spec
- **Decision**: não há ação de excluir sessão; a constituição V proíbe reescrever ou apagar sessões finalizadas por operações do app.
- **Rationale**: Assumptions da spec.
