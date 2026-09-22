import { addDays, mondayOf } from '../../utils/dateMath';

export interface ContributionDay {
  date: string;
  active: boolean;
}

export interface ContributionWeek {
  start: string;
  days: ContributionDay[];
}

export interface ContributionGrid {
  weeks: ContributionWeek[];
}

/**
 * Grade de frequência (estilo "gráfico de contribuições"): as últimas `weekCount`
 * semanas de calendário (segunda–domingo), terminando na semana de `today`, com cada
 * dia marcado como `active` se houver uma sessão finalizada com essa data local.
 * Puro: não lê o banco, não sabe de programa — recebe as datas já filtradas.
 */
export function buildContributionGrid(
  dates: string[],
  today: string,
  weekCount = 12,
): ContributionGrid {
  const active = new Set(dates);
  const currentMonday = mondayOf(today);
  const weeks: ContributionWeek[] = [];
  for (let w = weekCount - 1; w >= 0; w--) {
    const monday = addDays(currentMonday, -7 * w);
    const days: ContributionDay[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(monday, d);
      days.push({ date, active: active.has(date) });
    }
    weeks.push({ start: monday, days });
  }
  return { weeks };
}
