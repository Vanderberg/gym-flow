# Data Model: Ajuda Contextual

Sem tabelas ou migrations novas e **sem escrita**. Lê `exercise` (`name`, `primary_muscle`, `secondary_muscles`,
`description`) pelo `ExerciseRepository` (spec 002). Tipos de domínio:

```ts
interface LegendEntry { title: string; description: string }          // title = valor canônico em caixa alta

interface MuscleInfo {
  exerciseId: number
  name: string
  primaryMuscle: string            // "Não informado" só como rede de segurança
  secondaryMuscles: string[]       // de "Tríceps, Deltoide anterior" → ["Tríceps", "Deltoide anterior"]; vazio → ["Não informado"]
  description: string
}

type HelpSheetState =
  | { kind: 'NONE' }
  | { kind: 'LEGEND'; term?: string }                                  // term = título da entrada para rolar até ela
  | { kind: 'EXERCISE'; exerciseId: number }
```

## Regras

- **Legenda**: `TECHNIQUE_LEGEND` é uma constante; títulos únicos e textos não vazios. Contém, no mínimo, todo valor de `technique` usado no seed (`BI-SET`, `DROP-SET`, `FALHA`, `PROGRESSÃO DE CARGA`) e as entradas extras `PIRÂMIDE CRESCENTE`, `PIRÂMIDE DECRESCENTE`, `EXCÊNTRICA`, `CONCÊNTRICA`.
- **findLegendEntry(technique)**: `technique` não nulo e igual (`===`) a algum `title` → a entrada; senão `null`. Não lê prescrição nem observações.
- **buildMuscleInfo(exercise)**: separa `secondary_muscles` por vírgula, remove espaços e vazios; campos ausentes ou vazios → "Não informado" (rede de segurança; nunca no seed).
- **Estado**: `HelpSheetState` vive no `helpStore` (UI). Abrir e fechar mudam só esse estado. Marcar "abertura em curso" e o `exerciseId` a receber o foco de volta também ficam no `helpStore`.
- **Invariante (FR-004, BL-116)**: antes e depois de abrir e fechar qualquer folha, `workout_session`, `workout_session_exercise`, `program_sequence_state`, `app_settings`, `workoutStore` (marcações, pesos, rascunhos, cartões expandidos) e o cronômetro permanecem idênticos.
- **Peso pendente (FR-004a)**: com um rascunho não salvo, abrir a ajuda não chama `SetExerciseWeight` nem `SetExerciseCompleted`; o rascunho continua no campo.
