---
description: "Task list for Programas Iniciais (Seed)"
---

# Tasks: Programas Iniciais (Seed)

**Input**: `specs/003-programas-seed/` (plan.md, spec.md, research.md, data-model.md, contracts/seed-data.md, quickstart.md)
**Backlog**: BL-020, BL-021, BL-022, BL-023, BL-110 (dados), BL-120, BL-121, BL-122, BL-123 (dados), BL-124
**Depende de**: specs 001 e 002 concluídas
**Tests**: incluídos — a constituição (XI) exige testes de persistência; SC-001..003 são verificados por teste. Escreva cada teste antes da implementação e veja-o falhar.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1 (Treino Padrão), US2 (Treino Monstro fiel à ficha), US3 (carga repetível, completa e ligada ao app)

---

## Phase 1: Setup (BL-023)

- [ ] T001 Verificar que as specs 001 e 002 estão concluídas: `npm run check` passa e `specs/INDEX.md` marca `001-fundacao-projeto` e `002-modelo-dados` como `concluída`; se não, parar e avisar
- [ ] T002 [P] Criar as pastas com `.gitkeep` onde ainda não existirem: `src/constants/`, `src/data/seed/`, `src/data/seed/programs/`, `tests/unit/seed/`, `tests/integration/seed/`

---

## Phase 2: Foundational (bloqueia todas as histórias) — BL-022, BL-023, BL-121

**Purpose**: tipos, validação e o motor `runSeed`, testados com datasets pequenos de fixture (sem o conteúdo real)

