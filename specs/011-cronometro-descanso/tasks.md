---
description: "Task list for Cronômetro de Descanso"
---

# Tasks: Cronômetro de Descanso

**Input**: `specs/011-cronometro-descanso/` (plan.md, spec.md, research.md, data-model.md, contracts/use-cases.md, contracts/ui.md, quickstart.md)
**Backlog**: BL-043, BL-090, BL-091, BL-092
**Requisitos de produto**: RF-19
**Depende de**: specs 001–010 concluídas (repositório de configurações da 002, Configurações da 005, tela de treino da 007, ajuda da 008)
**Tests**: incluídos — a constituição (XI) exige testes de domínio, persistência e fluxos de UI. Escreva cada teste antes da implementação e veja-o falhar.
**Design**: tokens e componentes de `docs/design-telas.md` §2–3, §5.3 e §8 ("Placar de academia"). Nenhuma tela usa cor, tamanho ou espaçamento literal.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1 (configurar cronômetro), US2 (usar durante o treino)
- Cada fase lista os BL/RF que cobre; todo commit referencia o BL da tarefa (ex.: `feat(011): BL-092 ...`).

---

## Phase 1: Setup

- [ ] T001 Verificar que as specs 001–010 estão concluídas: `npm run check` passa e `specs/INDEX.md` marca `001` a `010` como `concluída`; se não, parar e avisar
- [ ] T002 [P] Criar as pastas com `.gitkeep` onde ainda não existirem: `src/domain/restTimer/`, `src/components/settings/`, `src/components/workout/`, `src/components/common/`, `src/store/`, `src/hooks/`, `tests/unit/domain/restTimer/`, `tests/unit/store/`, `tests/unit/hooks/`, `tests/unit/restTimer/`, `tests/ui/restTimer/`, `tests/integration/application/`

---

## Phase 2: Foundational (bloqueia todas as histórias)

**Purpose**: tipos, constantes e regras de duração (tudo puro e verde sozinho)

- [ ] T003 [P] Criar `src/domain/restTimer/types.ts` com `MIN_REST_SECONDS = 5`, `MAX_REST_SECONDS = 3600`, `DEFAULT_REST_SECONDS = 90`, `RestTimerState` (`IDLE`, `RUNNING { endsAt, durationMs }`, `PAUSED { remainingMs, durationMs }`, `FINISHED`), `TickResult` e `DurationParse` exatamente como em `data-model.md`
- [ ] T004 [P] Escrever `tests/unit/domain/restTimer/duration.test.ts` e implementar `src/domain/restTimer/duration.ts` (`parseDurationInput(text): DurationParse`, `validateDuration(seconds): boolean`, `formatMmSs(ms): string`): "01:30" e "1:30" → 90; "90" → 90; "00:05" → 5 e "60:00" → 3600 (limites válidos); "00:04", "60:01", "0", "-5" → `OUT_OF_RANGE`; vazio, "abc", "1:2:3", "1,5" → `INVALID`; `validateDuration` só para inteiros de 5 a 3600; `formatMmSs(90000)` = "01:30", `formatMmSs(0)` = "00:00", `formatMmSs(3600000)` = "60:00", arredonda para cima os milissegundos (89 999 ms → "01:30")

**Checkpoint**: T004 passa; `npm run check` verde.

---

## Phase 3: User Story 1 — Configurar cronômetro (P1) 🎯 MVP — BL-043, BL-090, BL-091 · RF-19

**Goal**: ativar/desativar o cronômetro e definir a duração do descanso em Configurações, com persistência.
**Independent Test**: alterar a configuração e reabrir o app (quickstart, itens 2–3).

### Tests

