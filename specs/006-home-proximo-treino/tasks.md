---
description: "Task list for Home e Próximo Treino"
---

# Tasks: Home e Próximo Treino

**Input**: `specs/006-home-proximo-treino/` (plan.md, spec.md, research.md, data-model.md, contracts/use-cases.md, contracts/ui.md, quickstart.md)
**Backlog**: BL-050, BL-051, BL-052, BL-053, BL-122, BL-123
**Requisitos de produto**: RF-01, RF-04, RF-29, RF-30
**Depende de**: specs 001–005 concluídas (repositórios, seed, `GetNextWorkout`, `SelectSequenceStrategy`, tokens e componentes comuns)
**Tests**: incluídos — a constituição (XI) exige testes de domínio, persistência e fluxos de UI. Escreva cada teste antes da implementação e veja-o falhar.
**Design**: tokens e componentes de `docs/design-telas.md` §2–4 ("Placar de academia"). Nenhuma tela usa cor, tamanho ou espaçamento literal.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1 (próximo treino e iniciar), US2 (dias sem treino e textos do programa), US3 (treino em andamento)
- Cada fase lista os BL/RF que cobre; todo commit referencia o BL da tarefa (ex.: `feat(006): BL-052 ...`).

---

## Phase 1: Setup

- [ ] T001 Verificar que as specs 001–005 estão concluídas: `npm run check` passa e `specs/INDEX.md` marca `001` a `005` como `concluída`; se não, parar e avisar
- [ ] T002 [P] Criar as pastas com `.gitkeep` onde ainda não existirem: `src/domain/home/`, `src/components/home/`, `src/components/common/`, `src/utils/`, `src/store/`, `src/hooks/`, `tests/unit/domain/home/`, `tests/unit/utils/`, `tests/unit/store/`, `tests/ui/common/`, `tests/ui/home/`, `tests/integration/application/`

---

## Phase 2: Foundational (bloqueia todas as histórias) — BL-050

**Purpose**: tipos, funções puras dos indicadores, componentes do design, store, hook e o esqueleto da aba (tudo verde sozinho)

