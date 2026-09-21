---
description: "Task list for Histórico de Sessões"
---

# Tasks: Histórico de Sessões

**Input**: `specs/009-historico-sessoes/` (plan.md, spec.md, research.md, data-model.md, contracts/use-cases.md, contracts/ui.md, quickstart.md)
**Backlog**: BL-070, BL-071, BL-072, BL-073, BL-074
**Requisitos de produto**: RF-14, RF-15, RF-16
**Depende de**: specs 001–008 concluídas (repositórios da 002, seed, `parseWeightInput`, `WeightInput` e `formatDuration` da 007, componentes comuns)
**Tests**: incluídos — a constituição (XI) exige testes de domínio, persistência e fluxos de UI. Escreva cada teste antes da implementação e veja-o falhar.
**Design**: tokens e componentes de `docs/design-telas.md` §2–3 e §6 ("Placar de academia"). Nenhuma tela usa cor, tamanho ou espaçamento literal.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1 (lista e detalhe), US2 (editar sessão), US3 (filtrar por programa)
- Cada fase lista os BL/RF que cobre; todo commit referencia o BL da tarefa (ex.: `feat(009): BL-074 ...`).

---

## Phase 1: Setup

- [ ] T001 Verificar que as specs 001–008 estão concluídas: `npm run check` passa e `specs/INDEX.md` marca `001` a `008` como `concluída`; se não, parar e avisar
- [ ] T002 [P] Criar as pastas com `.gitkeep` onde ainda não existirem: `src/domain/history/`, `src/components/history/`, `src/components/common/`, `src/app/history/`, `src/store/`, `src/hooks/`, `src/utils/`, `tests/unit/domain/history/`, `tests/unit/utils/`, `tests/unit/store/`, `tests/ui/common/`, `tests/ui/history/`, `tests/integration/data/`, `tests/integration/application/`

---

## Phase 2: Foundational (bloqueia todas as histórias)

**Purpose**: tipos, agrupamento por mês, leituras agregadas do repositório, store e esqueletos das rotas (tudo verde sozinho)

- [ ] T003 [P] Criar `src/domain/history/types.ts` com `SessionSummary`, `HistoryItem`, `DetailRow`, `SessionDetail`, `EditChanges` e `MonthSection` exatamente como em `data-model.md`
- [ ] T004 [P] Escrever `tests/unit/utils/monthLabel.test.ts` e `tests/unit/domain/history/groupByMonth.test.ts` e implementar `src/utils/monthLabel.ts` (`monthLabel('2026-09')` → "SETEMBRO 2026", pt-BR, 12 meses) e `src/domain/history/groupByMonth.ts` (`groupByMonth(items: HistoryItem[]): MonthSection[]`): agrupa por mês da `localDate`, meses do mais recente ao mais antigo, mantém a ordem dos itens dentro do mês, virada de ano, lista vazia → `[]`
- [ ] T005 Escrever `tests/integration/data/sessionHistoryQueries.test.ts` (`createTestDb()` + dados de fixture: 2 programas, várias sessões finalizadas, 1 em andamento, exercício removido da ficha depois) e implementar em `src/domain/session/SessionRepository.ts` e `src/data/repositories/SqliteSessionRepository.ts` as leituras `listFinishedSummaries(opts?: { programId?: number })` e `getFinishedDetail(sessionId)` conforme `contracts/use-cases.md`: só sessões finalizadas, ordem `finished_at DESC, id DESC`, `done`/`total` agregados numa única consulta com JOIN em `training_program` e `workout`, filtro por programa, `getFinishedDetail` com `LEFT JOIN` em `workout_exercise` pelo par `(workout_id, exercise_id)` (prescrição, técnica, observações e `display_order` só quando o exercício ainda está no treino; `inWorkout` falso para o que saiu), `null` para sessão inexistente ou em andamento; nenhuma escrita; 500 sessões respondem em menos de 300 ms
- [ ] T006 [P] Escrever `tests/unit/store/historyStore.test.ts` e implementar `src/store/historyStore.ts` (Zustand): `programFilter: number | null` (null = "Todos"), `edit: { sessionId, original: DetailRow[], draft: DetailRow[] } | null`, ações `setProgramFilter`, `clearProgramFilter`, `startEdit(sessionId, rows)`, `toggleCompleted(exerciseId)`, `setWeight(exerciseId, weight | null, invalid?)`, `cancelEdit()`; casos: o filtro isola-se do rascunho e o rascunho não altera `original`; sem persistência (estado inicial "Todos"); não importa repositórios
- [ ] T007 [P] Criar (se ainda não existirem; senão só conferir) `src/constants/theme.ts` com os tokens de `docs/design-telas.md` §2 e, em `src/components/common/`, `Button.tsx`, `Sheet.tsx`, `ConfirmDialog.tsx`, `EmptyState.tsx`, `ProgramBadge.tsx` e `WeightInput.tsx` conforme §3, só com tokens (mesmos arquivos das specs 005 a 008; não criar variações paralelas)
- [ ] T008 Criar os esqueletos de `src/app/(tabs)/history.tsx` (aba "Histórico", título "HISTÓRICO", estados de carregamento e erro sem dados) e `src/app/history/[sessionId].tsx` (lê `sessionId` da rota; conteúdo entra na US1)

