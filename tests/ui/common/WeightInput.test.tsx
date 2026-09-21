import { fireEvent, render, screen } from '@testing-library/react-native';
import { PrescriptionBlock } from '@/components/common/PrescriptionBlock';
import { WeightInput } from '@/components/common/WeightInput';

describe('WeightInput', () => {
  it('teclado decimal, kg, -/+ e erro ligado ao campo', async () => {
    const onDec = jest.fn();
    const onInc = jest.fn();
    await render(
      <WeightInput
        value="60"
        onChangeText={jest.fn()}
        onBlur={jest.fn()}
        onDecrement={onDec}
        onIncrement={onInc}
        error="Informe um valor maior ou igual a 0"
      />,
    );
    expect(screen.getByLabelText('Peso').props.keyboardType).toBe('decimal-pad');
    expect(screen.getByText('kg')).toBeTruthy();
    expect(screen.getByText('Informe um valor maior ou igual a 0')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Diminuir 2,5 quilos'));
    await fireEvent.press(screen.getByLabelText('Aumentar 2,5 quilos'));
    expect(onDec).toHaveBeenCalled();
    expect(onInc).toHaveBeenCalled();
  });
});

describe('PrescriptionBlock', () => {
  it('exibe prescrição, técnica em caixa alta e observações', async () => {
    await render(
      <PrescriptionBlock prescription="4x8-12" technique="drop-set" notes={'linha 1\nlinha 2'} />,
    );
    expect(screen.getByText('4x8-12')).toBeTruthy();
    expect(screen.getByText('DROP-SET')).toBeTruthy();
    expect(screen.getByText(/linha 1/)).toBeTruthy();
  });
});
