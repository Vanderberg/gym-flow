# Implementation Plan: Estatísticas de Frequência

**Branch**: `main` (diretório da spec: `010-estatisticas-frequencia`) | **Date**: 2026-09-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/010-estatisticas-frequencia/spec.md`
**Backlog**: BL-080, BL-081, BL-082, BL-083, BL-084, BL-085, BL-086, BL-087, BL-105
**Requisitos de produto**: RF-17, RF-18
**Depende de**: 002 (`SessionRepository`, índice `ix_workout_session_program_finished`), 003 (seed), 004 (`weekdayOfLocalDate`), 009 (`FilterSelect` do design §3)

## Summary

Entregar a aba **Estatísticas**: para o período em curso da granularidade escolhida (semana, mês, trimestre, semestre,
ano) e o filtro por programa (Todos ou cada programa), mostrar **três números**: treinos no período, média por semana e
intervalo médio entre treinos. O cálculo fica num **serviço centralizado** (`application/GetStatistics` sobre a função pura
`computeStats` do domínio), lendo apenas as datas locais de finalização das sessões finalizadas (`workout_session`), sem
tabelas próprias. Média = treinos ÷ semanas de calendário (segunda a domingo) que o período já tocou até hoje; intervalo =
média das diferenças em dias corridos entre treinos consecutivos do período. Sem navegação entre períodos, sem distribuição
por dia nem calendário. Decisões em [research.md](research.md); modelo em [data-model.md](data-model.md); contratos em
[contracts/](contracts/).

## Technical Context

**Language/Version**: TypeScript strict (projeto da 001)

**Primary Dependencies**: nenhuma nova (Expo Router, Zustand, RNTL; `AppState` do React Native para reavaliar o dia)

**Storage**: nenhuma migration nova; leitura de `workout_session` (`finished_at`, `program_id`) e de `training_program` (nomes para o filtro); nenhuma escrita

**Testing**: Jest; unitários exaustivos das funções puras (BL-105: contagem, média, intervalo, limites de período, datas de borda); integração do serviço com `better-sqlite3` sobre o conjunto de referência (SC-003); RNTL para a tela

**Target Platform**: Android e iOS (código compartilhado)

**Project Type**: mobile-app (projeto único)

**Performance Goals**: trocar período ou filtro atualiza os números em < 1 s percebido (SC-002); a consulta lê só uma coluna de data das sessões do período (milhares de linhas no máximo) em < 100 ms sobre SQLite em memória

**Constraints**: offline; só sessões finalizadas (todas contam, mesmo com 0 exercícios marcados); só frequência e cadência (constituição IX); datas locais (X); domínio puro

**Scale/Scope**: 1 tela, 1 caso de uso de leitura, 4 funções puras, 1 leitura nova de repositório, 1 store, ~4 componentes

## Constitution Check

| Princípio | Avaliação |
|-----------|-----------|
| I. Offline-first | ✅ Leitura do SQLite; `statisticsStore` guarda só período e filtro (memória) |
| II. Domínio puro e camadas | ✅ `periodRange`, `weeksTouched`, `computeStats` puros em `domain/statistics`; consulta em `data/`; serviço em `application/`; tela sem regra |
| III. TypeScript estrito | ✅ `Period` como união literal, `StatsResult` tipado; sem `any` |
| IV. Registro livre | ✅ Sessão finalizada com 0 exercícios conta; nenhuma leitura de repetições |
| V. Histórico preservado | ✅ Somente leitura; editar marcações no histórico não altera as estatísticas |
| VI. Programa e sequência independentes | ✅ Filtro por programa sem regra por nome; independente do tipo de sequência |
| VII. Prescrição como dado | ✅ Não se aplica |
| VIII. Sem recomendações | ✅ Só números; sem meta, comparação nem sugestão |
| IX. Estatísticas de frequência e cadência | ✅ Só quantidade, média por semana e intervalo médio; filtro Todos/programa; só sessões finalizadas; serviço centralizado sobre `workout_session`, sem tabelas próprias |
| X. Transações e datas locais | ✅ Datas pelo dia local de `finished_at` (prefixo `YYYY-MM-DD`), sem conversão UTC; aritmética de datas por componentes |
| XI. Testes por camada | ✅ Unitários (BL-105), integração (conjunto de referência) e RNTL (período, filtro, estados) |
| XII. Simplicidade | ✅ Sem dependência nova; sem navegação de períodos, gráficos nem calendário |

Sem violações ⇒ Complexity Tracking vazio. Reavaliação pós-design: **sem mudanças, continua passando**.

## Project Structure

### Documentation (this feature)

```text
specs/010-estatisticas-frequencia/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── use-cases.md
│   └── ui.md
└── tasks.md             # /speckit-tasks (não criado aqui)
```

### Source Code (repository root)

```text
src/
├── domain/statistics/
│   ├── types.ts                    # Period, PeriodRange, StatsResult
│   ├── periodRange.ts              # periodRange(period, today) → início, fim e rótulo do período em curso
│   ├── weeksTouched.ts             # weeksTouched(range, today) → semanas de calendário já tocadas (≥ 1)
│   └── computeStats.ts             # computeStats(dates, range, today) → { count, weeklyAverage, averageIntervalDays }
├── domain/session/
│   └── SessionRepository.ts        # (002) + listFinishedDates, listProgramsWithFinished (novas leituras)
├── data/repositories/
│   └── SqliteSessionRepository.ts  # (002) implementa as duas leituras
├── application/
│   └── GetStatistics.ts            # serviço centralizado: lê datas e devolve StatsResult + programas do filtro
├── utils/
│   ├── dateMath.ts                 # daysBetween, addDays, mondayOf, endOfMonth… por componentes (sem UTC)
│   └── formatDecimal.ts            # 1 casa decimal com vírgula ("3,4"), "—" para nulo
├── store/
│   └── statisticsStore.ts          # period (padrão "Mês") e programFilter, só memória
├── hooks/
│   └── useStatistics.ts            # carrega, recarrega ao focar e ao voltar ao app (dia mudou)
├── app/
│   └── (tabs)/statistics.tsx       # tela
└── components/
    ├── common/                     # FilterSelect (009), StatCard, Button, EmptyState (design §3)
    └── statistics/
        ├── PeriodSelector.tsx      # [Semana][Mês][Trim.][Sem.][Ano]
        └── PeriodHeader.tsx        # "SETEMBRO 2026", "SEMANA 14–20 SET", "2º TRIMESTRE 2026", …
