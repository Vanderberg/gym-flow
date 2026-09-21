# Índice de specs

Fonte de verdade de status para `builder-specs`. Status: `planejando` → `aprovada` → `desenvolvendo` → `concluída`.
`Depende de`: códigos numéricos das specs (ex.: `002,003`); vazio = sem dependência.

| Spec | Status | Depende de |
|------|--------|------------|
| 001-fundacao-projeto | concluída | |
| 002-modelo-dados | concluída | 001 |
| 003-programas-seed | concluída | 002 |
| 004-estrategias-sequencia | concluída | 002 |
| 005-configuracoes-programa-sequencia | concluída | 003,004 |
| 006-home-proximo-treino | concluída | 004,005 |
| 007-execucao-treino | concluída | 003,006 |
| 008-ajuda-contextual | concluída | 003,007 |
| 009-historico-sessoes | aprovada | 007 |
| 010-estatisticas-frequencia | aprovada | 007 |
| 011-cronometro-descanso | aprovada | 007 |
