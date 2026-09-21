---
description: "Task list for Estatísticas de Frequência"
---

# Tasks: Estatísticas de Frequência

**Input**: `specs/010-estatisticas-frequencia/` (plan.md, spec.md, research.md, data-model.md, contracts/use-cases.md, contracts/ui.md, quickstart.md)
**Backlog**: BL-080, BL-081, BL-082, BL-083, BL-084, BL-085, BL-086, BL-087, BL-105
**Requisitos de produto**: RF-17, RF-18
**Depende de**: specs 001–009 concluídas (repositórios da 002, seed, `FilterSelect` da 009, componentes comuns)
**Tests**: incluídos — a constituição (XI) exige testes de domínio (BL-105), persistência e fluxos de UI. Escreva cada teste antes da implementação e veja-o falhar.
**Design**: tokens e componentes de `docs/design-telas.md` §2–3 e §7 ("Placar de academia"). Nenhuma tela usa cor, tamanho ou espaçamento literal.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1 (frequência por período), US2 (média semanal e intervalo médio), US3 (filtro por programa)
- Cada fase lista os BL/RF que cobre; todo commit referencia o BL da tarefa (ex.: `feat(010): BL-085 ...`).

---

## Phase 1: Setup

- [X] T001 Verificar que as specs 001–009 estão concluídas: `npm run check` passa e `specs/INDEX.md` marca `001` a `009` como `concluída`; se não, parar e avisar
- [X] T002 [P] Criar as pastas com `.gitkeep` onde ainda não existirem: `src/domain/statistics/`, `src/components/statistics/`, `src/components/common/`, `src/utils/`, `src/store/`, `src/hooks/`, `tests/unit/domain/statistics/`, `tests/unit/utils/`, `tests/unit/store/`, `tests/ui/common/`, `tests/ui/statistics/`, `tests/integration/data/`, `tests/integration/application/`

---

## Phase 2: Foundational (bloqueia todas as histórias)

**Purpose**: tipos, aritmética de datas, leituras do repositório, store, `StatCard` e esqueleto da aba (tudo verde sozinho)

- [X] T003 [P] Criar `src/domain/statistics/types.ts` com `Period`, `PeriodRange`, `StatsResult` e `StatisticsView` como em `data-model.md`, com `weeklyAverage` e `averageIntervalDays` tipados `number | null` (nulos até a US2)
- [X] T004 [P] Escrever `tests/unit/utils/dateMath.test.ts` e implementar `src/utils/dateMath.ts` (`daysBetween(a, b)`, `addDays(date, n)`, `mondayOf(date)` para datas `"YYYY-MM-DD"`, sempre por componentes de ano/mês/dia sem `toISOString()` nem UTC): mesmo dia = 0, virada de mês e de ano, ano bissexto (fevereiro de 2028), `mondayOf` de uma quarta, de uma segunda e de um domingo, `addDays` negativo, dia 31/12 → 01/01
- [X] T005 Escrever `tests/integration/data/sessionStatsQueries.test.ts` (`createTestDb()` + fixture: 2 programas, sessões finalizadas em várias datas, 1 em andamento, 1 finalizada com 0 exercícios marcados) e implementar (ou só conferir, se a T029 da spec 009 já tiver criado `listProgramsWithFinished`) em `src/domain/session/SessionRepository.ts` e `src/data/repositories/SqliteSessionRepository.ts` as leituras `listFinishedDates(opts: { from, to, programId? })` (`substr(finished_at, 1, 10)` de sessões finalizadas com data local em `[from, to]` inclusive, ordenadas; filtro opcional por programa) e `listProgramsWithFinished()` (programas, ativos ou não, com ao menos uma sessão finalizada, por nome): sessão em andamento fora, finalizada com 0 exercícios dentro, `finished_at` às `23:30−03:00` no último dia do mês continua no mesmo mês, borda inclusiva de `from` e `to`, nenhuma escrita
- [X] T006 [P] Escrever `tests/unit/store/statisticsStore.test.ts` e implementar `src/store/statisticsStore.ts` (Zustand): `period` (padrão `'MONTH'`), `programFilter: number | null` (padrão `null`), ações `setPeriod`, `setProgramFilter`; sem persistência (estado inicial sempre o padrão); independente do `historyStore` da 009; não importa repositórios
- [X] T007 [P] Criar (se ainda não existirem; senão só conferir) `src/constants/theme.ts` com os tokens de `docs/design-telas.md` §2 e, em `src/components/common/`, `Button.tsx`, `EmptyState.tsx` e `StatCard.tsx` conforme §3 (`StatCard`: número em `display`, rótulo em `label`, sem gradiente, leitura de acessibilidade "Treinos no período: 17"), só com tokens; escrever `tests/ui/common/StatCard.test.tsx` (RNTL) para o `StatCard`
- [X] T008 Criar o esqueleto de `src/app/(tabs)/statistics.tsx` (aba "Estatísticas", título "ESTATÍSTICAS", estados de carregamento e erro sem dados; o conteúdo entra na US1)

