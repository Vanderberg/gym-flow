# Modelo de Dados --- App de Controle de Treinos

## 1. Visão geral

O modelo precisa representar:

-   treinos;
-   exercícios;
-   sessões realizadas;
-   exercícios realizados;
-   peso;
-   sequência atual;
-   configurações.

O banco será SQLite.

------------------------------------------------------------------------

# 2. Entidades

``` text
WorkoutPlan
    │
    └── WorkoutExercise
              │
              └── Exercise

WorkoutSession
    │
    └── WorkoutSessionExercise
              │
              └── Exercise

SequenceState
Settings
```

------------------------------------------------------------------------

# 3. WorkoutPlan

Representa um dos cinco treinos.

Campos:

  Campo        Tipo      Descrição
  ------------ --------- ---------------
  id           INTEGER   Identificador
  day_number   INTEGER   Dia 1--5
  name         TEXT      Nome
  active       INTEGER   Ativo/inativo

Exemplo:

``` text
1 | 1 | Peito e Tríceps | 1
2 | 2 | Costas e Bíceps | 1
```

`day_number` deve ser único.

------------------------------------------------------------------------

# 4. Exercise

Representa um exercício.

  Campo          Tipo      Descrição
  -------------- --------- ----------------------
  id             INTEGER   Identificador
  name           TEXT      Nome
  muscle_group   TEXT      Grupo muscular
  sets           INTEGER   Número de séries
  min_reps       INTEGER   Mínimo de repetições
  max_reps       INTEGER   Máximo de repetições
  active         INTEGER   Ativo/inativo

Exemplo:

``` text
Supino
Peito
3
10
12
```

------------------------------------------------------------------------

# 5. WorkoutPlanExercise

Relaciona um treino aos seus exercícios.

  Campo             Tipo
  ----------------- ---------
  id                INTEGER
  workout_plan_id   INTEGER
  exercise_id       INTEGER
  display_order     INTEGER

`display_order` representa a ordem visual padrão.

Não representa a ordem obrigatória de execução.

------------------------------------------------------------------------

# 6. WorkoutSession

Representa uma realização de um treino.

  Campo             Tipo      Descrição
  ----------------- --------- ---------------
  id                INTEGER   Identificador
  workout_plan_id   INTEGER   Treino
  day_number        INTEGER   Dia executado
  started_at        TEXT      Início
  finished_at       TEXT      Fim
  completed         INTEGER   Finalizado
  created_at        TEXT      Criação
  updated_at        TEXT      Atualização

Mesmo que apenas 1 exercício seja feito, se o usuário finalizar a
sessão:

`completed = 1`

------------------------------------------------------------------------

# 7. WorkoutSessionExercise

Representa o estado de um exercício naquela sessão.

  Campo                Tipo
  -------------------- ---------
  id                   INTEGER
  workout_session_id   INTEGER
  exercise_id          INTEGER
  completed            INTEGER
  weight               REAL
  updated_at           TEXT

`weight` pode ser nulo caso o usuário não tenha informado a carga.

Não existe campo para repetições realizadas.

------------------------------------------------------------------------

# 8. SequenceState

Representa o estado atual da sequência.

  Campo                     Tipo
  ------------------------- ---------
  id                        INTEGER
  current_day               INTEGER
  last_workout_session_id   INTEGER
  updated_at                TEXT

Deve existir apenas um registro ativo.

Exemplo:

``` text
current_day = 3
```

significa que o próximo treino é Dia 3.

------------------------------------------------------------------------

# 9. Settings

Configurações do aplicativo.

  Campo                Tipo
  -------------------- ---------
  id                   INTEGER
  rest_timer_enabled   INTEGER
  rest_timer_seconds   INTEGER
  updated_at           TEXT

Exemplo:

``` text
rest_timer_enabled = 1
rest_timer_seconds = 90
```

------------------------------------------------------------------------

# 10. Relacionamentos

``` text
WorkoutPlan
    1 ───── N WorkoutPlanExercise
                  N ───── 1 Exercise

WorkoutPlan
    1 ───── N WorkoutSession

WorkoutSession
    1 ───── N WorkoutSessionExercise
                  N ───── 1 Exercise
```

------------------------------------------------------------------------

# 11. Regras de integridade

-   `WorkoutPlan.day_number` deve ser único.
-   `WorkoutPlanExercise` não deve duplicar o mesmo exercício dentro do
    mesmo treino.
-   `WorkoutSessionExercise` não deve duplicar exercício dentro da mesma
    sessão.
-   `SequenceState.current_day` deve estar entre 1 e 5.
-   Peso deve ser `NULL` ou maior/igual a zero.
-   Sessões descartadas não devem aparecer nas estatísticas.
-   Somente sessões finalizadas entram nas estatísticas.

------------------------------------------------------------------------

# 12. Exemplo de schema SQL

``` sql
CREATE TABLE workout_plan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    day_number INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE exercise (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    muscle_group TEXT,
    sets INTEGER NOT NULL,
    min_reps INTEGER NOT NULL,
    max_reps INTEGER NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE workout_plan_exercise (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_plan_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    display_order INTEGER NOT NULL,
    FOREIGN KEY (workout_plan_id) REFERENCES workout_plan(id),
    FOREIGN KEY (exercise_id) REFERENCES exercise(id),
    UNIQUE(workout_plan_id, exercise_id)
);

CREATE TABLE workout_session (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_plan_id INTEGER NOT NULL,
    day_number INTEGER NOT NULL,
    started_at TEXT NOT NULL,
    finished_at TEXT,
    completed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (workout_plan_id) REFERENCES workout_plan(id)
);

CREATE TABLE workout_session_exercise (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_session_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    weight REAL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (workout_session_id) REFERENCES workout_session(id),
    FOREIGN KEY (exercise_id) REFERENCES exercise(id),
    UNIQUE(workout_session_id, exercise_id)
);

CREATE TABLE sequence_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    current_day INTEGER NOT NULL,
    last_workout_session_id INTEGER,
    updated_at TEXT NOT NULL
);

CREATE TABLE settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    rest_timer_enabled INTEGER NOT NULL DEFAULT 0,
    rest_timer_seconds INTEGER NOT NULL DEFAULT 90,
    updated_at TEXT NOT NULL
);
```

------------------------------------------------------------------------

# 13. Estatísticas

As estatísticas não precisam de tabelas próprias no MVP.

Serão calculadas a partir de `workout_session`.

Exemplo:

``` sql
SELECT COUNT(*)
FROM workout_session
WHERE completed = 1
AND started_at >= ?
AND started_at < ?;
```

A média semanal pode ser calculada dividindo a quantidade de sessões
pelo número de semanas do período.

O cálculo deve ser centralizado em um serviço de estatísticas.

------------------------------------------------------------------------

# 14. Última carga

Para exibir a última carga de um exercício:

1.  Buscar sessões finalizadas.
2.  Filtrar pelo exercício.
3.  Ordenar por data decrescente.
4.  Retornar o último peso não nulo.

Não existe uma coluna `last_weight` no exercício, evitando duplicação de
estado.