- [ ] T005 [P] [US1] Escrever `tests/integration/application/restTimerSettings.test.ts` (`createTestDb()` + seed): padrões `rest_timer_enabled = 0` e `rest_timer_seconds = 90`; `SetRestTimerEnabled(true)` persiste em nova conexão ao mesmo banco e só muda `rest_timer_enabled`; `SetRestTimerDuration(90)` persiste e só muda `rest_timer_seconds`; limites 5 e 3600 aceitos; 0, negativa, 4, 3601 e não inteiro lançam `ValidationError` sem gravar nada; nenhuma outra coluna de `app_settings` (programa ativo, tipo de sequência) muda; `workout_session*` e `program_sequence_state` intactos
- [ ] T006 [P] [US1] Escrever `tests/ui/restTimer/restTimerSettings.test.tsx` (RNTL, casos de uso simulados): em Configurações aparece a seção "DESCANSO" com "Cronômetro de descanso" (switch) e "Tempo de descanso" (valor "01:30" e `›`); "Tempo de descanso" fica desabilitado com o cronômetro desativado; ativar chama `SetRestTimerEnabled(true)` e o valor persiste ao remontar; tocar em "Tempo de descanso" abre o `RestDurationSheet` com o valor atual em mm:ss; salvar "02:00" chama `SetRestTimerDuration(120)` e a linha mostra "02:00"; "00:04", "60:01" e vazio mostram "Informe um tempo entre 00:05 e 60:00" ligada ao campo e não salvam; abrir e fechar o sheet não altera nada; depois de salvar o `settingsStore` é recarregado e a linha reflete o valor novo; sem regra de negócio no componente (só chama os casos de uso)

### Implementation

- [ ] T007 [P] [US1] Implementar `src/application/SetRestTimerEnabled.ts` e `src/application/SetRestTimerDuration.ts` conforme `contracts/use-cases.md` (`SettingsRepository.save` alterando só o campo correspondente; duração fora de 5–3600 ou não inteira → `ValidationError` sem gravar; sem `if` por programa) — faz T005 passar
- [ ] T008 [P] [US1] Criar (se ainda não existirem; senão só conferir) `src/constants/theme.ts` e `src/components/common/Sheet.tsx`/`Button.tsx`, e criar `src/components/common/Switch.tsx` (design §3/§8: alvo ≥ 48 dp, estado ligado/desligado por posição e ícone além da cor, `accessibilityRole="switch"`) e `src/components/settings/SettingsSwitchRow.tsx` (linha de 56 dp com rótulo e `Switch`, variante da `SettingsRow` da spec 005), só com tokens
- [ ] T009 [US1] Criar `src/components/settings/RestDurationSheet.tsx` sobre `Sheet` (campo mm:ss com teclado numérico, valor atual, `parseDurationInput`/`validateDuration`, mensagem "Informe um tempo entre 00:05 e 60:00" ligada ao campo, **Salvar** e **Cancelar**; só chama o callback com os segundos válidos) e acrescentar à `src/app/(tabs)/settings.tsx` a seção "DESCANSO" (`SettingsSwitchRow` "Cronômetro de descanso" e `SettingsRow` "Tempo de descanso" desabilitada com o cronômetro off), lendo e recarregando pelo `settingsStore`/`useSettings` da spec 005 e chamando `SetRestTimerEnabled`/`SetRestTimerDuration` — faz T006 passar

**Checkpoint**: US1 testável sozinha (não depende de US2); `npm run check` verde.

---

## Phase 4: User Story 2 — Usar durante o treino (P1) — BL-092 · RF-19

**Goal**: com o cronômetro ativo, marcar um exercício inicia a contagem; pausar, retomar e encerrar; aviso de fim; ⏱ no cabeçalho; nada altera a sessão. Depende da configuração da US1 (`SetRestTimerEnabled`) e da tela de treino da 007.
**Independent Test**: iniciar, pausar, retomar e encerrar em um treino, com o app em segundo plano e sem alterar dados (quickstart, itens 1, 3 e 4).

### Tests