- [ ] T003 [P] Criar `src/constants/techniques.ts` exportando `TECHNIQUES` (`'BI-SET'`, `'DROP-SET'`, `'PROGRESSÃO DE CARGA'`, `'FALHA'`) e o tipo `Technique`
- [ ] T004 [P] Criar `src/data/seed/types.ts` com `SeedExercise`, `SeedWorkoutExercise`, `SeedWorkout`, `SeedScheduleDay`, `SeedProgram`, `SeedData` exatamente como em `contracts/seed-data.md`
- [ ] T005 [P] Criar `src/data/seed/warmup.ts` exportando `WARMUP_NOTE = "Aquecimento de manguito rotador + aquecimento livre"`
- [ ] T006 [P] Criar `src/data/seed/exercisesShared.ts` exportando `SHARED_EXERCISES: SeedExercise[]` com os 6 exercícios usados pelos dois programas — "Elevação frontal", "Elevação lateral", "Supino inclinado", "Adutora", "Cadeira extensora", "Mesa flexora" — cada um com `muscleGroup`, `primaryMuscle`, `secondaryMuscles` e `description` em pt-BR (1–2 frases informativas; sem carga, técnica ou recomendação; `contracts/seed-data.md`, "Regras de conteúdo")
- [ ] T007 Escrever `tests/unit/seed/validateSeedData.test.ts`: dataset válido pequeno passa; cada caso a seguir lança `ValidationError`: item que cita exercício fora do catálogo; nomes de exercício duplicados por `normalizeName`; exercício com `primaryMuscle`, `secondaryMuscles` ou `description` vazio; nenhum programa `isDefault`; dois programas `isDefault`; `code` de treino duplicado no programa; bi-set sem par (item `BI-SET` sem vizinho `BI-SET`, ou com `notes` nulas/sem "bi-set"); `weekday` repetido ou fora de 1..7 na agenda; agenda que cita `workout` inexistente
- [ ] T008 Implementar `src/data/seed/validateSeedData.ts` (`validateSeedData(data: SeedData): void`, lançando `ValidationError` da spec 002) — faz T007 passar
- [ ] T009 Escrever `tests/integration/seed/runSeed.test.ts` com datasets de fixture pequenos (2 programas, 3 treinos, 5 exercícios, um bi-set, uma agenda), usando `createTestDb()` da spec 002: cria programas/treinos/exercícios/itens com `warmup_note = WARMUP_NOTE`; segunda execução mantém contagens idênticas; prescrição alterada no dataset é atualizada e o id do exercício se mantém; item removido do dataset some de `workout_exercise`; treino removido do dataset fica `active = 0`; exercício removido do catálogo fica `active = 0` e continua referenciado por sessão antiga; `program_sequence_state` é criado com posição 1 só se ausente (posição 3 preexistente permanece); `app_settings` é criado só se ausente, com `activeProgramId` do programa `isDefault`, `CONTINUOUS`, cronômetro desligado e 90 s (configuração alterada permanece); linhas de `workout_session` e `workout_session_exercise` ficam idênticas; agenda gravada só para programas com `schedule`; erro forçado no meio (Database decorador que lança no 3º `INSERT`) ⇒ nada gravado; dataset inválido ⇒ `ValidationError` antes de qualquer escrita; dia removido da agenda do dataset some de `weekly_schedule`; programa removido do dataset fica `active = 0` com sessões intactas; `current_position` maior que o número de treinos permanece inalterada; sessão em andamento continua legível após remoção de item do treino
- [ ] T010 Implementar `src/data/seed/sync.ts` com `removeStaleContent(db: Database, programId: number, keep: { workoutCodes: string[]; itemsByWorkoutCode: Record<string, number[]> })` e `deactivateMissingExercises(db, keptExerciseIds: number[])`, `removeStaleSchedule(db, programId, keptWeekdays: number[])` e `deactivateMissingPrograms(db, keptProgramIds: number[])`: `DELETE` de `workout_exercise` fora do seed, `UPDATE active = 0` em treinos e exercícios fora do seed (nunca `DELETE` de `workout` ou `exercise`) — research R4, passo 4
- [ ] T011 Implementar `src/data/seed/runSeed.ts` conforme `contracts/seed-data.md`: valida o dataset; em `db.transaction` usa `createRepositories(tx, clock)` da spec 002 para `upsertByName` (mapa nome → id), `upsertProgram`, `upsertWorkout` (com `warmup_note = WARMUP_NOTE` e `position` = índice + 1), `upsertWorkoutExercise` (`display_order` = índice + 1), `upsertEntry` da agenda quando `schedule` não é `null`; chama `sync.ts`; cria estado de sequência (posição 1) e configurações padrão só se `get()` devolver `null`; sem nenhum `if` sobre o nome do programa (constituição VI) — faz T009 passar

**Checkpoint**: T007 e T009 passam; `npm run check` verde.

---

## Phase 3: User Story 1 — Treino Padrão disponível (P1) 🎯 MVP (BL-020)

**Goal**: Treino Padrão com Dia 1–5 (Peito e Tríceps, Costas e Bíceps, Perna Completo, Ombro Isolado, Bíceps e Tríceps) carregado.
**Independent Test**: seed só com o Padrão numa instalação limpa ⇒ 1 programa, 5 treinos, 28 itens, 22 exercícios, aquecimento em cada treino (quickstart, US1).

### Tests

- [ ] T012 [P] [US1] Criar `tests/unit/seed/helpers/parsePrdPadrao.ts` (lê `docs/PRD.md` §7 e devolve treinos → itens `{ name, series, reps }`, separando colunas por 2+ espaços e normalizando `--` para `–`) e `tests/unit/seed/padraoData.test.ts`: `PADRAO_PROGRAM` tem 5 treinos com códigos `'1'..'5'` e nomes conforme o PRD; itens por treino 6, 6, 6, 4, 6 na ordem do PRD; toda prescrição é `"3 × 10–12"` (montada de Séries/Repetições do PRD); `technique` e `notes` nulos; todo item cita um exercício de `[...SHARED_EXERCISES, ...PADRAO_EXERCISES]`; sem agenda (`schedule: null`); sem `homeSuggestion`
- [ ] T013 [P] [US1] Criar `tests/integration/seed/padrao.integration.test.ts`: `runSeed` com dataset `{ exercises: [...SHARED_EXERCISES, ...PADRAO_EXERCISES], programs: [PADRAO_PROGRAM (isDefault)] }` ⇒ 1 programa, 5 treinos, 28 itens, 22 exercícios distintos, `warmup_note = WARMUP_NOTE` em todos os treinos, nenhuma linha em `weekly_schedule`, `app_settings` com o Padrão ativo e `CONTINUOUS`

