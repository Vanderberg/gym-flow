export const MIN_REST_SECONDS = 5;
export const MAX_REST_SECONDS = 3600;
export const DEFAULT_REST_SECONDS = 90;

export type RestTimerState =
  | { status: 'IDLE' }
  | { status: 'RUNNING'; endsAt: number; durationMs: number }
  | { status: 'PAUSED'; remainingMs: number; durationMs: number }
  | { status: 'FINISHED' };

/** `justFinished`: terminou agora, observado com o app ativo. */
export interface TickResult {
  state: RestTimerState;
  justFinished: boolean;
}

export type DurationParse =
  { ok: true; seconds: number } | { ok: false; reason: 'INVALID' | 'OUT_OF_RANGE' };
