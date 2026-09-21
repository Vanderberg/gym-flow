---
description: "Task list for Estratégias de Sequência"
---

# Tasks: Estratégias de Sequência

**Input**: `specs/004-estrategias-sequencia/` (plan.md, spec.md, research.md, data-model.md, contracts/sequence.md, quickstart.md)
**Backlog**: BL-030, BL-031, BL-032, BL-034, BL-035, BL-100, BL-101
**Requisitos de produto**: RF-01, RF-11, RF-12, RF-13, RF-14, RF-29
**Depende de**: specs 001, 002 e 003 concluídas (repositórios, `createTestDb()`, utilitário de data local e seed dos dois programas)
**Tests**: incluídos — a constituição (XI) exige testes de domínio e de persistência. Escreva cada teste antes da implementação e veja-o falhar.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1 (sequência contínua), US2 (sequência semanal), US3 (reiniciar sequência contínua)
- Cada fase lista os BL/RF que cobre; todo commit referencia o BL da tarefa (ex.: `feat(004): BL-031 ...`).

---

## Phase 1: Setup

- [ ] T001 Verificar que as specs 001–003 estão concluídas: `npm run check` passa e `specs/INDEX.md` marca `001-fundacao-projeto`, `002-modelo-dados` e `003-programas-seed` como `concluída`; se não, parar e avisar
- [ ] T002 [P] Criar as pastas com `.gitkeep` onde ainda não existirem: `src/domain/sequence/strategies/`, `src/domain/sequence/services/`, `src/application/`, `src/utils/`, `tests/unit/domain/sequence/`, `tests/unit/utils/`, `tests/integration/application/`

---

## Phase 2: Foundational (bloqueia todas as histórias) — BL-030

**Purpose**: tipos, interface, resolvedor, avanço de posição e dia da semana local (tudo puro e verde sozinho)

- [ ] T003 [P] Criar `src/domain/sequence/types.ts` com `WorkoutRef`, `WeeklyDayEntry`, `SequenceContext`, `NoneReason` e `NextWorkoutResult` exatamente como em `data-model.md` (reutilizar `SequenceType` de `src/domain/settings/types.ts`; não redefinir)
- [ ] T004 [P] Criar `src/domain/sequence/SequenceStrategy.ts` com a interface `SequenceStrategy` (`type`, `getNextWorkout(context): NextWorkoutResult`, pura e síncrona) conforme `contracts/sequence.md`
- [ ] T005 [P] Escrever `tests/unit/utils/weekday.test.ts` e implementar `src/utils/weekday.ts` com `weekdayOfLocalDate(localDate: string): number` (`"YYYY-MM-DD"` → 1=segunda..7=domingo, por componentes ano/mês/dia sem `toISOString()`; casos: segunda, domingo, virada de mês e de ano, ano bissexto)
- [ ] T006 [P] Escrever `tests/unit/domain/sequence/advancePosition.test.ts` e implementar `src/domain/sequence/services/advancePosition.ts` (`advancePosition(currentPosition: number | null, activePositions: number[]): number`, regras de `data-model.md`): posições `[1,2,3,4,5]` → 1→2, 3→4, 5→1; com lacuna `[1,2,4,5]`: 2→4, 5→1; posição ausente ou sem correspondência (ex.: 3 em `[1,2,4,5]`, `null`, 0) conta como a primeira e devolve a segunda; lista de 1 elemento devolve esse elemento
- [ ] T007 [P] Escrever `tests/unit/domain/sequence/NextWorkoutResolver.test.ts` e implementar `src/domain/sequence/services/NextWorkoutResolver.ts`: delega à estratégia do `type` pedido (estratégias falsas); tipo sem estratégia lança `Error`; tipo duplicado no construtor lança `Error`; registrar uma terceira estratégia falsa não altera as outras (SC-003)
- [ ] T008 [P] Criar `tests/unit/domain/sequence/builders.ts` com `makeWorkouts(n, positions?)` (`WorkoutRef` com `position` 1..n ou as posições informadas) e `makeContext(overrides)` para reuso nos testes de estratégia

**Checkpoint**: T005–T007 passam; `npm run check` verde.

---

## Phase 3: User Story 1 — Sequência contínua (P1) 🎯 MVP — BL-031, BL-035, BL-100 · RF-01, RF-11

