# Data Model: Cronômetro de Descanso

Sem tabelas ou migrations novas. Usa os campos existentes de `app_settings` (spec 002): `rest_timer_enabled` (0/1, padrão 0) e
`rest_timer_seconds` (`> 0`, padrão 90). O **estado da contagem não é persistido** (só memória). Tipos de domínio:

```ts
const MIN_REST_SECONDS = 5
const MAX_REST_SECONDS = 3600
const DEFAULT_REST_SECONDS = 90

type RestTimerState =
  | { status: 'IDLE' }
  | { status: 'RUNNING'; endsAt: number; durationMs: number }          // epoch ms
  | { status: 'PAUSED'; remainingMs: number; durationMs: number }
  | { status: 'FINISHED' }

interface TickResult { state: RestTimerState; justFinished: boolean }  // justFinished: terminou agora, com o app ativo

type DurationParse = { ok: true; seconds: number } | { ok: false; reason: 'INVALID' | 'OUT_OF_RANGE' }
```

## Regras

- **Transições**: `IDLE → RUNNING` (`start`); `RUNNING → PAUSED` (`pause`, `remainingMs = max(0, endsAt − now)`); `PAUSED → RUNNING` (`resume`, `endsAt = now + remainingMs`); `RUNNING → FINISHED` (`evaluate` quando `now ≥ endsAt`); `qualquer → IDLE` (`stop` ao encerrar; `dismiss` ao dispensar o "Descanso terminado"; `reset` ao finalizar a sessão ou sem sessão). `start` durante `RUNNING`/`PAUSED`/`FINISHED` reinicia a partir da duração cheia.
- **Tempo restante**: `RUNNING` → `max(0, endsAt − now)`; `PAUSED` → `remainingMs`; nunca negativo; erro < 1 s em 5 minutos, inclusive em segundo plano, por ser derivado de `endsAt`.
- **justFinished**: verdadeiro só quando a transição para `FINISHED` é observada com `now − endsAt ≤ 1500 ms` (com o app ativo); observada mais tarde (voltou de segundo plano) é `false`, então não vibra.
- **Duração**: `parseDurationInput` aceita `mm:ss` ou segundos puros; inteiros de 5 a 3600; fora do intervalo → `OUT_OF_RANGE` ("Informe um tempo entre 00:05 e 60:00"); vazio ou não numérico → `INVALID`; `formatMmSs` exibe `mm:ss` (ex.: 90 s = "01:30").
- **Configuração**: `SetRestTimerEnabled` e `SetRestTimerDuration` escrevem só o seu campo de `app_settings` (id = 1); duração fora do intervalo lança `ValidationError` sem gravar; alterar a duração vale a partir do próximo início; desativar encerra a contagem em curso.
- **Início**: só com o cronômetro ativo — marcar como feito inicia/reinicia; desmarcar não faz nada; botão **Iniciar** inicia sem marcar.
- **Invariante (FR-004)**: nenhuma ação do cronômetro escreve em `workout_session`, `workout_session_exercise`, `program_sequence_state` nem em campos de `app_settings` além dos dois do cronômetro (esses só pelas telas de configuração/⏱).
