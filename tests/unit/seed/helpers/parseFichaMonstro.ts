import { readFileSync } from 'fs';
import { join } from 'path';

export interface FichaItem {
  n: number;
  name: string;
  prescription: string;
  technique: string | null;
  notes: string | null;
}

/** Lê as tabelas dos treinos A–D em docs/fichas-treino.md (seção 1). */
export function parseFichaMonstro(): Record<string, FichaItem[]> {
  const text = readFileSync(join(__dirname, '../../../../docs/fichas-treino.md'), 'utf-8').replace(
    /\r/g,
    '',
  );
  const section = text.split('# 1. Treino Monstro')[1].split('## Agenda')[0];
  const result: Record<string, FichaItem[]> = {};
  let current: FichaItem[] | null = null;
  for (const line of section.split('\n')) {
    const h = line.match(/^### Treino ([A-D]) /);
    if (h) {
      current = [];
      result[h[1]] = current;
      continue;
    }
    if (!current || !line.startsWith('|')) continue;
    const cols = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    if (!/^\d+$/.test(cols[0])) continue;
    const dash = (v: string) => (v === '—' ? null : v);
    current.push({
      n: Number(cols[0]),
      name: cols[1],
      prescription: cols[2],
      technique: dash(cols[3]),
      notes: dash(cols[4]),
    });
  }
  return result;
}
