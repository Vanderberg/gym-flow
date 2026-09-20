# Modelo de Dados --- App de Controle de Treinos

## 1. Entidades

``` text
TrainingProgram
    │
    ├── Workout
    │      │
    │      └── WorkoutExercise
    │                 └── Exercise
    │
    ├── WeeklySchedule
    │
    └── ProgramSequenceState

WorkoutSession
    │
    └── WorkoutSessionExercise
              └── Exercise

AppSettings
```

------------------------------------------------------------------------

# 2. TrainingProgram

Representa um programa completo.

  Campo         Tipo
  ------------- ---------
  id            INTEGER
  name          TEXT
  description   TEXT
  active        INTEGER
  created_at    TEXT
  updated_at    TEXT

Exemplos:

``` text
Treino Padrão
Treino Monstro
```

------------------------------------------------------------------------

# 3. Workout

Representa um treino dentro de um programa.

  Campo        Tipo
  ------------ ---------
  id           INTEGER
  program_id   INTEGER
  code         TEXT
  name         TEXT
  position     INTEGER
  active       INTEGER

Exemplos:

``` text
Programa: Treino Padrão
1 / Dia 1 / Peito e Tríceps
2 / Dia 2 / Costas e Bíceps
```

ou:

``` text
Programa: Treino Monstro
A / Ombros completos
B / Costas e Bíceps
C / Pernas completas
D / Peito e Tríceps
```

------------------------------------------------------------------------

# 4. Exercise

Entidade reutilizável.

  Campo          Tipo
  -------------- ---------
  id             INTEGER
  name           TEXT
  muscle_group   TEXT
  active         INTEGER

------------------------------------------------------------------------

# 5. WorkoutExercise

Relaciona exercício ao treino.

  Campo           Tipo
  --------------- ---------
  id              INTEGER
  workout_id      INTEGER
  exercise_id     INTEGER
  display_order   INTEGER
  prescription    TEXT
  technique       TEXT
  notes           TEXT

`prescription` permite valores como:

``` text
3 × 10–12
4 × 8
3 × 6/8/10
3 × até a falha
```

`technique` pode conter:

``` text
DROP-SET
BI-SET
PIRÂMIDE CRESCENTE
PIRÂMIDE DECRESCENTE
PROGRESSÃO DE CARGA
```

O aplicativo exibe esses dados e não precisa interpretá-los.

------------------------------------------------------------------------

# 6. WeeklySchedule

Define a agenda para programas que utilizam sequência semanal.

  Campo        Tipo
  ------------ ---------
  id           INTEGER
  program_id   INTEGER
  weekday      INTEGER
  workout_id   INTEGER
  optional     INTEGER

Exemplo:

``` text
1 → Segunda → A
2 → Terça → B
3 → Quarta → NULL
4 → Quinta → C
5 → Sexta → D
6 → Sábado → NULL / opcional
7 → Domingo → NULL
```

------------------------------------------------------------------------

# 7. ProgramSequenceState

Guarda o estado de sequência contínua de cada programa.

  Campo              Tipo
  ------------------ ---------
  id                 INTEGER
  program_id         INTEGER
  current_position   INTEGER
  updated_at         TEXT

`current_position` aponta para o próximo treino.

------------------------------------------------------------------------

# 8. WorkoutSession

Registro de uma sessão.

  Campo         Tipo
  ------------- ---------
  id            INTEGER
  program_id    INTEGER
  workout_id    INTEGER
  started_at    TEXT
  finished_at   TEXT
  completed     INTEGER
  created_at    TEXT
  updated_at    TEXT

------------------------------------------------------------------------

# 9. WorkoutSessionExercise

Estado de cada exercício naquela sessão.

  Campo         Tipo
  ------------- ---------
  id            INTEGER
  session_id    INTEGER
  exercise_id   INTEGER
  completed     INTEGER
  weight        REAL
  updated_at    TEXT

Não registrar repetições realizadas.

------------------------------------------------------------------------

# 10. AppSettings

  Campo                Tipo
  -------------------- ---------
  id                   INTEGER
  active_program_id    INTEGER
  sequence_type        TEXT
  rest_timer_enabled   INTEGER
  rest_timer_seconds   INTEGER
  updated_at           TEXT

Valores de `sequence_type`:

``` text
CONTINUOUS
WEEKLY
```

------------------------------------------------------------------------

# 11. Regras

-   Um programa possui vários treinos.
-   Um treino pertence a exatamente um programa.
-   Um treino possui vários exercícios.
-   Um exercício pode ser reutilizado em vários treinos.
-   Uma sessão pertence a um programa e a um treino.
-   Sessões antigas não mudam quando o programa atual muda.
-   O estado de sequência contínua é separado por programa.
-   Agenda semanal pertence ao programa.
-   Estatísticas usam apenas sessões finalizadas.
-   O nome do exercício é único, sem diferenciar maiúsculas/minúsculas.
-   Programa, treino e exercício usados em sessão nunca são excluídos: são desativados (`active = 0`).
-   Ao iniciar uma sessão, é criada uma linha em `workout_session_exercise` para cada exercício do treino.
-   Existe no máximo uma sessão em andamento.
-   Datas e horas são texto ISO local com deslocamento de fuso.

------------------------------------------------------------------------

# 12. Última carga

Não armazenar `last_weight` no exercício.

Buscar a última sessão finalizada do mesmo programa/exercício com peso
preenchido.

Isso evita dados duplicados.

------------------------------------------------------------------------

# 13. Exemplo SQL