### Implementation

- [ ] T014 [P] [US1] Criar `src/data/seed/exercisesPadrao.ts` exportando `PADRAO_EXERCISES: SeedExercise[]` com os 16 exercícios exclusivos do Padrão — Supino, Fly, Tríceps corda, Tríceps francês, Tríceps testa, Remada curvada, Remada aberta, Puxada aberta, Rosca Scott, Rosca martelo, Rosca direta, Agachamento Hack, Cadeira flexora, Leg Press, Crucifixo inverso, Desenvolvimento — com músculos e descrição em pt-BR; usar as ilustrações de `docs/treino padrao/` (músculos em laranja) como referência para `primaryMuscle`/`secondaryMuscles`
- [ ] T015 [US1] Criar `src/data/seed/programs/padrao.ts` exportando `PADRAO_PROGRAM: SeedProgram` (`isDefault: true`, `schedule: null`, `homeSuggestion: null`, `description: null`) com os 5 treinos e 28 itens do `docs/PRD.md` §7, prescrição `"3 × 10–12"`, `technique: null`, `notes: null`, códigos `'1'..'5'` — faz T012 e T013 passarem

**Checkpoint**: US1 testável sozinha (não depende de US2/US3).

---

## Phase 4: User Story 2 — Treino Monstro fiel à ficha (P1) (BL-021, BL-022, BL-120, BL-121, BL-122, BL-123)

**Goal**: Treino Monstro A–D (43 exercícios) com prescrição, técnica, observações, bi-sets distintos, agenda semanal, dias opcionais e sugestão de cardio.
**Independent Test**: seed só com o Monstro ⇒ 43 itens (11/10/10/12), 6 pares de bi-set, agenda de 7 dias, cardio na Home (quickstart, US2).

### Tests

- [ ] T016 [P] [US2] Criar `tests/unit/seed/helpers/parseFichaMonstro.ts` (lê as tabelas de `docs/fichas-treino.md` seção 1, treinos A–D, devolvendo `{ n, name, prescription, technique, notes }` com "—" ⇒ `null`; e a tabela de agenda) e `tests/unit/seed/monstroData.test.ts`: `MONSTRO_PROGRAM` confere item a item com a ficha (nome, ordem, prescrição, técnica, observações); contagens A = 11, B = 10, C = 10, D = 12; 12 itens `BI-SET` em 6 pares (A: 1, B: 2, C: 1, D: 2) sempre em posições vizinhas, com `notes` idênticas às da ficha e contendo "bi-set"; o parceiro de cada item é o vizinho de técnica `BI-SET` (A 1–2, B 2–3 e 7–8, C 9–10, D 2–3 e 10–11); agenda: seg A, ter B, qua `null` sem texto e `optional = false`, qui C, sex D, sáb e dom `null` com `optional = true` e `note = "Abdominais supra/infra e oblíquos"`; `homeSuggestion` igual ao texto do research R8; `isDefault = false`; todo item cita exercício de `[...SHARED_EXERCISES, ...MONSTRO_EXERCISES]`
- [ ] T017 [P] [US2] Criar `tests/integration/seed/monstro.integration.test.ts`: `runSeed` com dataset `{ exercises: [...SHARED_EXERCISES, ...MONSTRO_EXERCISES], programs: [{ ...MONSTRO_PROGRAM, isDefault: true }] }` ⇒ 4 treinos, 43 itens, 43 exercícios distintos, 12 linhas com `technique = 'BI-SET'`, 7 linhas em `weekly_schedule` com `workout_id`/`optional`/`note` corretos, `home_suggestion` preenchida, `warmup_note = WARMUP_NOTE` nos 4 treinos, estado de sequência com posição 1

