import type { DetailRow, EditChanges } from './types';

/** Só as linhas cujo `completed` ou `weight` diferem do original. */
export function buildEditChanges(original: DetailRow[], draft: DetailRow[]): EditChanges {
  const byId = new Map(original.map((r) => [r.exerciseId, r]));
  const rows: EditChanges['rows'] = [];
  for (const d of draft) {
    const o = byId.get(d.exerciseId);
    if (!o) continue;
    const change: EditChanges['rows'][number] = { exerciseId: d.exerciseId };
    if (o.completed !== d.completed) change.completed = d.completed;
    if (o.weight !== d.weight) change.weight = d.weight;
    if (change.completed !== undefined || change.weight !== undefined) rows.push(change);
  }
  return { rows };
}

export function hasChanges(changes: EditChanges): boolean {
  return changes.rows.length > 0;
}
