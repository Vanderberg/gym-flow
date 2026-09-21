import { act, renderRouter, fireEvent, waitFor } from 'expo-router/testing-library';
import { router } from 'expo-router';
import path from 'path';

jest.mock('@/data/database/openDatabase', () => ({
  openDatabase: async () => ({}),
}));
jest.mock('@/data/migrations/runner', () => ({
  runMigrations: async () => ({ status: 'ready', version: 1 }),
}));

const appDir = path.resolve(__dirname, '../../src/app');

describe('navegação', () => {
  it('mostra as 4 abas em português', async () => {
    const view = await renderRouter(appDir);
    for (const label of ['Treino', 'Histórico', 'Estatísticas', 'Config']) {
      expect(await view.findByLabelText(label)).toBeTruthy();
    }
    for (const label of ['Histórico', 'Estatísticas', 'Config']) {
      await fireEvent.press(view.getByLabelText(label));
      await waitFor(() => expect(view.getByRole('header', { name: label })).toBeTruthy());
    }
  });

  it('/workout abre sem abas e permite voltar', async () => {
    const view = await renderRouter(appDir);
    await view.findByLabelText('Histórico');
    await act(async () => {
      router.push('/workout');
    });
    await view.findAllByText('Treino em andamento');
    await act(async () => {
      router.back();
    });
    await waitFor(() => expect(view.queryByText('Treino em andamento')).toBeNull());
  });
});
