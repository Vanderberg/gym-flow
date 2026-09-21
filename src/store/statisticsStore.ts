import { create } from 'zustand';
import type { Period } from '../domain/statistics/types';

/** Estado só de UI, em memória; independente do filtro do histórico. */
export interface StatisticsState {
  period: Period;
  programFilter: number | null;
  setPeriod(period: Period): void;
  setProgramFilter(programId: number | null): void;
}

export const useStatisticsStore = create<StatisticsState>((set) => ({
  period: 'MONTH',
  programFilter: null,
  setPeriod: (period) => set({ period }),
  setProgramFilter: (programFilter) => set({ programFilter }),
}));
