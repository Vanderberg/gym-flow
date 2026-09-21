import { fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { RestTimerBar } from '@/components/workout/RestTimerBar';
import { RestTimerToggle } from '@/components/workout/RestTimerToggle';
import type { RestTimerState } from '@/domain/restTimer/types';

const handlers = () => ({
  onStart: jest.fn(),
  onPause: jest.fn(),
  onResume: jest.fn(),
  onStop: jest.fn(),
  onDismiss: jest.fn(),
});
const bar = (state: RestTimerState, ms: number, h = handlers()) => (
  <RestTimerBar state={state} remainingMs={ms} {...h} />
);

describe('RestTimerBar', () => {
  it('parado: Iniciar descanso', async () => {
    const h = handlers();
    await render(bar({ status: 'IDLE' }, 0, h));
    await fireEvent.press(screen.getByLabelText('Iniciar descanso'));
    expect(h.onStart).toHaveBeenCalled();
  });
  it('contando: tempo, Pausar e Encerrar', async () => {
    const h = handlers();
    await render(bar({ status: 'RUNNING', endsAt: 1, durationMs: 90000 }, 90000, h));
    expect(screen.getByText('01:30')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Pausar descanso'));
    await fireEvent.press(screen.getByLabelText('Encerrar descanso'));
    expect(h.onPause).toHaveBeenCalled();
    expect(h.onStop).toHaveBeenCalled();
  });
  it('pausado: Retomar e Encerrar', async () => {
    const h = handlers();
    await render(bar({ status: 'PAUSED', remainingMs: 45000, durationMs: 90000 }, 45000, h));
    expect(screen.getByText('00:45')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Retomar descanso'));
    expect(h.onResume).toHaveBeenCalled();
    expect(screen.getByLabelText('Encerrar descanso')).toBeTruthy();
  });
  it('terminado: aviso e OK', async () => {
    const h = handlers();
    await render(bar({ status: 'FINISHED' }, 0, h));
    expect(screen.getByText(/Descanso terminado/)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('OK'));
    expect(h.onDismiss).toHaveBeenCalled();
  });
  it('anuncia só início e fim (uma vez cada)', async () => {
    const spy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation();
    const running: RestTimerState = { status: 'RUNNING', endsAt: 1, durationMs: 90000 };
    const view = await render(bar({ status: 'IDLE' }, 0));
    await view.rerender(bar(running, 90000));
    await view.rerender(bar(running, 89000));
    await view.rerender(bar(running, 88000));
    await view.rerender(bar({ status: 'FINISHED' }, 0));
    expect(spy.mock.calls).toEqual([['Descanso iniciado'], ['Descanso terminado']]);
  });
});

describe('RestTimerToggle', () => {
  it('mostra o estado e alterna ao tocar', async () => {
    const onPress = jest.fn();
    const view = await render(<RestTimerToggle enabled={false} onPress={onPress} />);
    const btn = screen.getByLabelText('Ativar cronômetro de descanso');
    expect(btn.props.accessibilityState).toMatchObject({ selected: false });
    await fireEvent.press(btn);
    expect(onPress).toHaveBeenCalled();
    await view.rerender(<RestTimerToggle enabled onPress={onPress} />);
    expect(screen.getByLabelText('Desativar cronômetro de descanso')).toBeTruthy();
  });
});
