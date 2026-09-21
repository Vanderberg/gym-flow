# Quickstart: Estratégias de Sequência

Pré-requisito: specs 001–003 implementadas.

1. Unitários (sem banco): `npm test -- tests/unit/domain/sequence` — BL-100 (primeiro, meio, último→primeiro, reinício, estado ausente/inválido) e BL-101 (treino, descanso, sábado opcional, domingo, virada de semana, sem agenda, já concluído hoje).
2. Integração: `npm test -- tests/integration/application` — `GetNextWorkout` sobre o seed (Treino Padrão contínuo; Treino Monstro semanal) e `ResetSequence` (recusa em semanal; outro programa intacto; histórico e sessão em andamento mantidos).
3. Manual (após a UI): alternar o tipo de sequência e conferir o resultado sem alterar posições.
4. Lint e tipos sem erros.
