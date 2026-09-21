# Implementation Plan: Execução do Treino

**Branch**: `main` (diretório da spec: `007-execucao-treino`) | **Date**: 2026-09-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-execucao-treino/spec.md`
**Backlog**: BL-060, BL-061, BL-062, BL-063, BL-064, BL-065, BL-066, BL-067, BL-104, BL-121
**Requisitos de produto**: RF-04, RF-05, RF-06, RF-07, RF-08, RF-09, RF-10, RF-11, RF-27, RF-28
**Depende de**: 002 (`SessionRepository`, `SequenceStateRepository`, transações), 003 (seed: prescrição, técnica, `warmup_note`), 004 (`advancePosition`), 006 (`StartWorkout`, rota de entrada `/workout`, descarte na Home)

## Summary

Entregar a tela de treino (`/workout`) e o resumo de finalização (`/workout/summary`). O usuário marca e desmarca
exercícios em qualquer ordem, registra peso (vírgula ou ponto), vê a última carga do mesmo programa, a prescrição como na
ficha e a nota de aquecimento fora das contagens, e finaliza mesmo incompleto. As regras ficam em `application/`
(`GetWorkoutSession`, `SetExerciseCompleted`, `SetExerciseWeight`, `FinishWorkout`) e em funções puras do domínio
(`parseWeightInput`, `computeProgress`). `FinishWorkout` é **transacional**: pesos pendentes → sessão
finalizada → posição da contínua (seguinte à do treino finalizado, via `advancePosition` da 004) → resumo. Cada alteração
persiste na hora, então a sessão é recuperável. Decisões em [research.md](research.md); modelo em
[data-model.md](data-model.md); contratos em [contracts/](contracts/).

## Technical Context

**Language/Version**: TypeScript strict (projeto da 001)

**Primary Dependencies**: nenhuma nova (Expo Router, Zustand, RNTL; ícones já definidos pelo design)

**Storage**: nenhuma migration nova; usa `workout_session`, `workout_session_exercise`, `program_sequence_state`, `app_settings`, `workout`, `workout_exercise`, `exercise`

**Testing**: Jest; unitários das funções puras; integração dos casos de uso com `better-sqlite3` (BL-104: criar, finalizar, recuperar, editar; falha no meio da finalização); RNTL para a tela e o resumo

**Target Platform**: Android e iOS (código compartilhado)

**Project Type**: mobile-app (projeto único)

**Performance Goals**: marcar/desmarcar e salvar peso em < 100 ms percebidos; abrir a tela de um treino de 12 exercícios em < 300 ms

**Constraints**: offline; sem regra de negócio nos componentes; sem recomendar carga nem registrar repetições (constituição IV e VIII); prescrição exibida como texto, nunca interpretada (VII); datas locais (X)

**Scale/Scope**: 2 telas, 4 casos de uso, 2 funções puras, 1 store, ~8 componentes

## Constitution Check

| Princípio | Avaliação |
|-----------|-----------|
| I. Offline-first | ✅ SQLite é a fonte de verdade; `workoutStore` guarda só rascunhos de campo e estado de UI dos cartões |
| II. Domínio puro e camadas | ✅ `parseWeightInput`, `computeProgress` puros em `domain/workout`; orquestração em `application/`; telas sem regra |
| III. TypeScript estrito | ✅ Resultados como uniões discriminadas (`WeightParse`), sem `any` |
| IV. Registro livre e finalização flexível | ✅ Marcação em qualquer ordem; finalizar com 0 ou mais; só realizado/não realizado e carga; sessão persistida a cada alteração |
| V. Histórico preservado | ✅ Finalização não reescreve sessões antigas; "última carga" derivada por consulta (`getLastWeight`), sem coluna |
| VI. Programa e sequência independentes | ✅ Avanço só quando o tipo é `CONTINUOUS` (lido ao finalizar); nenhuma regra por nome de programa |
| VII. Prescrição como dado | ✅ `prescription`, `technique`, `notes` exibidos como texto; bi-set = dois cartões independentes com chip e observação exibidos como estão; nenhum vínculo é derivado da técnica, sem entidade "par" |
| VIII. Sem recomendações | ✅ "Última carga" e "Usar X kg" são referência e atalho de digitação; nunca preenchem sozinhos nem sugerem aumento |
| IX. Estatísticas | ✅ Não se aplica (resumo mostra só a contagem e a duração da própria sessão) |
| X. Transações e datas locais | ✅ `FinishWorkout` em uma transação (pesos → finalizada → posição); datas via `nowLocalIso` |
| XI. Testes por camada | ✅ Unitários, integração (BL-104) e RNTL (marcar, peso, finalizar, recuperar) |
| XII. Simplicidade | ✅ Sem dependência nova; sem cronômetro (spec 011) nem ajuda (spec 008) |

Sem violações ⇒ Complexity Tracking vazio. Reavaliação pós-design: **sem mudanças, continua passando**.

## Project Structure

### Documentation (this feature)

```text
specs/007-execucao-treino/
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
├── domain/workout/
│   ├── weight.ts                   # parseWeightInput(text) → WeightParse; formatWeight(n) → "60" | "62,5"
│   ├── progress.ts                 # computeProgress(items) → { done, total }
│   └── types.ts                    # WorkoutScreenItem, WorkoutScreenView, FinishSummary
├── application/
│   ├── GetWorkoutSession.ts        # sessão em andamento + treino + itens + última carga + progresso
│   ├── SetExerciseCompleted.ts     # marca/desmarca (com peso pendente opcional, atômico)
│   ├── SetExerciseWeight.ts        # valida e grava o peso (nulo ou ≥ 0)
│   ├── FinishWorkout.ts            # transação: pesos pendentes → finalizada → posição (contínua) → resumo
│   └── GetFinishSummary.ts         # resumo de uma sessão finalizada (contagem, duração)
├── utils/
│   └── duration.ts                 # formatDuration(startedAtIso, finishedAtIso) → "52 min"
├── store/
│   └── workoutStore.ts             # rascunhos de peso, cartões expandidos, erro por cartão, status
├── hooks/
│   └── useWorkoutSession.ts        # carrega, marca, grava peso, finaliza; descarrega pendentes
├── app/
│   └── workout/
│       ├── index.tsx               # tela de treino (empilhada, sem abas)
│       └── summary.tsx             # resumo pós-finalização
└── components/
    ├── common/                     # Button, Card, Sheet, ConfirmDialog, EmptyState, ProgramBadge (já existentes)
    │                               # + SegmentedProgress, TechniqueChip, PrescriptionBlock, WeightInput (design §3)
    └── workout/
        ├── ExerciseCard.tsx        # cartão expandido/colapsado (bi-set = dois cartões independentes)
        ├── WarmupNote.tsx          # nota de aquecimento (texto, sem checkbox)
        ├── FinishBar.tsx           # barra fixa inferior FINALIZAR TREINO
        └── FinishSummaryView.tsx   # resumo: "N de M", duração, Voltar ao início
