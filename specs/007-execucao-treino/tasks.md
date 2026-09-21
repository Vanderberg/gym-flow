---
description: "Task list for Execução do Treino"
---

# Tasks: Execução do Treino

**Input**: `specs/007-execucao-treino/` (plan.md, spec.md, research.md, data-model.md, contracts/use-cases.md, contracts/ui.md, quickstart.md)
**Backlog**: BL-060, BL-061, BL-062, BL-063, BL-064, BL-065, BL-066, BL-067, BL-104, BL-121
**Requisitos de produto**: RF-04, RF-05, RF-06, RF-07, RF-08, RF-09, RF-10, RF-11, RF-27, RF-28
**Depende de**: specs 001–006 concluídas (repositórios, seed, `advancePosition`, `StartWorkout`, rota de entrada, tokens e componentes comuns)
**Tests**: incluídos — a constituição (XI) exige testes de domínio, persistência e fluxos de UI. Escreva cada teste antes da implementação e veja-o falhar.
**Design**: tokens e componentes de `docs/design-telas.md` §2–3 e §5 ("Placar de academia"). Nenhuma tela usa cor, tamanho ou espaçamento literal.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1 (marcar exercícios e finalizar), US2 (peso, última carga e prescrição), US3 (aquecimento e recuperação de sessão)
- Cada fase lista os BL/RF que cobre; todo commit referencia o BL da tarefa (ex.: `feat(007): BL-066 ...`).

---

## Phase 1: Setup

- [X] T001 Verificar que as specs 001–006 estão concluídas: `npm run check` passa e `specs/INDEX.md` marca `001` a `006` como `concluída`; se não, parar e avisar
- [X] T002 [P] Criar as pastas com `.gitkeep` onde ainda não existirem: `src/domain/workout/`, `src/application/`, `src/utils/`, `src/store/`, `src/hooks/`, `src/app/workout/`, `src/components/common/`, `src/components/workout/`, `tests/unit/domain/workout/`, `tests/unit/utils/`, `tests/unit/store/`, `tests/ui/common/`, `tests/ui/workout/`, `tests/integration/application/`

---

## Phase 2: Foundational (bloqueia todas as histórias)

**Purpose**: tipos, progresso, duração, componentes do design, store e esqueleto das rotas (tudo verde sozinho)

- [X] T003 [P] Criar `src/domain/workout/types.ts` com `WorkoutScreenItem`, `WorkoutScreenView` e `FinishSummary` exatamente como em `data-model.md` (`WeightParse` entra na US2; `lastWeight` existe no tipo com valor `null` até a US2; `warmupNote` nulo até a US3)
- [X] T004 [P] Escrever `tests/unit/domain/workout/progress.test.ts` e implementar `src/domain/workout/progress.ts` (`computeProgress(items): { done, total }`): 0 itens → `{0,0}`; nenhum marcado; parcialmente marcado; todos marcados; conta só os itens recebidos (o aquecimento nunca é item)
- [X] T005 [P] Escrever `tests/unit/utils/duration.test.ts` e implementar `src/utils/duration.ts` (`formatDuration(startedAtIso, finishedAtIso): string` a partir de ISO local com deslocamento de fuso, ex.: `2026-09-20T18:00:00-03:00` → `2026-09-20T18:52:10-03:00` = "52 min"; menos de 1 min → "menos de 1 min"; 1 h 05 min → "65 min"; mesmo deslocamento em ambos, sem converter para UTC o dia)
- [X] T006 [P] Criar (se ainda não existirem; senão só conferir) `src/constants/theme.ts` com os tokens de `docs/design-telas.md` §2 e, em `src/components/common/`, `Button.tsx`, `Card.tsx`, `Sheet.tsx`, `ConfirmDialog.tsx`, `EmptyState.tsx` e `ProgramBadge.tsx` conforme §3, só com tokens (mesmos arquivos das specs 005 e 006; não criar variações paralelas)
- [X] T007 [P] Escrever `tests/ui/common/SegmentedProgress.test.tsx` (RNTL) e implementar `src/components/common/SegmentedProgress.tsx` conforme `docs/design-telas.md` §3: N segmentos (um por exercício), feitos em `accent`, sempre acompanhado do texto "4 / 6 realizados" (nunca só a barra), `accessibilityLabel` com o texto; N = 0 não renderiza segmentos e mostra "0 / 0 realizados"
- [X] T008 [P] Criar `src/store/workoutStore.ts` (Zustand): `view: WorkoutScreenView | null`, `status: 'loading' | 'ready' | 'error' | 'noSession'`, `expanded: Record<number, boolean>`, `drafts: Record<number, string>` (texto do peso por exercício), `cardErrors: Record<number, string>`, ações `setView`, `setStatus`, `toggleExpanded`, `setDraft`, `setCardError`, `clearCardError`; não grava nada e não é fonte de verdade
- [X] T009 Escrever `tests/unit/store/workoutStore.test.ts` (transições de status; expandir/recolher; rascunho e erro por cartão isolados por `exerciseId`; `setView` mantém rascunhos existentes de exercícios que continuam na lista) e ajustar T008 até passar
- [X] T010 Criar os esqueletos de `src/app/workout/index.tsx` (cabeçalho, `status = 'loading'` mostra esqueleto simples) e `src/app/workout/summary.tsx` (lê `sessionId` da rota; conteúdo entra na US1)

