# Implementation Plan: Fundação do Projeto

**Branch**: `main` (sem branch de feature; diretório da spec: `001-fundacao-projeto`) | **Date**: 2026-09-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-fundacao-projeto/spec.md`
**Backlog**: BL-001, BL-002, BL-003, BL-010, BL-011

## Summary

Criar o projeto Expo (React Native + TypeScript strict) na raiz do repositório, com Expo Router em 4 abas
(Treino/Home, Histórico, Estatísticas, Configurações) mais a rota empilhada `workout`, banco SQLite local com
executor de migrations versionadas e transacionais (falha ⇒ rollback + tela de erro com "Tentar novamente"), e o
comando único `npm run check` (tipos + lint + formato + testes). Telas são esqueletos; sem tema, sem regras de
negócio (ver "Fora do Escopo" da spec). Detalhes de decisão em [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript (strict) sobre React Native + Expo SDK estável mais recente no momento da criação; Node LTS

**Primary Dependencies**: `expo`, `expo-router`, `expo-sqlite`, `react-native-safe-area-context`, `react-native-screens` (exigidas pelo Router). Zustand **não** entra aqui (YAGNI; vem com a primeira store)

**Storage**: SQLite local via `expo-sqlite`; versão do esquema em `PRAGMA user_version`

**Testing**: Jest (`jest-expo`) + React Native Testing Library; `better-sqlite3` (dev) atrás de uma interface `Database` para testes de integração das migrations em Node

**Target Platform**: Android e iOS. Referência de validação: Moto G84, Android 15. Versões mínimas = as suportadas pelo Expo SDK escolhido (registradas no `research.md`); iOS validado em aparelho/simulador conforme disponibilidade

**Project Type**: mobile-app (projeto único, sem backend)

**Performance Goals**: Home visível em ≤ 3 s no Moto G84 (SC-001); migrations iniciais imperceptíveis

**Constraints**: offline-first, sem permissões extras, sem rede; textos pt-BR

**Scale/Scope**: 4 abas + 1 tela empilhada (esqueletos); 1 migration baseline; dados pessoais de um único usuário

## Constitution Check

*GATE: passa antes da pesquisa; reavaliado após o design.*

| Princípio | Avaliação |
|-----------|-----------|
| I. Offline-first / migrations versionadas | ✅ SQLite local, `user_version`, sem rede. Seed idempotente é da spec 003 |
| II. Domínio puro e camadas | ✅ Estrutura `src/{app,domain,application,data,store,...}` criada; nenhum código de domínio aqui. Executor de migrations fica em `data/` e depende só da interface `Database` |
| III. TypeScript estrito | ✅ `strict: true`, ESLint + Prettier no `npm run check` |
| IV–X (regras de treino, histórico, estatísticas) | ✅ N/A nesta spec; nada as contradiz |
| XI. Testes por camada | ✅ Testes de integração do executor de migrations; teste de UI (RNTL) da navegação e da tela de erro |
| XII. Simplicidade e privacidade | ✅ Dependências mínimas; sem permissões; `better-sqlite3` só dev, justificado em research |
| Fluxo: IDs de backlog, docs | ✅ Referenciados; `CLAUDE.md` recebe os comandos ao final |

Sem violações ⇒ Complexity Tracking vazio. Reavaliação pós-design: **sem mudanças, continua passando**.

## Project Structure

### Documentation (this feature)

```text
specs/001-fundacao-projeto/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── navigation.md
│   └── migrations.md
└── tasks.md             # /speckit-tasks (não criado aqui)
```

### Source Code (repository root)

```text
src/
├── app/                    # Expo Router
│   ├── _layout.tsx         # Provider do banco + gate de migração (erro/tentar novamente) + Stack
│   ├── (tabs)/
│   │   ├── _layout.tsx     # 4 abas
│   │   ├── index.tsx       # Treino/Home (esqueleto)
│   │   ├── history.tsx
│   │   ├── statistics.tsx
│   │   └── settings.tsx
│   └── workout.tsx         # tela empilhada, sem abas
├── data/
│   ├── database/           # interface Database, adaptador expo-sqlite, provider
│   └── migrations/         # index.ts (lista) + runner.ts + 0001-baseline.ts
├── domain/  application/  store/  components/  hooks/  utils/  constants/   # pastas vazias (.gitkeep)
tests/
├── integration/            # runner de migrations (better-sqlite3)
└── ui/                     # navegação e tela de erro (RNTL)
```

**Structure Decision**: projeto Expo único na raiz, código em `src/` conforme `docs/arquitetura.md`. O projeto é
gerado num diretório temporário e mesclado à raiz para não sobrescrever `docs/`, `specs/`, `.specify/`, `.claude/`.

## Complexity Tracking

Sem violações.