tests/
├── unit/domain/statistics/         # periodRange, weeksTouched, computeStats (conjunto de referência)
├── unit/utils/                     # dateMath, formatDecimal
├── integration/data/               # sessionStatsQueries
├── integration/application/        # getStatistics (conjunto de referência, SC-003)
└── ui/statistics/                  # statistics.test.tsx, periodSelector.test.tsx (RNTL)
```

**Structure Decision**: mesma raiz Expo; rota `(tabs)/statistics` conforme `docs/design-telas.md` §9. O serviço lê datas
brutas e delega todo o cálculo ao domínio puro, para que BL-105 teste o cálculo sem banco.

## Direção visual (continuidade)

Direção existente: **"Placar de academia"** (`docs/design-telas.md` §1–3, §7). Esta spec reutiliza os tokens de
`src/constants/theme.ts`, o `FilterSelect` (criado na 009) e os componentes comuns (`Button`, `EmptyState`), sem nova direção.

- **Componente do design criado aqui**: `StatCard` (§3: número em `display`, rótulo em `label`, sem gradiente), ainda não
  existente no código; `PeriodSelector` e `PeriodHeader` são extensões declaradas (a barra `[Semana][Mês][Trim.][Sem.][Ano]` e o
  título do período estão em §7, mas não em §3): adicioná-los a §3 como padrões da tela.
- **Fora desta spec (previsto no design §7)**: setas `‹ ›`, distribuição por dia (SEG…DOM) e calendário de pontos. O design
  deve ser corrigido (tarefa dedicada).
- **Estados cobertos**: carregando (esqueleto dos 3 cartões), erro ("Não foi possível carregar as estatísticas" + "Tentar de
  novo"), período sem treinos (zero + "Nenhum treino neste período."), sem nenhum treino registrado ("Complete seu primeiro
  treino para começar a acompanhar sua frequência." + **Ir para o treino**), intervalo com menos de 2 treinos ("—" +
  "precisa de ao menos 2 treinos"); o filtro escolhido fica visível ao lado do título e é lido por leitores de tela.
- **Auditoria de consistência**: tarefa final compara a tela com tokens e componentes.

## Divergências de documentação a corrigir no mesmo trabalho

`docs/design-telas.md` §7 e `docs/telas.md` (setas de navegação, distribuição por dia e calendário fora desta spec; média
por semana por semanas de calendário já tocadas; sessão com 0 exercícios conta) e `docs/arquitetura.md` (leituras novas em
`SessionRepository`). Tarefa dedicada em `tasks.md`.

## Complexity Tracking

Sem violações.
