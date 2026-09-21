# Contrato: dados do seed e `runSeed`

## Tipos (`src/data/seed/types.ts`)

```ts
type Technique = 'BI-SET' | 'DROP-SET' | 'PROGRESSÃO DE CARGA' | 'FALHA';   // src/constants/techniques.ts

interface SeedExercise {
  name: string;                 // único por normalizeName
  muscleGroup: string;          // grupo amplo (ex.: "Ombros")
  primaryMuscle: string;        // obrigatório, não vazio
  secondaryMuscles: string;     // obrigatório, não vazio (lista em texto, ex.: "Tríceps, Deltoide anterior")
  description: string;          // obrigatório, informativo, 1–2 frases; sem carga/técnica/recomendação
}

interface SeedWorkoutExercise {
  exercise: string;             // nome de um SeedExercise
  prescription: string;         // texto literal da ficha ("3 × 10–12", "3 × 6/8/10", "3 × até a falha")
  technique: Technique | null;  // null quando a ficha traz "—"
  notes: string | null;         // null quando a ficha traz "—"
}

interface SeedWorkout {
  code: string;                 // 'A'..'D' ou '1'..'5'
  name: string;                 // "Ombros completos", "Peito e Tríceps"…
  items: SeedWorkoutExercise[]; // ordem = display_order (1..N)
}

interface SeedScheduleDay {
  weekday: 1|2|3|4|5|6|7;       // 1 = segunda … 7 = domingo
  workout: string | null;       // code do treino ou null (sem treino)
  optional: boolean;
  note: string | null;
}

interface SeedProgram {
  name: string;
  description: string | null;
  homeSuggestion: string | null;
  isDefault: boolean;           // exatamente um programa
  workouts: SeedWorkout[];      // position = índice + 1
  schedule: SeedScheduleDay[] | null;   // null = programa sem agenda
}

interface SeedData {
  exercises: SeedExercise[];
  programs: SeedProgram[];
  defaultSequenceType: 'CONTINUOUS' | 'WEEKLY';   // 'CONTINUOUS'
}
```

`WARMUP_NOTE` (`src/data/seed/warmup.ts`) é aplicado a todo treino: `"Aquecimento de manguito rotador + aquecimento livre"`.

## `runSeed`

```ts
runSeed(db: Database, opts?: { data?: SeedData; clock?: Clock }): Promise<void>
```

- `data` padrão = `SEED_DATA`; parâmetro existe para testes (dataset alterado/inválido).
- Executa tudo em `db.transaction`; qualquer erro ⇒ rollback total e a exceção é propagada.
- Regras (research R4): upsert de conteúdo; remoção de itens de treino fora do seed; desativação de treinos e exercícios fora do seed; sequência e configurações só se ausentes; sessões nunca lidas para escrita.
- Configurações criadas: `activeProgramId` = programa com `isDefault`, `sequenceType = defaultSequenceType`, cronômetro desligado, 90 s.
- Valida o dataset antes de gravar (`ValidationError`): exercício de item inexistente no catálogo, dois programas `isDefault`, nenhum `isDefault`, `code` duplicado, bi-set sem par (item `BI-SET` sem vizinho `BI-SET`, ou com `notes` vazias ou sem a palavra "bi-set").

## `bootstrapDatabase`

```ts
bootstrapDatabase(db: Database): Promise<{ status: 'ready' } | { status: 'error'; error: Error }>
```

`runMigrations` → `runSeed`; nunca lança. Usado pelo `DatabaseGate` (001) antes de montar as rotas.

## Regras de conteúdo dos exercícios (ⓘ)

- Português (pt-BR), 1–2 frases por descrição, tom informativo.
- Descreve o movimento e o músculo-alvo; não cita carga, séries, técnica, "melhor" exercício nem recomendação.
- `primaryMuscle`: um músculo; `secondaryMuscles`: lista separada por vírgula (pode ser "Nenhum relevante" apenas se a ficha/ilustração não indicar outro).
- Para o Treino Padrão, referência: ilustrações de `docs/treino padrao/`.
