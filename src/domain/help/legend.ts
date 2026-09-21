import { TECHNIQUE_LEGEND } from '../../constants/techniqueLegend';
import type { LegendEntry } from './types';

/** Correspondência exata com o campo `technique`; nunca lê prescrição/observações. */
export function findLegendEntry(technique: string | null): LegendEntry | null {
  if (technique === null) return null;
  return TECHNIQUE_LEGEND.find((e) => e.title === technique) ?? null;
}
