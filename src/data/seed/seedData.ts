import { EXERCISE_CATALOG } from './exercises';
import { MONSTRO_PROGRAM } from './programs/monstro';
import { PADRAO_PROGRAM } from './programs/padrao';
import type { SeedData } from './types';

export const SEED_DATA: SeedData = {
  exercises: EXERCISE_CATALOG,
  programs: [PADRAO_PROGRAM, MONSTRO_PROGRAM],
  defaultSequenceType: 'CONTINUOUS',
};
