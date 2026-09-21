# Data Model: Estatísticas de Frequência

Sem tabelas ou migrations novas e **sem escrita**: as métricas são derivadas e não armazenadas. Lê `workout_session`
(`finished_at`, `program_id`) e `training_program` (nomes para o filtro). Tipos de domínio:

```ts
type Period = 'WEEK' | 'MONTH' | 'QUARTER' | 'SEMESTER' | 'YEAR'

interface PeriodRange {
  period: Period
  start: string          // "YYYY-MM-DD" (início do período em curso, dia local)
  end: string            // "YYYY-MM-DD" (fim do período; pode estar no futuro)
  label: string          // "SETEMBRO 2026", "SEMANA 14–20 SET", "2º TRIMESTRE 2026", "1º SEMESTRE 2026", "2026"
}

interface StatsResult {
  count: number                       // sessões finalizadas em [start, min(end, hoje)]
  weeksTouched: number                // semanas de calendário (seg–dom) já tocadas, ≥ 1
  weeklyAverage: number               // count / weeksTouched (bruto, sem arredondar)
  averageIntervalDays: number | null  // média das diferenças entre treinos consecutivos; null com < 2 treinos
}

interface StatisticsView extends StatsResult {
  range: PeriodRange
  programFilter: number | null        // null = Todos
  programs: { id: number; name: string }[]   // opções do filtro (programas com sessões finalizadas)
  hasAnySession: boolean              // derivado de programs: não vazio (sem filtro) ou programFilter presente em programs
}
```

## Regras

- **Períodos** (calendário atual): Semana = segunda–domingo da semana de hoje; Mês = dia 1 ao último dia; Trimestre = jan–mar, abr–jun, jul–set, out–dez; Semestre = jan–jun, jul–dez; Ano = 1º/jan a 31/dez. Só o período em curso; sem navegação.
- **Contagem**: `count` = sessões finalizadas com data local em `[start, min(end, hoje)]` e, se houver filtro, `program_id` igual; todas contam, inclusive com 0 exercícios marcados; dois treinos no mesmo dia contam como dois.
- **weeksTouched**: `(mondayOf(min(hoje, end)) − mondayOf(start)) / 7 + 1`; na Semana vale 1.
- **weeklyAverage**: `count / weeksTouched` (bruto).
- **averageIntervalDays**: datas do período ordenadas; média das diferenças em dias corridos entre consecutivas (mesmo dia = 0); `null` se `count < 2`.
- **Datas**: sempre o prefixo local `YYYY-MM-DD` de `finished_at`; a aritmética é por componentes (ano, mês, dia), sem `toISOString()` nem UTC.
- **Exibição**: números com uma casa decimal e vírgula ("3,4", "2,0 dias"); `null` → "—" e "precisa de ao menos 2 treinos".
- **Vazio**: `count = 0` mostra 0, "—" nos demais e "Nenhum treino neste período."; `hasAnySession = false` mostra "Complete seu primeiro treino para começar a acompanhar sua frequência." com **Ir para o treino**.
- **Invariante**: nenhuma operação desta spec escreve no banco; editar marcações no histórico (009) não altera `count`.
