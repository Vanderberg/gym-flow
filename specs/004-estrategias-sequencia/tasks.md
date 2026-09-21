---
description: "Task list for Estratégias de Sequência"
---

# Tasks: Estratégias de Sequência

**Input**: `specs/004-estrategias-sequencia/` (plan.md, spec.md, research.md, data-model.md, contracts/sequence.md, quickstart.md)
**Backlog**: BL-030, BL-031, BL-032, BL-034, BL-035, BL-100, BL-101
**Depende de**: specs 001, 002 e 003 concluídas (repositórios, `createTestDb()`, utilitário de data local e seed dos dois programas)
**Tests**: incluídos — a constituição (XI) exige testes de domínio e de persistência. Escreva cada teste antes da implementação e veja-o falhar.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1 (sequência contínua), US2 (sequência semanal), US3 (reiniciar sequência contínua)

---

## Phase 1: Setup

- [ ] T001 Verificar que as specs 001–003 estão concluídas: `npm run check` passa e `specs/INDEX.md` marca `001-fundacao-projeto`, `002-modelo-dados` e `003-programas-seed` como `concluída`; se não, parar e avisar
- [ ] T002 [P] Criar as pastas com `.gitkeep` onde ainda não existirem: `src/domain/sequence/strategies/`, `src/domain/sequence/services/`, `src/application/`, `tests/unit/domain/sequence/`, `tests/integration/application/`

---

## Phase 2: Foundational (bloqueia todas as histórias) — BL-030, BL-035

**Purpose**: tipos, interface, resolvedor, avanço de posição, dia da semana local e o caso de uso `GetNextWorkout`

- [ ] T003 [P] Criar `src/domain/sequence/types.ts` com `WorkoutRef`, `WeeklyDayEntry`, `SequenceContext`, `NoneReason` e `NextWorkoutResult` exatamente como em `data-model.md` (reutilizar `SequenceType` de `src/domain/settings/types.ts`; não redefinir)
- [ ] T004 [P] Criar `src/domain/sequence/SequenceStrategy.ts` com a interface `SequenceStrategy` (`type`, `getNextWorkout(context): NextWorkoutResult`, pura e síncrona) conforme `contracts/sequence.md` (BL-030)
- [ ] T005 [P] Escrever `tests/unit/utils/weekday.test.ts` e implementar `src/utils/weekday.ts` com `weekdayOfLocalDate(localDate: string): number` (`"YYYY-MM-DD"` → 1=segunda..7=domingo, por componentes ano/mês/dia sem `toISOString()`; casos: segunda, domingo, virada de mês/ano, 23:59 local em fuso negativo não desloca o dia)
- [ ] T006 [P] Escrever `tests/unit/domain/sequence/advancePosition.test.ts` (primeiro→segundo, meio, último→primeiro com `total = N`, posição `null`/0/negativa/maior que `total`: vira 1 antes de avançar, logo devolve 2 quando `total ≥ 2`; `total = 1` sempre devolve 1) e implementar `src/domain/sequence/services/advancePosition.ts` (`current % total + 1` após normalizar) — faz o teste passar
- [ ] T007 [P] Escrever `tests/unit/domain/sequence/NextWorkoutResolver.test.ts` (delega à estratégia do `type` pedido com estratégias falsas; tipo sem estratégia lança `Error`; tipo duplicado no construtor lança `Error`; registrar uma terceira estratégia falsa não altera as outras — SC-003) e implementar `src/domain/sequence/services/NextWorkoutResolver.ts` — faz o teste passar
- [ ] T008 [P] Criar `tests/unit/domain/sequence/builders.ts` com `makeWorkouts(n)` (n `WorkoutRef` com `position` 1..n) e `makeContext(overrides)` para reuso nos testes de estratégia
- [ ] T009 Escrever `tests/integration/application/getNextWorkout.test.ts` (base: `createTestDb()` + seed da 003 + `Clock` fixo): lê programa ativo e tipo de `app_settings`; contínuo devolve o treino da posição gravada; semanal devolve o do dia; trocar o tipo em `app_settings` não altera `program_sequence_state` nem sessões; existência de sessão em andamento ou finalizada hoje não muda o resultado; programa inativo/treino inativo não entra em `workouts`; `weekday` usa a data local (relógio às 23:30 com deslocamento −03:00 continua no mesmo dia)
- [ ] T010 Implementar `src/application/GetNextWorkout.ts` conforme `contracts/sequence.md`: carrega `settings`, treinos ativos (`ProgramRepository.listWorkouts`), `SequenceStateRepository.get`, `ScheduleRepository.getSchedule`, `weekdayOfLocalDate(localDateOf(nowLocalIso(clock)))`; monta `SequenceContext` e chama `NextWorkoutResolver.resolve(settings.sequenceType, context)`; sem consultar sessões e sem `if` por tipo ou nome de programa (constituição VI) — faz T009 passar depois das estratégias (T014, T019)

