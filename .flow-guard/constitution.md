# Gym Flow Constituição

Perfil do projeto: mobile

Este arquivo é o resumo de setup do flow-guard (roteamento de skills por stack).
A constituição normativa e versionada do projeto é `.specify/memory/constitution.md`
(atualmente v2.2.0) — em caso de divergência, ela prevalece.

## 1. Estilo arquitetural

Camadas: `UI → Hooks/Application → Domain → Repositories → SQLite`. Domínio puro
(sem React, sem SQLite, sem API): sequências, finalização de treino e estatísticas
vivem em `src/domain/`. Casos de uso em `src/application/`. Zustand só guarda estado
de UI/sessão atual (`src/store/`); SQLite é a fonte de verdade. Projeto único
(monorepo não se aplica), Expo Router para rotas (`src/app/`).

## 2. Stack e frameworks (com versões)

React Native + Expo `~57`, TypeScript strict, Expo Router, Zustand, SQLite
(via `better-sqlite3` em testes/scripts), Jest + React Native Testing Library,
ESLint, Prettier. Sem dependências novas fora do necessário (projeto prioriza
libs pequenas e maduras).

## 3. Estratégia de testes

Unitário (domínio puro: máquinas de estado, estratégias de sequência, cálculo
de estatísticas, validação), integração (casos de uso + persistência SQLite),
UI (RNTL: fluxos de tela). `npm run check` (typecheck + lint + format:check +
testes) é obrigatório antes de considerar qualquer tarefa concluída.

## 4. Padrões de segurança e nomenclatura

Offline-first, sem backend, sem login, sem sincronização; nenhum dado sai do
aparelho; nenhuma permissão de dispositivo desnecessária. Nomenclatura de
domínio em português (nomes de entidades/telas) alinhada aos documentos em
`docs/`; identificadores de código em inglês seguindo convenção RN/TS padrão.

## 5. Regras implícitas inegociáveis

- Nunca codificar regra de negócio por nome de programa de treino (programa e
  sequência são sempre independentes).
- Domínio nunca importa React/SQLite/API; relógio sempre injetado (sem
  `Date.now` direto em código de domínio).
- Histórico de sessões nunca é apagado ou alterado por troca de programa/
  sequência; "descartar" sessão em andamento não altera sequência/estatísticas.
- Sem recomendações (cargas, exercícios, treinos, IA, dieta, peso corporal).
- Toda mudança de comportamento real passa por `npm run check` verde antes de
  ser considerada concluída (TDD: teste primeiro).

## Perfil do projeto (detalhe)

`mobile` — app React Native/Expo para Android e iOS, uso pessoal, sem
comercialização, sem backend.
