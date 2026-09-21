# Research: Cronômetro de Descanso

## D1 — Máquina de estados pura baseada em horário de término
- **Decision**: `RestTimerState` é uma união: `IDLE`; `RUNNING { endsAt, durationMs }`; `PAUSED { remainingMs, durationMs }`; `FINISHED`. Funções puras com relógio por parâmetro (`now: number`, epoch em ms): `start(durationSeconds, now)` → `RUNNING` com `endsAt = now + duration`; `pause(state, now)` → `PAUSED` com `remainingMs = max(0, endsAt − now)`; `resume(state, now)` → `RUNNING` com `endsAt = now + remainingMs`; `stop(state)`/`dismiss(state)` → `IDLE`; `remainingMs(state, now)`; `evaluate(state, now)` → `{ state, justFinished }` (passa a `FINISHED` quando `now ≥ endsAt`; `justFinished` só se `now − endsAt ≤ 1500 ms`).
- **Rationale**: o tempo restante deriva do horário de término, não de contagem de ticks: fica correto em segundo plano (SC-002) e o teste usa um relógio simulado, sem timers reais.
- **Alternatives**: decrementar um contador a cada segundo (deriva com o app em segundo plano); usar `performance.now()` (pode não avançar em segundo plano).

## D2 — Estado só em memória (clarificação 3)
- **Decision**: `restTimerStore` (Zustand) guarda o `RestTimerState`; nada é gravado no SQLite. Fechar o app à força apaga a contagem. A duração e o estado ativado/desativado é que são persistidos (D6).
- **Rationale**: FR-003/FR-004; simplicidade; contagem de descanso é efêmera e não faz parte dos dados da sessão.
- **Alternatives**: persistir `endsAt` para sobreviver a fechar o app (complexidade e risco de estado obsoleto sem ganho real).

## D3 — Início ao marcar (clarificação 1)
- **Decision**: o hook `useRestTimer` expõe `onExerciseMarked(completed: boolean)`; a tela de treino o chama após uma marcação **concluída com sucesso**: com o cronômetro ativo e `completed = true`, inicia (ou reinicia) a contagem com a duração configurada; `completed = false` não faz nada. O botão **Iniciar** inicia sem marcar. `FinishWorkout` bem-sucedido e sessão inexistente chamam `reset()`.
- **Rationale**: FR-002, US2 cenários 1 e 5; a `useWorkoutSession` da 007 não é alterada.
- **Alternatives**: iniciar dentro do caso de uso de marcação (acopla o cronômetro à sessão, contra FR-004).

## D4 — Sinalização do fim (clarificação 3)
- **Decision**: com o app ativo, ao `justFinished` o provedor chama `Vibration.vibrate(400)` (API do React Native; sem biblioteca) e a barra mostra "Descanso terminado". Em segundo plano não há alerta nem notificação; ao voltar (`AppState` → `active`) o provedor reavalia: se o término já passou há mais de 1,5 s a barra mostra "Descanso terminado" **sem vibrar**. A vibração é uma permissão normal do Android (`VIBRATE`, sem pedido ao usuário em tempo de execução) e não exige permissão no iOS; conferir na validação manual que o manifesto gerado a contém.
- **Rationale**: FR-003, US2 cenários 3 e 7, constituição XII (sem permissões de execução nem dependência nova).
- **Alternatives**: notificação local (permissão e dependência); `expo-haptics` (dependência nova).

## D5 — Ticker e AppState
- **Decision**: um provedor no layout raiz (`RestTimerProvider`) usa um `setInterval` de ~250 ms só enquanto há contagem em curso, mesmo com a tela de treino desmontada (o hook `useRestTimer` só lê o estado e chama as ações; a tela de treino não monta ticker), chamando `evaluate(state, clock())` e atualizando o valor exibido; nunca grava. Ao voltar ao primeiro plano, avalia imediatamente. O intervalo é limpo ao terminar, pausar, parar ou desmontar.
- **Rationale**: a exibição é fluida sem regravar nada; o erro de tempo não acumula porque o valor sai do horário de término.

## D6 — Configuração persistida
- **Decision**: dois casos de uso de escrita única em `app_settings` (id = 1): `SetRestTimerEnabled(enabled)` e `SetRestTimerDuration(seconds)` (valida `5 ≤ seconds ≤ 3600`, inteiro; `ValidationError` fora do intervalo, nada gravado). Ambos usam `SettingsRepository.save` alterando só o seu campo; o `settingsStore` da 005 recarrega após salvar. Alterar a duração não afeta uma contagem em curso; vale a partir do próximo início. Desativar durante a contagem a encerra.
- **Rationale**: FR-001, US1 e clarificações 2 e 4; usa as colunas que a 002 já criou (`rest_timer_enabled` padrão 0, `rest_timer_seconds` padrão 90).

## D7 — Entrada e exibição da duração (clarificação 4)
- **Decision**: `parseDurationInput(text)` aceita `mm:ss` ("01:30", "1:30") ou segundos puros ("90"), devolve segundos inteiros ou `INVALID`; `validateDuration` exige 5–3600; `formatMmSs(ms)` exibe "01:30" (e "60:00" no máximo). `RestDurationSheet` mostra o erro "Informe um tempo entre 00:05 e 60:00" e não grava.
- **Rationale**: US1 cenário 2; unidade em segundos como no schema.

## D8 — Ícone ⏱ (clarificação 2)
- **Decision**: `RestTimerToggle` no cabeçalho da tela de treino chama `SetRestTimerEnabled(!enabled)` (a mesma configuração de Configurações), mostra o estado ativado/desativado (ícone e `accessibilityState`, não só cor); com o cronômetro desativado não há barra nem botão Iniciar, só o ⏱.
- **Rationale**: FR-001, US2 cenários 4 e 6; fonte única de verdade.

## D9 — Ajuda e cronômetro (dependência da 008)
- **Decision**: abrir/fechar as folhas de ajuda não chama nenhuma ação do `restTimerStore`; um teste de integração de UI abre e fecha a legenda e o `ⓘ` com o cronômetro em contagem e confere que o `RestTimerState` e o tempo restante não mudam. O teste estático da 008 (T031) continua garantindo que a ajuda não importa o cronômetro.
- **Rationale**: BL-116 e Edge Case da spec 008 ("com o cronômetro ativo, abrir a ajuda não o pausa nem o reinicia") — entregue aqui, onde o cronômetro existe.

## D10 — Independência da sessão (FR-004)
- **Decision**: nenhuma ação do cronômetro chama casos de uso de sessão; testes com espiões e snapshot das tabelas garantem que iniciar, pausar, retomar, encerrar e terminar não alteram `workout_session*`, `program_sequence_state` nem outros campos de `app_settings`.
- **Rationale**: FR-004.
