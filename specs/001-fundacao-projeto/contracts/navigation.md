# Contrato de navegação

Rotas expostas ao usuário (Expo Router, arquivos em `src/app/`).

| Rota | Arquivo | Tipo | Rótulo (pt-BR) | Abas visíveis |
|------|---------|------|----------------|---------------|
| `/` | `(tabs)/index.tsx` | aba | Treino | sim |
| `/history` | `(tabs)/history.tsx` | aba | Histórico | sim |
| `/statistics` | `(tabs)/statistics.tsx` | aba | Estatísticas | sim |
| `/settings` | `(tabs)/settings.tsx` | aba | Config | sim |
| `/workout` | `workout.tsx` | empilhada | Treino em andamento | **não** |

## Regras

- Ordem das abas: Treino, Histórico, Estatísticas, Config.
- `/workout` abre sobre as abas e volta com o gesto/botão voltar (esqueleto; comportamento de sessão é da spec 007).
- Nenhuma rota é montada enquanto o banco não estiver `pronto` (ver `migrations.md`); em `erro`, só a tela de falha é exibida.
- Toda aba e tela tem `accessibilityLabel` em pt-BR e alvos de toque ≥ 48 dp (`docs/design-telas.md` §10).
- Telas esqueleto exibem apenas o título da área; sem conteúdo de negócio.