- [ ] T003 [P] Criar `src/domain/home/types.ts` com `WorkoutSummary`, `SequenceRailStep`, `WeekStripDay`, `HomeIndicator`, `HomeCard`, `HomeView` e `HomeViewInput` exatamente como em `data-model.md`
- [ ] T004 [P] Escrever `tests/unit/utils/weekdayLabel.test.ts` e implementar `src/utils/weekdayLabel.ts` (`weekdayLabel(weekday: number, form: 'LONG' | 'SHORT'): string`, pt-BR: 1 → "SEGUNDA-FEIRA"/"SEG" … 7 → "DOMINGO"/"DOM"; fora de 1..7 lança `Error`)
- [ ] T005 [P] Escrever `tests/unit/domain/home/buildSequenceRail.test.ts` e implementar `src/domain/home/buildSequenceRail.ts` (`buildSequenceRail(workouts, currentPosition)`): N passos com o `code` do treino; passos com `position` menor que a atual = `DONE`, o da posição atual = `CURRENT`, os demais `PENDING`; posição `null`, inválida ou sem treino ativo correspondente → o primeiro é `CURRENT` e nenhum `DONE`; posições com lacuna (`[1,2,4,5]`) respeitadas; lista vazia → `[]`
- [ ] T006 [P] Escrever `tests/unit/domain/home/buildWeekStrip.test.ts` e implementar `src/domain/home/buildWeekStrip.ts` (`buildWeekStrip(schedule, workouts, todayWeekday, doneWeekdays)`): 7 itens SEG→DOM; rótulo = `code` do treino, `'—'` para descanso ou dia sem linha, `'opc.'` para opcional; `isToday` só no dia atual; `hasSession` conforme `doneWeekdays`; treino da agenda desativado (fora de `workouts`) → `'—'`
- [ ] T007 [P] Criar (se ainda não existirem; senão só conferir) `src/constants/theme.ts` com os tokens de `docs/design-telas.md` §2 e, em `src/components/common/`, `Button.tsx`, `Card.tsx`, `Sheet.tsx`, `ConfirmDialog.tsx` e `EmptyState.tsx` conforme §3, só com tokens (mesmos arquivos da spec 005; não criar variações paralelas)
- [ ] T008 [P] Escrever `tests/ui/common/SequenceRail.test.tsx` e `tests/ui/common/WeekStrip.test.tsx` (RNTL) e implementar `src/components/common/SequenceRail.tsx`, `src/components/common/WeekStrip.tsx` e `src/components/common/ProgramBadge.tsx` conforme `docs/design-telas.md` §3: rail com N passos ligados (atual preenchido com `accent`, concluídos com ✓, demais vazios; rótulo = código do treino); strip com 7 colunas (hoje preenchido com `accent`; dias com sessão com ponto + ✓, sem depender de cor); `ProgramBadge` pílula com contorno `border`; `accessibilityLabel` descrevendo o estado de cada passo/dia
- [ ] T009 [P] Criar `src/store/homeStore.ts` (Zustand): `view: HomeView | null`, `status: 'loading' | 'ready' | 'error'`, `pendingDialogShown: boolean`, ações `setLoading()`, `setView(view)`, `setError()`, `markDialogShown()`; não grava nada e não é fonte de verdade
- [ ] T010 Escrever `tests/unit/store/homeStore.test.ts` (transições loading → ready/error, `markDialogShown` uma vez) e ajustar T009 até passar
- [ ] T011 [P] Criar `src/components/home/HomeSkeleton.tsx`: esqueleto do cartão principal com a mesma altura do cartão carregado, sem salto de layout, usando tokens
- [ ] T012 Criar o esqueleto de `src/app/(tabs)/index.tsx` (aba "Treino"): cabeçalho "MEU TREINO", `HomeSkeleton` enquanto `status = 'loading'` e cartão de erro "Não foi possível carregar seus treinos" com **Tentar de novo** quando `status = 'error'`; o botão "Tentar de novo" fica sem ação até a T021 ligá-lo ao `reload` do `useHome`; o conteúdo `ready` entra nas histórias

**Checkpoint**: T004–T006, T008 e T010 passam; `npm run check` verde; a aba abre com o esqueleto.

---

## Phase 3: User Story 1 — Ver o próximo treino e iniciar (P1) 🎯 MVP — BL-050, BL-051, BL-052 · RF-01, RF-04

**Goal**: ver programa, tipo de sequência, indicador e próximo treino, e iniciar com um toque; "Concluído hoje" na semanal.
**Independent Test**: com programa e sequência definidos, a Home mostra o treino correto e o botão cria a sessão com programa e treino corretos (quickstart, itens 2–3).

### Tests

