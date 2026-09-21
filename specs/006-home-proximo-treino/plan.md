# Implementation Plan: Home e Próximo Treino

**Branch**: `main` (diretório da spec: `006-home-proximo-treino`) | **Date**: 2026-09-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-home-proximo-treino/spec.md`
**Backlog**: BL-050, BL-051, BL-052, BL-053, BL-122, BL-123
**Requisitos de produto**: RF-01, RF-04, RF-29, RF-30
**Depende de**: 002 (repositórios), 003 (seed: agenda, `warmup_note`, `home_suggestion`), 004 (`GetNextWorkout`), 005 (configurações, `discardSession`)

## Summary

Entregar a aba **Treino** (Home): programa ativo, tipo de sequência, SequenceRail (contínua) ou WeekStrip (semanal), cartão
do próximo treino e os estados de descanso, dia opcional, sem agenda, "Concluído hoje" e treino em andamento. As regras de
composição ficam em `application/GetHomeState` e na função pura `buildHomeView` do domínio; `StartWorkout` cria a sessão
só por ação explícita do usuário e `DiscardInProgressSession` descarta a sessão em andamento. A UI apenas renderiza a
`HomeView` e chama hooks. Decisões em [research.md](research.md); modelo em [data-model.md](data-model.md); contratos em
[contracts/](contracts/).

## Technical Context

**Language/Version**: TypeScript strict (projeto da 001)

**Primary Dependencies**: nenhuma nova (Expo Router, Zustand, RNTL; `AppState` do React Native para reavaliar o dia)

**Storage**: nenhuma migration nova; leitura de `app_settings`, `training_program`, `workout`, `weekly_schedule`, `program_sequence_state`, `workout_session*`; escrita só via `SessionRepository.startSession` e `discardSession`

**Testing**: Jest; unitários de `buildHomeView`, `buildSequenceRail`, `buildWeekStrip`; integração de `GetHomeState`, `StartWorkout` e `DiscardInProgressSession` com `better-sqlite3`; RNTL para a Home

**Target Platform**: Android e iOS (código compartilhado)

**Project Type**: mobile-app (projeto único)

**Performance Goals**: `GetHomeState` em < 150 ms sobre o seed; Home sem salto de layout no carregamento (esqueleto com a mesma altura)

**Constraints**: offline; sem regra de negócio nos componentes; nenhuma sessão criada sem toque do usuário (SC-003); sem recomendações (constituição VIII); datas locais

**Scale/Scope**: 1 tela, 3 casos de uso, 3 funções puras de domínio, 1 hook, 1 store, ~6 componentes

## Constitution Check

| Princípio | Avaliação |
|-----------|-----------|
| I. Offline-first | ✅ SQLite é a fonte de verdade; `homeStore` guarda só a `HomeView` carregada e é recarregado |
| II. Domínio puro e camadas | ✅ `buildHomeView`, `buildSequenceRail`, `buildWeekStrip` puras em `domain/home`; carga e composição em `application/`; tela sem regra |
| III. TypeScript estrito | ✅ `HomeView` como união discriminada; sem `any` |
| IV. Registro livre e sessão persistida | ✅ Sessão em andamento detectada ao abrir; descartar não altera sequência nem estatísticas; nada é criado automaticamente |
| V. Histórico preservado | ✅ Só leitura de sessões finalizadas; a única escrita destrutiva é o descarte confirmado da sessão em andamento |
| VI. Programa e sequência independentes | ✅ Resolução via `GetNextWorkout` (004); nenhum `if` por nome de programa; "Ver treinos do programa" vale para qualquer programa |
| VII. Prescrição como dado | ✅ Home mostra só nome e contagem de exercícios; prescrição não é interpretada |
| VIII. Sem recomendações | ✅ Texto do dia opcional e sugestão vêm de `weekly_schedule.note` e `home_suggestion`, exibidos como estão; nenhuma sugestão gerada pelo app |
| IX. Estatísticas | ✅ ESTE MÊS e ÚLTIMO ficam fora; "Concluído hoje" é marca de sessão, não estatística |
| X. Transações e datas locais | ✅ `startSession` é transacional (002); "hoje" e a semana do WeekStrip usam data local; reavaliação ao voltar ao app |
| XI. Testes por camada | ✅ Unitários, integração (criar/descartar/recuperar) e RNTL (iniciar, continuar, descartar, estados) |
| XII. Simplicidade | ✅ Sem dependência nova; sem cartões de histórico/estatística |

Sem violações ⇒ Complexity Tracking vazio. Reavaliação pós-design: **sem mudanças, continua passando**.

## Project Structure

### Documentation (this feature)

```text
specs/006-home-proximo-treino/
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
├── domain/home/
│   ├── types.ts                    # HomeView, SequenceRailView, WeekStripView
│   ├── buildHomeView.ts            # puro: precedência dos estados
│   ├── buildSequenceRail.ts        # puro: passos, atual e concluídos no ciclo
│   └── buildWeekStrip.ts           # puro: 7 dias, hoje, dias com sessão finalizada
├── application/
│   ├── GetHomeState.ts             # carrega dados, chama GetNextWorkout (004) e monta HomeView
│   ├── StartWorkout.ts             # cria sessão (programa ativo + treino); Conflict se já há sessão
│   └── DiscardInProgressSession.ts # descarta a sessão em andamento (reutilizável pela 005)
├── utils/
│   └── weekdayLabel.ts             # 1..7 → "SEGUNDA-FEIRA"/"SEG" (pt-BR)
├── store/
│   └── homeStore.ts                # HomeView + status (loading/ready/error); load()/reload()
├── hooks/
│   └── useHome.ts                  # estado, start(workoutId), discard(), reload; reavalia ao voltar ao app (AppState)
├── app/
│   └── (tabs)/index.tsx            # Home
└── components/
    ├── common/                     # ProgramBadge, SequenceRail, WeekStrip (design §3), + Button, Card, Sheet, ConfirmDialog, EmptyState
    └── home/
        ├── NextWorkoutCard.tsx     # cartão principal (próximo/descanso/opcional/sem agenda/em andamento/concluído hoje)
        ├── SuggestionCard.tsx      # "SUGESTÃO DA FICHA" (só texto)
        ├── ProgramWorkoutsSheet.tsx  # lista para "Ver treinos do programa"
        └── HomeSkeleton.tsx        # esqueleto do cartão principal
