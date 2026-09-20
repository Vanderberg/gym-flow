# Visão geral das specs

Derivadas de `docs/backlog.md`. Ordem = ordem sugerida de execução do ciclo spec-kit (clarify → plan → tasks → implement).

| # | Spec | Backlog | Prioridade | Depende de |
|---|------|---------|------------|------------|
| 001 | [Fundação do projeto](001-fundacao-projeto/spec.md) | BL-001..003, 010, 011 | P0 | — |
| 002 | [Modelo de dados](002-modelo-dados/spec.md) | BL-012..015 | P0 | 001 |
| 003 | [Programas (seed)](003-programas-seed/spec.md) | BL-020..023, 110*, 120, 124 | P0 | 002 |
| 004 | [Estratégias de sequência](004-estrategias-sequencia/spec.md) | BL-030..032, 034, 035, 100, 101 | P0 | 002 |
| 005 | [Configurações programa/sequência](005-configuracoes-programa-sequencia/spec.md) | BL-033, 040..042, 102, 103 | P0 | 003, 004 |
| 006 | [Home e próximo treino](006-home-proximo-treino/spec.md) | BL-050..053, 122, 123 | P0 (123: P1) | 004, 005 |
| 007 | [Execução do treino](007-execucao-treino/spec.md) | BL-060..067, 121, 104 | P0 | 003, 006 |
| 008 | [Ajuda contextual](008-ajuda-contextual/spec.md) | BL-110..116 | P0 (115: P1) | 003, 007 |
| 009 | [Histórico](009-historico-sessoes/spec.md) | BL-070..074 | P0 (073: P1) | 007 |
| 010 | [Estatísticas](010-estatisticas-frequencia/spec.md) | BL-080..087, 105 | P0 (087: P1) | 007 |
| 011 | [Cronômetro](011-cronometro-descanso/spec.md) | BL-043, 090..092 | P1 | 007 |

Todos os IDs BL-xxx do backlog estão cobertos. Specs 008, 009 e 010 são independentes entre si após a 007.

## Pontos a confirmar na fase `/speckit-clarify`

- 003: variação "tríceps testa unilateral no cross"; texto do aquecimento e do cardio.
- 004/005: comportamento do modo semanal em programa sem agenda.
- 005: troca de programa com sessão em andamento (assumido: impedir); agenda semanal editável ou só leitura (assumido: leitura).
- 010: definição da média semanal com semana corrente incompleta.