**Checkpoint**: T004–T006 passam; `npm run check` verde; as rotas abrem sem erro.

---

## Phase 3: User Story 1 — Lista e detalhe (P1) 🎯 MVP — BL-070, BL-071, BL-072 · RF-16

**Goal**: ver as sessões finalizadas da mais recente à mais antiga, com data, programa, treino, "N / M" e duração, e abrir o detalhe com marcações, pesos e prescrição atual.
**Independent Test**: com sessões de dois programas, listar e abrir uma (quickstart, itens 2–3).

### Tests

- [ ] T009 [P] [US1] Escrever `tests/integration/application/listHistory.test.ts` (`createTestDb()` + seed + sessões de fixture): devolve só finalizadas, mais recentes primeiro, com `programName`, `workoutCode`, `workoutName`, `done`/`total`, `durationLabel` (ex.: "52 min") e `complete` (✓ quando `done === total`); `localDate` no dia local de `finished_at` (relógio às 23:30 com deslocamento −03:00 continua no mesmo dia); sessão em andamento não aparece; nenhuma escrita (snapshot de `workout_session*`, `program_sequence_state` e `app_settings` idêntico); 500 sessões em menos de 300 ms
- [ ] T010 [P] [US1] Escrever `tests/integration/application/getSessionDetail.test.ts`: devolve programa, treino, data local, "N / M", duração e linhas na ordem da ficha, cada uma com `completed`, `weight` e, quando o exercício ainda está no treino, `prescription`, `technique` e `notes` como estão; exercício que saiu da ficha continua listado (nome, marcação e peso) sem prescrição e depois das demais; prescrição alterada no seed depois da sessão mostra a atual; sessão inexistente ou em andamento → `NotFoundError`; nenhuma escrita; o detalhe responde em menos de 200 ms sobre o SQLite em memória
- [ ] T011 [P] [US1] Escrever `tests/ui/history/historyList.test.tsx` (RNTL, casos de uso e router simulados): lista agrupada com cabeçalho de mês ("SETEMBRO 2026") e itens com data (dia), programa, "<código> — <treino>", "N / M realizados" (✓ quando completo) e duração; item inteiro é um botão de altura mínima 72 dp e tocar navega para `/history/<id>` (2 toques desde a aba — SC-001); vazio mostra "Ainda não existem treinos registrados." com **Ir para o treino** (navega para a Home); erro mostra "Não foi possível carregar o histórico" com **Tentar de novo**; carregando mostra 4 esqueletos; `getItemLayout` de altura fixa e `keyExtractor` por id; recarrega ao ganhar o foco
- [ ] T012 [P] [US1] Escrever `tests/ui/history/sessionDetail.test.tsx` (RNTL): mostra "<TREINO> — <NOME>", programa, data local (dd/mm/aaaa) e "N / M realizados"; feito = ✓ + peso ("sem carga" se nulo), não realizado = ○ + "não realizado" (nunca só por cor); prescrição abaixo do nome como texto só quando `inWorkout`; exercício que saiu da ficha aparece sem prescrição; não há como trocar programa, treino ou data nem excluir a sessão; não há botão de edição na US1 (entra na US2)

