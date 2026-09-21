# Implementation Plan: Estratégias de Sequência

**Branch**: `main` (diretório da spec: `004-estrategias-sequencia`) | **Date**: 2026-09-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-estrategias-sequencia/spec.md`
**Backlog**: BL-030, BL-031, BL-032, BL-034, BL-035, BL-100, BL-101
**Requisitos de produto**: RF-01, RF-11, RF-12, RF-13, RF-14, RF-29
**Depende de**: 002 (tipos e repositórios `ScheduleRepository`, `SequenceStateRepository`, `ProgramRepository`, `SettingsRepository`, utilitário de data local)

## Summary

Implementar em `domain/sequence/` a interface `SequenceStrategy`, as estratégias `ContinuousSequenceStrategy` e
`WeeklyScheduleSequenceStrategy` e o `NextWorkoutResolver`, todos puros: recebem um `SequenceContext` já carregado e
devolvem um `NextWorkoutResult` (treino, ou ausência com motivo). Na `application/`, `GetNextWorkout` carrega o contexto
pelos repositórios e `ResetSequence` reinicia a posição (só contínua). Avançar a posição ao finalizar é decisão pura
(`advancePosition`), usada pelo `FinishWorkout` da spec 007. Sem UI. Decisões em [research.md](research.md); modelo em
[data-model.md](data-model.md); contratos em [contracts/sequence.md](contracts/sequence.md).

## Technical Context

**Language/Version**: TypeScript strict (projeto da 001)

**Primary Dependencies**: nenhuma nova

**Storage**: nenhuma migration nova; usa `program_sequence_state` e `weekly_schedule` da 002

**Testing**: Jest; unitários de domínio (sem banco) e integração dos casos de uso com `better-sqlite3`

**Target Platform**: Android e iOS (código compartilhado)

**Project Type**: mobile-app (projeto único)

**Performance Goals**: resolução em memória, sem I/O no domínio; carga do contexto em < 100 ms

**Constraints**: domínio sem importar React/SQLite; dia da semana pela data local; sem lógica por nome de programa

**Scale/Scope**: 2 estratégias, 1 resolvedor, 2 casos de uso, dezenas de casos de teste

## Constitution Check

| Princípio | Avaliação |
|-----------|-----------|
| I. Offline-first | ✅ Só SQLite local; sem migration nova |
| II. Domínio puro e camadas | ✅ Estratégias/resolvedor puros em `domain/sequence`; carga de dados em `application/` |
| III. TypeScript estrito | ✅ União discriminada, sem `any` |
| IV. Registro livre | ✅ Resolvedor ignora sessão em andamento; não cria sessão |
| V. Histórico preservado | ✅ Reiniciar altera só a posição; nada apaga sessão |
| VI. Programa e sequência independentes | ✅ Estratégia escolhida por `SequenceType` via registro; nenhuma regra por nome de programa; nova estratégia = novo item no registro (SC-003) |
| VII. Prescrição como dado | ✅ Não se aplica |
| VIII. Sem recomendações | ✅ Texto do dia opcional vem de `weekly_schedule.note`, exibido como está |
| IX. Estatísticas | ✅ Não se aplica |
| X. Transações e datas locais | ✅ Dia da semana derivado de data local (`localDateOf`); avanço da posição fica na transação de finalização (007) |
| XI. Testes por camada | ✅ Unitários (BL-100/101) + integração dos casos de uso |
| XII. Simplicidade | ✅ Sem dependência nova; estratégias como objetos simples |

Sem violações ⇒ Complexity Tracking vazio. Reavaliação pós-design: **sem mudanças, continua passando**.

## Project Structure

### Documentation (this feature)

```text
specs/004-estrategias-sequencia/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── sequence.md
└── tasks.md             # /speckit-tasks (não criado aqui)
```

### Source Code (repository root)

```text
src/
├── domain/sequence/
│   ├── types.ts                    # SequenceContext, NextWorkoutResult, WorkoutRef
│   ├── SequenceStrategy.ts         # interface
│   ├── strategies/
│   │   ├── ContinuousSequenceStrategy.ts
│   │   └── WeeklyScheduleSequenceStrategy.ts
│   └── services/
│       ├── NextWorkoutResolver.ts  # registro SequenceType → estratégia
│       └── advancePosition.ts      # próxima posição ativa após finalizar (última → primeira)
├── application/
│   ├── composition.ts              # createSequenceResolver(): registra as estratégias
│   ├── GetNextWorkout.ts           # carrega contexto (settings, treinos, estado, agenda, data local) e resolve
│   ├── ResetSequence.ts            # só contínua; upsert posição 1
│   └── index.ts                    # exports públicos
├── utils/
│   └── weekday.ts                  # weekdayOfLocalDate('YYYY-MM-DD') → 1=seg..7=dom
tests/
├── unit/domain/sequence/           # continuous, weekly, resolver, advancePosition, builders.ts, purity
├── unit/utils/                     # weekday
└── integration/application/        # getNextWorkout, resetSequence
```

**Structure Decision**: mesma raiz Expo; regras em `domain/`, orquestração em `application/`, conforme
`docs/arquitetura.md` e constituição II.

## Complexity Tracking

Sem violações.