**Checkpoint**: T004, T005, T007 e T009 passam; `npm run check` verde; as rotas abrem sem erro.

---

## Phase 3: User Story 1 — Marcar exercícios e finalizar (P1) 🎯 MVP — BL-060, BL-061, BL-062, BL-066 · RF-05, RF-06, RF-07, RF-10, RF-11

**Goal**: listar os exercícios do treino, marcar e desmarcar em qualquer ordem e finalizar mesmo incompleto, com avanço da contínua a partir do treino finalizado.
**Independent Test**: iniciar um treino, marcar alguns exercícios fora de ordem, finalizar e conferir a sessão finalizada, o resumo e a posição (quickstart, itens 2–3).

### Tests

- [X] T011 [P] [US1] Escrever `tests/integration/application/getWorkoutSession.test.ts` (`createTestDb()` + seed): com sessão em andamento devolve `WorkoutScreenView` com programa, treino (código, nome, posição), itens por `display_order` com `name`, `prescription`, `technique`, `notes`, `completed`, `weight` e `progress`; sem sessão em andamento devolve `null`; Monstro A (11 exercícios) e Padrão Dia 1 (6) conferem contagens e o carregamento do Monstro A responde em menos de 300 ms sobre o SQLite em memória; nenhuma escrita
- [X] T012 [P] [US1] Escrever `tests/integration/application/setExerciseCompleted.test.ts`: marca e desmarca qualquer exercício em qualquer ordem (sem bloqueio); é idempotente (marcar duas vezes = marcado; desmarcar sem estar marcado = desmarcado); persiste em nova conexão ao mesmo banco; exercício que não pertence à sessão → `NotFoundError`; sessão finalizada não é alterada por este caso de uso (`ValidationError`)
- [X] T013 [P] [US1] Escrever `tests/integration/application/finishWorkout.test.ts`: finaliza com 0, com alguns e com todos marcados (`finished_at` preenchido, `completed = 1`, exercícios pendentes ficam `completed = 0`); contínua avança a posição para a seguinte à do treino finalizado (posição 3 → 4; último → 1; com lacuna nas posições ativas respeita `advancePosition`); sequência reiniciada (posição 1) com sessão do treino de posição 3 em andamento → após finalizar a posição é 4; semanal não escreve em `program_sequence_state`; falha forçada no meio (Database decorador que lança no `upsert` da posição) desfaz tudo: sessão continua em andamento, `finished_at` nulo e posição inalterada (SC-004); depois de finalizar não há sessão em andamento; segunda chamada com a sessão já finalizada → `ConflictError` sem alterar nada; sessões antigas intactas
- [X] T014 [P] [US1] Escrever `tests/integration/application/getFinishSummary.test.ts`: sessão finalizada com 7 de 9 marcados → `{ done: 7, total: 9, durationMinutes }` (duração de `started_at` a `finished_at` com relógio fixo); sessão em andamento ou inexistente → `NotFoundError`; o aquecimento não entra em `total`
- [X] T015 [P] [US1] Escrever `tests/ui/workout/workout.test.tsx` (RNTL, casos de uso e router simulados), casos da US1: lista os exercícios na ordem padrão com cabeçalho "TREINO <código>", nome do treino, `ProgramBadge` e "N / M realizados"; tocar em ✓ FEITO de um exercício do meio marca sem exigir ordem e atualiza o progresso; tocar no cartão feito reabre e **desmarca**; **FINALIZAR TREINO** está sempre habilitado (também com 0 marcados) e abre o diálogo "Finalizar treino? N de M exercícios realizados. (K pendentes serão registrados como não realizados)"; **Cancelar** não escreve nada; **Finalizar** chama `FinishWorkout` e navega para `/workout/summary?sessionId=…`; falha na finalização mostra "Não foi possível finalizar. Nada foi alterado." e a sessão continua; segundo toque em FINALIZAR com a sessão já finalizada leva ao resumo sem reabrir o diálogo; não existe ação de descartar
- [X] T016 [P] [US1] Escrever `tests/ui/workout/summary.test.tsx` (RNTL): mostra "Treino concluído", "7 de 9 exercícios realizados", a duração (ex.: "52 min") e **Voltar ao início** (`router.replace('/')`); não mostra "Próximo" nem confete

