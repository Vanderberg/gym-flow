---
description: "Task list for Modelo de Dados e Repositórios"
---

# Tasks: Modelo de Dados e Repositórios

**Input**: `specs/002-modelo-dados/` (plan.md, spec.md, research.md, data-model.md, contracts/repositories.md, quickstart.md)
**Backlog**: BL-012, BL-013, BL-014, BL-015
**Depende de**: spec 001 concluída
**Tests**: incluídos — a constituição (XI) exige testes de integração de persistência e testes unitários das regras/datas. Escreva cada teste antes da implementação e veja-o falhar.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1 (conteúdo: programas/treinos/exercícios), US2 (agenda, sequência, configurações), US3 (sessões)

---

## Phase 1: Setup (BL-011)

- [X] T001 Verificar que a spec 001 está concluída: `npm run check` passa e `specs/INDEX.md` marca `001-fundacao-projeto` como `concluída`; se não, parar e avisar
- [X] T002 Garantir `PRAGMA foreign_keys = ON` fora de transação em `src/data/database/openDatabase.ts` e no helper `tests/integration/helpers/betterSqliteDatabase.ts` (research R2); se faltar, adicionar, com teste mínimo em `tests/integration/foreignKeys.test.ts` (inserir linha com FK inexistente é rejeitada)
- [X] T003 [P] Criar as pastas com `.gitkeep` onde ainda não existirem: `src/domain/program/`, `src/domain/exercise/`, `src/domain/sequence/`, `src/domain/session/`, `src/domain/settings/`, `src/data/repositories/`, `tests/integration/data/`, `tests/unit/`

---

## Phase 2: Foundational (bloqueia todas as histórias) — BL-012..015

**Purpose**: utilitário de datas, erros tipados, esquema e helper de teste compartilhados

- [X] T004 [P] Escrever `tests/unit/localDate.test.ts`: `nowLocalIso` com relógio falso gera `AAAA-MM-DDTHH:mm:ss±HH:MM` (deslocamento −03:00 e +05:30, minutos e segundos com zero à esquerda); `localDateOf("2026-09-20T23:30:00-03:00")` devolve `2026-09-20`; sem conversão UTC (FR-011)
- [X] T005 [P] Implementar `src/utils/localDate.ts` (`type Clock = () => Date`, `nowLocalIso(clock?)` usando `getTimezoneOffset()`, `localDateOf(iso)` como fatia da string) — faz T004 passar
- [X] T006 [P] Escrever `tests/unit/normalizeName.test.ts`: `normalizeName("  Tríceps   TESTA ")` = `"tríceps testa"`; `"ELEVAÇÃO lateral"` = `"elevação lateral"`; forma NFD e NFC do mesmo texto ("Elevação") geram a mesma chave; nome vazio ou só espaços ⇒ `ValidationError`
- [X] T007 [P] Implementar `src/utils/normalizeName.ts` (`trim`, colapsar espaços internos, `normalize('NFC')`, `toLocaleLowerCase('pt-BR')`; lança `ValidationError` para vazio) — faz T006 passar
- [X] T008 [P] Criar `src/data/repositories/errors.ts` com `ValidationError`, `ConflictError`, `NotFoundError` e `translateSqliteError(e)` que mapeia mensagens `UNIQUE constraint failed` e `FOREIGN KEY constraint failed` → `ConflictError`, `CHECK constraint failed` e `NOT NULL constraint failed` → `ValidationError`, e repassa qualquer outro erro
- [X] T009 [P] Criar `src/data/repositories/mappers.ts` com `toBoolean(n: number): boolean` e `fromBoolean(b: boolean): 0 | 1`
- [X] T010 Criar `tests/integration/helpers/testDb.ts`: `createTestDb()` devolve `{ db, clock }` com banco em memória (`better-sqlite3`), migrations aplicadas, relógio falso controlável (começa em `2026-09-20T10:00:00-03:00`) e funções de fixture por SQL direto: `insertProgram(name)`, `insertWorkout(programId, code, position)`, `insertExercise(name)`, `linkExercise(workoutId, exerciseId, displayOrder)` (sem usar repositórios, para manter os testes de cada história independentes)
- [X] T011 Escrever `tests/integration/data/schema.test.ts` (usando `createTestDb()` do helper, com migrations 1–2 aplicadas): as 9 tabelas existem; `exercise.name_key` duplicado é rejeitado (a coluna guarda o nome já normalizado; a normalização em si é testada no teste unitário de `normalizeName`); `weight = -1` rejeitado, `NULL` e `0` aceitos; `sequence_type = 'X'` rejeitado; `weekday` 0 e 8 rejeitados; segunda linha em `app_settings` com `id = 2` rejeitada; duas sessões com `finished_at IS NULL` rejeitadas; sessão com `completed = 1` e `finished_at NULL` rejeitada; excluir `exercise`, `workout` e `training_program` referenciados por sessão é rejeitado; `UNIQUE(workout_id, exercise_id)`, `UNIQUE(program_id, position)` e `UNIQUE(program_id)` em `program_sequence_state` funcionam
- [X] T012 Criar `src/data/migrations/0002-schema.ts` com o DDL exato de `specs/002-modelo-dados/data-model.md` (9 tabelas, incluindo `exercise.name_key TEXT NOT NULL UNIQUE` sem `COLLATE NOCASE`, CHECKs, `ux_workout_session_in_progress`, `ix_workout_session_program_finished`) e registrá-la em `src/data/migrations/index.ts` — faz T011 passar

