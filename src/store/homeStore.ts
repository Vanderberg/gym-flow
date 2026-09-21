import { create } from 'zustand';
import type { HomeView } from '../domain/home/types';

/** Estado só de UI: o SQLite é a fonte de verdade. */
export interface HomeState {
  view: HomeView | null;
  status: 'loading' | 'ready' | 'error';
  pendingDialogShown: boolean;
  setLoading(): void;
  setView(view: HomeView): void;
  setError(): void;
  markDialogShown(): void;
}

export const useHomeStore = create<HomeState>((set) => ({
  view: null,
  status: 'loading',
  pendingDialogShown: false,
  setLoading: () => set({ status: 'loading' }),
  setView: (view) => set({ view, status: 'ready' }),
  setError: () => set({ status: 'error' }),
  markDialogShown: () => set({ pendingDialogShown: true }),
}));