**Goal**: posição por programa que só avança ao finalizar; última → primeira.
**Independent Test**: simular finalizações sucessivas com `advancePosition` e conferir o próximo treino a cada passo (quickstart, item 1). A gravação do avanço ao finalizar é da spec 007 (Assumptions).

### Tests

- [ ] T009 [P] [US1] Escrever `tests/unit/domain/sequence/ContinuousSequenceStrategy.test.ts` (BL-100): posição 1 → primeiro treino; meio → treino da posição; última → último treino; mesma posição em consultas repetidas (vários dias sem treinar); posição `null`, 0, negativa ou sem treino ativo correspondente → primeiro treino sem lançar erro; treino desativado no meio (posições ativas `[1,2,4,5]`, gravada 3) → primeiro; lista vazia → `NONE/NO_WORKOUTS`; ignora `schedule` e `today`
- [ ] T010 [P] [US1] Escrever `tests/unit/domain/sequence/continuousProgression.test.ts`: simula a finalização encadeando `resolve` + `advancePosition` por 2 ciclos completos com N = 5 (Treino Padrão) e N = 4 (Treino Monstro), conferindo 1→…→N→1; consulta sem finalização nunca muda a posição (SC-002)
- [ ] T011 [P] [US1] Escrever `tests/integration/application/getNextWorkout.test.ts` (base: `createTestDb()` + seed da 003 + `Clock` fixo) com os casos contínuos: devolve o treino da posição gravada; estado ausente → primeiro treino sem criar linha em `program_sequence_state`; cada programa retoma a própria posição ao alternar o programa ativo e voltar; sessão em andamento, finalizada ou descartada (`discardSession`) não altera o resultado nem a posição; programa ou treino inativo não entra em `workouts`; trocar o tipo em `app_settings` não altera `program_sequence_state` nem sessões

### Implementation

- [ ] T012 [US1] Implementar `src/domain/sequence/strategies/ContinuousSequenceStrategy.ts` (`type: 'CONTINUOUS'`; regras de `data-model.md`, comparação por `WorkoutRef.position`; sem I/O) — faz T009 e T010 passarem
- [ ] T013 [US1] Criar `src/application/composition.ts` com `createSequenceResolver()` que instancia `NextWorkoutResolver` com as estratégias existentes (por ora só `ContinuousSequenceStrategy`)
- [ ] T014 [US1] Implementar `src/application/GetNextWorkout.ts` conforme `contracts/sequence.md`: carrega `settings`, treinos ativos (`ProgramRepository.listWorkouts`), `SequenceStateRepository.get`, `ScheduleRepository.getSchedule`, `weekdayOfLocalDate(localDateOf(nowLocalIso(clock)))`; monta `SequenceContext` e chama `NextWorkoutResolver.resolve(settings.sequenceType, context)`; sem consultar sessões e sem `if` por tipo ou nome de programa (constituição VI) — faz T011 passar

**Checkpoint**: US1 testável sozinha (não depende de US2/US3); `npm run check` verde.

---

## Phase 4: User Story 2 — Sequência semanal (P1) — BL-032, BL-101 · RF-01, RF-12, RF-29

**Goal**: o treino do dia vem da agenda semanal do programa, com motivo quando não há treino.
**Independent Test**: para cada dia da agenda do Treino Monstro, conferir treino, descanso ou opcional (quickstart, itens 1–2).

### Tests

- [ ] T015 [P] [US2] Escrever `tests/unit/domain/sequence/WeeklyScheduleSequenceStrategy.test.ts` (BL-101): dia com treino → `WORKOUT` do `workoutId` da agenda; dia com `workoutId` nulo e `optional = false` → `NONE/REST`; sábado opcional com nota → `NONE/OPTIONAL_DAY` com a `note`; domingo sem treino → `NONE/REST`; dia sem linha em agenda existente → `NONE/REST`; agenda vazia → `NONE/NO_SCHEDULE`; `workoutId` que não está em `workouts` (treino desativado) → `NONE/REST`; virada de semana (domingo 7 → segunda 1) segue a agenda do novo dia; resultado idêntico com qualquer `currentPosition`
- [ ] T016 [P] [US2] Acrescentar a `tests/integration/application/getNextWorkout.test.ts` os casos semanais sobre o seed: Treino Monstro nas 7 datas de uma semana local (A/B/C/D nos dias da agenda, opcional com o texto da agenda, descanso); Treino Padrão em modo semanal → `NONE/NO_SCHEDULE` (não lança erro); treino já finalizado hoje continua sendo devolvido; relógio às 23:30 com deslocamento −03:00 continua no mesmo dia da semana (data local, sem UTC)

