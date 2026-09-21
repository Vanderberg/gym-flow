# Quickstart: Home e Próximo Treino

Pré-requisito: specs 001–005 implementadas.

1. Unitários: `npm test -- tests/unit/domain/home` (precedência dos estados, rail com posição ausente/inválida, WeekStrip com dias feitos e semana segunda a domingo) e `tests/unit/utils/weekdayLabel`.
2. Integração: `npm test -- tests/integration/application` — `GetHomeState` sobre o seed (Padrão contínuo; Monstro semanal em cada dia, incluindo "Concluído hoje"), `StartWorkout` (cria sessão só na chamada; Conflict com sessão em andamento), `DiscardInProgressSession` (sequência e sessões finalizadas intactas).
3. UI (RNTL): `npm test -- tests/ui/home` — todos os estados do cartão, iniciar, "Ver treinos do programa", diálogo de sessão pendente (Continuar/Descartar com segunda confirmação), carregando e erro.
4. Manual (Android e iOS): abrir a Home no Padrão e no Monstro; iniciar um treino; fechar e reabrir o app (diálogo); descartar; mudar a data do aparelho para o dia seguinte e voltar ao app (dia reavaliado).
5. Lint e tipos sem erros.
