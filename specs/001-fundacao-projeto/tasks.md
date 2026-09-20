---
description: "Task list for Fundação do Projeto"
---

# Tasks: Fundação do Projeto

**Input**: `specs/001-fundacao-projeto/` (plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md)
**Backlog**: BL-001, BL-002, BL-003, BL-010, BL-011
**Tests**: incluídos — a constituição (XI) exige testes de persistência e de fluxos críticos de UI.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1 (app abre + navegação), US2 (armazenamento versionado), US3 (qualidade automatizada)

---

## Phase 1: Setup

**Purpose**: criar o projeto Expo na raiz sem sobrescrever a documentação existente (research R8) — BL-001

- [ ] T001 Gerar template Expo (TypeScript + Expo Router) em pasta temporária fora do repositório e mesclar na raiz **sem** tocar em `docs/`, `specs/`, `.specify/`, `.claude/`, `CLAUDE.md`; mesclar `.gitignore` e criar `package.json`, `app.json`, `tsconfig.json`
- [ ] T002 Mover as rotas do template para `src/app/` e ajustar `package.json` (`main: expo-router/entry`) e `app.json` (nome "Gym Flow", idioma pt-BR, sem permissões extras); registrar em `research.md` (R1) as versões mínimas de Android/iOS do Expo SDK instalado
- [ ] T003 Criar a estrutura de pastas de `src/` do plano com `.gitkeep`: `src/domain/`, `src/application/`, `src/store/`, `src/components/`, `src/hooks/`, `src/utils/`, `src/constants/`, `src/data/database/`, `src/data/migrations/`, e `tests/integration/`, `tests/ui/`
- [ ] T004 Ativar `"strict": true` em `tsconfig.json` e definir alias/paths para `src/` (BL-003)

---

## Phase 2: Foundational (bloqueia todas as histórias)

**Purpose**: infraestrutura de teste compartilhada (BL-003)

- [ ] T005 Instalar dev-deps `jest-expo`, `jest`, `@types/jest`, `@testing-library/react-native` e criar `jest.config.js` (preset `jest-expo`, `testMatch` para `tests/**/*.test.ts(x)`, `moduleNameMapper` espelhando o alias de `src/` definido na T004) e `tests/setup.ts` se necessário
- [ ] T006 Adicionar script `test` em `package.json` e um teste-fumaça `tests/ui/smoke.test.tsx` que roda verde; remover o teste-fumaça ao criar os testes reais de US1

**Checkpoint**: `npm test` executa; projeto compila com `strict`.

---

## Phase 3: User Story 1 — App abre em Android e iOS (P1) 🎯 MVP

**Goal**: 4 abas em pt-BR + tela `workout` empilhada sem abas (BL-002).
**Independent Test**: abrir no Moto G84/Android 15 (e iOS quando houver), navegar pelas 4 abas e abrir/fechar `/workout` (quickstart, US1).

### Tests

- [ ] T007 [P] [US1] Teste RNTL em `tests/ui/navigation.test.tsx`: renderiza o app (expo-router `renderRouter`) e verifica as 4 abas com rótulos "Treino", "Histórico", "Estatísticas", "Config" e que cada uma exibe seu título, assertando os textos em português (FR-007)

### Implementation

- [ ] T008 [P] [US1] Criar `src/app/(tabs)/index.tsx` (Treino/Home), `src/app/(tabs)/history.tsx`, `src/app/(tabs)/statistics.tsx`, `src/app/(tabs)/settings.tsx` — esqueletos exibindo só o título em pt-BR (contracts/navigation.md)
- [ ] T009 [US1] Criar `src/app/(tabs)/_layout.tsx` com 4 abas na ordem Treino, Histórico, Estatísticas, Config, com `accessibilityLabel` em pt-BR e alvos ≥ 48 dp
- [ ] T010 [P] [US1] Criar `src/app/workout.tsx` (esqueleto "Treino em andamento") fora do grupo `(tabs)`, sem abas, com voltar
- [ ] T011 [US1] Criar `src/app/_layout.tsx` com `Stack` contendo `(tabs)` e `workout` (`headerShown` apenas em `workout`)
- [ ] T012 [US1] Adicionar ao `tests/ui/navigation.test.tsx` o caso: navegar para `/workout` e verificar que as abas não aparecem e é possível voltar; remover `tests/ui/smoke.test.tsx` (T006)

**Checkpoint**: US1 funcional e testável sozinha, sem banco.

---

## Phase 4: User Story 2 — Armazenamento local versionado (P1)

**Goal**: migrations transacionais com `user_version`, rollback em falha e tela de erro com "Tentar novamente" (BL-010, BL-011).
**Independent Test**: instalação limpa ⇒ versão 1; banco em versão anterior atualiza sem perda; migration com erro ⇒ rollback + tela de erro (quickstart, US2).

### Tests

- [ ] T013 [P] [US2] Instalar `better-sqlite3` (dev) e criar `tests/integration/helpers/betterSqliteDatabase.ts` implementando a interface `Database` (contracts/migrations.md); se a instalação nativa falhar no Windows, usar `sql.js` mantendo a mesma interface (research R6)
- [ ] T014 [P] [US2] Criar `tests/integration/migrations.test.ts` cobrindo: banco novo ⇒ `ready`, versão 1; banco com `user_version` anterior e dados ⇒ aplica só as pendentes preservando dados (o teste injeta migrations próprias: v1 cria uma tabela com dados, v2 altera; o banco começa em v1 e a v2 é aplicada); re-execução idempotente; migration que lança ⇒ `status: 'error'`, rollback, `user_version` e dados inalterados; `user_version` maior que a maior migration ⇒ `error` sem alterar o banco; lista com versão duplicada/lacuna ⇒ erro detectado
- [ ] T015 [P] [US2] Criar `tests/ui/databaseGate.test.tsx`: com runner mockado em `error` (e também com falha ao abrir o banco), exibe "Não foi possível atualizar seus dados" e "Tentar novamente"; tocar no botão reexecuta e, ao suceder, monta as rotas; enquanto `migrando`/`error` as abas não são renderizadas

