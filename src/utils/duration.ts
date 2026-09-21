/** Duração em minutos inteiros entre dois ISO locais com deslocamento de fuso. */
export function durationMinutes(startedAtIso: string, finishedAtIso: string): number {
  const ms = Date.parse(finishedAtIso) - Date.parse(startedAtIso);
  return Math.max(0, Math.floor(ms / 60000));
}

export function formatDuration(startedAtIso: string, finishedAtIso: string): string {
  const min = durationMinutes(startedAtIso, finishedAtIso);
  return min < 1 ? 'menos de 1 min' : `${min} min`;
}
