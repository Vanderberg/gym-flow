import { readFileSync } from 'fs';
import { join } from 'path';

export interface PrdItem {
  name: string;
  series: string;
  reps: string;
}
export interface PrdWorkout {
  title: string;
  items: PrdItem[];
}

/** Lê docs/PRD.md §7 (Treino Padrão). */
export function parsePrdPadrao(): PrdWorkout[] {
  const text = readFileSync(join(__dirname, '../../../../docs/PRD.md'), 'utf-8').replace(/\r/g, '');
  const section = text.split('# 7. Treino Padrão')[1].split('# 8. Treino Monstro')[0];
  const result: PrdWorkout[] = [];
  let current: PrdWorkout | null = null;
  for (const line of section.split('\n')) {
    const h = line.match(/^## Dia \d --- (.+)$/);
    if (h) {
      current = { title: h[1].trim(), items: [] };
      result.push(current);
      continue;
    }
    if (!current || !line.startsWith('  ') || /^\s*-+\s/.test(line)) continue;
    const cols = line.trim().split(/\s{2,}/);
    if (cols.length !== 3 || cols[0] === 'Exercício') continue;
    current.items.push({ name: cols[0], series: cols[1], reps: cols[2].replace('--', '–') });
  }
  return result;
}