**Checkpoint**: T004–T006 passam; `npm run check` verde; a aba abre sem erro.

---

## Phase 3: User Story 1 — Frequência por período (P1) 🎯 MVP — BL-080, BL-081, BL-082, BL-083, BL-084, BL-105 · RF-17

**Goal**: ver quantos treinos foram feitos na semana, mês, trimestre, semestre e ano em curso, só com sessões finalizadas.
**Independent Test**: com sessões conhecidas, conferir a contagem em cada período (quickstart, itens 1–3).

### Tests

- [X] T009 [P] [US1] Escrever `tests/unit/domain/statistics/periodRange.test.ts` (BL-105): para `today` conhecidos, `periodRange` devolve o período em curso: **Semana** segunda–domingo (hoje numa segunda, numa quarta e num domingo); **Mês** dia 1 ao último dia (fevereiro bissexto e não bissexto, mês de 30 e de 31 dias); **Trimestre** jan–mar, abr–jun, jul–set, out–dez; **Semestre** jan–jun e jul–dez; **Ano** 1º/jan a 31/dez; virada de mês e de ano (31/12 e 01/01); rótulos ("SETEMBRO 2026", "SEMANA 14–20 SET", "SEMANA 28 SET–04 OUT" quando cruza o mês, "3º TRIMESTRE 2026", "2º SEMESTRE 2026", "2026")
- [X] T010 [P] [US1] Escrever `tests/unit/domain/statistics/computeStats.test.ts` (parte da contagem, BL-105): `computeStats(dates, range, today)` conta só as datas dentro de `[start, min(end, today)]`; dois treinos no mesmo dia contam como dois; datas fora do período não contam; sem datas → `count = 0`; a data de hoje conta; `weeklyAverage` e `averageIntervalDays` são `null` até a US2
- [X] T011 [P] [US1] Escrever `tests/integration/application/getStatistics.test.ts` (`createTestDb()` + seed + `Clock` fixo + fixture de sessões), casos da US1: cada período devolve a contagem correta do conjunto de referência; sessão em andamento não entra e sessão descartada não existe; sessão finalizada com 0 exercícios marcados conta (clarificação 4); editar marcações de uma sessão finalizada (repositório da 002) não altera a contagem; virada de mês (último dia às `23:30−03:00`) e de ano; `hasAnySession` verdadeiro/falso (programa sem nenhuma sessão finalizada → falso); nenhuma escrita (snapshot de `workout_session*`, `program_sequence_state` e `app_settings` idêntico); `GetStatistics` responde em menos de 100 ms para cada período, com e sem filtro, sobre o SQLite em memória (medição do SC-002)
- [X] T012 [P] [US1] Escrever `tests/ui/statistics/statistics.test.tsx` (RNTL, casos de uso e router simulados), casos da US1: ao abrir mostra o período "Mês" com o `PeriodSelector` (`[Semana][Mês][Trim.][Sem.][Ano]`, `accessibilityRole="tab"`, selecionado marcado além da cor, `accessibilityLabel` com o nome completo de cada período), o `PeriodHeader` ("SETEMBRO 2026") e o `StatCard` "TREINOS NO PERÍODO"; trocar de período chama `GetStatistics` com o período novo e atualiza o número (a medição do SC-002 é do T011); **não há** setas `‹ ›` de navegação, distribuição por dia nem calendário; período sem treinos (`hasAnySession = true`) mostra 0 e "Nenhum treino neste período."; sem nenhum treino registrado mostra "Complete seu primeiro treino para começar a acompanhar sua frequência." com **Ir para o treino** (navega para a Home); erro mostra "Não foi possível carregar as estatísticas" com **Tentar de novo**; carregando mostra esqueleto; recarrega ao ganhar o foco e ao voltar ao app (`AppState` → `active`); o período e o filtro voltam ao padrão ao remontar

