import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { DatabaseGate } from '@/data/database/DatabaseGate';
import type { Database } from '@/data/database/Database';

const fakeDb = {} as Database;
const ok = { status: 'ready', version: 1 } as const;
const fail = { status: 'error', error: new Error('x'), version: 0 } as const;

describe('DatabaseGate', () => {
  it('erro de migration mostra mensagem e tenta novamente', async () => {
    const run = jest.fn().mockResolvedValueOnce(fail).mockResolvedValueOnce(ok);
    await render(
      <DatabaseGate open={async () => fakeDb} migrations={[]} run={run}>
        <Text>rotas</Text>
      </DatabaseGate>,
    );
    expect(await screen.findByText('Não foi possível atualizar seus dados')).toBeTruthy();
    expect(screen.queryByText('rotas')).toBeNull();
    await fireEvent.press(screen.getByText('Tentar novamente'));
    expect(await screen.findByText('rotas')).toBeTruthy();
    expect(run).toHaveBeenCalledTimes(2);
  });

  it('falha ao abrir o banco também mostra erro e recupera', async () => {
    const open = jest.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce(fakeDb);
    await render(
      <DatabaseGate open={open} migrations={[]} run={async () => ok}>
        <Text>rotas</Text>
      </DatabaseGate>,
    );
    expect(await screen.findByText('Tentar novamente')).toBeTruthy();
    await fireEvent.press(screen.getByText('Tentar novamente'));
    await waitFor(() => expect(screen.getByText('rotas')).toBeTruthy());
  });

  it('não renderiza filhos enquanto migra', async () => {
    await render(
      <DatabaseGate open={() => new Promise(() => {})} migrations={[]}>
        <Text>rotas</Text>
      </DatabaseGate>,
    );
    expect(screen.queryByText('rotas')).toBeNull();
  });
});
