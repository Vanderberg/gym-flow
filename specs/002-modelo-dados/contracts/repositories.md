# Contrato: repositórios (portas do domínio)

Interfaces em `src/domain/<área>/`; implementações `Sqlite*Repository` em `src/data/repositories/`
(construtor recebe `Database` e `Clock`). Todos os métodos são assíncronos. `id` = `number`.

## Erros

```ts
class ValidationError extends Error {}  // peso negativo, dia da semana inválido, nome vazio…
class ConflictError extends Error {}    // sessão em andamento duplicada, nome de exercício duplicado, exclusão de item referenciado
class NotFoundError extends Error {}
```

Violações de constraint do SQLite são traduzidas para esses erros; nunca vazam mensagens cruas do driver.

## ProgramRepository

```ts
listPrograms(opts?: { includeInactive?: boolean }): Promise<TrainingProgram[]>
getProgram(id: number): Promise<TrainingProgram | null>
listWorkouts(programId: number): Promise<Workout[]>                        // ordenado por position
getWorkoutWithExercises(workoutId: number): Promise<WorkoutDetail | null>  // exercícios por display_order, com prescrição/técnica/notas e dados do exercício
upsertProgram(input: ProgramInput): Promise<TrainingProgram>              // chave: name
upsertWorkout(input: WorkoutInput): Promise<Workout>                       // chave: (programId, code)
upsertWorkoutExercise(input: WorkoutExerciseInput): Promise<void>          // chave: (workoutId, exerciseId)
deactivateProgram(id) / deactivateWorkout(id): Promise<void>               // nunca exclui
```

## ExerciseRepository

```ts
getById(id: number): Promise<Exercise | null>
findByName(name: string): Promise<Exercise | null>   // busca por name_key = normalizeName(name)
upsertByName(input: ExerciseInput): Promise<Exercise> // reaproveita o existente pela name_key (mantém o name original); nunca cria duplicata
deactivate(id: number): Promise<void>
```

## ScheduleRepository

```ts
getSchedule(programId: number): Promise<WeeklyScheduleEntry[]>                 // 1..7; workoutId null = sem treino
getEntry(programId: number, weekday: number): Promise<WeeklyScheduleEntry | null>
upsertEntry(input: { programId; weekday /*1=seg..7=dom*/; workoutId: number | null; optional: boolean; note: string | null }): Promise<void>
   // ValidationError se weekday fora de 1..7 ou se workoutId não pertence ao programId
```

## SequenceStateRepository

```ts
get(programId: number): Promise<ProgramSequenceState | null>
upsert(programId: number, currentPosition: number): Promise<void>   // posição ≥ 1
```

## SettingsRepository

```ts
get(): Promise<AppSettings | null>                      // null antes do seed
save(settings: AppSettingsInput): Promise<AppSettings>   // registro único id = 1
```

## SessionRepository

```ts
startSession(programId: number, workoutId: number): Promise<WorkoutSession>
   // transação: sessão + 1 linha por exercício do treino (desmarcadas, sem peso)
   // ConflictError se já há sessão em andamento; ValidationError se o treino não pertence ao programa ou se programa/treino estão inativos
getInProgress(): Promise<WorkoutSessionDetail | null>
getSession(id: number): Promise<WorkoutSessionDetail | null>   // com linhas de exercício
listFinished(opts?: { programId?: number }): Promise<WorkoutSession[]>   // mais recente primeiro
setExerciseCompleted(sessionId: number, exerciseId: number, completed: boolean): Promise<void>
setExerciseWeight(sessionId: number, exerciseId: number, weight: number | null): Promise<void>   // ValidationError se < 0
   // ambos: NotFoundError se a sessão não tem linha para o exercício
finishSession(sessionId: number, finishedAt?: string): Promise<void>     // marca finalizada; NÃO mexe na sequência (use case da 007 orquestra na mesma transação)
discardSession(sessionId: number): Promise<void>                          // apaga sessão em andamento e linhas; ConflictError se finalizada
getLastWeight(programId: number, exerciseId: number): Promise<number | null>   // derivada, mesmo programa
```

Edição de sessão finalizada usa `setExerciseCompleted`/`setExerciseWeight` (permitidos em finalizadas); programa e
treino nunca mudam.

## Transações compostas

Repositórios aceitam um `Database` transacional: use cases (spec 007) chamam `db.transaction(tx => …)` construindo
repositórios sobre `tx` para compor `finishSession` + `SequenceStateRepository.upsert` atomicamente.

## Utilitário de datas (`src/utils/localDate.ts`)

```ts
type Clock = () => Date
normalizeName(name: string): string     // src/utils/normalizeName.ts — chave de unicidade do exercício
nowLocalIso(clock?: Clock): string      // "2026-09-20T18:30:00-03:00"
localDateOf(iso: string): string        // "2026-09-20" (fatia da string; sem conversão UTC)
```