- [ ] T013 [P] [US1] Escrever `tests/unit/domain/home/buildHomeView.test.ts` (casos da US1 e mapeamento de todos os resultados): contínua com `WORKOUT` → `card.kind = 'WORKOUT'`, `dayLabel = null`, `doneToday = false`, indicador `RAIL`; semanal com `WORKOUT` → `dayLabel` = dia da semana em caixa alta, indicador `WEEK`; `doneToday = true` só na semanal quando existe sessão finalizada do mesmo programa e treino com data local de hoje (e `false` para outro treino, outro programa, ou outro dia); `doneToday` nunca remove o treino; `NONE/REST` → `REST` com `dayLabel`; `NONE/OPTIONAL_DAY` → `OPTIONAL_DAY` com a `note` como está; `NONE/NO_SCHEDULE` → `NO_SCHEDULE` com indicador `NONE`; `NONE/NO_WORKOUTS` → `NO_WORKOUTS`; nenhum resultado lança erro; `program` repassado; sem escrita nem efeito colateral (função pura)
- [ ] T014 [P] [US1] Escrever `tests/integration/application/getHomeState.test.ts` (`createTestDb()` + seed + `Clock` fixo), casos da US1: Padrão contínuo na posição 3 → `WORKOUT` "Perna Completo" com a contagem de exercícios do seed e `RAIL` com 5 passos (2 `DONE`, 1 `CURRENT`); Monstro semanal em cada dia de treino → o treino da agenda e `WEEK`; treino finalizado hoje → `doneToday = true`; carregar a Home não escreve em nenhuma tabela (contagens de `workout_session*` idênticas — SC-003); com 500 sessões finalizadas do programa, `GetHomeState` responde em menos de 150 ms sobre o SQLite em memória; Monstro em dia de descanso e em sábado opcional devolve `REST` e `OPTIONAL_DAY` sem erro
- [ ] T015 [P] [US1] Escrever `tests/integration/application/startWorkout.test.ts`: `execute(workoutId)` cria uma `workout_session` em andamento com `program_id` = programa ativo e o `workout_id` pedido, com uma linha por exercício; treino de outro programa ou inativo → `ValidationError` sem criar nada; com sessão em andamento → `ConflictError` e nada muda; nenhuma outra escrita (sequência e sessões finalizadas intactas)
- [ ] T016 [P] [US1] Escrever `tests/ui/home/home.test.tsx` (RNTL, casos de uso e router simulados), casos da US1: contínua mostra badge do programa, "Sequência contínua", `SequenceRail`, "PRÓXIMO TREINO · DIA 3", nome, "6 exercícios" e **COMEÇAR TREINO**; semanal mostra `WeekStrip`, "<DIA> · TREINO C" e o botão; "Concluído hoje" aparece e o botão continua ativo; tocar em **COMEÇAR TREINO** chama `StartWorkout` com o id do treino e navega para `/workout` (1 toque — SC-001); carregar a Home não chama `StartWorkout`; nome longo até 2 linhas sem cortar o botão; segundo toque em **COMEÇAR TREINO** com sessão já criada (`ConflictError`) mostra "Já existe um treino em andamento" e recarrega sem criar outra sessão; `WeekStrip` marca o dia com sessão finalizada (FR-001b)

### Implementation

- [ ] T017 [US1] Implementar `src/domain/home/buildHomeView.ts` (`buildHomeView(input): HomeView`, pura) para **todos** os resultados de `GetNextWorkout`: `WORKOUT` (com `dayLabel` via `weekdayLabel`, só na semanal, e `doneToday`), `NONE/REST` → `REST`, `NONE/OPTIONAL_DAY` → `OPTIONAL_DAY` (com `note`), `NONE/NO_SCHEDULE` → `NO_SCHEDULE`, `NONE/NO_WORKOUTS` → `NO_WORKOUTS`; `indicator` via `buildSequenceRail`/`buildWeekStrip`; `program` e `localDate`; deixa `suggestion = null` e `browsableWorkouts = []` até a US2 (T025); nunca lança erro por estado; a precedência `IN_PROGRESS` entra na US3 (T031) — faz T013 passar
- [ ] T018 [US1] Implementar `src/application/GetHomeState.ts` conforme `contracts/use-cases.md`: lê `settings`, programa, treinos ativos, estado, agenda e `sessions.listFinished({ programId })`; calcula `doneToday` e `doneWeekdays` (semana corrente segunda a domingo, por `localDateOf(finishedAt)`); chama `GetNextWorkout` (004) e `buildHomeView`; conta exercícios com `getWorkoutWithExercises`; não escreve nada — faz T014 passar
- [ ] T019 [US1] Implementar `src/application/StartWorkout.ts` conforme `contracts/use-cases.md`: programa = `settings.activeProgramId`; valida que o treino é ativo e do programa (`ValidationError`); `SessionRepository.startSession` (`ConflictError` se já há sessão); devolve `{ sessionId }` — faz T015 passar
- [ ] T020 [US1] Criar `src/hooks/useHome.ts` (`view`, `status`, `reload()`, `start(workoutId)`): carrega via `GetHomeState` para o `homeStore`; `start` chama `StartWorkout`, navega para `/workout` e trata `ConflictError` mostrando "Já existe um treino em andamento" e recarregando; sem regra de negócio no hook
- [ ] T021 [US1] Criar `src/components/home/NextWorkoutCard.tsx` (estado `WORKOUT`: rótulo, código em destaque, nome, "N exercícios", marca "Concluído hoje" quando `doneToday`, **COMEÇAR TREINO** com `Button primary`; para `REST`, `OPTIONAL_DAY`, `NO_SCHEDULE` e `NO_WORKOUTS` mostra provisoriamente um cartão neutro "Sem treino hoje", substituído pelos cartões completos na T027) e ligar em `src/app/(tabs)/index.tsx` o `ProgramBadge`, o tipo de sequência, o indicador (`SequenceRail`/`WeekStrip`) e o cartão para `status = 'ready'` — faz T016 passar

