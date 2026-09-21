# Contrato: Histórico (UI)

Direção visual: `docs/design-telas.md` §1–3 e §6 ("Placar de academia"); tokens de `src/constants/theme.ts`. Textos em pt-BR.

## Rotas

| Rota | Tipo | Conteúdo |
|------|------|----------|
| `/(tabs)/history` | aba | Lista de sessões finalizadas, filtro por programa |
| `/history/[sessionId]` | empilhada, sem abas | Detalhe e edição da sessão |

## Lista

- Cabeçalho "HISTÓRICO" + `FilterSelect` ("Todos ▼": abre `Sheet` com Todos e cada programa que tenha sessões).
- Cabeçalhos de mês ("SETEMBRO 2026") e itens de 72 dp (item inteiro é botão): data (dia) à esquerda, programa, "<código> — <treino>", "N / M realizados" (✓ + contagem quando completo) e duração ("52 min"). Com filtro por programa ativo, o nome do programa pode sair do item.
- `FlatList` virtualizada com altura fixa (`getItemLayout`); 500 sessões rolam sem travar.
- **Estados**: carregando (4 esqueletos); erro ("Não foi possível carregar o histórico" + **Tentar de novo**); vazio ("Ainda não existem treinos registrados." + **Ir para o treino**); vazio com filtro ("Nenhum treino deste programa." + **Limpar filtro**).
- O filtro vive só em memória: volta a "Todos" ao reabrir o app e não afeta as estatísticas. A lista recarrega ao ganhar o foco.

## Detalhe

```text
‹  <TREINO> — <NOME>
   <Programa> · dd/mm/aaaa · N / M realizados
 ✓ Supino reto           80 kg
   4 × 8
 ○ Voador                não realizado
   3 × até a falha
 ✓ Exercício que saiu da ficha    60 kg     (sem prescrição)
                              [ EDITAR ]
```

- Feito = ✓ + peso ("sem carga" se nulo); não realizado = ○ + "não realizado"; a prescrição atual da ficha aparece abaixo do nome como texto, sem interpretação, só quando o exercício ainda está no treino.
- Data no dia local do fim da sessão.

## Edição

- **EDITAR** libera as linhas: alternar ✓/○ e editar peso (`WeightInput`, vírgula ou ponto). As alterações ficam pendentes.
- **Salvar** (primário) grava tudo em uma transação e volta ao detalhe atualizado; peso inválido ("Informe um valor maior ou igual a 0") bloqueia **Salvar**. Falha ao salvar: "Não foi possível salvar. Nada foi alterado." e o rascunho é mantido.
- **Cancelar** sai da edição; com alterações pendentes abre `ConfirmDialog` ("Descartar as alterações?"); sem alterações sai direto. Qualquer outra saída da tela (voltar `‹`, gesto de voltar, troca de aba) com alterações pendentes abre a mesma confirmação; "manter" continua na edição.
- Não há como trocar programa, treino ou data, nem excluir a sessão. Salvar não altera a sequência.

## Acessibilidade

Feito/não realizado com ícone e texto além da cor; alvos ≥ 48 dp; nome de treino longo em até 2 linhas; `accessibilityLabel` nas linhas editáveis ("Exercício X, realizado, 80 quilos").
