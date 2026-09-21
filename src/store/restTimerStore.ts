import { create } from 'zustand';
import type { RestTimerState } from '../domain/restTimer/types';

/** Só memória: a contagem nunca é persistida (spec 011). `now` alimenta a renderização a cada tick. */
export interface RestTimerStoreState {
  state: RestTimerState;
  now: number;
  set(state: RestTimerState, now?: number): void;
}

export const useRestTimerStore = create<RestTimerStoreState>((set) => ({
  state: { status: 'IDLE' },
  now: 0,
  set(state, now) {
    set(now === undefined ? { state } : { state, now });
  },
}));
