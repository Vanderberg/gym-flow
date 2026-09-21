import { useHomeStore } from '../../../src/store/homeStore';
import type { HomeView } from '../../../src/domain/home/types';

const view: HomeView = {
  program: { id: 1, name: 'P' },
  sequenceType: 'CONTINUOUS',
  indicator: { kind: 'NONE' },
  card: { kind: 'NO_WORKOUTS' },
  suggestion: null,
  localDate: '2026-09-20',
  browsableWorkouts: [],
};

describe('homeStore', () => {
  beforeEach(() =>
    useHomeStore.setState({ view: null, status: 'loading', pendingDialogShown: false }),
  );
  it('transita loading -> ready/error', () => {
    expect(useHomeStore.getState().status).toBe('loading');
    useHomeStore.getState().setView(view);
    expect(useHomeStore.getState().status).toBe('ready');
    expect(useHomeStore.getState().view).toBe(view);
    useHomeStore.getState().setLoading();
    expect(useHomeStore.getState().status).toBe('loading');
    useHomeStore.getState().setError();
    expect(useHomeStore.getState().status).toBe('error');
  });
  it('markDialogShown marca uma vez', () => {
    useHomeStore.getState().markDialogShown();
    useHomeStore.getState().markDialogShown();
    expect(useHomeStore.getState().pendingDialogShown).toBe(true);
  });
});