### Implementation

- [X] T013 [US1] Implementar `src/domain/statistics/periodRange.ts` (`periodRange(period, today): PeriodRange` com início, fim e rótulo do período em curso, usando `dateMath`; pt-BR nos rótulos) — faz T009 passar
- [X] T014 [US1] Implementar `src/domain/statistics/computeStats.ts` (contagem: `count`, `weeksTouched` provisório 1 e `weeklyAverage`/`averageIntervalDays` = `null` até a US2; puro; só datas em `[start, min(end, today)]`) — faz T010 passar
- [X] T015 [US1] Implementar `src/application/GetStatistics.ts` conforme `contracts/use-cases.md` (`today` = data local do `clock`; `range` via `periodRange`; `listFinishedDates`; `computeStats`; `hasAnySession` derivado de `programs` (não vazio sem filtro; `programId` presente em `programs` com filtro), sem leitura nova; `programs` via `listProgramsWithFinished`; nenhuma escrita) — faz T011 passar
- [X] T016 [P] [US1] Criar `src/components/statistics/PeriodSelector.tsx` (barra `[Semana][Mês][Trim.][Sem.][Ano]`, `accessibilityRole="tab"`, rótulos visíveis curtos e `accessibilityLabel` com o nome completo "Semana", "Mês", "Trimestre", "Semestre", "Ano", alvos ≥ 48 dp) e `src/components/statistics/PeriodHeader.tsx` (só rótulo do período; sem setas), só com tokens
- [X] T017 [US1] Criar `src/hooks/useStatistics.ts` (`view`, `status`, `reload()`, período e filtro do `statisticsStore`; recarrega ao ganhar o foco e ao voltar ao primeiro plano com `AppState`, recalculando o período se o dia mudou; sem regra de negócio) e completar `src/app/(tabs)/statistics.tsx` (`PeriodSelector`, `PeriodHeader`, `StatCard` "TREINOS NO PERÍODO", estados vazio/sem registro/erro/carregando) — faz T012 passar

**Checkpoint**: US1 testável sozinha (não depende de US2/US3); `npm run check` verde.

---

## Phase 4: User Story 2 — Média semanal e intervalo médio (P1) — BL-085, BL-086, BL-105 · RF-17

**Goal**: ver a média de treinos por semana (semanas de calendário já tocadas pelo período) e o intervalo médio entre treinos.
**Independent Test**: sessões em datas fixas com médias calculadas à mão, conjunto de referência (quickstart, itens 1–2). Depende do núcleo da US1.

### Tests

