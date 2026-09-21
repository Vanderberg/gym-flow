import { render, screen } from '@testing-library/react-native';
import { SegmentedProgress } from '@/components/common/SegmentedProgress';

describe('SegmentedProgress', () => {
  it('mostra segmentos e texto', async () => {
    await render(<SegmentedProgress done={4} total={6} />);
    expect(screen.getByText('4 / 6 realizados')).toBeTruthy();
    expect(screen.getAllByTestId('segment-done')).toHaveLength(4);
    expect(screen.getAllByTestId('segment-pending')).toHaveLength(2);
    expect(screen.getByLabelText('4 / 6 realizados')).toBeTruthy();
  });
  it('N = 0', async () => {
    await render(<SegmentedProgress done={0} total={0} />);
    expect(screen.getByText('0 / 0 realizados')).toBeTruthy();
    expect(screen.queryAllByTestId('segment-pending')).toHaveLength(0);
  });
});
