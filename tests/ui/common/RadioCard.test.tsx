import { fireEvent, render, screen } from '@testing-library/react-native';
import { RadioCard } from '@/components/common/RadioCard';

describe('RadioCard', () => {
  it('mostra título, descrição e dispara onPress', async () => {
    const onPress = jest.fn();
    await render(<RadioCard title="Opção" description="Desc" selected={false} onPress={onPress} />);
    expect(screen.getByText('Desc')).toBeTruthy();
    await fireEvent.press(screen.getByRole('radio', { name: 'Opção' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('selecionado expõe accessibilityState.selected', async () => {
    await render(<RadioCard title="Opção" selected onPress={jest.fn()} />);
    expect(screen.getByRole('radio', { name: 'Opção', selected: true })).toBeTruthy();
  });

  it('desabilitado não dispara e mostra o motivo', async () => {
    const onPress = jest.fn();
    await render(
      <RadioCard
        title="Opção"
        selected={false}
        disabled
        disabledReason="Motivo"
        onPress={onPress}
      />,
    );
    await fireEvent.press(screen.getByRole('radio', { name: 'Opção' }));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByText('Motivo')).toBeTruthy();
  });
});
