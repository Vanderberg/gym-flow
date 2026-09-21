# Implementation Plan: Programas Iniciais (Seed)

**Branch**: `main` (diretório da spec: `003-programas-seed`) | **Date**: 2026-09-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-programas-seed/spec.md`
**Backlog**: BL-020, BL-021, BL-022, BL-023, BL-110 (dados), BL-120, BL-121, BL-122, BL-123 (dados), BL-124
**Depende de**: 002 (esquema, repositórios, `createRepositories`, `normalizeName`, `nowLocalIso`) e 001 (gate de banco)

## Summary

Carregar Treino Padrão (5 treinos, 28 itens) e Treino Monstro (A–D, 43 itens) como **dados tipados** em
`src/data/seed/`, executados por um `runSeed` genérico (sem `if` por nome de programa) dentro de uma transação, a
cada abertura do app, após as migrations. O seed faz upsert do conteúdo (exercícios pelo nome normalizado, treinos,
prescrições, agenda, textos), remove itens de treino que saíram do seed, cria estado de sequência e configurações
**só se ausentes** e nunca toca em sessões. Testes garantem contagens da ficha, integridade dos bi-sets,
músculos/descrição em todo exercício e idempotência. Sem tabelas novas. Decisões em [research.md](research.md);
formato dos dados em [contracts/seed-data.md](contracts/seed-data.md).

## Technical Context

**Language/Version**: TypeScript strict (mesmo projeto)

**Primary Dependencies**: nenhuma nova

**Storage**: SQLite via repositórios da spec 002; sem migration nova

**Testing**: Jest — unitários sobre os dados puros (contagens, bi-sets, completude, conferência contra `docs/fichas-treino.md` e PRD §7) e integração com `better-sqlite3` (idempotência, preservação, atualização, rollback)

**Target Platform**: Android e iOS

**Project Type**: mobile-app (projeto único)

**Performance Goals**: seed completo em < 500 ms em teste e imperceptível na abertura (não ameaça o SC-001 da 001: Home ≤ 3 s)

**Constraints**: offline; idempotente; transacional; sem regra por nome de programa; textos pt-BR

**Scale/Scope**: 2 programas, 9 treinos, 59 exercícios distintos (43 Monstro + 22 Padrão − 6 compartilhados), 71 itens de treino, 7 linhas de agenda

## Constitution Check

*GATE: passa antes da pesquisa; reavaliado após o design.*

| Princípio | Avaliação |
|-----------|-----------|
| I. Offline-first, seed idempotente | ✅ Seed local, idempotente, transacional |
| II. Domínio puro e camadas | ✅ Dados e `runSeed` em `data/seed/`; usa repositórios da 002; nada de React/UI |
| III. TypeScript estrito | ✅ Dados tipados por `SeedProgram`/`SeedExercise` |
| IV. Registro livre | ✅ N/A; seed não cria sessões |
| V. Histórico preservado | ✅ Nunca altera sessões; exercícios que saem do seed são desativados, não excluídos |
| VI. Programa e sequência independentes | ✅ `runSeed` é genérico; programa/configuração padrão vêm de um campo dos dados (`isDefault`), não do nome |
| VII. Prescrição como dado | ✅ Prescrição/técnica/notas gravadas como texto; bi-set = 2 itens distintos |
| VIII. Sem recomendações | ✅ Textos da ficha exibidos como estão; descrições de exercício apenas informativas, sem carga/técnica recomendada |
| IX. Estatísticas | ✅ N/A |
| X. Integridade transacional e datas locais | ✅ Uma transação; timestamps via `nowLocalIso` |
| XI. Testes por camada | ✅ Unitários dos dados + integração do seed |
| XII. Simplicidade | ✅ Sem dependência nova; sem tabela de versão de seed |

Sem violações ⇒ Complexity Tracking vazio. Reavaliação pós-design: **sem mudanças, continua passando**.

## Project Structure

### Documentation (this feature)

```text
specs/003-programas-seed/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── seed-data.md
└── tasks.md             # /speckit-tasks (não criado aqui)
```

### Source Code (repository root)

```text
src/
├── constants/
│   └── techniques.ts            # 'BI-SET' | 'DROP-SET' | 'PROGRESSÃO DE CARGA' | 'FALHA' (compartilhado com a spec 008)
└── data/
    ├── bootstrap.ts             # bootstrapDatabase(db): runMigrations → runSeed (usado pelo DatabaseGate)
    └── seed/
        ├── types.ts             # SeedProgram, SeedWorkout, SeedWorkoutExercise, SeedExercise, SeedScheduleDay
        ├── exercisesShared.ts   # 6 exercícios usados pelos dois programas
        ├── exercisesPadrao.ts   # 16 exclusivos do Padrão
        ├── exercisesMonstro.ts  # 37 exclusivos do Monstro
        ├── exercises.ts         # EXERCISE_CATALOG = shared + padrão + monstro (59)
        ├── sync.ts              # limpeza: itens fora do seed removidos; treinos/exercícios fora do seed desativados
        ├── validateSeedData.ts  # validação do dataset antes de gravar
        ├── programs/
        │   ├── padrao.ts        # Treino Padrão (Dia 1–5)
        │   └── monstro.ts       # Treino Monstro (A–D) + agenda + sugestão de cardio
        ├── warmup.ts            # WARMUP_NOTE
        ├── seedData.ts          # SEED_DATA = { exercises, programs }
        └── runSeed.ts           # runSeed(db, { data?, clock? })
tests/
├── unit/seed/                   # seedData.test.ts, fichaConformity.test.ts
└── integration/seed/            # runSeed.test.ts
```

**Structure Decision**: dados e executor na camada `data/` (constituição II/arquitetura), consumindo as portas da 002.
`bootstrap.ts` ajusta o `DatabaseGate` da 001 para rodar migrations + seed antes de montar as rotas.

## Complexity Tracking

Sem violações.