- [ ] T010 [P] [US2] Escrever `tests/unit/domain/restTimer/restTimerMachine.test.ts` (relógio simulado, sem timers reais): `start(90, t)` → `RUNNING` com `endsAt = t + 90 000`; `remainingMs` cai com o relógio e nunca fica negativo; `pause` guarda `remainingMs` e `resume` continua de onde parou (`endsAt = now + remainingMs`); `start` durante `RUNNING`, `PAUSED` ou `FINISHED` reinicia da duração cheia; `evaluate` antes do fim mantém `RUNNING` (`justFinished = false`), no instante do fim e depois passa a `FINISHED`; `justFinished` só quando a observação vem até 1 500 ms depois do término (voltar de segundo plano 30 s depois → `FINISHED` com `justFinished = false`); `stop` e `dismiss` → `IDLE`; `pause` em `IDLE`/`FINISHED` e `resume` fora de `PAUSED` não mudam o estado; erro < 1 s após 5 minutos simulados, inclusive com salto do relógio de 5 min sem ticks intermediários (SC-002)
- [ ] T011 [P] [US2] Escrever `tests/unit/store/restTimerStore.test.ts` e `tests/unit/hooks/useRestTimer.test.ts` (relógio, `AppState` e `vibrate` simulados, timers falsos): o store guarda só o estado em memória (nada em SQLite) e começa em `IDLE`; `onExerciseMarked(true)` com o cronômetro ativo inicia (e reinicia se já em curso); `onExerciseMarked(false)` e com o cronômetro desativado não fazem nada; ao terminar com o app ativo chama `vibrate(400)` exatamente uma vez e o estado vai a `FINISHED`; voltar de segundo plano depois do término mostra `FINISHED` sem vibrar; voltar antes do término mostra o tempo restante correto; desativar a configuração encerra a contagem (`IDLE`); `reset()` (finalizar/sem sessão) limpa; o ticker (~250 ms, no `RestTimerProvider` do layout raiz) só corre durante `RUNNING`, corre sem a tela de treino montada, vibra uma vez também com outra tela ativa e é limpo ao pausar, terminar, encerrar e desmontar o provedor; alterar a duração configurada não afeta a contagem em curso
- [ ] T012 [P] [US2] Escrever `tests/ui/restTimer/restTimerBar.test.tsx` e `tests/ui/restTimer/restTimerToggle.test.tsx` (RNTL): a barra parada mostra **Iniciar descanso** (1 toque — SC-001); contando mostra `mm:ss` em `numeric`, **Pausar** e **Encerrar**; pausada mostra `mm:ss`, **Retomar** e **Encerrar**; terminada mostra "Descanso terminado" (ícone e texto) e **OK**; encerrar só para (sem "terminado"); botões ≥ 48 dp com `accessibilityLabel` ("Pausar descanso", "Retomar descanso", "Encerrar descanso", "Iniciar descanso"); a barra anuncia só início e fim (`accessibilityLiveRegion="polite"` no Android e `AccessibilityInfo.announceForAccessibility` no iOS, chamados uma vez no início e uma no fim, nunca a cada segundo); o ⏱ do cabeçalho (44 dp) mostra ativado/desativado por ícone e `accessibilityState` e tocar chama `SetRestTimerEnabled(!enabled)`
- [ ] T013 [P] [US2] Escrever `tests/ui/restTimer/workoutIntegration.test.tsx` (RNTL, tela de treino da 007 com casos de uso simulados e espiões): com o cronômetro desativado nenhum controle de contagem aparece (só o ⏱) e marcar um exercício não inicia nada; ativar pelo ⏱ mostra a barra parada com **Iniciar descanso** imediatamente (o `settingsStore` é recarregado); marcar um exercício como feito inicia a contagem, marcar outro reinicia da duração cheia, desmarcar não inicia nem altera; desativar durante a contagem a encerra; a barra fica acima de **FINALIZAR TREINO** e não bloqueia marcar, digitar peso nem finalizar; finalizar o treino encerra e limpa o cronômetro; navegar da tela de treino à Home com a contagem em curso não a interrompe e, ao voltar, a barra mostra o estado correto ("Descanso terminado" se já passou); iniciar, pausar, retomar, encerrar e terminar **não** chamam `SetExerciseCompleted`, `SetExerciseWeight`, `FinishWorkout` nem `StartWorkout` e deixam `workoutStore` (marcações, pesos, rascunhos) idêntico (FR-004); **abrir e fechar a legenda (`?`) e o `ⓘ` com a contagem em curso não pausa nem reinicia** (estado e tempo restante iguais — entrega o teste que a spec 008 deixou para cá)
- [ ] T014 [P] [US2] Escrever `tests/integration/application/restTimerIndependence.test.ts` (`createTestDb()` + seed + sessão em andamento): executar as ações do cronômetro (via store e hook simulados) e as escritas de configuração `SetRestTimerEnabled`/`SetRestTimerDuration` não altera `workout_session`, `workout_session_exercise` nem `program_sequence_state` (snapshot idêntico antes e depois); a contagem não deixa nenhum rastro no banco