### Implementation

- [ ] T017 [US2] Implementar `src/domain/sequence/strategies/WeeklyScheduleSequenceStrategy.ts` (`type: 'WEEKLY'`; regras de `data-model.md`; sem I/O; a `note` só é devolvida para `OPTIONAL_DAY`) — faz T015 passar
- [ ] T018 [US2] Registrar `WeeklyScheduleSequenceStrategy` em `createSequenceResolver()` de `src/application/composition.ts` — faz T016 passar

**Checkpoint**: US1 e US2 funcionam de forma independente; nenhuma estratégia referencia a outra.

---

## Phase 5: User Story 3 — Reiniciar sequência contínua (P1) — BL-034 · RF-13, RF-14

**Goal**: voltar ao primeiro treino do programa sem apagar histórico, só na contínua.
**Independent Test**: avançar, reiniciar e conferir posição 1 com histórico intacto (quickstart, item 2).

### Tests

- [ ] T019 [P] [US3] Escrever `tests/integration/application/resetSequence.test.ts` (base: `createTestDb()` + seed): posição no meio → após reiniciar `current_position = 1` e `GetNextWorkout` devolve o primeiro treino; `workout_session` e `workout_session_exercise` idênticos antes e depois; reiniciar o programa A não altera o estado do programa B; com tipo `WEEKLY` lança `ValidationError` e nada muda; sessão em andamento do programa é mantida (continua legível); programa sem linha de estado → cria com posição 1

### Implementation

- [ ] T020 [US3] Implementar `src/application/ResetSequence.ts` conforme `contracts/sequence.md`: lê `settings`, lança `ValidationError` (spec 002) se `sequenceType !== 'CONTINUOUS'`, chama `SequenceStateRepository.upsert(programId, 1)`; não acessa `SessionRepository` — faz T019 passar

**Checkpoint**: todas as histórias independentes.

---

## Phase 6: Polish & cross-cutting

- [ ] T021 [P] Exportar a API pública em `src/domain/sequence/index.ts` (tipos, `SequenceStrategy`, estratégias, `NextWorkoutResolver`, `advancePosition`) e em `src/application/index.ts` (`GetNextWorkout`, `ResetSequence`, `createSequenceResolver`)
- [ ] T022 [P] Escrever `tests/unit/domain/sequence/purity.test.ts`: lê os arquivos de `src/domain/sequence/` e falha se importarem `react`, `expo-*`, `better-sqlite3` ou `src/data/`, ou se contiverem nomes de programa (`Padrão`, `Monstro`) — constituição II e VI
- [ ] T023 [P] Conferir `docs/arquitetura.md` §4–6 e `docs/backlog.md` (BL-030..035, BL-100, BL-101) contra a implementação e ajustar no mesmo trabalho (a assinatura síncrona de `getNextWorkout` já foi atualizada na doc)
- [ ] T024 Rodar `npm run check` (lint, tipos e testes) e os passos do `quickstart.md`; marcar a spec como `concluída` em `specs/INDEX.md`

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → histórias. Na Phase 2, T003–T008 são paralelizáveis e a fase termina verde.
- **US1** depende só da Phase 2 e entrega `GetNextWorkout` funcional para o tipo contínuo. **US2** depende da Phase 2 e de T013/T014 (adiciona a estratégia semanal ao mesmo `composition.ts` e estende os testes de `getNextWorkout.test.ts`). **US3** depende de T014 (`GetNextWorkout`) e de T012 para conferir "o próximo é o primeiro".
- T011 e T016 editam o mesmo arquivo de teste: fazer em sequência. T013 e T018 editam `composition.ts`: fazer em sequência.
- Polish só depois das histórias desejadas.

### Parallel examples

```text
Phase 2:  T003 T004 T005 T006 T007 T008    # arquivos distintos
US1:      T009 T010 T011                    # testes em arquivos distintos
US2:      T015 T016
Polish:   T021 T022 T023
```

## Implementation Strategy

1. **MVP**: Phases 1–3 (contínua com resolvedor e `GetNextWorkout`) — já entrega o modo padrão.
2. Incremental: US2 (semanal) → US3 (reiniciar) → Polish.
3. Um item só está concluído com lint, tipos e testes passando.