### Implementation

- [X] T017 [US1] Implementar `src/application/GetWorkoutSession.ts` conforme `contracts/use-cases.md`: lê a sessão em andamento (`getInProgress`), o treino com exercícios (`getWorkoutWithExercises`), o programa e monta `WorkoutScreenView` (itens por `display_order`, `progress` via `computeProgress`); `lastWeight = null` até a US2, `warmupNote = null` até a US3; sem escrita — faz T011 passar
- [X] T018 [P] [US1] Implementar `src/application/SetExerciseCompleted.ts`: define o estado alvo via `SessionRepository.setExerciseCompleted` (idempotente); recusa sessão finalizada; sem `pendingWeight` até a US2 — faz T012 passar
- [X] T019 [US1] Implementar `src/application/FinishWorkout.ts` conforme `contracts/use-cases.md` (deps: `db`, `settings`, `clock`; repositórios construídos sobre a transação; sessão já finalizada → `ConflictError`): em `db.transaction` chama `finishSession(sessionId, nowLocalIso(clock))` e, se `settings.sequenceType = 'CONTINUOUS'`, `SequenceStateRepository.upsert(programId, advancePosition(treino.position, posiçõesAtivas))` (004), devolvendo `FinishSummary`; sem `pendingWeights` até a US2; sem `if` por nome de programa — faz T013 passar
- [X] T020 [P] [US1] Implementar `src/application/GetFinishSummary.ts` (lê a sessão finalizada, conta `done`/`total` das linhas de exercício e calcula a duração com `formatDuration`) — faz T014 passar
- [X] T021 [US1] Criar `src/hooks/useWorkoutSession.ts` (`view`, `status`, `load()`, `setCompleted(exerciseId, completed)`, `finish()`): carrega via `GetWorkoutSession` para o `workoutStore` (sem sessão → `noSession`); `setCompleted` chama `SetExerciseCompleted` e recarrega; `finish` chama `FinishWorkout` e navega para o resumo; nenhuma regra de negócio no hook
- [X] T022 [P] [US1] Criar `src/components/workout/ExerciseCard.tsx` (versão base): cartão pendente expandido com nome, ✓ FEITO (`Button primary`); cartão feito colapsado com borda `accent` e nome, tocar reabre para desmarcar; qualquer cartão pode ser expandido; nome longo em até 2 linhas; estado feito/pendente com ícone e `accessibilityState` além da cor; slots opcionais `onInfo` e `onHelp` não renderizados sem handler
- [X] T023 [P] [US1] Criar `src/components/workout/FinishBar.tsx` (barra fixa inferior, **FINALIZAR TREINO** sempre habilitado, some com o teclado aberto) e `src/components/workout/FinishSummaryView.tsx` ("Treino concluído", "N de M exercícios realizados", duração, **Voltar ao início**; sem "Próximo")
- [X] T024 [US1] Completar `src/app/workout/index.tsx` (cabeçalho com `‹`, "TREINO <código>", nome, `ProgramBadge`, `SegmentedProgress`; lista de `ExerciseCard`; `FinishBar`; `ConfirmDialog` de finalização; aviso de falha) e `src/app/workout/summary.tsx` (via `GetFinishSummary` e `FinishSummaryView`) — faz T015 e T016 passarem