**Checkpoint**: T005–T007 passam; T009 fica pendente até as estratégias existirem.

---

## Phase 3: User Story 1 — Sequência contínua (P1) 🎯 MVP (BL-031, BL-035, BL-100)

**Goal**: posição por programa que só avança ao finalizar; último → primeiro.
**Independent Test**: simular finalizações sucessivas com `advancePosition` e conferir o próximo treino a cada passo (quickstart, item 1).

### Tests

- [ ] T011 [P] [US1] Escrever `tests/unit/domain/sequence/ContinuousSequenceStrategy.test.ts` (BL-100): posição 1 → treino 1; meio → treino da posição; último → treino N; após avançar do último → treino 1; mesma posição em consultas repetidas (vários dias sem treinar); posição `null`, 0, negativa ou > N → treino 1 sem lançar erro; lista vazia → `NONE/NO_WORKOUTS`; ignora `schedule` e `today`
- [ ] T012 [P] [US1] Escrever `tests/unit/domain/sequence/continuousProgression.test.ts`: encadeia `resolve` + `advancePosition` por 2 ciclos completos com N = 5 (Treino Padrão) e N = 4 (Treino Monstro) e confere a ordem 1→…→N→1; consulta sem finalização nunca muda a posição (SC-002)
- [ ] T013 [P] [US1] Acrescentar a `tests/integration/application/getNextWorkout.test.ts` os casos contínuos: cada programa retoma a própria posição ao alternar o programa ativo e voltar; estado ausente → primeiro treino sem criar linha em `program_sequence_state`

### Implementation

- [ ] T014 [US1] Implementar `src/domain/sequence/strategies/ContinuousSequenceStrategy.ts` (`type: 'CONTINUOUS'`; regras da seção "Regras" de `data-model.md`; sem I/O) — faz T011 e T012 passarem
- [ ] T015 [US1] Registrar `ContinuousSequenceStrategy` na composição do resolvedor em `src/application/composition.ts` (função `createSequenceResolver()` que instancia `NextWorkoutResolver` com as estratégias existentes) — faz os casos contínuos de T009/T013 passarem

**Checkpoint**: US1 testável sozinha (não depende de US2/US3).

---

## Phase 4: User Story 2 — Sequência semanal (P1) (BL-032, BL-101)

**Goal**: o treino do dia vem da agenda semanal do programa, com motivo quando não há treino.
**Independent Test**: para cada dia da agenda do Treino Monstro, conferir treino, descanso ou opcional (quickstart, itens 1–2).

### Tests

- [ ] T016 [P] [US2] Escrever `tests/unit/domain/sequence/WeeklyScheduleSequenceStrategy.test.ts` (BL-101): dia com treino → `WORKOUT` do `workoutId` da agenda; dia com `workoutId` nulo e `optional = false` → `NONE/REST`; sábado opcional com nota → `NONE/OPTIONAL_DAY` com a `note`; domingo sem treino → `NONE/REST`; dia sem linha em agenda existente → `NONE/REST`; agenda vazia → `NONE/NO_SCHEDULE`; `workoutId` que não está em `workouts` → `NONE/REST`; virada de semana (domingo 7 → segunda 1) segue a agenda do novo dia; resultado idêntico com qualquer `currentPosition`
- [ ] T017 [P] [US2] Acrescentar a `tests/integration/application/getNextWorkout.test.ts` os casos semanais sobre o seed: Treino Monstro nas 7 datas de uma semana local (A/B/C/D nos dias da agenda, opcional com o texto da agenda, descanso); Treino Padrão em modo semanal → `NONE/NO_SCHEDULE` (não lança erro); treino já finalizado hoje continua sendo devolvido (cenário 6)

