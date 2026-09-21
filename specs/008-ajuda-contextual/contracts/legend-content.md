# Conteúdo da legenda de técnicas (rascunho para revisão do dono do app)

Definições informativas em pt-BR, sem carga, treino ou dieta (constituição VIII). O título é o valor canônico usado pelo
seed no campo `technique`; as quatro primeiras marcadas com ● são as técnicas usadas hoje pelos programas.

| Título | Texto |
|--------|-------|
| BI-SET ● | Dois exercícios diferentes feitos em sequência, sem descanso entre eles. |
| DROP-SET ● | Redução da carga logo após uma série, para continuar o exercício sem pausa. |
| PIRÂMIDE CRESCENTE | Aumento progressivo da carga ao longo das séries. |
| PIRÂMIDE DECRESCENTE | Redução progressiva da carga ao longo das séries. |
| FALHA ● | Execução até não conseguir realizar outra repetição com boa técnica. |
| EXCÊNTRICA | Fase do movimento em que o músculo se alonga, de retorno da carga. |
| CONCÊNTRICA | Fase do movimento em que o músculo se contrai e a carga é levantada. |
| PROGRESSÃO DE CARGA ● | Aumento gradual da carga ao longo das séries, conforme a prescrição da ficha. |

## Regras

- Títulos únicos, em caixa alta, iguais aos valores de `technique` do seed quando houver.
- Textos curtos (até ~120 caracteres), sem verbos de recomendação.
- Novos valores de `technique` no seed exigem uma nova entrada (o teste `helpContent` falha caso contrário).
