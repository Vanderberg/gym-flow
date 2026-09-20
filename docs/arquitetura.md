# Arquitetura --- App de Controle de Treinos

## 1. Stack

-   React Native
-   TypeScript
-   Expo
-   Expo Router
-   SQLite
-   Zustand
-   Jest
-   React Native Testing Library
-   ESLint
-   Prettier

------------------------------------------------------------------------

# 2. Conceito arquitetural

O domínio principal é:

``` text
TrainingProgram
      │
      ├── Workout
      │      └── Exercise
      │
      └── SequenceStrategy
```

Uma sessão registra:

``` text
WorkoutSession
 ├── Program
 ├── Workout
 ├── Date/time
 └── Exercise executions
```

------------------------------------------------------------------------

# 3. Separação entre programa e sequência

O sistema não deve associar um programa diretamente a uma única
estratégia.

``` text
Programa
    +
Estratégia de sequência
    ↓
NextWorkoutResolver
```

Exemplo:

``` text
Treino Padrão + CONTINUOUS
→ próximo treino pelo índice da sequência

Treino Monstro + WEEKLY
→ próximo treino pela agenda semanal
```

------------------------------------------------------------------------

# 4. Estratégias

Criar uma abstração:

``` ts
interface SequenceStrategy {
  getNextWorkout(
    context: SequenceContext
  ): Promise<WorkoutReference | null>;
}
```

Implementações iniciais:

``` text
ContinuousSequenceStrategy
WeeklyScheduleSequenceStrategy
```

Isso evita `if/else` espalhado pela aplicação.

------------------------------------------------------------------------

# 5. ContinuousSequenceStrategy

Responsável por:

-   descobrir o próximo treino;
-   avançar índice;
-   reiniciar sequência.

Regra:

``` text
currentIndex + 1

se chegar ao fim:
volta para 0
```

------------------------------------------------------------------------

# 6. WeeklyScheduleSequenceStrategy

Responsável por:

-   descobrir o dia atual;
-   consultar agenda;
-   retornar o treino programado.

Exemplo:

``` text
MONDAY    → A
TUESDAY   → B
WEDNESDAY → null
THURSDAY  → C
FRIDAY    → D
SATURDAY  → optional
SUNDAY    → null
```

Importante: `null` significa que não existe treino programado para
aquele dia.

Isso não cria uma sessão automaticamente.

------------------------------------------------------------------------

# 7. Estrutura de diretórios

``` text
src/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── workout.tsx
│   ├── history.tsx
│   ├── statistics.tsx
│   └── settings.tsx
│
├── domain/
│   ├── program/
│   ├── workout/
│   ├── exercise/
│   ├── sequence/
│   │   ├── strategies/
│   │   └── services/
│   ├── session/
│   └── statistics/
│
├── application/
│   ├── program/
│   ├── workout/
│   ├── sequence/
│   ├── session/
│   └── statistics/
│
├── data/
│   ├── database/
│   ├── repositories/
│   ├── migrations/
│   └── seed/
│
├── store/
│   ├── workoutStore.ts
│   ├── settingsStore.ts
│   └── sessionStore.ts
│
├── components/
├── hooks/
├── utils/
└── constants/
```

------------------------------------------------------------------------

# 8. Camadas

## Presentation

Telas, componentes e navegação.

## Application

Casos de uso.

Exemplos:

-   SelectProgram;
-   SelectSequenceStrategy;
-   StartWorkout;
-   CompleteExercise;
-   FinishWorkout;
-   ResetSequence;
-   EditWorkoutSession;
-   GetStatistics.

## Domain

Regras de negócio puras.

## Data

SQLite, repositories, migrations e seed.

------------------------------------------------------------------------

# 9. Estado

Zustand:

-   sessão atual;
-   exercício selecionado;
-   cronômetro;
-   estado temporário de UI;
-   configurações carregadas.

SQLite:

-   programas;
-   treinos;
-   exercícios;
-   agenda;
-   sessões;
-   pesos;
-   sequência;
-   configurações persistentes.

------------------------------------------------------------------------

# 10. Navegação

``` text
Home
├── Workout
├── History
├── Statistics
└── Settings
```

Settings:

``` text
Settings
├── Program selection
├── Sequence type
├── Weekly schedule
└── Timer
```

------------------------------------------------------------------------

# 11. Persistência

SQLite é a fonte de verdade.

Toda sessão deve ser persistida antes de ser considerada finalizada.

------------------------------------------------------------------------

# 12. Transição de programa

Ao alterar o programa:

1.  finalizar/impedir alteração se houver sessão incompatível em
    andamento;
2.  atualizar programa ativo;
3.  carregar a estratégia configurada;
4.  determinar próximo treino;
5.  manter histórico.

A troca não deve modificar sessões antigas.

------------------------------------------------------------------------

# 13. Mudança de estratégia

Ao alterar:

``` text
CONTINUOUS → WEEKLY
```

ou:

``` text
WEEKLY → CONTINUOUS
```

o histórico permanece.

A estratégia passa a ser aplicada somente para determinar próximos
treinos.

Para `CONTINUOUS`, o estado de sequência deve ser mantido por programa.

------------------------------------------------------------------------

# 14. Estado de sequência por programa

Recomendação importante:

Cada programa deve possuir seu próprio estado de sequência.

Exemplo:

``` text
Treino Padrão
current_position = Dia 3

Treino Monstro
agenda semanal
```

Ao voltar para um programa, ele retoma seu próprio contexto.

------------------------------------------------------------------------

# 15. Testes

Testar isoladamente:

-   sequência contínua;
-   sequência semanal;
-   troca de programa;
-   troca de estratégia;
-   reinício;
-   datas;
-   estatísticas;
-   persistência.

# 16. Conteúdo educativo e ajuda contextual

O domínio `Exercise` deve suportar:

```text
primary_muscle
secondary_muscles
description
```

Enquanto `WorkoutExercise` continua representando como o exercício foi prescrito:

```text
Exercise
├── nome
├── músculos
└── descrição

WorkoutExercise
├── prescrição
├── técnica
└── observações
```

Componentes sugeridos:

```text
HelpIcon
InfoIcon
LegendSheet
MuscleInfoSheet
```

A abertura das sheets não altera o estado da sessão.

O banco pode receber:

```sql
ALTER TABLE exercise ADD COLUMN primary_muscle TEXT;
ALTER TABLE exercise ADD COLUMN secondary_muscles TEXT;
ALTER TABLE exercise ADD COLUMN description TEXT;
```