### Implementation

- [ ] T013 [US1] Implementar `src/application/ListHistory.ts` conforme `contracts/use-cases.md` (`SessionRepository.listFinishedSummaries` + `localDateOf(finishedAt)` + `formatDuration` da 007 + `complete`; filtro opcional já repassado; nenhuma escrita) — faz T009 passar
- [ ] T014 [P] [US1] Implementar `src/application/GetSessionDetail.ts` (`getFinishedDetail` → `SessionDetail` com data local e duração; `NotFoundError` se não existe ou não está finalizada; nenhuma escrita) — faz T010 passar
- [ ] T015 [P] [US1] Criar `src/components/history/MonthHeader.tsx`, `src/components/history/SessionListItem.tsx` (altura fixa 72 dp, item inteiro botão, nome de treino em até 2 linhas, ✓ + contagem quando completo, programa omitido por prop `showProgram`) e `src/components/history/SessionDetailRow.tsx` (modo somente leitura: ✓/○, nome, prescrição, peso/"sem carga"/"não realizado"), só com tokens
- [ ] T016 [US1] Criar `src/hooks/useHistoryList.ts` (`items`, `sections` via `groupByMonth`, `status`, `reload()`, recarrega ao ganhar o foco; sem regra de negócio) e completar `src/app/(tabs)/history.tsx` com `FlatList` (cabeçalhos de mês como itens de altura fixa, `getItemLayout`, `keyExtractor`), os estados carregando (4 esqueletos), erro, vazio e a navegação ao detalhe — faz T011 passar
- [ ] T017 [US1] Completar `src/app/history/[sessionId].tsx` (cabeçalho com `‹`, linhas via `SessionDetailRow`, `GetSessionDetail`; sem botão de edição até a US2) — faz T012 passar

**Checkpoint**: US1 testável sozinha (não depende de US2/US3); `npm run check` verde.

---

## Phase 4: User Story 2 — Editar sessão (P1) — BL-074 · RF-15, RF-14

**Goal**: corrigir marcações e pesos de uma sessão passada em um modo de edição (EDITAR → Salvar/Cancelar), gravando tudo em uma transação e sem mudar programa, treino, data nem sequência.
**Independent Test**: editar peso e marcação, salvar, reabrir e conferir; Cancelar não grava (quickstart, itens 2–4). Depende do detalhe da US1.

### Tests

- [ ] T018 [P] [US2] Escrever `tests/unit/domain/history/editChanges.test.ts`: `buildEditChanges` devolve só as linhas cujo `completed` ou `weight` diferem do original (com só o campo alterado); sem diferenças → `rows: []`; alternar duas vezes volta ao original e não gera mudança; peso de "60" para vazio gera `weight: null`; `hasChanges` verdadeiro só com pelo menos uma linha
- [ ] T019 [P] [US2] Escrever `tests/integration/application/saveSessionEdits.test.ts` (`createTestDb()` + seed + sessão finalizada): grava marcações e pesos alterados e persiste em nova conexão ao mesmo banco; tudo numa transação (Database decorador que lança na segunda escrita desfaz todas: nenhuma linha muda); `workout_session` (`program_id`, `workout_id`, `started_at`, `finished_at`, `completed`), `program_sequence_state` e `app_settings` idênticos antes e depois (US2 cenários 2 e 4); peso negativo → `ValidationError` sem gravar nada; sessão em andamento → `ValidationError`; exercício que não pertence à sessão → `NotFoundError`; peso nulo aceito; sessão finalizada continua finalizada com 0 marcados
- [ ] T020 [P] [US2] Escrever `tests/integration/application/historyPreservation.test.ts` (BL-104 estendido, SC-002): depois de `SaveSessionEdits`, `GetSessionDetail` e `ListHistory` em nova conexão mostram os valores novos e o "N / M" recalculado; `getLastWeight` (002) do mesmo programa e exercício passa a refletir o peso editado da última sessão finalizada (sem coluna nova); nenhuma sessão é apagada e a contagem de sessões finalizadas não muda
- [ ] T021 [P] [US2] Escrever `tests/ui/history/sessionEdit.test.tsx` (RNTL, casos de uso simulados): **EDITAR** libera alternar ✓/○ e o campo de peso (`WeightInput`, vírgula ou ponto) e mostra **Salvar** e **Cancelar**; nada é gravado enquanto as alterações estão pendentes; **Salvar** chama `SaveSessionEdits` uma vez com só as mudanças, sai da edição e mostra o detalhe atualizado; peso inválido mostra "Informe um valor maior ou igual a 0" ligada ao campo e bloqueia **Salvar**; **Cancelar** sem alterações sai sem confirmação; com alterações abre `ConfirmDialog` ("Descartar as alterações?"), cancelar mantém o rascunho e confirmar descarta sem chamar `SaveSessionEdits`; voltar `‹`, gesto de voltar e troca de aba com alterações pendentes abrem o mesmo `ConfirmDialog` (manter continua na edição; confirmar descarta) e sem alterações saem direto; falha ao salvar mostra "Não foi possível salvar. Nada foi alterado." e mantém o rascunho; não há campos para programa, treino ou data

