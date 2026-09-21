export function advancePosition(currentPosition: number | null, activePositions: number[]): number {
  if (activePositions.length === 0) throw new Error('Sem posições ativas');
  const sorted = [...activePositions].sort((a, b) => a - b);
  const idx = currentPosition === null ? -1 : sorted.indexOf(currentPosition);
  const from = idx === -1 ? 0 : idx;
  return sorted[(from + 1) % sorted.length];
}