**Checkpoint**: US1 testável sozinha (não depende de US2/US3); `npm run check` verde.

---

## Phase 4: User Story 2 — Peso, última carga e prescrição (P1) — BL-063, BL-064, BL-065 · RF-05, RF-08, RF-09, RF-27

**Goal**: registrar peso (vírgula ou ponto), ver a última carga do mesmo programa, a prescrição como na ficha e o bi-set como dois cartões.
**Independent Test**: registrar peso em uma sessão, finalizar e iniciar outra do mesmo programa (quickstart, itens 2–4). Depende do núcleo da US1.

### Tests

- [X] T025 [P] [US2] Escrever `tests/unit/domain/workout/weight.test.ts`: `parseWeightInput` aceita "60", "62,5", "62.5", " 60 "; vazio → `{ ok: true, value: null }`; "0" → 0; "-1" e "-0,5" → `INVALID`; "abc", "1,2,3", "NaN", "Infinity" → `INVALID`; "62,555" → 62,56 (2 casas); "999999" é aceito (sem limite superior); `formatWeight(62.5)` = "62,5", `formatWeight(60)` = "60", `formatWeight(null)` = ""
- [X] T026 [P] [US2] Escrever `tests/integration/application/setExerciseWeight.test.ts`: texto válido grava peso nulo ou ≥ 0 e persiste em nova conexão; "62,5" grava 62,5; negativo ou inválido lança `ValidationError` e nada é gravado; sessão finalizada não aceita; exercício fora da sessão → `NotFoundError`
- [X] T027 [P] [US2] Acrescentar a `tests/integration/application/getWorkoutSession.test.ts` os casos da US2: `lastWeight` vem da última sessão finalizada do **mesmo programa** com peso para o exercício; sessão de outro programa não conta; sem histórico → `null`; a sessão em andamento não conta; itens BI-SET do Monstro chegam como dois itens independentes, cada um com `completed`, `weight`, `technique` e `notes` próprios como estão na ficha; `prescription`, `technique` e `notes` chegam como estão na ficha
- [X] T028 [P] [US2] Acrescentar a `tests/integration/application/setExerciseCompleted.test.ts` e a `finishWorkout.test.ts` os casos de peso pendente: `SetExerciseCompleted` com `pendingWeight` grava peso e marcação juntos (falha forçada desfaz os dois); `FinishWorkout` com `pendingWeights` grava os pesos na mesma transação e a falha desfaz pesos, sessão e posição
- [X] T029 [P] [US2] Escrever `tests/ui/common/WeightInput.test.tsx` (RNTL) e `tests/ui/common/PrescriptionBlock.test.tsx`: campo de peso com teclado decimal e sufixo "kg"; `−`/`+` ajustam 2,5 kg (mínimo 0) com `accessibilityLabel` "Diminuir 2,5 quilos"/"Aumentar 2,5 quilos"; valor inválido mostra "Informe um valor maior ou igual a 0" ligada ao campo; `PrescriptionBlock` exibe prescrição, `TechniqueChip` (contorno `accent`, caixa alta) e observações como texto, com quebra de linha e sem interpretar
- [X] T030 [P] [US2] Acrescentar a `tests/ui/workout/workout.test.tsx` os casos da US2: exibe "ÚLTIMA CARGA 60 kg" ou "Sem carga anterior"; **Usar 60 kg** copia a última carga para o campo e grava, nunca preenche sozinho e não aparece sem última carga; peso digitado é salvo ao perder o foco, ao tocar −/+ ou em "Usar X kg" (2 toques com "Usar" — SC-001); valor digitado e ainda não confirmado é enviado junto ao tocar FEITO (`pendingWeight`) e ao finalizar (`pendingWeights`); peso inválido não grava; erro ao salvar mostra aviso inline com **Tentar de novo** e mantém o valor digitado; bi-set mostra dois cartões independentes, cada um com chip BI-SET, observação do parceiro, marcação e carga próprias (sem barra ou vínculo derivado da técnica); digitar o peso e tocar FEITO conta 2 toques (SC-001); não existe campo de repetições realizadas nem texto que sugira aumentar ou diminuir carga (FR-008); cartão feito colapsado mostra a primeira linha da prescrição e a carga