### Implementation

- [ ] T022 [P] [US2] Implementar `src/domain/history/editChanges.ts` (`buildEditChanges`, `hasChanges`; puro) — faz T018 passar
- [ ] T023 [US2] Implementar `src/application/SaveSessionEdits.ts` conforme `contracts/use-cases.md`: `db.transaction` com repositórios sobre a transação; valida sessão finalizada e `weight` nulo ou ≥ 0; `setExerciseCompleted`/`setExerciseWeight` só para as mudanças; nunca escreve em `workout_session`, `program_sequence_state` nem `app_settings` — faz T019 e T020 passarem
- [ ] T024 [P] [US2] Criar `src/components/history/EditActionBar.tsx` (**EDITAR** no detalhe; **Salvar** primário e **Cancelar** na edição, **Salvar** desabilitado com peso inválido) e estender `src/components/history/SessionDetailRow.tsx` com o modo editável (toque alterna ✓/○, `WeightInput` com `parseWeightInput` da 007, erro inline, `accessibilityLabel` "Exercício X, realizado, 80 quilos")
- [ ] T025 [US2] Criar `src/hooks/useSessionEdit.ts` (`startEdit`, `toggleCompleted`, `setWeight`, `save()`, `cancel()` com confirmação quando `hasChanges`) sobre o `historyStore` e `SaveSessionEdits`, e ligar em `src/app/history/[sessionId].tsx` o modo de edição, o `ConfirmDialog` de cancelamento, a interceptação da saída da tela (`beforeRemove`) quando `hasChanges` com o mesmo `ConfirmDialog` e o recarregamento do detalhe após salvar — faz T021 passar

**Checkpoint**: US1 e US2 funcionam; nenhuma edição altera programa, treino, data nem sequência.

---

## Phase 5: User Story 3 — Filtrar por programa (P2) — BL-073 · RF-16

**Goal**: filtrar o histórico por programa (Todos ou cada programa), só em memória.
**Independent Test**: alternar filtros e conferir a lista; reabrir o app volta a "Todos" (quickstart, item 3). Depende da lista da US1.

### Tests

- [ ] T026 [P] [US3] Acrescentar a `tests/integration/application/listHistory.test.ts` os casos do filtro: `programId` devolve só as sessões daquele programa; sem filtro devolve todas; programa sem sessões → lista vazia; programa inativo com sessões continua filtrável; a ordem e as contagens não mudam com o filtro
- [ ] T027 [P] [US3] Escrever `tests/ui/common/FilterSelect.test.tsx` (RNTL) e `tests/ui/history/historyFilter.test.tsx`: `FilterSelect` mostra "Todos ▼" e abre um `Sheet` com "Todos" e cada programa que tem sessões (marcando o atual); escolher um programa filtra a lista e "Todos" restaura; com filtro ativo o nome do programa pode sair do item; filtro sem sessões mostra "Nenhum treino deste programa." com **Limpar filtro**; ao desmontar e montar de novo o app o filtro volta a "Todos" (não persistido) e não altera nada fora do `historyStore`; abrir/fechar o `Sheet` não altera a lista

