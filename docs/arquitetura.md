# Arquitetura --- App de Controle de Treinos

## 1. Objetivo

Definir uma arquitetura simples, modular e adequada para um aplicativo
pessoal multiplataforma usando React Native.

## 2. Stack

-   React Native
-   TypeScript
-   Expo
-   Expo Router
-   SQLite
-   Zustand
-   React Native Testing Library
-   Jest
-   ESLint
-   Prettier

A implementação deve priorizar dependências pequenas e maduras.

------------------------------------------------------------------------

# 3. Princípios

## 3.1 Offline-first

Toda funcionalidade essencial deve funcionar sem internet.

O banco local é a fonte de verdade do MVP.

## 3.2 Local-first

Não haverá backend inicialmente.

``` text
UI
 ↓
Hooks / Application
 ↓
Services
 ↓
Repositories
 ↓
SQLite
```

## 3.3 Domínio independente da interface

As regras de sequência, finalização e estatísticas não devem ficar
diretamente nos componentes React.

## 3.4 Evolução futura

A arquitetura deve permitir futuramente adicionar:

-   backup;
-   sincronização;
-   exportação;
-   cloud;
-   autenticação.

Essas funcionalidades não fazem parte do MVP.

------------------------------------------------------------------------

# 4. Estrutura de diretórios

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
├── components/
│   ├── ExerciseCard/
│   ├── WorkoutCard/
│   ├── Timer/
│   ├── StatCard/
│   └── common/
│
├── domain/
│   ├── workout/
│   │   ├── entities/
│   │   ├── services/
│   │   └── types/
│   ├── exercise/
│   ├── sequence/
│   └── statistics/
│
├── application/
│   ├── workout/
│   ├── sequence/
│   ├── history/
│   └── statistics/
│
├── data/
│   ├── database/
│   ├── repositories/
│   ├── mappers/
│   └── seed/
│
├── store/
│   ├── workoutStore.ts
│   ├── sequenceStore.ts
│   └── settingsStore.ts
│
├── hooks/
│   ├── useWorkout.ts
│   ├── useSequence.ts
│   ├── useHistory.ts
│   └── useStatistics.ts
│
├── utils/
│   ├── date.ts
│   ├── format.ts
│   └── calculations.ts
│
└── constants/
    └── ...
```

------------------------------------------------------------------------

# 5. Camadas

## Presentation

Responsável por:

-   telas;
-   componentes;
-   interação;
-   navegação.

Não deve conter regras complexas de negócio.

## Application

Orquestra casos de uso:

-   iniciar treino;
-   marcar exercício;
-   finalizar treino;
-   reiniciar sequência;
-   editar sessão.

## Domain

Contém regras puras:

-   cálculo do próximo dia;
-   validação de sequência;
-   cálculo de frequência;
-   cálculo de cadência.

## Data

Responsável por:

-   SQLite;
-   repositories;
-   migrations;
-   seed;
-   conversão banco ↔ domínio.

------------------------------------------------------------------------

# 6. Estado

Zustand será usado para estado de interface e sessão em andamento.

Não deve substituir o banco como persistência principal.

Exemplo:

``` text
Zustand
- sessão atual
- exercício selecionado
- cronômetro
- estado temporário de UI

SQLite
- treinos
- exercícios
- sessões
- registros de execução
- configurações persistentes
- sequência
```

------------------------------------------------------------------------

# 7. Navegação

Usar Expo Router.

Rotas principais:

``` text
/
├── index
├── workout
├── history
├── statistics
└── settings
```

Fluxo:

``` text
Home
  ↓
Começar treino
  ↓
Workout
  ↓
Finalizar
  ↓
Home
```

------------------------------------------------------------------------

# 8. Persistência

SQLite será utilizado para:

-   dados dos treinos;
-   exercícios;
-   sessões;
-   execução dos exercícios;
-   sequência;
-   configurações.

As migrations devem ser versionadas.

------------------------------------------------------------------------

# 9. Seed inicial

Na primeira execução:

1.  Criar banco.
2.  Executar migrations.
3.  Inserir os cinco treinos.
4.  Inserir exercícios.
5.  Criar estado inicial da sequência com Dia 1.

O seed deve ser idempotente.

------------------------------------------------------------------------

# 10. Regra de sequência

A lógica deve estar em serviço puro.

Exemplo conceitual:

``` ts
function nextWorkoutDay(currentDay: number): number {
  return currentDay === 5 ? 1 : currentDay + 1;
}
```

Reinício:

``` ts
function resetSequence(): number {
  return 1;
}
```

Nenhuma dessas regras deve depender de React.

------------------------------------------------------------------------

# 11. Finalização

Ao finalizar uma sessão:

``` text
1. Persistir estado dos exercícios.
2. Criar/atualizar WorkoutSession.
3. Marcar como completed.
4. Calcular próximo dia.
5. Atualizar SequenceState.
6. Limpar sessão em andamento.
```

Essa operação deve ser transacional no banco sempre que possível.

------------------------------------------------------------------------

# 12. Estatísticas

As estatísticas devem ser calculadas a partir das sessões finalizadas.

Não contar:

-   sessões descartadas;
-   sessões incompletas ainda abertas.

Uma sessão pode ter exercícios incompletos e ainda assim contar como
treino se foi finalizada.

------------------------------------------------------------------------

# 13. Datas

Usar uma representação consistente para:

-   início;
-   término;
-   data do treino.

Para estatísticas por calendário, trabalhar com a data local do usuário.

Evitar conversões que façam um treino aparecer em outro dia por causa de
UTC.

------------------------------------------------------------------------

# 14. Testes

Prioridade de testes:

### Unitários

-   sequência;
-   reinício;
-   cálculo de média;
-   intervalo médio;
-   filtros de período.

### Integração

-   criação de sessão;
-   finalização;
-   persistência;
-   recuperação de sessão.

### UI

-   iniciar treino;
-   marcar exercício;
-   registrar peso;
-   finalizar;
-   editar histórico.

------------------------------------------------------------------------

# 15. Segurança e privacidade

Como o MVP é local:

-   nenhum dado precisa sair do aparelho;
-   não existe conta;
-   não existe coleta remota.

O aplicativo não deve solicitar permissões desnecessárias.

------------------------------------------------------------------------

# 16. Evolução futura

Se no futuro for necessário sincronizar:

``` text
React Native
      ↓
Application / Domain
      ↓
Repository Interface
      ↓
Local Repository
      +
Remote Repository
```

O domínio não deverá depender diretamente de SQLite ou de uma API.
