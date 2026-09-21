const LONG = [
  'SEGUNDA-FEIRA',
  'TERÇA-FEIRA',
  'QUARTA-FEIRA',
  'QUINTA-FEIRA',
  'SEXTA-FEIRA',
  'SÁBADO',
  'DOMINGO',
];
const SHORT = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

/** Rótulo pt-BR do dia da semana (1=segunda ... 7=domingo). */
export function weekdayLabel(weekday: number, form: 'LONG' | 'SHORT'): string {
  if (!Number.isInteger(weekday) || weekday < 1 || weekday > 7) {
    throw new Error(`Dia da semana inválido: ${weekday}`);
  }
  return (form === 'LONG' ? LONG : SHORT)[weekday - 1];
}