**Checkpoint**: os testes T004, T006 e T011 passam; `npm run check` verde.

---

## Phase 3: User Story 1 — Programas, treinos e exercícios (P1) 🎯 MVP (BL-012)

**Goal**: guardar e consultar programas, treinos, exercícios e a relação com prescrição/técnica/notas.
**Independent Test**: gravar programa com 2 treinos e exercícios e recuperá-lo idêntico e na ordem (quickstart, US1).

### Tests

- [X] T013 [P] [US1] `tests/integration/data/exercise.repository.test.ts`: `upsertByName` cria e, ao repetir com outra caixa/espaços ("  supino INCLINADO "), devolve o mesmo id sem duplicar e mantendo o `name` original; o mesmo vale com acentos ("Tríceps testa" × "TRÍCEPS  TESTA", "Elevação lateral" × "ELEVAÇÃO LATERAL"); `findByName` busca por `name_key`; `deactivate` marca `active = false` sem excluir; campos `primaryMuscle`, `secondaryMuscles`, `description` persistem
- [X] T014 [P] [US1] `tests/integration/data/program.repository.test.ts`: `upsertProgram` por nome (repetir não duplica); `listWorkouts` ordenado por `position`; `getWorkoutWithExercises` devolve exercícios por `displayOrder` com prescrição, técnica, notas e dados do exercício; exercício reutilizado em 2 treinos é 1 linha em `exercise`; `upsertWorkoutExercise` repetido para o mesmo par não duplica; `warmupNote` e `homeSuggestion` persistem; `deactivateProgram`/`deactivateWorkout` não excluem; `listPrograms` oculta inativos por padrão

### Implementation

- [X] T015 [P] [US1] Criar `src/domain/exercise/types.ts` (`Exercise`, `ExerciseInput`) e `src/domain/exercise/ExerciseRepository.ts` conforme `contracts/repositories.md`
- [X] T016 [P] [US1] Criar `src/domain/program/types.ts` (`TrainingProgram`, `Workout`, `WorkoutExercise`, `WorkoutDetail`, `ProgramInput`, `WorkoutInput`, `WorkoutExerciseInput`) e `src/domain/program/ProgramRepository.ts` conforme o contrato
- [X] T017 [US1] Implementar `src/data/repositories/SqliteExerciseRepository.ts` (construtor `(db: Database, clock: Clock)`; upsert por `name_key = normalizeName(name)`, gravando `name` como informado na primeira criação; erros via `translateSqliteError`) — faz T013 passar
- [X] T018 [US1] Implementar `src/data/repositories/SqliteProgramRepository.ts` (upserts por chave natural, `getWorkoutWithExercises` com JOIN em `exercise`, `updated_at` via `clock`) — faz T014 passar

**Checkpoint**: US1 testável sozinha (não depende de US2/US3).

---

## Phase 4: User Story 2 — Agenda semanal, sequência e configurações (P1) (BL-013, BL-014)

