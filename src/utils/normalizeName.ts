import { ValidationError } from '../data/repositories/errors';

/** Chave de unicidade do exercício: trim, espaços únicos, NFC, minúsculas pt-BR. */
export function normalizeName(name: string): string {
  const key = name.trim().replace(/\s+/g, ' ').normalize('NFC').toLocaleLowerCase('pt-BR');
  if (key === '') throw new ValidationError('Nome vazio');
  return key;
}
