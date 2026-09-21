import { ValidationError } from '../repositories/errors';
import { normalizeName } from '../../utils/normalizeName';
import type { SeedData } from './types';

const blank = (s: string | null | undefined) => !s || s.trim() === '';

/** Valida o dataset antes de qualquer escrita. Lança ValidationError. */
export function validateSeedData(data: SeedData): void {
  const keys = new Set<string>();
  for (const ex of data.exercises) {
    const key = normalizeName(ex.name);
    if (keys.has(key)) throw new ValidationError(`Exercício duplicado: ${ex.name}`);
    keys.add(key);
    if (blank(ex.primaryMuscle) || blank(ex.secondaryMuscles) || blank(ex.description)) {
      throw new ValidationError(`Exercício sem músculos/descrição: ${ex.name}`);
    }
  }

  const defaults = data.programs.filter((p) => p.isDefault).length;
  if (defaults !== 1) throw new ValidationError('É necessário exatamente um programa padrão');

  for (const program of data.programs) {
    const codes = new Set<string>();
    for (const w of program.workouts) {
      if (codes.has(w.code)) throw new ValidationError(`Treino duplicado: ${w.code}`);
      codes.add(w.code);
      w.items.forEach((item, i) => {
        if (!keys.has(normalizeName(item.exercise))) {
          throw new ValidationError(`Exercício fora do catálogo: ${item.exercise}`);
        }
        if (item.technique === 'BI-SET') {
          const prev = w.items[i - 1]?.technique === 'BI-SET';
          const next = w.items[i + 1]?.technique === 'BI-SET';
          if (!prev && !next) throw new ValidationError(`Bi-set sem par: ${item.exercise}`);
          if (blank(item.notes) || !/bi-set/i.test(item.notes as string)) {
            throw new ValidationError(`Bi-set sem observação do par: ${item.exercise}`);
          }
        }
      });
    }
    if (program.schedule) {
      const days = new Set<number>();
      for (const d of program.schedule) {
        if (d.weekday < 1 || d.weekday > 7 || days.has(d.weekday)) {
          throw new ValidationError(`Dia da semana inválido: ${d.weekday}`);
        }
        days.add(d.weekday);
        if (d.workout !== null && !codes.has(d.workout)) {
          throw new ValidationError(`Agenda cita treino inexistente: ${d.workout}`);
        }
      }
    }
  }
}