**Goal**: agenda por programa (com dia sem treino e nota), posição de sequência por programa e configurações globais.
**Independent Test**: dois programas com agenda e posições diferentes permanecem independentes (quickstart, US2).

### Tests

- [X] T019 [P] [US2] `tests/integration/data/schedule.repository.test.ts`: `upsertEntry` grava e atualiza por `(programId, weekday)`; `workoutId: null` devolve "sem treino" em `getEntry`; `optional` e `note` persistem; `weekday` 0 e 8 ⇒ `ValidationError`; `workoutId` de treino de outro programa ⇒ `ValidationError`; `getSchedule` devolve os dias em ordem 1..7; agendas de dois programas não interferem
- [X] T020 [P] [US2] `tests/integration/data/sequenceState.repository.test.ts`: `upsert` cria e atualiza; `get` de programa sem estado devolve `null`; posição 0 ⇒ `ValidationError`; alterar a posição de um programa não muda a do outro
- [X] T021 [P] [US2] `tests/integration/data/settings.repository.test.ts`: `get` antes de salvar devolve `null`; `save` cria o registro único e uma segunda chamada atualiza o mesmo (`id = 1`); `sequenceType` inválido ⇒ `ValidationError`; programa ativo inexistente ⇒ `ConflictError`; valores padrão de cronômetro (desligado, 90 s)

### Implementation

- [X] T022 [P] [US2] Criar `src/domain/sequence/types.ts` (`WeeklyScheduleEntry`, `ProgramSequenceState`), `src/domain/sequence/ScheduleRepository.ts` e `src/domain/sequence/SequenceStateRepository.ts` conforme o contrato
- [X] T023 [P] [US2] Criar `src/domain/settings/types.ts` (`SequenceType = 'CONTINUOUS' | 'WEEKLY'`, `AppSettings`, `AppSettingsInput`) e `src/domain/settings/SettingsRepository.ts`
- [X] T024 [US2] Implementar `src/data/repositories/SqliteScheduleRepository.ts` (validando que o `workoutId` pertence ao `programId`) e `src/data/repositories/SqliteSequenceStateRepository.ts` — fazem T019 e T020 passar
- [X] T025 [US2] Implementar `src/data/repositories/SqliteSettingsRepository.ts` (registro único `id = 1`) — faz T021 passar

**Checkpoint**: US2 testável sozinha (fixtures por SQL do T010).

---

## Phase 5: User Story 3 — Sessões com integridade (P1) (BL-015)

**Goal**: criar, atualizar, finalizar, descartar e consultar sessões, com a regra de peso e a "última carga" derivada.
**Independent Test**: criar sessão, marcar com peso, finalizar; conferir persistência e regras (quickstart, US3).

### Tests

- [X] T026 [US3] `tests/integration/data/session.repository.test.ts` cobrindo: (a) `startSession` de treino com 3 exercícios cria a sessão e 3 linhas desmarcadas e sem peso, com `startedAt` gerado por `nowLocalIso`; (b) segunda `startSession` com uma em andamento ⇒ `ConflictError` e nada novo gravado; (c) `setExerciseWeight` −1 ⇒ `ValidationError`, `null` e `0` aceitos; `setExerciseCompleted` alterna; (d) falha injetada na criação da 2ª linha (Database decorador que lança no 2º `INSERT` em `workout_session_exercise`) ⇒ nenhuma sessão nem linha gravada; (e) `finishSession` com 0 exercícios marcados funciona e preenche `finishedAt` e `completed`; (f) `discardSession` apaga sessão e linhas de uma em andamento e lança `ConflictError` para finalizada; (g) `getInProgress` devolve a em andamento com linhas, ou `null`; (h) `listFinished` mais recente primeiro e filtra por `programId`, sem incluir em andamento; (i) `setExerciseCompleted`/`setExerciseWeight` funcionam em sessão finalizada sem alterar programa/treino; (j) `getLastWeight` usa só sessões finalizadas do mesmo programa com peso preenchido, ignora outro programa e sessão em andamento e devolve `null` sem histórico; (k) sessão de 23h30 −03:00 pertence ao dia local correto (`localDateOf`); (l) `startSession` com treino de outro programa ⇒ `ValidationError`; (m) `startSession` com programa ou treino inativo ⇒ `ValidationError`; (n) `setExerciseCompleted`/`setExerciseWeight` para exercício sem linha na sessão ⇒ `NotFoundError`

