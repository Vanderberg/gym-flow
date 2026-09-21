# Contrato: domínio, casos de uso e hook (spec 011)

## Domínio (`src/domain/restTimer/`) — puro; o relógio entra por parâmetro

```ts
start(durationSeconds: number, now: number): RestTimerState                 // RUNNING; reinicia de qualquer estado
pause(state: RestTimerState, now: number): RestTimerState                   // RUNNING → PAUSED; outros estados inalterados
resume(state: RestTimerState, now: number): RestTimerState                  // PAUSED → RUNNING; outros estados inalterados
stop(state: RestTimerState): RestTimerState                                 // → IDLE (Encerrar)
dismiss(state: RestTimerState): RestTimerState                              // FINISHED → IDLE
evaluate(state: RestTimerState, now: number): TickResult                    // RUNNING → FINISHED ao vencer; justFinished só com now − endsAt ≤ 1500 ms
remainingMs(state: RestTimerState, now: number): number                     // ≥ 0

parseDurationInput(text: string): DurationParse                             // "01:30", "1:30" ou "90"; 5..3600
validateDuration(seconds: number): boolean
formatMmSs(ms: number): string                                              // "01:30"
```

## Aplicação (`src/application/`)

```ts
SetRestTimerEnabled(deps: { settings })
  execute(enabled: boolean): Promise<AppSettings>
  // SettingsRepository.save só com restTimerEnabled; nenhuma outra escrita

SetRestTimerDuration(deps: { settings })
  execute(seconds: number): Promise<AppSettings>
  // ValidationError se fora de 5..3600 ou não inteiro (nada gravado); grava só restTimerSeconds
```

## Store e hook

```ts
restTimerStore: { state: RestTimerState; set(state: RestTimerState): void }    // só memória; nunca persiste

useRestTimer(deps?: { clock?: () => number; vibrate?: (ms: number) => void })
  -> { state, remainingMs, enabled, durationSeconds,
       start(), pause(), resume(), stop(), dismiss(), reset(),
       onExerciseMarked(completed: boolean) }   // completed = true e enabled → start(); false → nada
  // leitura do estado e ações; o ticker de ~250 ms, a reavaliação por AppState 'active' e vibrate(400) (uma vez, em justFinished)
  // ficam no RestTimerProvider (layout raiz), então o fim vibra em qualquer tela com o app aberto
  // desativar (settings.enabled → false) encerra a contagem; nenhuma escrita em sessão
```

`useWorkoutSession` (007) **não** é alterado: a tela de treino chama `onExerciseMarked` após uma marcação bem-sucedida e `reset()` após finalizar ou sem sessão.