### Implementation

- [X] T031 [P] [US2] Implementar `src/domain/workout/weight.ts` (`parseWeightInput`, `formatWeight`) e adicionar `WeightParse` a `src/domain/workout/types.ts` — faz T025 passar
- [X] T032 [US2] Implementar `src/application/SetExerciseWeight.ts` (`parseWeightInput` → `ValidationError` se inválido → `SessionRepository.setExerciseWeight`; devolve `{ weight }`) — faz T026 passar
- [X] T033 [US2] Estender `src/application/GetWorkoutSession.ts` com `lastWeight` (`SessionRepository.getLastWeight(programId, exerciseId)`) — faz T027 passar; estender `src/application/SetExerciseCompleted.ts` (`pendingWeight` na mesma transação) e `src/application/FinishWorkout.ts` (`pendingWeights` como primeiro passo da transação) — faz T028 passar
- [X] T034 [P] [US2] Criar `src/components/common/TechniqueChip.tsx`, `src/components/common/PrescriptionBlock.tsx` e `src/components/common/WeightInput.tsx` conforme `docs/design-telas.md` §3 e `contracts/ui.md`, só com tokens — faz T029 passar
- [X] T035 [US2] Estender `src/hooks/useWorkoutSession.ts` com `setWeight(exerciseId, text)` (rascunho no `workoutStore`; ao terminar de digitar chama `SetExerciseWeight`; falha → `setCardError`, valor preservado), `useLastWeight(exerciseId)`, envio de `pendingWeight` em `setCompleted` e de `pendingWeights` (rascunhos não gravados) em `finish`; estender `src/components/workout/ExerciseCard.tsx` com `PrescriptionBlock`, "ÚLTIMA CARGA"/"Sem carga anterior", `WeightInput`, **Usar X kg**, aviso de erro com **Tentar de novo**, chip BI-SET e observação do parceiro e resumo colapsado (primeira linha da prescrição + carga) — faz T030 passar

**Checkpoint**: US1 e US2 funcionam; nada é recomendado nem preenchido sozinho.

---

## Phase 5: User Story 3 — Aquecimento livre e recuperação de sessão (P1) — BL-067, BL-121, BL-104 · RF-04, RF-28

**Goal**: mostrar a nota de aquecimento fora das contagens e retomar a sessão interrompida com marcações e pesos preservados.
**Independent Test**: fechar o app no meio do treino e reabrir (quickstart, itens 2–4). Depende do núcleo da US1.

### Tests

- [X] T036 [P] [US3] Acrescentar a `tests/integration/application/getWorkoutSession.test.ts` os casos da US3: `workout.warmupNote` vem de `workout.warmup_note` ("Aquecimento de manguito rotador + aquecimento livre" no seed) e é `null` quando o treino não tem nota; o aquecimento nunca aparece em `items` nem em `progress`
- [X] T037 [P] [US3] Escrever `tests/integration/application/sessionRecovery.test.ts` (BL-104, base: `createTestDb()` em arquivo temporário para simular fechar e reabrir): criar sessão com `StartWorkout`, marcar exercícios, gravar pesos e "reabrir" (nova conexão ao mesmo banco) → `GetWorkoutSession` devolve as mesmas marcações e pesos (SC-002); finalizar depois de reabrir funciona; editar marcação e peso de sessão finalizada pelos repositórios da 002 não muda programa, treino nem data; sem sessão em andamento (após finalizar) `GetWorkoutSession` devolve `null`
- [X] T038 [P] [US3] Acrescentar a `tests/ui/workout/workout.test.tsx` os casos da US3: `WarmupNote` mostra o texto sob o cabeçalho, sem checkbox e sem contar em "N / M"; treino sem nota não mostra o bloco; treino sem exercícios mostra `EmptyState` "Este treino não tem exercícios" e **FINALIZAR TREINO** continua habilitado; ao abrir sem sessão em andamento volta à Home (`router.replace('/')`); ao remontar a tela, marcações e pesos vêm do banco (não do store); com o teclado aberto a barra FINALIZAR se esconde; slots `onInfo`/`onHelp` sem handler não renderizam ícone

### Implementation

