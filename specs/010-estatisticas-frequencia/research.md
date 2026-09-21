# Research: Estatísticas de Frequência

## D1 — Serviço centralizado sobre datas brutas
- **Decision**: `GetStatistics` lê só as datas locais de finalização (e o `program_id` no filtro) das sessões finalizadas do período e entrega ao domínio puro `computeStats`. Nenhuma tabela nova, nenhuma métrica armazenada.
- **Rationale**: constituição IX (serviço centralizado sobre `workout_session`, sem tabelas próprias) e II (regra pura testável sem banco, BL-105).
- **Alternatives**: agregar no SQL (`COUNT`, `AVG`) — acopla a regra ao banco e dificulta o teste das bordas.

## D2 — Leituras novas em `SessionRepository`
- **Decision**: `listFinishedDates(opts: { from: string; to: string; programId?: number }): Promise<string[]>` devolve `substr(finished_at, 1, 10)` (data local) das sessões finalizadas no intervalo (`BETWEEN from AND to`, inclusive), ordenadas; e `listProgramsWithFinished(): Promise<{ id: number; name: string }[]>` devolve os programas que têm sessões finalizadas (para o filtro). Ambas somente de consulta, sem migration; usam `ix_workout_session_program_finished`.
- **Rationale**: `finished_at` já guarda o horário local com deslocamento; comparar o prefixo `YYYY-MM-DD` evita qualquer conversão de fuso (constituição X). A 009 hoje deriva a lista de programas dos itens; pode reutilizar `listProgramsWithFinished`.
- **Alternatives**: reutilizar `listFinishedSummaries` da 009 (agregação e junções desnecessárias para uma coluna).

## D3 — Períodos do calendário atual (clarificação 1)
- **Decision**: `periodRange(period, today)` devolve o intervalo do período em curso: **Semana** segunda–domingo da semana de `today`; **Mês** do dia 1 ao último dia; **Trimestre** jan–mar, abr–jun, jul–set, out–dez; **Semestre** jan–jun ou jul–dez; **Ano** 1º de janeiro a 31 de dezembro. Sessões contadas: `from = start` até `to = min(end, today)`. Sem navegação para períodos anteriores.
- **Rationale**: FR-001a; datas por componentes locais, com a virada de mês/ano coberta nos testes.

## D4 — Média por semana (clarificação 2)
- **Decision**: `weeksTouched(range, today)` = número de semanas de calendário (segunda a domingo) que o período já tocou até hoje, contando a semana atual inteira: `(mondayOf(min(today, end)) − mondayOf(start)) / 7 + 1`. Para **Semana** o divisor é 1. `weeklyAverage = count / weeksTouched` (número bruto; formatado com uma casa decimal e vírgula só na apresentação). Exemplo do design: setembro de 2026 em 30/09 → 5 semanas; 17 treinos → 3,4.
- **Rationale**: FR-001; divisor inteiro ≥ 1 não exagera a média no início do período e concorda com o exemplo do design.
- **Alternatives**: dias decorridos ÷ 7 (exagera no início da semana) ou período completo ÷ 7 (subestima período em curso).

## D5 — Intervalo médio
- **Decision**: com as datas locais das sessões do período e do filtro, ordenadas, o intervalo médio é a média das diferenças em dias corridos entre treinos consecutivos (`daysBetween` por componentes de data, sem UTC); dois treinos no mesmo dia dão intervalo 0; menos de 2 treinos → `null` ("—"). Só usa sessões dentro do período (não olha a última sessão anterior).
- **Rationale**: FR-001, US2 cenários 2–3 e edge case; exemplo: treinos nos dias 1, 3 e 7 → (2 + 4) / 2 = 3.

## D6 — O que conta
- **Decision**: toda sessão finalizada conta, inclusive com 0 exercícios marcados; sessões em andamento ou descartadas não existem em `finished_at` e ficam fora. Editar marcações no histórico (009) não muda a contagem.
- **Rationale**: clarificação 4, FR-002 e constituição IX (apenas sessões finalizadas).

## D7 — Filtro e período em memória
- **Decision**: `statisticsStore` guarda `period` (padrão "Mês") e `programFilter` (null = "Todos"), sem persistência, independentes do filtro do histórico. `FilterSelect` (009) lista "Todos" e os programas de `listProgramsWithFinished`; o filtro escolhido fica visível ao lado do título e com rótulo de acessibilidade.
- **Rationale**: FR-003; consistência com a decisão da 009.

## D8 — Três números apenas (clarificação 3)
- **Decision**: a tela mostra `StatCard` de "TREINOS NO PERÍODO", "POR SEMANA" e "INTERVALO"; sem distribuição por dia, calendário nem setas. O rótulo do período (`PeriodHeader`) é informativo ("SETEMBRO 2026", "SEMANA 14–20 SET", "2º TRIMESTRE 2026", "1º SEMESTRE 2026", "2026").
- **Rationale**: FR-004/FR-004a e constituição IX.

## D9 — Reavaliar o dia
- **Decision**: `useStatistics` recarrega ao ganhar o foco e ao voltar ao primeiro plano (`AppState` → `active`) e recalcula o período se a data local mudou.
- **Rationale**: a virada de dia, semana ou mês muda o período em curso (constituição X).

## D10 — Arredondamento e exibição
- **Decision**: média e intervalo exibidos com uma casa decimal e vírgula ("3,4", "2,0 dias"); inteiro sem sufixo para a contagem; nulo → "—" com a dica "precisa de ao menos 2 treinos". O cálculo interno não arredonda. O arredondamento de exibição é meio para cima sobre a representação decimal de uma casa (3,45 → 3,5; 3,44 → 3,4), sem `toFixed` direto no número de ponto flutuante (multiplicar por 10 com correção de epsilon ou usar aritmética inteira).
- **Rationale**: exemplos do design; testes comparam o número bruto e o texto formatado separadamente.