### Implementation

- [ ] T015 [P] [US2] Implementar `src/domain/restTimer/restTimerMachine.ts` (`start`, `pause`, `resume`, `stop`, `dismiss`, `evaluate`, `remainingMs`; puro, relógio por parâmetro, sem `Date.now`) — faz T010 passar
- [ ] T016 [US2] Criar `src/store/restTimerStore.ts` (Zustand: `state: RestTimerState`, `set`; só memória, nunca persiste), `src/components/RestTimerProvider.tsx` (ticker de ~250 ms só em contagem; reavaliação ao `AppState` → `active`; `vibrate(400)` uma vez em `justFinished` via `Vibration` do React Native; desativar encerra a contagem; lê `enabled` e `durationSeconds` do `settingsStore`, carregado na inicialização do app; sem regra de sessão) e `src/hooks/useRestTimer.ts` (só leitura do estado e ações `start`, `pause`, `resume`, `stop`, `dismiss`, `reset`, `onExerciseMarked`, conforme `contracts/use-cases.md`) — faz T011 passar
- [ ] T017 [P] [US2] Criar `src/components/workout/RestTimerBar.tsx` (estados parado/contando/pausado/terminado de `contracts/ui.md`, `numeric` para o tempo, botões ≥ 48 dp, rótulos de acessibilidade, ignorável) e `src/components/workout/RestTimerToggle.tsx` (⏱ de 44 dp com estado por ícone e `accessibilityState`), só com tokens — faz T012 passar
- [ ] T018 [US2] Montar o `RestTimerProvider` em `src/app/_layout.tsx` e integrar em `src/app/workout/index.tsx` (spec 007): `RestTimerToggle` no cabeçalho (que chama `SetRestTimerEnabled` e depois `settingsStore.reload()`); `RestTimerBar` acima da `FinishBar` só com o cronômetro ativo; chamar `useRestTimer().onExerciseMarked(completed)` após uma marcação bem-sucedida; chamar `reset()` após finalizar com sucesso e quando `status = 'noSession'`; sem alterar `useWorkoutSession` e sem montar ticker na tela — faz T013 e T014 passarem
- [ ] T019 [US2] Verificar a vibração sem permissões extras: conferir que o manifesto Android gerado contém a permissão normal `VIBRATE` (sem pedido em tempo de execução) e que o iOS não exige nada; se a permissão estiver ausente, declará-la em `app.json` ou `app.config.*`, conforme o projeto (`android.permissions`) e registrar a verificação em `specs/011-cronometro-descanso/quickstart.md` (item 4)

**Checkpoint**: US1 e US2 funcionam; nenhuma ação do cronômetro altera sessão, sequência nem dados.

---

## Phase 5: Polish & cross-cutting