### Implementation

- [X] T027 [US3] Criar `src/domain/session/types.ts` (`WorkoutSession`, `WorkoutSessionExercise`, `WorkoutSessionDetail`) e `src/domain/session/SessionRepository.ts` conforme o contrato
- [X] T028 [US3] Implementar `src/data/repositories/SqliteSessionRepository.ts`: `startSession` valida que o treino pertence ao programa e que ambos estão ativos (`ValidationError`) e, em `db.transaction`, insere ( sessão + uma linha por `workout_exercise` em ordem de `display_order`); `setExercise*` lançam `NotFoundError` quando a linha não existe; `discardSession` em transação (linhas e depois sessão, só se `finished_at IS NULL`); `finishSession` define `finished_at = finishedAt ?? nowLocalIso()` e `completed = 1` sem tocar em sequência; `getLastWeight` por `finished_at DESC, id DESC` (research R10); erros via `translateSqliteError` — faz T026 passar

**Checkpoint**: as três histórias funcionam; todos os testes de integração passam.

---

## Phase 6: Polish (BL-012..015)

- [X] T029 [P] Criar `src/data/repositories/index.ts` com `createRepositories(db: Database, clock?: Clock)` devolvendo todos os repositórios, para permitir construí-los sobre um `Database` transacional (contracts, "Transações compostas"); adicionar teste em `tests/integration/data/composition.test.ts`: dentro de `db.transaction`, `finishSession` + `SequenceStateRepository.upsert` com erro forçado no segundo passo desfaz o primeiro (cobre a finalização composta do SC-003)
- [X] T030 [P] Teste de desempenho (SC-002) em `tests/integration/data/performance.test.ts`: criar sessão de 15 exercícios, marcar todos com peso, finalizar e reler, em menos de 1 s (medição em Node/`better-sqlite3`; a validação no aparelho fica para a spec 007)
- [X] T031 [P] Atualizar `docs/modelo-dados.md`: CHECKs (peso, `completed`, `weekday`, `sequence_type`, `position`, `current_position`), `UNIQUE (program_id, position)` em `workout`, `CHECK (completed = 0 OR finished_at IS NOT NULL)` e o índice `ux_workout_session_in_progress` com `WHERE finished_at IS NULL` (alinhando com o `data-model.md` desta spec); corrigir também os §11 e §16 para a mesma definição de "em andamento" (`finished_at IS NULL`) e conferir que o §13 traz `exercise.name_key`
- [X] T032 Rodar `npm run check` (tipos, lint, formato e testes) e corrigir até passar sem erros
- [X] T033 Marcar `002-modelo-dados` como `concluída` em `specs/INDEX.md`

---

## Dependencies & Execution Order

- **Setup → Foundational → histórias → Polish.** testes antes da implementação: T004→T005, T006→T007, T011→T012. O helper T010 é escrito antes do T011, mas só funciona depois da migration T012.
- **US1, US2 e US3 são independentes** entre si (as fixtures do T010 usam SQL direto), então podem andar em paralelo após a Phase 2.
- Dentro de cada história: testes antes da implementação; interfaces (T015/T016, T022/T023, T027) antes das implementações.
- T029 depende de US1, US2 e US3 concluídas; T031 pode rodar a qualquer momento após T012.

### Parallel Opportunities

- Phase 2: T004, T006, T008, T009 em paralelo (T005 depois de T004; T007 depois de T006); T010 → T011 → T012 em sequência.
- US1: T013, T014 (testes) e T015, T016 (interfaces) em paralelo.
- US2: T019–T021 e T022–T023 em paralelo.
- Histórias inteiras em paralelo por agentes distintos; cada uma toca só arquivos próprios.

## Implementation Strategy

- **MVP**: Phase 1 + 2 + US1 (conteúdo de programas) — habilita a spec 003 (seed).
- **Incremento 2**: US2 — habilita as specs 004 e 005 (sequência e configurações).
- **Incremento 3**: US3 — habilita as specs 006 a 010 (Home, execução, histórico, estatísticas).
- Fechar com Polish e só então marcar `concluída`.