- [X] T018 [P] [US2] Escrever `tests/unit/utils/formatDecimal.test.ts`: `formatDecimal(3.4)` = "3,4", `formatDecimal(2)` = "2,0", `formatDecimal(17/5)` = "3,4", `formatDecimal(3.45)` = "3,5" e `formatDecimal(3.44)` = "3,4" (meio para cima sobre a representação decimal, sem `toFixed` direto); com `{ suffix: 'dias' }` → "2,0 dias"; `null` → "—"; zero → "0,0"
- [X] T019 [P] [US2] Escrever `tests/unit/domain/statistics/weeksTouched.test.ts` (BL-105): `weeksTouched(range, today)` = `(mondayOf(min(today, end)) − mondayOf(start)) / 7 + 1`; **Semana** = 1 em qualquer dia; setembro de 2026 em 30/09 = 5 e em 19/09 = 3; mês que começa numa segunda-feira; mês em que `today` cai numa segunda; trimestre e semestre em curso; ano em 01/01 = 1; virada de ano (semana que cruza 31/12→01/01); sempre ≥ 1
- [X] T020 [P] [US2] Acrescentar a `tests/unit/domain/statistics/computeStats.test.ts` os casos de média e intervalo (BL-105, conjunto de referência calculado à mão): 8 treinos em 4 semanas tocadas → média 2; 17 treinos em 5 semanas → 3,4 (número bruto 3,4); **Semana** com 3 treinos → média 3 (divisor 1); intervalo dos dias 1, 3 e 7 → 3; dois treinos no mesmo dia → intervalo 0; com 1 ou 0 treinos → `averageIntervalDays = null`; o intervalo usa só as datas do período (não olha o treino anterior ao período); a média não arredonda internamente
- [X] T021 [P] [US2] Acrescentar a `tests/integration/application/getStatistics.test.ts` os casos da US2 sobre o conjunto de referência do SC-003: para cada período (semana, mês, trimestre, semestre e ano) `weeklyAverage` e `averageIntervalDays` batem com os valores calculados à mão no arquivo de fixture; `weeksTouched` conforme a data do relógio fixo
- [X] T022 [P] [US2] Acrescentar a `tests/ui/statistics/statistics.test.tsx` os casos da US2: além de "TREINOS NO PERÍODO" mostra "POR SEMANA" ("3,4") e "INTERVALO" ("2,0 dias"); só esses três números (nenhum volume, carga, peso corporal ou recomendação — FR-004/FR-004a); intervalo nulo mostra "—" e "precisa de ao menos 2 treinos"; período sem treinos mostra "—" nos dois cartões novos

### Implementation

- [X] T023 [P] [US2] Implementar `src/domain/statistics/weeksTouched.ts` (`weeksTouched(range, today)`; puro, usa `dateMath`) — faz T019 passar
- [X] T024 [P] [US2] Implementar `src/utils/formatDecimal.ts` (uma casa decimal com vírgula, arredondamento meio para cima por aritmética decimal segura, sufixo opcional, `null` → "—") — faz T018 passar
- [X] T025 [US2] Estender `src/domain/statistics/computeStats.ts` com `weeksTouched` real (T023), `weeklyAverage = count / weeksTouched` (bruto) e `averageIntervalDays` (média das diferenças em dias corridos entre treinos consecutivos do período via `daysBetween`; `null` com menos de 2 treinos) — faz T020 e T021 passarem
- [X] T026 [US2] Em `src/app/(tabs)/statistics.tsx` acrescentar os `StatCard` "POR SEMANA" e "INTERVALO" (com `formatDecimal` e a dica "precisa de ao menos 2 treinos") — faz T022 passar

**Checkpoint**: US1 e US2 funcionam; números idênticos ao conjunto de referência (SC-003).

---

## Phase 5: User Story 3 — Filtro por programa (P2) — BL-087, BL-105 · RF-18

**Goal**: filtrar todas as métricas por programa (Todos ou cada programa).
**Independent Test**: alternar o filtro e conferir os números (quickstart, itens 2–3). Depende do núcleo da US1.

### Tests

- [X] T027 [P] [US3] Acrescentar a `tests/integration/application/getStatistics.test.ts` os casos do filtro: `programId` de um programa usa só as sessões dele em contagem, média e intervalo; `null` ("Todos") soma tudo; programa sem sessões no período → `count = 0`; `programs` lista só programas com sessões finalizadas (inclusive inativos); `hasAnySession` respeita o filtro (programa sem nenhuma sessão → falso); a soma das contagens por programa é igual à contagem de "Todos"
- [X] T028 [P] [US3] Acrescentar a `tests/ui/statistics/statistics.test.tsx` os casos do filtro: o `FilterSelect` (spec 009) mostra "Todos ▼" e abre o `Sheet` com "Todos" e cada programa com sessões; escolher um programa recalcula os três números e "Todos" restaura; o filtro escolhido fica visível ao lado do título e é lido por leitores de tela ("Estatísticas, filtro: Treino Monstro"); programa filtrado sem treinos mostra a mensagem de vazio; ao remontar, o filtro volta a "Todos" e não altera o filtro do histórico (`historyStore` intacto); abrir e fechar o `Sheet` não altera os números

### Implementation

