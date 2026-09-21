# Quickstart: Estatísticas de Frequência

Pré-requisito: specs 001–009 implementadas.

1. Unitários (BL-105): `npm test -- tests/unit/domain/statistics tests/unit/utils/dateMath tests/unit/utils/formatDecimal` — períodos em curso (semana seg–dom, mês, trimestre, semestre, ano) e virada de mês/ano; `weeksTouched` (mês tocando 5 semanas, semana = 1); contagem (dois treinos no mesmo dia = 2); média (8 treinos em 4 semanas = 2; 17 em 5 = 3,4); intervalo (dias 1, 3 e 7 → 3; menos de 2 → `null`; mesmo dia = 0); formatação com vírgula.
2. Integração: `npm test -- tests/integration/data/sessionStatsQueries tests/integration/application/getStatistics` — conjunto de referência calculado à mão (SC-003) para cada período, com e sem filtro por programa; sessão em andamento e descartada fora; sessão finalizada com 0 exercícios marcados dentro; editar marcações no histórico não muda a contagem; relógio às 23:30 −03:00 no último dia do mês continua no mesmo mês; nenhuma escrita.
3. UI (RNTL): `npm test -- tests/ui/statistics` — trocar período e filtro atualiza os números; três `StatCard`; sem setas, distribuição nem calendário; estados vazio, sem registro, erro e carregando; "—" com a dica do intervalo.
4. Manual (Android e iOS): registrar treinos em dias diferentes, conferir os números de cada período com contas à mão; trocar o filtro entre Todos e cada programa; mudar a data do aparelho para o dia seguinte e voltar ao app (período recalculado).
5. Lint e tipos sem erros.
