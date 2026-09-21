import type { RestTimerState, TickResult } from './types';

/** Janela para considerar que o término foi observado "agora" (com o app ativo). */
const JUST_FINISHED_WINDOW_MS = 1500;

export function start(durationSeconds: number, now: number): RestTimerState {
  const durationMs = durationSeconds * 1000;
  return { status: 'RUNNING', endsAt: now + durationMs, durationMs };
}

export function pause(state: RestTimerState, now: number): RestTimerState {
  if (state.status !== 'RUNNING') return state;
  return {
    status: 'PAUSED',
    remainingMs: Math.max(0, state.endsAt - now),
    durationMs: state.durationMs,
  };
}

export function resume(state: RestTimerState, now: number): RestTimerState {
  if (state.status !== 'PAUSED') return state;
  return { status: 'RUNNING', endsAt: now + state.remainingMs, durationMs: state.durationMs };
}

export function stop(_state: RestTimerState): RestTimerState {
  return { status: 'IDLE' };
}

export function dismiss(state: RestTimerState): RestTimerState {
  return state.status === 'FINISHED' ? { status: 'IDLE' } : state;
}

export function evaluate(state: RestTimerState, now: number): TickResult {
  if (state.status === 'RUNNING' && now >= state.endsAt) {
    return {
      state: { status: 'FINISHED' },
      justFinished: now - state.endsAt <= JUST_FINISHED_WINDOW_MS,
    };
  }
  return { state, justFinished: false };
}

export function remainingMs(state: RestTimerState, now: number): number {
  if (state.status === 'RUNNING') return Math.max(0, state.endsAt - now);
  if (state.status === 'PAUSED') return state.remainingMs;
  return 0;
}
