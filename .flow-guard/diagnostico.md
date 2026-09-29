# Diagnóstico de adoção — Gym Flow

Preenchido rodando comandos reais (spec Seção 6), nunca por inferência.
Cada célula vazia usa `<!-- PENDENTE -->` até ser perguntada/rodada.

## Seção A — Terreno (comandos)

| Campo | Comando | Resultado |
|---|---|---|
| Linguagens e proporção | `git ls-files \| sed 's/.*\.//' \| sort \| uniq -c \| sort -rn \| head` | TypeScript predominante: 192 `.ts`, 74 `.tsx`; 119 `.md` (documentação/specs); 13 `.json`; 9 `.sh`; 7 `.png`/6 `.jpeg` (assets/fichas); 5 `.ps1`; 3 `.js` |
| Gerenciador de pacotes | `ls package.json ...` | `package.json` (npm) |
| Arquitetura de pastas | `git ls-files \| awk -F/ ...` | App Expo Router: `src/{app,domain,application,data,store,hooks,components,constants,utils}`; `specs/NNN-*` (Spec-Kit, 11 features), `docs/` (PRD, arquitetura, modelo de dados, telas, backlog), `.specify/` (memory/constitution, templates, scripts), `.flow-guard/` (este processo), `tests/{unit,integration,ui}`, `assets/` |
| Testes existentes | `git ls-files \| grep ...` | 89 arquivos em `tests/unit`, `tests/integration`, `tests/ui`; Jest + React Native Testing Library; cobertura por camada (domínio puro, casos de uso/persistência, UI) já estabelecida desde a spec 001 |

## Seção B — Entrevista (uma pergunta por vez)

- B1. Comandos de build/teste/subir local: `npx expo start` (rodar; Android `a`), `npm run check` (typecheck + lint + format:check + testes), `npm run typecheck`, `npm run lint`, `npm run format`, `npm test` (ver `CLAUDE.md`)
- B2. Perfil do projeto (backend/frontend/mobile/full-stack): mobile (React Native + Expo, Android/iOS), offline-first, sem backend/API própria

## Dado pessoal (alimenta `.flow-guard/paths-sensiveis.conf`)

Pergunte pelas três formas de captura de dado pessoal, não só a tabela do banco.

- Via API/backend: não aplicável — o app não tem backend nem API própria (offline-first, sem sincronização, RNF do `CLAUDE.md`)
- Via formulário/client-side: nenhum dado pessoal identificável é coletado; apenas dados de treino (cargas, exercícios marcados, datas de sessão) ficam no SQLite local do próprio usuário
- Via permissão de dispositivo (mobile): nenhuma permissão de dispositivo é solicitada hoje; app usa `Vibration`/`AppState` do React Native (sem permissão); ver RNF "nenhuma permissão desnecessária" no `CLAUDE.md`

## Gate de completude

Antes de propor `/speckit-constitution`, conte:
`grep -c '<!-- PENDENTE -->' .flow-guard/diagnostico.md`
Se maior que 0, diga o que falta e pare.
