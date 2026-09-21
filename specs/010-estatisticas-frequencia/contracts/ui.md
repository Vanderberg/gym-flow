# Contrato: Estatísticas (UI)

Direção visual: `docs/design-telas.md` §1–3 e §7 ("Placar de academia"); tokens de `src/constants/theme.ts`. Textos em pt-BR.

## Rota

| Rota | Tipo | Conteúdo |
|------|------|----------|
| `/(tabs)/statistics` | aba | Período e filtro; três números do período em curso |

## Estrutura

```text
ESTATÍSTICAS                     [ Todos ▼ ]     FilterSelect (009)
[Semana][Mês][Trim.][Sem.][Ano]                  PeriodSelector
SETEMBRO 2026                                    PeriodHeader (só rótulo; sem setas)
┌───────────────────────────┐
│ TREINOS NO PERÍODO   17   │                    StatCard
└───────────────────────────┘
┌────────────┐ ┌────────────┐
│ POR SEMANA │ │ INTERVALO  │
│ 3,4        │ │ 2,0 dias   │
└────────────┘ └────────────┘
```

- Padrão ao abrir: período "Mês" e filtro "Todos"; ambos só em memória (voltam ao padrão ao reabrir o app); o filtro é independente do filtro do histórico.
- Trocar período ou filtro atualiza os números em menos de 1 s (SC-002).
- O filtro escolhido fica visível ao lado do título e é lido por leitores de tela ("Estatísticas, filtro: Treino Monstro").
- **Sem** setas `‹ ›`, distribuição por dia (SEG…DOM) nem calendário de pontos; sem volume, carga total, peso corporal ou recomendação.

## Estados

- **Carregando**: esqueleto dos 3 cartões. **Erro**: "Não foi possível carregar as estatísticas" + **Tentar de novo**.
- **Período sem treinos** (`count = 0`, `hasAnySession = true`): 0 em "TREINOS", "—" nos demais e "Nenhum treino neste período.".
- **Sem nenhum treino registrado no filtro** (`hasAnySession = false`): "Complete seu primeiro treino para começar a acompanhar sua frequência." + **Ir para o treino** (navega para a Home).
- **Intervalo com menos de 2 treinos**: "—" + "precisa de ao menos 2 treinos".
- **Reavaliação**: ao ganhar o foco ou voltar ao app, recarrega; se o dia mudou, o período em curso é recalculado.

## Acessibilidade

`PeriodSelector` com `accessibilityRole="tab"` e estado selecionado além da cor; os rótulos visíveis são curtos ("Semana", "Mês", "Trim.", "Sem.", "Ano"), mas cada aba tem `accessibilityLabel` com o nome completo ("Semana", "Mês", "Trimestre", "Semestre", "Ano"); alvos ≥ 48 dp; `StatCard` com rótulo e valor lidos juntos ("Treinos no período: 17").