### Implementation

- [ ] T016 [US2] Instalar `expo-sqlite` e criar `src/data/database/Database.ts` com a interface `Database` e o tipo `SqlValue` (contracts/migrations.md)
- [ ] T017 [US2] Criar `src/data/database/expoSqliteDatabase.ts` (adaptador de `expo-sqlite` para `Database`; `transaction` usa transação exclusiva — `withExclusiveTransactionAsync` — para que consultas concorrentes não entrem na transação da migration; COMMIT/ROLLBACK) e `src/data/database/openDatabase.ts` que abre o arquivo do app; falha ao abrir o banco também resulta em estado `error`
- [ ] T018 [US2] Criar `src/data/migrations/types.ts` (`Migration`, `MigrationResult`), `src/data/migrations/0001-baseline.ts` (eleva `user_version` para 1, sem tabelas) e `src/data/migrations/index.ts` (lista ordenada)
- [ ] T019 [US2] Implementar `src/data/migrations/runner.ts` (`runMigrations`): valida lista (sem duplicata/lacuna), lê `PRAGMA user_version`, aplica pendentes em ordem, cada uma + atualização de `user_version` na mesma transação, retorna `ready`/`error` sem lançar; `user_version` acima do conhecido ⇒ `error` (data-model.md)
- [ ] T020 [US2] Criar `src/data/database/DatabaseGate.tsx` (estados `migrando`/`ready`/`error`, mensagem pt-BR e botão "Tentar novamente" com `accessibilityRole="button"`, alvo ≥ 48 dp) e `src/data/database/DatabaseProvider.tsx` expondo o `Database` via contexto/hook `useDatabase`
- [ ] T021 [US2] Envolver o `Stack` de `src/app/_layout.tsx` com `DatabaseGate`, de modo que nenhuma rota monte antes de `ready` (contracts/navigation.md)
- [ ] T022 [US2] Validar sem rede (modo avião) e confirmar que `app.json` não declara permissões; registrar o resultado em `quickstart.md` (FR-003, FR-006)

**Checkpoint**: US1 + US2 funcionam; T014 e T015 passam.

---

## Phase 5: User Story 3 — Qualidade automatizada (P2)

**Goal**: comando único que falha em erro de tipo/estilo/teste (BL-003).
**Independent Test**: introduzir erro ⇒ `npm run check` falha; corrigir ⇒ passa (quickstart, US3).

- [ ] T023 [P] [US3] Instalar `eslint` + `eslint-config-expo` e criar `eslint.config.js`; adicionar script `lint`
- [ ] T024 [P] [US3] Instalar `prettier`, criar `.prettierrc` e `.prettierignore` (ignorar `docs/`, `specs/`, `.specify/`, `.claude/`); adicionar scripts `format` e `format:check`
- [ ] T025 [US3] Adicionar scripts `typecheck` (`tsc --noEmit`) e `check` (typecheck + lint + format:check + test) em `package.json`
- [ ] T026 [US3] Rodar `npm run format` e corrigir achados de lint/tipos até `npm run check` passar sem erros
- [ ] T027 [US3] Verificar o cenário negativo: inserir temporariamente um erro de tipo e um de estilo, confirmar que `npm run check` falha apontando o problema, e reverter

**Checkpoint**: as três histórias concluídas.

---

## Phase 6: Polish (BL-001..003)

- [ ] T028 Atualizar a seção "Comandos de build/test/lint" e o "Estado atual" do `CLAUDE.md` com os comandos reais (`npx expo start`, `npm run check`, etc.)
- [ ] T029 Atualizar `docs/arquitetura.md` se a estrutura de pastas ou a stack divergir do implementado (constituição: docs em sincronia)
- [ ] T030 Executar o roteiro de validação do `quickstart.md` no Moto G84 (Android 15): Home em ≤ 3 s em partida a frio, medida por cronômetro em 3 tentativas, valendo a pior (SC-001) e as 4 abas + `/workout`; registrar iOS como pendência se não houver aparelho (research R10)
- [ ] T031 Rodar `npm run check` final e marcar a spec `001-fundacao-projeto` como `concluída` em `specs/INDEX.md`

---

## Dependencies & Execution Order

- **Phase 1 → Phase 2 → histórias**. T001→T002→T003→T004 em sequência (mesmos arquivos de configuração).
- **US1** depende só de Phase 2. **US2** depende de Phase 2 e, em T021, de US1 (T011). **US3** depende de Phase 2; T026 exige US1 e US2 concluídas para validar o projeto inteiro.
- Dentro de cada história: testes antes da implementação (devem falhar primeiro); T016→T017/T018→T019→T020→T021.

### Parallel Opportunities

- US1: T007, T008, T010 em paralelo (arquivos distintos).
- US2: T013, T014, T015 em paralelo; depois T016 e T018 (parte de tipos) em paralelo.
- US3: T023 e T024 em paralelo.
- US3 (T023–T024) pode ser feita em paralelo com US2 por outra pessoa/agente.

## Implementation Strategy

- **MVP**: Phase 1 + 2 + US1 (app abre com navegação). Validar no Moto G84.
- **Incremento 2**: US2 (banco versionado com gate) — pré-requisito de todas as specs seguintes.
- **Incremento 3**: US3 (qualidade) e Polish. Recomenda-se rodar T023–T025 cedo para que as demais tarefas já sejam checadas pelo lint.
