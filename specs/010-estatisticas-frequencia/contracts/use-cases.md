# Contrato: leituras, serviço e domínio (spec 010)

## Porta `SessionRepository` (002) — leituras novas, somente consulta

```ts
listFinishedDates(opts: { from: string; to: string; programId?: number }): Promise<string[]>
   // substr(finished_at, 1, 10) de sessões finalizadas com data local em [from, to] (inclusive), ordenadas; filtro opcional por programa
listProgramsWithFinished(): Promise<{ id: number; name: string }[]>
   // programas (ativos ou não) que têm ao menos uma sessão finalizada, por nome
```

Implementadas em `SqliteSessionRepository`; sem migration; usam `ix_workout_session_program_finished`.

## Domínio (`src/domain/statistics/`) — puro

```ts
periodRange(period: Period, today: string): PeriodRange                       // período em curso; datas locais "YYYY-MM-DD"
weeksTouched(range: PeriodRange, today: string): number                       // ≥ 1; semana atual inteira
computeStats(dates: string[], range: PeriodRange, today: string): StatsResult // count, weeksTouched, weeklyAverage, averageIntervalDays
```

## Utilitários (`src/utils/`)

```ts
daysBetween(a: string, b: string): number        // diferença em dias corridos entre duas datas "YYYY-MM-DD" (sem UTC)
addDays(date: string, n: number): string
mondayOf(date: string): string                   // segunda-feira da semana (seg–dom) da data
formatDecimal(value: number | null, opts?: { suffix?: string }): string   // "3,4", "2,0 dias", "—" para nulo
```

## Aplicação (`src/application/`)

```ts
GetStatistics(deps: { sessions, clock })
  execute(input: { period: Period; programId: number | null }): Promise<StatisticsView>
  // hoje = data local do clock; range = periodRange; dates = listFinishedDates({ from: range.start, to: min(range.end, hoje), programId });
  // hasAnySession = programs não vazio (sem filtro) ou programId presente em programs (com filtro), sem leitura nova; programs = listProgramsWithFinished();
  // stats = computeStats(dates, range, hoje); nenhuma escrita
```

Nenhum caso de uso de escrita existe nesta spec.
