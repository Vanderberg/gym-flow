# Contrato: telas e comportamento de UI

Direção visual: `docs/design-telas.md` ("Placar de academia", tema escuro). Textos em pt-BR. Linhas de 56 dp.

## Rotas

| Rota | Tipo | Conteúdo |
|------|------|----------|
| `/(tabs)/settings` | aba | Programa · Tipo de sequência · Agenda semanal (em qualquer tipo de sequência) · Reiniciar sequência (só `CONTINUOUS`) |
| `/settings/program` | empilhada | RadioCards: Treino Padrão, Treino Monstro; aviso "Trocar de programa não apaga seu histórico." |
| `/settings/sequence` | empilhada | RadioCards: Sequência contínua, Dias da semana |
| `/settings/schedule` | empilhada | Título "AGENDA · <PROGRAMA ATIVO>"; 7 linhas SEG→DOM somente leitura, ou estado vazio |

## Comportamento

- Tocar numa opção salva na hora (sem botão): Configurações → linha → opção = 2 toques (SC-001).
- **Programa com sessão em andamento**: tocar em outro programa abre `InProgressBlockSheet` — "Há um treino em andamento. Continue ou descarte para trocar de programa." Botões **Continuar** (`router.push('/workout')`) e **Descartar** (confirmação: "Descartar o treino em andamento? Isso não altera sua sequência nem suas estatísticas."). Depois de descartar, o usuário toca de novo no programa. Abrir/fechar o sheet não altera nada.
- **Tipo de sequência**: sempre permitido, inclusive com sessão em andamento. Escolher `WEEKLY` num programa sem agenda é permitido; a Home orienta (spec 004) e a linha "Agenda semanal" (sempre visível) leva ao estado vazio.
- **Agenda**: linhas sem `›` (não navegam); dia opcional mostra o texto da nota como está. Estado vazio: "Este programa não tem agenda semanal", sem lista de dias.
- **Reiniciar**: confirmação "Reiniciar a sequência do <PROGRAMA ATIVO>? O próximo treino volta ao primeiro. Seu histórico não é apagado." Botões **Reiniciar** / **Cancelar**; cancelar não escreve nada. Linha ausente em `WEEKLY`.
- Nenhuma tela cria sessão. A escolha persiste ao reabrir (lida do SQLite).
- Acessibilidade: RadioCards com `accessibilityRole="radio"` e estado selecionado; alvos ≥ 48 dp.
