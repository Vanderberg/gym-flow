# Research: Home e Próximo Treino

## D1 — Composição em um caso de uso e uma função pura
- **Decision**: `GetHomeState` carrega settings, programa, treinos, estado, agenda, sessão em andamento e sessões finalizadas do programa; chama `GetNextWorkout` (004) e passa tudo a `buildHomeView`, que decide o estado exibido.
- **Rationale**: a precedência dos estados é regra de negócio (constituição II) e precisa de teste sem banco. A UI só renderiza a `HomeView`.
- **Alternatives**: decidir na tela com vários `if` (regra na apresentação, difícil de testar).

## D2 — Precedência dos estados
- **Decision**: 1) sessão em andamento (`IN_PROGRESS`); 2) resultado do próximo treino: `WORKOUT` (com `doneToday` na semanal), `NONE/REST`, `NONE/OPTIONAL_DAY`, `NONE/NO_SCHEDULE`, `NONE/NO_WORKOUTS`. Com sessão em andamento não há botão de iniciar outro treino (US3 cenário 3), nem "Ver treinos do programa".
- **Rationale**: FR-005 e "sessão em andamento é única".

## D3 — "Concluído hoje" (clarificação)
- **Decision**: `doneToday = true` se existir sessão finalizada do mesmo `programId` e `workoutId` com `localDateOf(finishedAt)` igual à data local de hoje; só na semanal. O botão continua disponível.
- **Rationale**: FR-002a; usa `SessionRepository.listFinished({ programId })` filtrado em memória (volume pequeno), sem consulta nova na 002.
- **Alternatives**: nova consulta SQL por data (otimização desnecessária; YAGNI).

## D4 — Iniciar treino e "Ver treinos do programa"
- **Decision**: `StartWorkout.execute(workoutId)` usa o programa ativo, valida que o treino é ativo e pertence a ele e chama `SessionRepository.startSession`. Sessão já em andamento → `ConflictError` da 002, exibido como "Já existe um treino em andamento" e a Home recarrega. A lista do "Ver treinos do programa" é um sheet com os treinos ativos; escolher um chama o mesmo `StartWorkout`. Após criar, navegar para `/workout` (tela da spec 007; nos testes o router é simulado).
- **Rationale**: FR-002/FR-002b; um único caminho de criação de sessão (SC-003).

## D5 — Descartar sessão
- **Decision**: `DiscardInProgressSession.execute()` lê a sessão em andamento e chama `discardSession`; a UI pede segunda confirmação. Não toca sequência nem estatísticas. Caso de uso reutilizável pela 005 (que hoje chama o repositório direto).
- **Rationale**: FR-005; camada `application/` (constituição II).

## D6 — SequenceRail e WeekStrip
- **Decision**: `buildSequenceRail(workouts, currentPosition)` devolve N passos com código, `state: 'DONE' | 'CURRENT' | 'PENDING'` (passos antes da posição atual = DONE, posição atual = CURRENT; posição ausente/inválida = primeiro é CURRENT). `buildWeekStrip(schedule, workouts, todayWeekday, doneWeekdays)` devolve 7 itens `{ weekday, label: código | '—' | 'opc.', isToday, hasSession }`; `doneWeekdays` vem das sessões finalizadas do programa cuja data local cai na semana corrente (segunda a domingo).
- **Rationale**: FR-001a e design §3; mesma regra de posição por valor `position` da 004.

## D7 — Reavaliar o dia
- **Decision**: `useHome` recarrega ao montar, ao voltar ao primeiro plano (`AppState` → `active`) e ao focar a aba; a `HomeView` guarda a data local usada e recarrega se ela mudou.
- **Rationale**: edge case da meia-noite.

## D8 — Diálogo de sessão pendente
- **Decision**: ao abrir o app com sessão em andamento, a Home mostra o cartão "TREINO EM ANDAMENTO" e, uma vez por abertura do app, o diálogo "Você possui um treino em andamento" com **Continuar** (primário) e **Descartar** (danger, segunda confirmação). Fechar o diálogo mantém o cartão com **CONTINUAR TREINO**.
- **Rationale**: US3 cenário 1 e design §4.3; a flag "já mostrado" vive no `homeStore` (estado de UI).

## D9 — Estado da Home
- **Decision**: `homeStore` (Zustand) guarda `HomeView`, `status` (`loading | ready | error`) e a flag do diálogo; nunca é fonte de verdade. Independente do `settingsStore` da 005 (ambos recarregam do SQLite).
- **Rationale**: constituição I; evita acoplar as duas telas.

## D10 — Texto dos dias e do cartão
- **Decision**: rótulo do dia por `weekdayLabel` (pt-BR, ex.: "QUINTA-FEIRA"); cartão mostra código + nome do treino e "N exercícios" (contagem de `getWorkoutWithExercises`). Texto opcional = `note` da agenda; sugestão = `homeSuggestion` do programa; ambos como estão.
- **Rationale**: FR-004/FR-006; "exercícios em resumo" = contagem, como no design.
