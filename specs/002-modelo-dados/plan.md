# Implementation Plan: Modelo de Dados e Repositórios

**Branch**: `main` (diretório da spec: `002-modelo-dados`) | **Date**: 2026-09-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-modelo-dados/spec.md`
**Backlog**: BL-012, BL-013, BL-014, BL-015 (dados de BL-110 e BL-121..123 como colunas)
**Depende de**: 001 (interface `Database`, runner de migrations, helper de testes com `better-sqlite3`)

## Summary

Criar o esquema SQLite completo do MVP em uma migration (`0002`), os tipos de domínio e as interfaces de
repositório (portas em `domain/`), as implementações em `data/repositories/` e um utilitário de data local
(ISO com deslocamento de fuso). As regras de integridade das clarificações (nome de exercício único sem
diferenciar caixa nem acentuação em caixa alta, desativar em vez de excluir, uma sessão em andamento, linhas de exercício criadas ao iniciar
a sessão, peso ≥ 0) ficam garantidas no schema e cobertas por testes de integração. Sem UI e sem conteúdo real
(seed é a spec 003). Decisões em [research.md](research.md); esquema final em [data-model.md](data-model.md).

## Technical Context

**Language/Version**: TypeScript strict (mesmo projeto da 001)

**Primary Dependencies**: nenhuma nova (usa `expo-sqlite` via interface `Database` da 001)

**Storage**: SQLite; migration `0002-schema` aplicada pelo runner da 001

**Testing**: Jest; testes de integração em `tests/integration/` com o adaptador `better-sqlite3` da 001; testes unitários do utilitário de datas

**Target Platform**: Android e iOS (código compartilhado; sem código de plataforma)

**Project Type**: mobile-app (projeto único)

**Performance Goals**: gravar e recuperar sessão de 15 exercícios em < 1 s (SC-002) — na prática, dezenas de ms

**Constraints**: offline; FKs sempre ativas (`PRAGMA foreign_keys = ON` por conexão); domínio sem importar SQLite/React

**Scale/Scope**: 9 tabelas, ~6 repositórios, dezenas de programas/exercícios e milhares de sessões no máximo

## Constitution Check

*GATE: passa antes da pesquisa; reavaliado após o design.*

| Princípio | Avaliação |
|-----------|-----------|
| I. Offline-first, migrations versionadas | ✅ Nova migration `0002`; seed fica na 003 |
| II. Domínio puro e camadas | ✅ Interfaces de repositório em `domain/`, implementações em `data/repositories/`; domínio depende só das interfaces |
| III. TypeScript estrito | ✅ Tipos explícitos, sem `any` |
| IV. Registro livre / finalização flexível | ✅ Linhas criadas ao iniciar; finalizar com 0 marcados suportado; descartar remove a sessão em andamento |
| V. Histórico preservado | ✅ FKs `RESTRICT` + desativar; "última carga" derivada por consulta, sem coluna |
| VI. Programa e sequência independentes | ✅ Estado de sequência por programa (UNIQUE); agenda por programa; nada por nome de programa |
| VII. Prescrição como dado | ✅ `prescription/technique/notes` texto em `workout_exercise`; sem min/max de repetições |
| VIII. Sem recomendações | ✅ Só armazena; campos de conteúdo da ficha como texto |
| IX. Estatísticas | ✅ Sem tabelas de estatística; `completed`/datas suportam a consulta |
| X. Integridade transacional e datas locais | ✅ CHECKs, UNIQUEs, índice parcial, `foreign_keys=ON`; criação de sessão transacional; datas ISO locais |
| XI. Testes por camada | ✅ Testes de integração de schema e repositórios; unitários de datas |
| XII. Simplicidade | ✅ Sem ORM nem dependência nova |

Sem violações ⇒ Complexity Tracking vazio. Reavaliação pós-design: **sem mudanças, continua passando**.

## Project Structure

### Documentation (this feature)

```text
specs/002-modelo-dados/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── repositories.md
└── tasks.md             # /speckit-tasks (não criado aqui)
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── program/        # types.ts (TrainingProgram, Workout, WorkoutExercise), ProgramRepository.ts
│   ├── exercise/       # types.ts (Exercise), ExerciseRepository.ts
│   ├── sequence/       # types.ts (WeeklyScheduleEntry, ProgramSequenceState), ScheduleRepository.ts, SequenceStateRepository.ts
│   ├── session/        # types.ts (WorkoutSession, WorkoutSessionExercise), SessionRepository.ts
│   └── settings/       # types.ts (AppSettings, SequenceType), SettingsRepository.ts
├── data/
│   ├── migrations/     # 0002-schema.ts (+ registro em index.ts)
│   └── repositories/   # Sqlite*Repository.ts, mappers.ts, errors.ts
└── utils/
    ├── localDate.ts    # nowLocalIso(clock), localDateOf(iso)
    └── normalizeName.ts  # chave de unicidade do exercício
tests/
├── integration/data/   # schema.test.ts e um *.repository.test.ts por repositório
└── unit/               # localDate.test.ts, normalizeName.test.ts
```

**Structure Decision**: mesma raiz Expo da 001. Portas (interfaces) no domínio, adaptadores SQLite em `data/`,
conforme `docs/arquitetura.md` e constituição II.

## Complexity Tracking

Sem violações.
