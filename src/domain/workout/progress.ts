/** Progresso da sessão: só exercícios (o aquecimento nunca é item). */
export function computeProgress(items: { completed: boolean }[]): { done: number; total: number } {
  return { done: items.filter((i) => i.completed).length, total: items.length };
}