### Implementation

- [ ] T018 [P] [US2] Criar `src/data/seed/exercisesMonstro.ts` exportando `MONSTRO_EXERCISES: SeedExercise[]` com os 37 exercícios exclusivos do Monstro (os 43 da ficha menos os 6 de `SHARED_EXERCISES`), com músculos e descrição em pt-BR (informativos, sem recomendação); o nome deve ser exatamente o da ficha (ex.: "Leg press 45°", "Rosca martelo sentado", "Tríceps testa unilateral no cross" permanecem distintos dos do Padrão)
- [ ] T019 [US2] Criar `src/data/seed/programs/monstro.ts` exportando `MONSTRO_PROGRAM: SeedProgram` (`isDefault: false`) com os treinos A "Ombros completos", B "Costas e bíceps", C "Pernas completas", D "Peito e tríceps", itens transcritos literalmente de `docs/fichas-treino.md` (bi-sets como itens distintos com `technique: 'BI-SET'` e `notes` da ficha), a agenda de 7 dias (`data-model.md`) e `homeSuggestion = "Caminhada ligeira, sem correr: 30 min de manhã e 30 min à noite, ou 1 h, longe do treino resistido."` — faz T016 e T017 passarem

**Checkpoint**: US2 testável sozinha (usa só `SHARED_EXERCISES` da Foundational).

---

## Phase 5: User Story 3 — Carga repetível, completa e ligada ao app (P1) (BL-023, BL-110, BL-124)

**Goal**: o dataset real é consistente, idempotente e roda a cada abertura do app antes das rotas.
**Independent Test**: duas execuções seguidas do seed real ⇒ contagens idênticas; dados do usuário preservados; todo exercício com músculos e descrição (quickstart, US3). **Depende de US1 e US2.**

### Tests

- [ ] T020 [P] [US3] Criar `tests/unit/seed/seedData.test.ts`: `validateSeedData(SEED_DATA)` não lança; 59 exercícios distintos por `normalizeName`; 9 treinos; 71 itens; todo exercício com `primaryMuscle`, `secondaryMuscles` e `description` não vazios e sem espaços apenas (BL-124, SC-003); descrição com no máximo 300 caracteres e sem "recomend", "melhor" nem "kg"; exatamente um `isDefault` (Treino Padrão); os 6 exercícios compartilhados aparecem em itens dos dois programas; `defaultSequenceType === 'CONTINUOUS'`
- [ ] T021 [P] [US3] Criar `tests/integration/seed/fullSeed.test.ts` com `SEED_DATA` real: contagens após o seed — 2 programas, 9 treinos, 59 exercícios, 71 itens, 7 linhas de agenda, 2 estados de sequência, 1 `app_settings`; segunda execução ⇒ contagens idênticas; após alterar `app_settings` (programa Monstro, `WEEKLY`, cronômetro ligado com 120 s), posição de sequência 3 e criar uma sessão finalizada com peso, uma nova execução mantém tudo isso e o `getLastWeight` continua funcionando; execução completa em menos de 2 s no teste (meta de 500 ms medida no aparelho, T028)
- [ ] T022 [P] [US3] Criar `tests/integration/seed/bootstrap.test.ts`: `bootstrapDatabase` em banco novo ⇒ `{ status: 'ready' }` com migrations e seed aplicados; migration que lança ⇒ `{ status: 'error' }` sem seed; seed que lança (dataset inválido injetado) ⇒ `{ status: 'error' }`, dados de seed não gravados e banco de migrations íntegro; nunca lança exceção

### Implementation