``` sql
CREATE TABLE training_program (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE workout (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (program_id) REFERENCES training_program(id),
    UNIQUE(program_id, code)
);

CREATE TABLE exercise (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL COLLATE NOCASE UNIQUE,
    muscle_group TEXT,
    active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE workout_exercise (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    display_order INTEGER NOT NULL,
    prescription TEXT,
    technique TEXT,
    notes TEXT,
    FOREIGN KEY (workout_id) REFERENCES workout(id),
    FOREIGN KEY (exercise_id) REFERENCES exercise(id),
    UNIQUE(workout_id, exercise_id)
);

CREATE TABLE weekly_schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    weekday INTEGER NOT NULL,
    workout_id INTEGER,
    optional INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (program_id) REFERENCES training_program(id),
    FOREIGN KEY (workout_id) REFERENCES workout(id),
    UNIQUE(program_id, weekday)
);

CREATE TABLE program_sequence_state (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL UNIQUE,
    current_position INTEGER NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (program_id) REFERENCES training_program(id)
);

CREATE TABLE workout_session (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    workout_id INTEGER NOT NULL,
    started_at TEXT NOT NULL,
    finished_at TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (program_id) REFERENCES training_program(id),
    FOREIGN KEY (workout_id) REFERENCES workout(id)
);

CREATE TABLE workout_session_exercise (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    weight REAL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES workout_session(id),
    FOREIGN KEY (exercise_id) REFERENCES exercise(id),
    UNIQUE(session_id, exercise_id)
);

CREATE TABLE app_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    active_program_id INTEGER NOT NULL,
    sequence_type TEXT NOT NULL,
    rest_timer_enabled INTEGER NOT NULL DEFAULT 0,
    rest_timer_seconds INTEGER NOT NULL DEFAULT 90,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (active_program_id) REFERENCES training_program(id)
);

-- no máximo uma sessão em andamento
CREATE UNIQUE INDEX ux_workout_session_in_progress
    ON workout_session ((1)) WHERE completed = 0 AND finished_at IS NULL;
```

# 14. Conteúdo educativo do exercício

Adicionar ao `Exercise`:

| Campo | Tipo |
|---|---|
| primary_muscle | TEXT |
| secondary_muscles | TEXT |
| description | TEXT |

Exemplo:

```text
Supino reto
Principal: Peitoral maior
Secundários: Tríceps, Deltoide anterior
Descrição: Exercício de empurrar que enfatiza o peitoral.
```

A legenda das técnicas pode ser conteúdo estático da aplicação:

```ts
type TechniqueLegend = {
  key: string;
  title: string;
  description: string;
};
```

Separação:

```text
Exercise
  → informações sobre movimento e músculos

WorkoutExercise
  → prescrição do programa

WorkoutSessionExercise
  → o que foi realizado
```


# 15. Conteúdo textual do programa (fichas)

Campos de texto opcionais para conteúdo que vem da ficha do programa, exibido
sem interpretação:

| Tabela             | Campo             | Tipo | Uso                                                         |
| ------------------ | ----------------- | ---- | ----------------------------------------------------------- |
| `workout`          | `warmup_note`     | TEXT | nota de aquecimento livre (não é exercício)                 |
| `weekly_schedule`  | `note`            | TEXT | texto do dia opcional (ex.: abdominais supra/infra e oblíquos) |
| `training_program` | `home_suggestion` | TEXT | sugestão exibida na Home (ex.: cardio)                      |

```sql
ALTER TABLE workout ADD COLUMN warmup_note TEXT;
ALTER TABLE weekly_schedule ADD COLUMN note TEXT;
ALTER TABLE training_program ADD COLUMN home_suggestion TEXT;
```

Bi-set: cada exercício do par é uma linha própria em `workout_exercise`, com
`technique = 'BI-SET'` e `notes` indicando o parceiro. Não existe entidade de
"par"; a proximidade de `display_order` os agrupa visualmente.


# 16. Decisões de integridade e formato

## Linhas de exercício da sessão

Ao iniciar a sessão, o app cria uma linha em `workout_session_exercise` para **cada**
exercício do treino, com `completed = 0` e `weight = NULL`. Marcar ou informar peso apenas
atualiza a linha. Assim o histórico mostra a lista completa daquele dia, inclusive o que não
foi feito, mesmo que a ficha mude depois. A criação da sessão e dessas linhas é uma única
transação.

## Desativar em vez de excluir

`training_program`, `workout` e `exercise` usados em alguma sessão são apenas desativados
(`active = 0`). As chaves estrangeiras das sessões não têm `ON DELETE CASCADE` (comportamento
`RESTRICT`), e `PRAGMA foreign_keys = ON` é ativado em toda conexão, de modo que a exclusão
física de um item referenciado por sessão é rejeitada pelo banco.

## Identidade do exercício

`exercise.name` é `UNIQUE` sem diferenciar maiúsculas/minúsculas (`COLLATE NOCASE`). O seed
reaproveita o exercício pelo nome. Variações reais recebem um nome diferente (ex.: "Tríceps
testa" e "Tríceps testa unilateral no cross").

## Formato de datas

`created_at`, `updated_at`, `started_at` e `finished_at` guardam texto ISO 8601 com hora
**local** e deslocamento do fuso, por exemplo `2026-09-20T18:30:00-03:00`. O dia local de uma
sessão é a parte de data do texto gravado, sem conversão para UTC. O texto ordena
cronologicamente enquanto o deslocamento for o mesmo; para ordem estrita, comparar o instante.

## Uma sessão em andamento

O índice único parcial `ux_workout_session_in_progress` (seção 13) garante no schema que só
existe uma sessão com `completed = 0` e `finished_at IS NULL`. Sessão descartada é removida
(não finalizada), portanto não conta como histórico.
