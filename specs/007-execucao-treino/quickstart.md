# Quickstart: Execução do Treino

Pré-requisito: specs 001–006 implementadas.

1. Unitários: `npm test -- tests/unit/domain/workout tests/unit/utils/duration` (peso com vírgula e ponto, vazio, negativo, `NaN`; progresso sem aquecimento; duração).
2. Integração (BL-104): `npm test -- tests/integration/application` — marcar/desmarcar fora de ordem e idempotência; peso nulo ou ≥ 0; última carga só do mesmo programa; `FinishWorkout` com 0 marcados; contínua avança a partir do treino finalizado (inclui sequência reiniciada com a sessão em andamento); semanal não altera a posição; falha forçada na finalização desfaz tudo e a sessão segue em andamento; recuperação após "reabrir" (nova conexão ao mesmo banco).
3. UI (RNTL): `npm test -- tests/ui/workout` — marcar fora de ordem, peso pendente salvo ao marcar FEITO e ao finalizar, "Usar X kg", chip BI-SET e observação, aquecimento fora das contagens, diálogo de finalizar, erro ao salvar, resumo.
4. Manual (Android e iOS): iniciar pela Home, marcar exercícios fora de ordem, digitar um peso e fechar o app à força (marcações e peso preservados ao reabrir); finalizar com exercícios pendentes e conferir o resumo e o próximo treino na Home.
5. Lint e tipos sem erros.
