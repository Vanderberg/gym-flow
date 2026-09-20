# Research: Fundação do Projeto

Todas as incógnitas do Technical Context resolvidas. Nada permanece como NEEDS CLARIFICATION.

## R1 — Versões mínimas de Android/iOS
- **Decision**: adotar os mínimos do Expo SDK escolhido (não fixar valores próprios); validar em Moto G84/Android 15. Registrar os valores reais em `app.json`/`quickstart.md` ao criar o projeto.
- **Rationale**: app pessoal; fixar mínimos mais altos que o SDK não traz benefício.
- **Alternatives**: Android 10+/iOS 15+ (arbitrário); só Android 15 (cortaria o iOS exigido pelo MVP).

## R2 — Acesso a SQLite
- **Decision**: `expo-sqlite` (API assíncrona), encapsulado por uma interface mínima `Database` (`exec`, `run`, `getAll`, `getFirst`, `transaction`).
- **Rationale**: biblioteca oficial e madura do Expo; a interface permite testar migrations em Node e manter o domínio independente (constituição II).
- **Alternatives**: ORMs (Drizzle/WatermelonDB) — dependência extra sem necessidade (XII); `op-sqlite` — menos padrão.

## R3 — Versionamento e migrations
- **Decision**: lista ordenada de migrations `{version, up(db)}`; versão aplicada em `PRAGMA user_version`; cada migration roda em transação e atualiza `user_version` dentro dela; em falha, `ROLLBACK`, dados anteriores intactos, erro exposto à UI. Migration 0001 é baseline (sem tabelas de domínio, que vêm na spec 002).
- **Rationale**: dispensa tabela própria; atômico; simples. Cumpre FR-004/FR-008.
- **Alternatives**: tabela `schema_migrations` (mais estado para sincronizar); `drizzle-kit` (dependência).

## R4 — Falha de migração na UI
- **Decision**: componente gate no `_layout` raiz: estados `migrando` → `pronto` | `erro`. Em `erro`, exibe mensagem pt-BR e botão "Tentar novamente" que reexecuta o runner; rotas não são montadas enquanto não estiver `pronto`.
- **Rationale**: atende o cenário 4 da US2 e impede uso sobre banco incerto.

## R5 — Navegação
- **Decision**: Expo Router com grupo `(tabs)` (4 abas) e rota `workout` fora do grupo (stack sem abas), conforme `docs/design-telas.md` §9.
- **Alternatives**: drawer/5 abas (contradiz o design).

## R6 — Testes
- **Decision**: `jest-expo` + `@testing-library/react-native`; migrations testadas com `better-sqlite3` (devDependency) através do adaptador da interface `Database`.
- **Rationale**: `expo-sqlite` não roda em Node; `better-sqlite3` é síncrono, rápido e usa SQLite real (semântica de transação/`user_version` idêntica).
- **Risk**: binário nativo no Windows/CI. **Fallback**: `sql.js` (WASM) sem alterar os testes, pois passam pela interface.

## R7 — Qualidade e comando único
- **Decision**: scripts npm: `typecheck` (`tsc --noEmit`), `lint` (`eslint`, config `eslint-config-expo`), `format:check` (`prettier --check`), `test` (`jest`) e `check` = todos em sequência. `tsconfig` com `strict: true`.
- **Rationale**: FR-005/SC-004; constituição III.

## R8 — Criar o projeto num repositório não vazio
- **Decision**: gerar com `create-expo-app` em pasta temporária (template TypeScript + Expo Router), mover arquivos para a raiz e reorganizar em `src/app`; preservar `docs/`, `specs/`, `.specify/`, `.claude/`, `CLAUDE.md`, `.gitignore` (mesclar).
- **Rationale**: `create-expo-app` recusa diretórios não vazios.

## R9 — Zustand
- **Decision**: não instalar nesta spec.
- **Rationale**: nenhum estado a guardar ainda; YAGNI (XII). Entra com a primeira spec que precisar (005/006).

## R10 — Validação em iOS
- **Decision**: desenvolvimento em Windows valida Android localmente; iOS via Expo Go em iPhone físico ou build de nuvem/macOS quando disponível. Registrar como pendência de validação, não como escopo de build (pipeline fora do escopo).
