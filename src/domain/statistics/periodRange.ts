import { addDays, daysInMonth, mondayOf } from '../../utils/dateMath';
import type { Period, PeriodRange } from './types';

const pad = (n: number) => String(n).padStart(2, '0');
const MONTHS = [
  'JANEIRO',
  'FEVEREIRO',
  'MARÇO',
  'ABRIL',
  'MAIO',
  'JUNHO',
  'JULHO',
  'AGOSTO',
  'SETEMBRO',
  'OUTUBRO',
  'NOVEMBRO',
  'DEZEMBRO',
];
const SHORT = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

/** Período em curso (datas locais "YYYY-MM-DD"). */
export function periodRange(period: Period, today: string): PeriodRange {
  const [y, m] = today.split('-').map(Number) as [number, number];
  const span = (firstMonth: number, lastMonth: number) => ({
    start: `${y}-${pad(firstMonth)}-01`,
    end: `${y}-${pad(lastMonth)}-${pad(daysInMonth(y, lastMonth))}`,
  });
  switch (period) {
    case 'WEEK': {
      const start = mondayOf(today);
      const end = addDays(start, 6);
      const [, sm, sd] = start.split('-').map(Number) as [number, number, number];
      const [, em, ed] = end.split('-').map(Number) as [number, number, number];
      const label =
        sm === em
          ? `SEMANA ${pad(sd)}–${pad(ed)} ${SHORT[em - 1]}`
          : `SEMANA ${pad(sd)} ${SHORT[sm - 1]}–${pad(ed)} ${SHORT[em - 1]}`;
      return { period, start, end, label };
    }
    case 'MONTH':
      return { period, ...span(m, m), label: `${MONTHS[m - 1]} ${y}` };
    case 'QUARTER': {
      const q = Math.floor((m - 1) / 3);
      return { period, ...span(q * 3 + 1, q * 3 + 3), label: `${q + 1}º TRIMESTRE ${y}` };
    }
    case 'SEMESTER': {
      const s = m <= 6 ? 0 : 1;
      return { period, ...span(s * 6 + 1, s * 6 + 6), label: `${s + 1}º SEMESTRE ${y}` };
    }
    case 'YEAR':
      return { period, ...span(1, 12), label: String(y) };
  }
}