tests/
├── unit/domain/home/               # buildHomeView, buildSequenceRail, buildWeekStrip
├── unit/utils/                     # weekdayLabel
├── integration/application/        # getHomeState, startWorkout, discardInProgressSession
└── ui/home/                        # home.test.tsx (RNTL)
```

**Structure Decision**: mesma raiz Expo; rota `(tabs)/index` conforme `docs/design-telas.md` §9. Regras em `domain/` e
`application/`, apresentação sem regra de negócio.

## Direção visual (continuidade)

Direção existente: **"Placar de academia"** (`docs/design-telas.md` §1–3). Esta spec **reutiliza** os tokens de
`src/constants/theme.ts` e os componentes de `src/components/common/`; não define nova direção.

- **Componentes do design §3 criados aqui** (ainda não existem no código): `ProgramBadge`, `SequenceRail`, `WeekStrip`.
  Nascem em `components/common/` exatamente como especificados (estados e acessibilidade: dia atual e dias feitos nunca
  dependem só de cor). `Button`, `Card`, `Sheet`, `ConfirmDialog`, `EmptyState` vêm da 005 (ou são criados por quem
  vier primeiro, sem variações paralelas).
- **Extensões deliberadas e visíveis**: `NextWorkoutCard`, `SuggestionCard`, `ProgramWorkoutsSheet` e `HomeSkeleton`
  (composições de tela previstas em `docs/design-telas.md` §4, não listadas em §3). Adicioná-las a §3 como padrões da Home.
- **Estados cobertos**: carregando (esqueleto de mesma altura), erro ("Tentar de novo"), primeiro uso, descanso,
  opcional, sem agenda, sem treinos, concluído hoje, em andamento.
- **Auditoria de consistência**: tarefa final compara a Home com tokens e componentes.

## Divergências de documentação a corrigir no mesmo trabalho

`docs/design-telas.md` §4 (cartões ÚLTIMO/ESTE MÊS e botão "Reiniciar sequência" na Home; botão "Configurar agenda"
no estado sem agenda; proposta de "Ver treinos do programa" a confirmar) e `docs/telas.md` (§2) devem refletir as
decisões clarificadas da spec. Tarefa dedicada em `tasks.md`.

## Complexity Tracking

Sem violações.
