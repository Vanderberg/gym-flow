# Research: Estratégias de Sequência

## D1 — Estratégia pura sobre contexto carregado
- **Decision**: `getNextWorkout(context): NextWorkoutResult` síncrona e pura; o `SequenceContext` (treinos ativos do programa por posição, posição atual, agenda, dia da semana local) é montado por `application/GetNextWorkout`.
- **Rationale**: domínio sem I/O e testável sem banco (constituição II). Diverge da assinatura `Promise<WorkoutReference | null>` de `docs/arquitetura.md` §4; a doc é atualizada junto.
- **Alternatives**: estratégia assíncrona chamando repositórios (mais acoplada, testes com mocks).

## D2 — Resultado com motivo
- **Decision**: união discriminada `NextWorkoutResult`: `{ kind: 'WORKOUT', workout }` ou `{ kind: 'NONE', reason: 'REST' | 'OPTIONAL_DAY' | 'NO_SCHEDULE' | 'NO_WORKOUTS', note }`.
- **Rationale**: FR-004 exige motivo; o `null` da constituição VI é representado por `NONE` sem perder o motivo.
- **Alternatives**: `null` + campos avulsos (perde tipagem).

## D3 — Contínua: estado ausente ou inválido = posição 1 (clarificação)
- **Decision**: posição ausente, < 1 ou > N → posição 1, sem gravar. Programa sem treinos ativos → `NONE/NO_WORKOUTS`.
- **Rationale**: autocorretivo; a posição só é gravada na finalização (FR-002, SC-002).

## D4 — Semanal: só agenda + data (clarificação)
- **Decision**: dia da semana (1=seg..7=dom) vem da data local; ignora sessões finalizadas e em andamento. Agenda vazia → `NO_SCHEDULE`. Linha com `workoutId` → `WORKOUT`; com `workoutId` nulo → `OPTIONAL_DAY` (se `optional`, devolvendo a `note`) ou `REST`; dia sem linha, com agenda existente → `REST`.
- **Rationale**: FR-003/FR-004; resolvedor puro; "já concluído" é responsabilidade da Home.
- **Alternatives**: consultar sessões no resolvedor (mistura responsabilidades).

## D5 — Registro de estratégias
- **Decision**: `NextWorkoutResolver` indexa as estratégias por `type`; sem `if/else` por tipo.
- **Rationale**: SC-003 (novo tipo sem alterar os existentes).

## D6 — Avanço e reinício
- **Decision**: `advancePosition(current, total)` puro (posição inválida → 1 antes de avançar; último → 1). Reiniciar = `SequenceStateRepository.upsert(programId, 1)`; o caso de uso recusa (`ValidationError`) se o tipo ativo for `WEEKLY`; não toca sessões (inclusive em andamento) nem outros programas.
- **Rationale**: FR-005 e clarificação de reinício com sessão em andamento.

## D7 — Data local
- **Decision**: dia da semana calculado da data local (`localDateOf(nowLocalIso(clock))`, componentes ano/mês/dia), nunca por `toISOString()`.
- **Rationale**: constituição X.
