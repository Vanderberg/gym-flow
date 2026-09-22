import { render, screen } from '@testing-library/react-native';
import { ContributionGridView } from '@/components/common/ContributionGridView';
import { buildContributionGrid } from '@/domain/statistics/contributionGrid';

describe('ContributionGridView', () => {
  it('mostra o rótulo com a quantidade de semanas e o resumo acessível', async () => {
    const grid = buildContributionGrid(['2026-09-15', '2026-09-20'], '2026-09-19', 3);
    await render(<ContributionGridView grid={grid} />);
    expect(screen.getByText('FREQUÊNCIA (ÚLTIMAS 3 SEMANAS)')).toBeTruthy();
    expect(screen.getByLabelText('Treinou em 2 de 21 dias nas últimas 3 semanas')).toBeTruthy();
    expect(screen.getByText('sem treino')).toBeTruthy();
    expect(screen.getByText('treino')).toBeTruthy();
  });

  it('funciona sem nenhum dia ativo', async () => {
    const grid = buildContributionGrid([], '2026-09-19', 1);
    await render(<ContributionGridView grid={grid} />);
    expect(screen.getByLabelText('Treinou em 0 de 7 dias nas últimas 1 semanas')).toBeTruthy();
  });
});