**Checkpoint**: US1 testável sozinha; `npm run check` verde.

---

## Phase 4: User Story 2 — Dias sem treino e textos do programa (P1) — BL-122, BL-123 · RF-29, RF-30

**Goal**: descanso, dia opcional, sem agenda e sugestão do programa, sem criar sessão sozinho; "Ver treinos do programa".
**Independent Test**: simular cada tipo de dia da agenda do Monstro (quickstart, itens 2–3). Depende do núcleo da US1 (`GetHomeState`, `StartWorkout`, tela).

### Tests

- [ ] T022 [P] [US2] Acrescentar a `tests/unit/domain/home/buildHomeView.test.ts` os casos da US2 (conteúdo dos estados): `suggestion` repassado do programa; `suggestion` nulo quando o programa não tem `homeSuggestion` (e string vazia vira nulo); descanso e opcional expõem `browsableWorkouts` (treinos ativos do programa), `NO_SCHEDULE` e `NO_WORKOUTS` não expõem ação de iniciar; `IN_PROGRESS` tem `browsableWorkouts` vazio
- [ ] T023 [P] [US2] Acrescentar a `tests/integration/application/getHomeState.test.ts` os casos da US2 sobre o seed: Monstro nas 7 datas de uma semana local (treino A–D, descanso, sábado e domingo opcionais com o texto da agenda); sugestão de cardio presente no Monstro e ausente no Padrão; Padrão em modo semanal → `NO_SCHEDULE`; nenhuma sessão criada em nenhum estado
- [ ] T024 [P] [US2] Acrescentar a `tests/ui/home/home.test.tsx` os casos da US2: descanso mostra "<DIA> · DESCANSO", sem botão primário, com **Ver treinos do programa**; opcional mostra o texto da agenda e a ação; a ação abre `ProgramWorkoutsSheet` com os treinos ativos e escolher um chama `StartWorkout` com esse treino (2 toques) sem alterar agenda nem sequência; `NO_SCHEDULE` mostra "Sem agenda configurada para este programa" e **Voltar para sequência contínua**, que chama `SelectSequenceStrategy('CONTINUOUS')`, sem botão de iniciar; `SuggestionCard` só com texto (sem botão) quando há sugestão e ausente quando não há; `NO_WORKOUTS` sem ação

### Implementation

- [ ] T025 [US2] Completar `src/domain/home/buildHomeView.ts` com `suggestion` (`homeSuggestion` do programa; vazio → `null`) e `browsableWorkouts` (treinos ativos com contagem, só em `REST` e `OPTIONAL_DAY`; vazio nos demais estados) — faz T022 e T023 passarem
- [ ] T026 [P] [US2] Criar `src/components/home/SuggestionCard.tsx` ("SUGESTÃO DA FICHA", só texto, cartão discreto abaixo do cartão principal, sem botão) e `src/components/home/ProgramWorkoutsSheet.tsx` (sobre `Sheet`: lista os treinos ativos com código, nome e contagem; tocar chama o callback recebido)
- [ ] T027 [US2] Estender `src/components/home/NextWorkoutCard.tsx` com os estados `REST`, `OPTIONAL_DAY`, `NO_SCHEDULE` e `NO_WORKOUTS` conforme `contracts/ui.md` e `docs/design-telas.md` §4.3; em `src/hooks/useHome.ts` acrescentar `browseWorkouts` (abre o sheet) e `switchToContinuous()` (chama `SelectSequenceStrategy('CONTINUOUS')` e recarrega); ligar `SuggestionCard` em `src/app/(tabs)/index.tsx` — faz T024 passar

