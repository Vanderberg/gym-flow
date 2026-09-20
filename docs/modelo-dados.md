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
    name TEXT NOT NULL,
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
