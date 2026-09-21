# Contrato: sequência (domínio e casos de uso)

## Domínio (`src/domain/sequence/`)

```ts
interface SequenceStrategy {
  readonly type: SequenceType
  getNextWorkout(context: SequenceContext): NextWorkoutResult   // pura, síncrona, sem I/O
}

class NextWorkoutResolver {
  constructor(strategies: SequenceStrategy[])                   // indexa por type; tipo duplicado = erro
  resolve(type: SequenceType, context: SequenceContext): NextWorkoutResult
}

advancePosition(currentPosition: number | null, activePositions: number[]): number   // próxima posição ativa; última → primeira; ausente/sem correspondência conta como a primeira
```

Tipo sem estratégia registrada: `resolve` lança `Error` (erro de programação; não ocorre com os tipos do enum).

## Aplicação (`src/application/`)

```ts
GetNextWorkout(deps: { programs, schedule, sequenceState, settings, resolver, clock })
  execute(): Promise<{ programId: number; sequenceType: SequenceType; result: NextWorkoutResult }>
  // lê settings (programa ativo + tipo), treinos ativos, estado, agenda; weekday da data local; NÃO consulta sessões

ResetSequence(deps: { settings, sequenceState })
  execute(programId: number): Promise<void>
  // ValidationError se sequence_type = WEEKLY; upsert(programId, 1); não altera sessões nem outros programas
```

`FinishWorkout` (spec 007) usa `advancePosition` dentro da transação de finalização, apenas quando o tipo é `CONTINUOUS`.