**Checkpoint**: US1 e US2 funcionam; nenhum estado cria sessão sozinho.

---

## Phase 5: User Story 3 — Treino em andamento (P1) — BL-053 · RF-04

**Goal**: detectar a sessão pendente ao abrir o app e oferecer Continuar ou Descartar; sem iniciar outro treino.
**Independent Test**: criar sessão, fechar o app, reabrir e conferir o diálogo (quickstart, itens 2–4). Depende do núcleo da US1.

### Tests

- [ ] T028 [P] [US3] Acrescentar a `tests/unit/domain/home/buildHomeView.test.ts` os casos da US3: sessão em andamento tem precedência sobre qualquer resultado (`WORKOUT`, `REST`, `OPTIONAL_DAY`, `NO_SCHEDULE`) → `card.kind = 'IN_PROGRESS'` com `workoutName`, `done` e `total`; `IN_PROGRESS` não expõe ação de iniciar nem `browsableWorkouts` acionáveis
- [ ] T029 [P] [US3] Escrever `tests/integration/application/discardInProgressSession.test.ts` (seed): descarta a sessão em andamento e suas linhas; `program_sequence_state` e sessões finalizadas idênticos antes e depois; sem sessão em andamento é no-op; depois de descartar, `GetHomeState` volta ao estado normal — e acrescentar a `getHomeState.test.ts` o caso "sessão em andamento (criada por `StartWorkout`, recuperada em nova conexão ao mesmo banco) → `IN_PROGRESS` com `done`/`total` corretos após marcar exercícios"
- [ ] T030 [P] [US3] Acrescentar a `tests/ui/home/home.test.tsx` os casos da US3: com sessão em andamento o cartão mostra "TREINO EM ANDAMENTO", o treino, "4 / 9 realizados" e **CONTINUAR TREINO** (→ `router.push('/workout')`), sem botão de iniciar outro treino; o diálogo "Você possui um treino em andamento" aparece uma vez por abertura, com **Continuar** (primário) e **Descartar** (danger); **Descartar** pede segunda confirmação, cancelar não escreve nada, confirmar chama `DiscardInProgressSession` e a Home volta ao estado normal; fechar o diálogo mantém o cartão; abrir e fechar não escrevem nada; reabrir o app volta a mostrar o diálogo

### Implementation

- [ ] T031 [US3] Completar `src/domain/home/buildHomeView.ts` com a precedência `IN_PROGRESS` (lida por `GetHomeState`) e estender `src/application/GetHomeState.ts` para carregar `SessionRepository.getInProgress()` e calcular `done`/`total` das linhas de exercício — faz T028 e o caso de recuperação de T029 passarem
- [ ] T032 [P] [US3] Criar `src/application/DiscardInProgressSession.ts` se ainda não existir (a tarefa T009 da spec 005 já o cria; nesse caso só conferir o contrato) conforme `contracts/use-cases.md` (`getInProgress()` → `discardSession(id)`; sem sessão = no-op; sem tocar sequência ou estatísticas) — faz T029 passar
- [ ] T033 [US3] Estender `src/components/home/NextWorkoutCard.tsx` com o estado `IN_PROGRESS` (rótulo, treino, progresso "N / M realizados", **CONTINUAR TREINO**); em `src/hooks/useHome.ts` acrescentar `continueWorkout()` (navega para `/workout`) e `discard()` (chama `DiscardInProgressSession` e recarrega); em `src/app/(tabs)/index.tsx` mostrar o diálogo de sessão pendente (uma vez por abertura, controlado por `pendingDialogShown` do `homeStore`) sobre `ConfirmDialog`, com segunda confirmação para **Descartar** — faz T030 passar

**Checkpoint**: todas as histórias independentes do ponto de vista de teste.

---

## Phase 6: Polish & cross-cutting