- [X] T039 [US3] Estender `src/application/GetWorkoutSession.ts` para preencher `workout.warmupNote` (a partir de `workout.warmup_note`) — faz T036 passar
- [X] T040 [P] [US3] Criar `src/components/workout/WarmupNote.tsx` (texto sob o cabeçalho, sem cartão e sem checkbox, `textSecondary`) e usar `EmptyState` em `src/app/workout/index.tsx` para treino sem exercícios; ligar o redirecionamento para a Home quando `status = 'noSession'` e a recarga completa ao montar (fonte de verdade = SQLite) — faz T037 e T038 passarem

**Checkpoint**: todas as histórias independentes do ponto de vista de teste.

---

## Phase 6: Polish & cross-cutting

- [X] T041 [P] Atualizar `docs/design-telas.md`: §5.1 (remover a linha "Próximo" do resumo: só "N de M exercícios realizados", duração e **Voltar ao início**), §5 (a tela de treino não tem ação de descartar; "?" e "ⓘ" só com a ajuda da spec 008; ⏱ só com a spec 011), §5 (bi-set sem barra lateral: chip BI-SET e observação bastam; cada exercício é um cartão independente), §3 (acrescentar `ExerciseCard`, `WarmupNote`, `FinishBar` e `FinishSummaryView` como padrões da tela de treino)
- [X] T042 [P] Atualizar `docs/telas.md` (tela de treino e finalização: resumo sem "Próximo", sem descartar na tela de treino, peso salvo ao terminar de digitar) e `docs/prototipo-telas.html` se o protótipo mostrar a linha "Próximo" ou um descartar na tela de treino; conferir `docs/backlog.md` (BL-060..067, BL-104, BL-121)
- [X] T043 Auditoria de consistência visual: comparar `src/app/workout/index.tsx`, `src/app/workout/summary.tsx`, `src/components/workout/*` e os componentes comuns novos com `theme.ts` e `docs/design-telas.md` §2–3 e §5 (nenhum valor literal de cor/tamanho, alvos ≥ 48 dp, progresso sempre com texto, feito/pendente sem depender só de cor, ação destrutiva nunca primária) e corrigir qualquer desvio
- [X] T044 Rodar `npm run check` (lint, tipos e testes) e os passos do `quickstart.md` (incluindo a validação manual em Android e iOS: fechar o app à força no meio do treino e reabrir); marcar a spec como `concluída` em `specs/INDEX.md`

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → histórias → Polish. Na Phase 2, T003–T008 são paralelizáveis; T009 depende de T008; T010 depende de T003 e T008. A fase termina verde.
- **US1** depende só da Phase 2 e entrega o núcleo (`GetWorkoutSession`, `SetExerciseCompleted`, `FinishWorkout`, `GetFinishSummary`, hook, `ExerciseCard` base, telas). **US2** e **US3** dependem do núcleo da US1 (estendem os mesmos arquivos); entre si são independentes, mas não devem rodar em paralelo, porque T033 e T039 editam `GetWorkoutSession.ts`, T035 e T040 editam `ExerciseCard.tsx`/`useWorkoutSession.ts`/`src/app/workout/index.tsx`, e T027, T036, T030, T038 editam os mesmos arquivos de teste.
- T017 devolve `lastWeight = null` e `warmupNote = null`; T033 e T039 os preenchem. T019 e T018 aceitam só o caso sem peso pendente até T033.
- Polish só depois das histórias desejadas; T043 depois de todas as telas.

### Parallel examples

```text
Phase 2:  T003 T004 T005 T006 T007 T008
US1:      T011 T012 T013 T014 T015 T016   → T018 T020 T022 T023 (arquivos distintos)
US2:      T025 T026 T027 T028 T029 T030 → T031 T034
US3:      T036 T037 T038 → T040 (T039 antes, mesmo arquivo de T033)
Polish:   T041 T042
```

## Implementation Strategy

1. **MVP**: Phases 1–3 (marcar em qualquer ordem e finalizar, com resumo e avanço da contínua) — já cobre o uso essencial.
2. Incremental: US2 (peso, última carga e prescrição) → US3 (aquecimento e recuperação, testes de BL-104) → Polish (docs e auditoria visual).
3. Um item só está concluído com lint, tipos e testes passando.
