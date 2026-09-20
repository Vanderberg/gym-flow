# Quickstart: Fundação do Projeto

## Criar o projeto (uma vez)

1. Gerar o template Expo (TypeScript + Expo Router) em pasta temporária e mesclar na raiz sem tocar em `docs/`, `specs/`, `.specify/`, `.claude/`, `CLAUDE.md`; mover o código para `src/app`.
2. Instalar: `expo-sqlite`; dev: `jest-expo`, `@testing-library/react-native`, `better-sqlite3`, `prettier`, `eslint` + `eslint-config-expo`.
3. Ativar `strict: true` no `tsconfig.json`; criar as pastas de `src/` do plano com `.gitkeep`.

## Comandos (registrar no `CLAUDE.md` ao concluir)

| Objetivo | Comando |
|----------|---------|
| Rodar no aparelho/emulador | `npx expo start` (Android: `a`; iOS: Expo Go/simulador) |
| Verificar tudo | `npm run check` (tipos + lint + formato + testes) |
| Só tipos / lint / formato / testes | `npm run typecheck` / `lint` / `format:check` / `test` |

## Validação manual (mapeia para a spec)

1. **US1**: abrir no Moto G84 (Android 15): Home em ≤ 3 s; percorrer as 4 abas; abrir `/workout` sem abas e voltar. Repetir em iOS quando houver aparelho.
2. **US2**: instalação limpa ⇒ `user_version = 1`. Simular banco em versão anterior ⇒ atualiza sem perder dados. Forçar erro numa migration de teste ⇒ tela de erro + "Tentar novamente"; dados antigos intactos. Modo avião ⇒ tudo funciona.
3. **US3**: introduzir um erro de tipo/estilo ⇒ `npm run check` falha; corrigir ⇒ passa.
4. Conferir que o app não solicita nenhuma permissão.