tests/
├── unit/domain/workout/            # weight, progress
├── unit/utils/                     # duration
├── integration/application/        # getWorkoutSession, setExerciseCompleted, setExerciseWeight, finishWorkout, sessionRecovery
└── ui/workout/                     # workout.test.tsx, summary.test.tsx (RNTL)
```

**Structure Decision**: mesma raiz Expo; rota `workout` empilhada sem abas conforme `docs/design-telas.md` §9. Regras em
`domain/` e `application/`; `?`/`ⓘ` e cronômetro ficam para as specs 008 e 011 (a tela só reserva o espaço).

## Direção visual (continuidade)

Direção existente: **"Placar de academia"** (`docs/design-telas.md` §1–3, §5). Esta spec reutiliza os tokens de
`src/constants/theme.ts` e os componentes comuns (`Button`, `Card`, `Sheet`, `ConfirmDialog`, `EmptyState`, `ProgramBadge`),
sem nova direção.

- **Componentes do design criados aqui** (especificados em §3, ainda não existem no código): `SegmentedProgress`,
  `TechniqueChip`, `PrescriptionBlock`, `WeightInput` (teclado decimal, sufixo "kg", `−`/`+` de 2,5 kg como ajuda de
  digitação), com estados e acessibilidade do design (progresso sempre acompanha texto "N / M realizados").
- **Extensões deliberadas e visíveis**: `ExerciseCard`, `WarmupNote`, `FinishBar` e `FinishSummaryView` (composições da
  tela, previstas em §5 mas não listadas em §3). Adicioná-las a §3.
- **Pontos reservados**: `ExerciseCard` e o cabeçalho aceitam `onInfo` (ⓘ) e `onHelp` (?) opcionais; sem os handlers da
  spec 008, os ícones não são renderizados (sem botões mortos), mas o layout comporta o espaço.
- **Estados cobertos**: sem exercícios (`EmptyState`, finalizar continua), erro ao salvar (aviso inline no cartão + "Tentar
  de novo", valor preservado), carga inválida ("Informe um valor maior ou igual a 0"), teclado aberto (a barra FINALIZAR se
  esconde), nome longo (2 linhas), sessão inexistente (volta à Home).
- **Auditoria de consistência**: tarefa final compara as telas com tokens e componentes.

## Divergências de documentação a corrigir no mesmo trabalho

`docs/design-telas.md` §5.1 (linha "Próximo" no resumo: removida por decisão) e §5 (ação de descartar só na Home) e
`docs/telas.md` (tela de treino e finalização) devem refletir a spec. Tarefa dedicada em `tasks.md`.

## Complexity Tracking

Sem violações.