### Implementation

- [ ] T018 [US2] Implementar `src/domain/sequence/strategies/WeeklyScheduleSequenceStrategy.ts` (`type: 'WEEKLY'`; regras de `data-model.md`; sem I/O; a `note` só é devolvida para `OPTIONAL_DAY`) — faz T016 passar
- [ ] T019 [US2] Registrar `WeeklyScheduleSequenceStrategy` em `createSequenceResolver()` de `src/application/composition.ts` — faz T009 e T017 passarem

**Checkpoint**: US1 e US2 funcionam de forma independente; nenhuma estratégia referencia a outra.

---

## Phase 5: User Story 3 — Reiniciar sequência contínua (P1) (BL-034)

**Goal**: voltar ao primeiro treino do programa sem apagar histórico, só na contínua.
**Independent Test**: avançar, reiniciar e conferir posição 1 com histórico intacto (quickstart, item 2).

### Tests

- [ ] T020 [P] [US3] Escrever `tests/integration/application/resetSequence.test.ts` (base: `createTestDb()` + seed): posição no meio → após reiniciar `current_position = 1` e `GetNextWorkout` devolve o primeiro treino; `workout_session` e `workout_session_exercise` idênticos antes e depois; reiniciar o programa A não altera o estado do programa B; com tipo `WEEKLY` lança `ValidationError` e nada muda; sessão em andamento do programa é mantida (continua legível e `finishSession` posterior avança a partir da posição 1); programa sem linha de estado → cria com posição 1

### Implementation

- [ ] T021 [US3] Implementar `src/application/ResetSequence.ts` conforme `contracts/sequence.md`: lê `settings`, lança `ValidationError` (spec 002) se `sequenceType !== 'CONTINUOUS'`, chama `SequenceStateRepository.upsert(programId, 1)`; não acessa `SessionRepository` — faz T020 passar

**Checkpoint**: todas as histórias independentes.

---

## Phase 6: Polish & cross-cutting

- [ ] T022 [P] Exportar a API pública de `src/domain/sequence/index.ts` (tipos, `SequenceStrategy`, estratégias, `NextWorkoutResolver`, `advancePosition`) e de `src/application/index.ts` (`GetNextWorkout`, `ResetSequence`, `createSequenceResolver`)
- [ ] T023 [P] Verificar a regra de camada: teste `tests/unit/domain/sequence/purity.test.ts` que lê os arquivos de `src/domain/sequence/` e falha se importarem `react`, `expo-*`, `better-sqlite3` ou `src/data/`; e busca por nomes de programa (`Padrão`, `Monstro`) nos mesmos arquivos (constituição II e VI)
- [ ] T024 Atualizar a documentação divergente, se houver: conferir `docs/arquitetura.md` §4–6 e `docs/backlog.md` (BL-030..035, BL-100, BL-101) contra a implementação e ajustar no mesmo trabalho
- [ ] T025 Rodar `npm run check` (lint, tipos e testes) e os passos do `quickstart.md`; marcar a spec como `concluída` em `specs/INDEX.md`

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → histórias. Dentro da Phase 2, T003–T008 são paralelizáveis; T009/T010 dependem de T003–T008.
- **US1** depende só da Phase 2 (T014, T015). **US2** depende da Phase 2 e não da US1, mas compartilha `composition.ts` com T015 (fazer T015 antes de T019 ou resolver o merge). **US3** depende de T010 (`GetNextWorkout`) e de T014 para a verificação de "próximo é o primeiro".
- T009 só passa por completo depois de T014 e T019; T010 pode ser escrito antes.
- Polish só depois das histórias desejadas.

### Parallel examples

```text
Phase 2:  T003 T004 T005 T006 T007 T008    # arquivos distintos
US1:      T011 T012 T013                    # testes em arquivos distintos (T013 edita getNextWorkout.test.ts: fazer antes de T017)
US2:      T016 T017
```

## Implementation Strategy

1. **MVP**: Phases 1–3 (contínua com resolvedor e `GetNextWorkout`) — já entrega o modo padrão.
2. Incremental: US2 (semanal) → US3 (reiniciar) → Polish.
3. Cada tarefa referencia o backlog no commit (ex.: `feat(004): BL-031 ...`). Um item só está concluído com lint, tipos e testes passando.