- [ ] T034 [P] Reavaliação do dia: em `src/hooks/useHome.ts` recarregar ao montar, ao focar a aba e quando o `AppState` voltar a `active`, e recarregar se a `localDate` da `HomeView` for diferente da data local atual; escrever `tests/ui/home/homeRefresh.test.tsx` (RNTL, `AppState` e relógio simulados): voltar ao app após a meia-noite reavalia o dia e não cria sessão
- [ ] T035 [P] Atualizar `docs/design-telas.md`: §4 (remover os cartões ÚLTIMO/ESTE MÊS e o botão "Reiniciar sequência" da Home e o sheet de reinício da §4.3; estado "sem agenda" com **Voltar para sequência contínua** em vez de **Configurar agenda**; "Ver treinos do programa" e marca "Concluído hoje" como decididos), §3 (acrescentar `NextWorkoutCard`, `SuggestionCard`, `ProgramWorkoutsSheet` e `HomeSkeleton`) e §12 (marcar os itens 1 e 3 como decididos)
- [ ] T036 [P] Atualizar `docs/telas.md` §2 (Home sem ÚLTIMO/ESTE MÊS nem reinício; estados de descanso/opcional/sem agenda/concluído hoje/em andamento) e `docs/prototipo-telas.html` se o protótipo mostrar esses elementos na Home; conferir `docs/backlog.md` (BL-050..053, BL-122, BL-123)
- [ ] T037 Auditoria de consistência visual: comparar `src/app/(tabs)/index.tsx`, `src/components/home/*` e os componentes comuns novos com `theme.ts` e `docs/design-telas.md` §2–4 (nenhum valor literal de cor/tamanho, alvos ≥ 48 dp, dia atual e dias feitos sem depender de cor, ação destrutiva nunca primária) e corrigir qualquer desvio
- [ ] T038 Rodar `npm run check` (lint, tipos e testes) e os passos do `quickstart.md` (incluindo a validação manual em Android e iOS); marcar a spec como `concluída` em `specs/INDEX.md`

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → histórias → Polish. Na Phase 2, T003–T009 e T011 são paralelizáveis; T010 depende de T009; T012 depende de T009 e T011. A fase termina verde.
- **US1** depende só da Phase 2 e entrega o núcleo (`buildHomeView`, `GetHomeState`, `StartWorkout`, `useHome`, `NextWorkoutCard`, tela). **US2** e **US3** dependem do núcleo da US1 (mesmos arquivos estendidos); entre si, são independentes e podem ser feitas em qualquer ordem, mas T025/T031 editam `buildHomeView.ts`, T027/T033 editam `NextWorkoutCard.tsx` e `useHome.ts`, e T022/T028 (e T023/T029, T024/T030) editam os mesmos arquivos de teste: não fazer em paralelo.
- T017 mapeia todos os resultados de `GetNextWorkout` (o MVP não quebra em dias sem treino; a tela mostra o cartão neutro até a T027); T025 completa `suggestion` e `browsableWorkouts`; T031 acrescenta a precedência `IN_PROGRESS`.
- `DiscardInProgressSession` é criado pela spec 005 (T009) e reutilizado aqui; T032 só o cria se a 005 ainda não o tiver feito.
- Polish só depois das histórias desejadas; T037 depois de todas as telas.

### Parallel examples

```text
Phase 2:  T003 T004 T005 T006 T007 T008 T009 T011
US1:      T013 T014 T015 T016            # testes em arquivos distintos
US2:      T022 T023 T024 → T026 (paralelo com T025)
US3:      T028 T029 T030 → T032 (paralelo com T031)
Polish:   T034 T035 T036
```

## Implementation Strategy

1. **MVP**: Phases 1–3 (ver e iniciar o próximo treino, com "Concluído hoje") — já entrega o uso diário.
2. Incremental: US3 (sessão em andamento, evita perda de progresso) → US2 (dias sem treino e textos) → Polish (reavaliação do dia, docs e auditoria visual).
3. Um item só está concluído com lint, tipos e testes passando.