- [X] T029 [US3] Ligar o filtro: reutilizar o `FilterSelect` da spec 009 (`src/components/common/FilterSelect.tsx`; se ainda não existir, criá-lo conforme `docs/design-telas.md` §3) em `src/app/(tabs)/statistics.tsx`, com as opções de `StatisticsView.programs`, o `programFilter` do `statisticsStore`, o rótulo de acessibilidade do filtro escolhido e o repasse de `programId` a `useStatistics`/`GetStatistics` — faz T027 e T028 passarem

**Checkpoint**: todas as histórias independentes do ponto de vista de teste.

---

## Phase 6: Polish & cross-cutting

- [X] T030 [P] Escrever `tests/unit/statistics/purity.test.ts`: lê `src/domain/statistics/` e `src/utils/dateMath.ts` e falha se importarem `react`, `expo-*`, `better-sqlite3` ou `src/data/`, ou se usarem `toISOString`, `getTimezoneOffset` ou `Date.UTC` com hora (constituição II e X: datas só por componentes locais)
- [X] T031 [P] Atualizar `docs/design-telas.md` §7 (só período em curso, sem setas `‹ ›`; só três números, sem distribuição por dia nem calendário; média por semana por semanas de calendário já tocadas; sessão com 0 exercícios conta) e §3 (acrescentar `PeriodSelector` e `PeriodHeader`; conferir `StatCard`)
- [X] T032 [P] Atualizar `docs/telas.md` (estatísticas), `docs/arquitetura.md` (leituras `listFinishedDates` e `listProgramsWithFinished` em `SessionRepository`; a spec 009 pode reutilizar `listProgramsWithFinished`), `docs/prototipo-telas.html` se divergir, registrar que a T029 da spec 009 usa `listProgramsWithFinished` (criada na T005; a que vier primeiro a cria, e a 009 é implementada antes), e conferir `docs/backlog.md` (BL-080..087, BL-105; registrar que a navegação entre períodos e o calendário ficam como itens futuros)
- [X] T033 Auditoria de consistência visual: comparar `src/app/(tabs)/statistics.tsx`, `src/components/statistics/*` e `StatCard` com `theme.ts` e `docs/design-telas.md` §2–3 e §7 (nenhum valor literal de cor/tamanho, alvos ≥ 48 dp, aba selecionada e valores lidos por leitor de tela, sem depender só de cor) e corrigir qualquer desvio
- [ ] T034 Rodar `npm run check` (lint, tipos e testes) e os passos do `quickstart.md` (incluindo a validação manual em Android e iOS com contas à mão e a virada do dia); marcar a spec como `concluída` em `specs/INDEX.md` (pendente: validação manual em Android/iOS)

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → histórias → Polish. Na Phase 2, T003, T004, T006 e T007 são paralelizáveis; T005 depende de T003; T008 depende de T006 e T007. A fase termina verde.
- **US1** depende só da Phase 2 e entrega o núcleo (`periodRange`, contagem, `GetStatistics`, `useStatistics`, tela). **US2** e **US3** dependem do núcleo da US1 (estendem os mesmos arquivos) e são independentes entre si, mas não devem rodar em paralelo: T025 estende `computeStats.ts`, T026 e T029 editam `statistics.tsx`, e T020/T021/T022/T027/T028 acrescentam casos aos mesmos arquivos de teste.
- `computeStats.ts` devolve `weeklyAverage` e `averageIntervalDays` nulos até T025; a tela da US1 mostra só "TREINOS NO PERÍODO".
- O `FilterSelect` vem da spec 009 (T028 da 009); T029 só o cria se ela ainda não o tiver feito.
- Polish só depois das histórias desejadas; T033 depois de todas as telas.

### Parallel examples

```text
Phase 2:  T003 T004 T006 T007
US1:      T009 T010 T011 T012   → T013 T016 (T014, T015 e T017 em sequência)
US2:      T018 T019 T020 T021 T022   → T023 T024 (T025 antes de T026)
US3:      T027 T028             → T029
Polish:   T030 T031 T032
```

## Implementation Strategy

1. **MVP**: Phases 1–3 (treinos no período, por semana/mês/trimestre/semestre/ano) — já cobre o acompanhamento básico de frequência.
2. Incremental: US2 (média e intervalo, com o conjunto de referência do SC-003) → US3 (filtro por programa) → Polish (docs, pureza de datas e auditoria visual).
3. Um item só está concluído com lint, tipos e testes passando.
