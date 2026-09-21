import { act, renderRouter, fireEvent, waitFor } from 'expo-router/testing-library';
import { router } from 'expo-router';
import path from 'path';

jest.mock('@/data/database/openDatabase', () => ({
  openDatabase: async () => ({}),
}));
jest.mock('@/data/bootstrap', () => ({
  bootstrapDatabase: async () => ({ status: 'ready' }),
}));

jest.mock('@/hooks/useHistoryList', () => ({
  useHistoryList: () => ({
    items: [],
    sections: [],
    programs: [],
    status: 'ready',
    reload: jest.fn(),
    programFilter: null,
  }),
}));

jest.mock('@/hooks/useWorkoutSession', () => ({
  useWorkoutSession: () => ({
    view: {
      sessionId: 1,
      program: { id: 1, name: 'Treino Padrão' },
      workout: { id: 1, code: '1', name: 'Peito', position: 1, warmupNote: null },
      items: [],
      progress: { done: 0, total: 0 },
    },
    status: 'ready',
    expanded: {},
    drafts: {},
    cardErrors: {},
    load: jest.fn(),
    finish: jest.fn(),
  }),
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
      const title = { Config: 'CONFIGURAÇÕES', Histórico: 'HISTÓRICO' }[label] ?? label;
      await waitFor(() => expect(view.getByRole('header', { name: title })).toBeTruthy());
    }
  });

  it('/workout abre sem abas e permite voltar', async () => {
    const view = await renderRouter(appDir);
    await view.findByLabelText('Histórico');
    await act(async () => {
      router.push('/workout');
    });
    await view.findAllByText('TREINO 1');
    await act(async () => {
      router.back();
    });
    await waitFor(() => expect(view.queryByText('TREINO 1')).toBeNull());
  });
});