### Implementation

- [ ] T028 [P] [US3] Criar `src/components/common/FilterSelect.tsx` conforme `docs/design-telas.md` §3 (botão "Todos ▼" que abre `Sheet` com a lista; alvos ≥ 48 dp; estado selecionado com ✓ além da cor), reutilizável pela spec 010 — faz T027 (parte do componente) passar
- [ ] T029 [US3] Ligar o filtro em `src/hooks/useHistoryList.ts` (`programFilter` do `historyStore` repassado a `ListHistory`, lista de programas com sessões para o `FilterSelect`) e em `src/app/(tabs)/history.tsx` (`FilterSelect` no cabeçalho, `showProgram = false` quando há filtro, estado vazio com filtro e **Limpar filtro**) — faz T026 e T027 passarem

**Checkpoint**: todas as histórias independentes do ponto de vista de teste.

---

## Phase 6: Polish & cross-cutting

- [ ] T030 [P] Atualizar `docs/design-telas.md` §6 (edição em lote: EDITAR → Salvar/Cancelar numa transação; prescrição atual da ficha só quando o exercício ainda está no treino; filtro só em memória; itens com "N / M" e duração) e §3 (acrescentar `SessionListItem`, `MonthHeader`, `SessionDetailRow` e `EditActionBar`; conferir `FilterSelect`)
- [ ] T031 [P] Atualizar `docs/telas.md` (histórico, detalhe e edição), `docs/arquitetura.md` (leituras agregadas `listFinishedSummaries` e `getFinishedDetail` em `SessionRepository`), `docs/prototipo-telas.html` se divergir, e conferir `docs/backlog.md` (BL-070..074)
- [ ] T032 Auditoria de consistência visual: comparar `src/app/(tabs)/history.tsx`, `src/app/history/[sessionId].tsx`, `src/components/history/*` e `FilterSelect` com `theme.ts` e `docs/design-telas.md` §2–3 e §6 (nenhum valor literal de cor/tamanho, alvos ≥ 48 dp, item de lista ≥ 72 dp, feito/não realizado sem depender só de cor, ação destrutiva nunca primária) e corrigir qualquer desvio
- [ ] T033 Rodar `npm run check` (lint, tipos e testes) e os passos do `quickstart.md` (incluindo a validação manual em Android e iOS: editar, salvar, fechar o app à força e reabrir); marcar a spec como `concluída` em `specs/INDEX.md`

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → histórias → Polish. Na Phase 2, T003, T004, T006 e T007 são paralelizáveis; T005 depende de T003; T008 depende de T006 e T007. A fase termina verde.
- **US1** depende só da Phase 2 e entrega o núcleo (lista, detalhe somente leitura, casos de uso de leitura). **US2** depende do detalhe da US1 (T017) e do `WeightInput` da 007. **US3** depende da lista da US1 (T016). US2 e US3 são independentes entre si, mas não devem rodar em paralelo: T025 e T017 editam `src/app/history/[sessionId].tsx`, T029 e T016 editam `src/app/(tabs)/history.tsx`, e T015 e T024 editam `SessionDetailRow.tsx`; T026 acrescenta casos ao arquivo de T009.
- Polish só depois das histórias desejadas; T032 depois de todas as telas.

### Parallel examples

```text
Phase 2:  T003 T004 T006 T007
US1:      T009 T010 T011 T012   → T014 T015 (T013 e T016 em sequência)
US2:      T018 T019 T020 T021   → T022 T024 (T023 antes de T025)
US3:      T026 T027             → T028
Polish:   T030 T031
```

## Implementation Strategy

1. **MVP**: Phases 1–3 (lista e detalhe das sessões finalizadas) — já cobre a consulta básica do que foi feito.
2. Incremental: US2 (editar sessão, o que mais precisa de cuidado com a integridade do histórico) → US3 (filtro) → Polish (docs e auditoria visual).
3. Um item só está concluído com lint, tipos e testes passando.
