import type { BackupDocument, BackupSummary } from './types';

/** Resumo exibido antes da confirmação: quantidade e período (dias locais, sem conversão de fuso). */
export function summarizeBackup(document: BackupDocument): BackupSummary {
  const days = document.sessions.map((s) => s.startedAt.slice(0, 10)).sort();
  return {
    sessionCount: document.sessions.length,
    firstDate: days[0] ?? null,
    lastDate: days[days.length - 1] ?? null,
  };
}