- [ ] T023 [US3] Criar `src/data/seed/exercises.ts` (`EXERCISE_CATALOG = [...SHARED_EXERCISES, ...PADRAO_EXERCISES, ...MONSTRO_EXERCISES]`) e `src/data/seed/seedData.ts` (`SEED_DATA: SeedData` com `exercises: EXERCISE_CATALOG`, `programs: [PADRAO_PROGRAM, MONSTRO_PROGRAM]`, `defaultSequenceType: 'CONTINUOUS'`) — faz T020 e T021 passarem
- [ ] T024 [US3] Criar `src/data/bootstrap.ts` (`bootstrapDatabase(db)`: `runMigrations` da spec 001, depois `runSeed(db)`; converte qualquer exceção em `{ status: 'error', error }`) — faz T022 passar
- [ ] T025 [US3] Ajustar o `DatabaseGate` da spec 001 (`src/data/database/DatabaseGate.tsx` e o uso em `src/app/_layout.tsx`) para chamar `bootstrapDatabase` em vez de `runMigrations` direto, mantendo os estados `migrando`/`ready`/`error` e o botão "Tentar novamente"; atualizar `tests/ui/databaseGate.test.tsx` (mock de `bootstrapDatabase`) e acrescentar o caso "falha do seed ⇒ mesma tela de erro"

**Checkpoint**: as três histórias funcionam; todos os testes passam.

---

## Phase 6: Polish

- [ ] T026 Gerar `specs/003-programas-seed/content-review.md` com uma tabela dos 59 exercícios (nome, músculo principal, secundários, descrição) copiada dos arquivos de dados, mais o texto do cardio (item que exige aprovação explícita) e a nota de aquecimento, para revisão do dono do app; marcar no topo "PENDENTE DE REVISÃO" (research R9)
- [ ] T027 [P] Conferir que `docs/fichas-treino.md`, `docs/PRD.md`, `docs/modelo-dados.md`, `docs/arquitetura.md` (bootstrap e `DatabaseGate`) e `docs/backlog.md` (status dos BLs) continuam coerentes com o seed (agenda com sábado e domingo opcionais, aquecimento único, contagens 43 e 28); atualizar o que divergir
- [ ] T028 Rodar `npm run check` (tipos, lint, formato e testes) e o roteiro do `quickstart.md` no Moto G84 (instalação limpa: Home sem atraso perceptível; reabrir não duplica dados); corrigir até passar
- [ ] T029 Após o dono do app revisar e aprovar `content-review.md` (remover "PENDENTE DE REVISÃO"), marcar `003-programas-seed` como `concluída` em `specs/INDEX.md`

---

## Dependencies & Execution Order

- **Setup → Foundational → histórias → Polish.** Dentro da Foundational: T003–T006 em paralelo; T007→T008; T009→T010→T011 (T011 depende de T008 e de T010).
- **US1 e US2 são independentes** entre si (só usam a Foundational e `SHARED_EXERCISES`) e podem andar em paralelo.
- **US3 depende de US1 e US2** (usa o dataset real completo).
- Dentro de cada história: testes antes da implementação (T012/T013 → T014/T015; T016/T017 → T018/T019; T020–T022 → T023–T025).
- T026 depende de T014 e T018; T029 depende de T026 e da aprovação do dono do app.

### Parallel Opportunities

- Foundational: T003, T004, T005, T006.
- US1: T012, T013 (testes) e T014.
- US2: T016, T017 (testes) e T018.
- US1 e US2 inteiras em paralelo; US3: T020, T021, T022 em paralelo.

## Implementation Strategy

- **MVP**: Phase 1 + 2 + US1 (Treino Padrão, programa ativo padrão) — já permite iniciar o fluxo ponta a ponta nas specs seguintes.
- **Incremento 2**: US2 (Treino Monstro completo).
- **Incremento 3**: US3 (conjunto real, idempotência e ligação ao app).
- O trabalho de maior esforço é o conteúdo dos 59 exercícios (T006, T014, T018) e sua revisão (T026/T029).
