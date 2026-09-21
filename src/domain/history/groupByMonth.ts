import { monthLabel } from '../../utils/monthLabel';
import type { HistoryItem, MonthSection } from './types';

/** Agrupa por mês local, do mais recente ao mais antigo, preservando a ordem dos itens. */
export function groupByMonth(items: HistoryItem[]): MonthSection[] {
  const map = new Map<string, HistoryItem[]>();
  for (const it of items) {
    const key = it.localDate.slice(0, 7);
    const list = map.get(key);
    if (list) list.push(it);
    else map.set(key, [it]);
  }
  return [...map.keys()]
    .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))
    .map((key) => ({ key, label: monthLabel(key), items: map.get(key)! }));
}