- [ ] T020 [P] Escrever `tests/unit/restTimer/purity.test.ts`: lê `src/domain/restTimer/` e falha se importarem `react`, `react-native`, `expo-*`, `better-sqlite3` ou `src/data/`, ou se usarem `Date.now`, `new Date(` ou `performance.now` (o relógio entra por parâmetro; constituição II); e lê `src/store/restTimerStore.ts` e `src/hooks/useRestTimer.ts` e falha se importarem repositórios, casos de uso de sessão (`SetExerciseCompleted`, `SetExerciseWeight`, `FinishWorkout`, `StartWorkout`) ou `src/data/` (FR-004)
- [ ] T021 [P] Atualizar `docs/design-telas.md` §5.3 (início ao marcar e botão **Iniciar descanso**; fim com vibração e "Descanso terminado"; em segundo plano sem alerta; estado só em memória; ⏱ altera a configuração persistida), §8 (linha do cronômetro e "Tempo de descanso" com limites 00:05–60:00 e entrada mm:ss) e §3 (acrescentar `RestTimerBar`, `RestTimerToggle`, `Switch`, `SettingsSwitchRow` e `RestDurationSheet`)
- [ ] T022 [P] Atualizar `docs/telas.md` (cronômetro nas Configurações e na tela de treino), `docs/prototipo-telas.html` se divergir, `docs/backlog.md` (BL-043, BL-090..092; registrar que o teste "abrir a ajuda com o cronômetro ativo não o pausa nem reinicia" foi entregue na spec 011) e a spec 005 (a seção de Configurações agora inclui o cronômetro, antes fora do escopo)
- [ ] T023 Auditoria de consistência visual: comparar `RestTimerBar`, `RestTimerToggle`, `Switch`, `SettingsSwitchRow`, `RestDurationSheet` e a seção "DESCANSO" com `theme.ts` e `docs/design-telas.md` §2–3, §5.3 e §8 (nenhum valor literal de cor/tamanho, alvos ≥ 48 dp/44 dp, estado ativado/terminado sem depender só de cor, tempo em `numeric`) e corrigir qualquer desvio
- [ ] T024 Rodar `npm run check` (lint, tipos e testes) e os passos do `quickstart.md` (incluindo a validação manual em Android e iOS: contagem, segundo plano antes e depois do término, fechar o app à força); marcar a spec como `concluída` em `specs/INDEX.md`

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → histórias → Polish. Na Phase 2, T003 e T004 são paralelizáveis (T004 usa os tipos de T003).
- **US1** depende só da Phase 2 e das Configurações da 005. **US2** depende da US1 (`SetRestTimerEnabled` e a configuração persistida, T007) e da tela de treino da 007; a tela de Configurações (T009) e a de treino (T018) são arquivos diferentes. Dentro da US2, T015 antes de T016; T017 pode rodar em paralelo com T015/T016; T018 depois de T016 e T017.
- T013 usa os testes de ajuda da spec 008 (`?`/`ⓘ`): a 008 é implementada antes.
- T009 edita `src/app/(tabs)/settings.tsx` e T018 edita `src/app/_layout.tsx` e `src/app/workout/index.tsx`; não há outra tarefa da spec nesses arquivos. O `RestTimerProvider` (T016) é montado no layout raiz em T018.
- Polish só depois das histórias desejadas; T023 depois de todas as telas.

### Parallel examples

```text
US1:      T005 T006             → T007 T008 (T009 depois de T007/T008)
US2:      T010 T011 T012 T013 T014   → T015 T017 (T016 depois de T015; T018 depois de T016/T017; T019 no fim)
Polish:   T020 T021 T022
```

## Implementation Strategy

1. **MVP**: Phases 1–3 (configurar o cronômetro) — já cobre BL-043, BL-090 e BL-091; o uso durante o treino (US2) entrega o valor do recurso.
2. Incremental: US2 (motor por horário de término, barra, ⏱ e integração com a tela de treino) → Polish (docs, pureza e auditoria visual).
3. Um item só está concluído com lint, tipos e testes passando.
