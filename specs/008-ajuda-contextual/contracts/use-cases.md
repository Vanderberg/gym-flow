# Contrato: domínio e casos de uso (spec 008)

Somente leitura. `ExerciseRepository` da 002 injetado.

## Constante (`src/constants/techniqueLegend.ts`)

```ts
export const TECHNIQUE_LEGEND: LegendEntry[]     // ordem: BI-SET, DROP-SET, PIRÂMIDE CRESCENTE, PIRÂMIDE DECRESCENTE, FALHA, EXCÊNTRICA, CONCÊNTRICA, PROGRESSÃO DE CARGA
```

Textos em [legend-content.md](legend-content.md).

## Domínio (`src/domain/help/`)

```ts
findLegendEntry(technique: string | null): LegendEntry | null       // correspondência exata com o título; nunca lê prescrição/observações
buildMuscleInfo(exercise: { id: number; name: string; primaryMuscle: string | null; secondaryMuscles: string | null; description: string | null }): MuscleInfo
```

## Aplicação (`src/application/`)

```ts
GetExerciseInfo(deps: { exercises })
  execute(exerciseId: number): Promise<MuscleInfo>
  // ExerciseRepository.getById → buildMuscleInfo; NotFoundError se não existe; nenhuma escrita
```

Nenhum caso de uso de escrita é chamado ao abrir ou fechar as folhas (BL-116).
