import { useWorkoutStore } from '../../../src/store/workoutStore';
import type { WorkoutScreenView } from '../../../src/domain/workout/types';

const item = (id: number) => ({
  exerciseId: id,
  name: `E${id}`,
  displayOrder: id,
  prescription: null,
  technique: null,
  notes: null,
  completed: false,
  weight: null,
  lastWeight: null,
});
const view = (ids: number[]): WorkoutScreenView => ({
  sessionId: 1,
  program: { id: 1, name: 'P' },
  workout: { id: 1, code: '1', name: 'W', position: 1, warmupNote: null },
  items: ids.map(item),
  progress: { done: 0, total: ids.length },
});

beforeEach(() => useWorkoutStore.getState().reset());

describe('workoutStore', () => {
  it('transições de status', () => {
    expect(useWorkoutStore.getState().status).toBe('loading');
    useWorkoutStore.getState().setView(view([1]));
    expect(useWorkoutStore.getState().status).toBe('ready');
    useWorkoutStore.getState().setStatus('noSession');
    expect(useWorkoutStore.getState().status).toBe('noSession');
  });
  it('expandir, rascunho e erro isolados por exercício', () => {
    const s = useWorkoutStore.getState();
    s.toggleExpanded(1, false);
    s.setDraft(1, '60');
    s.setCardError(2, 'x');
    const st = useWorkoutStore.getState();
    expect(st.expanded).toEqual({ 1: true });
    expect(st.drafts).toEqual({ 1: '60' });
    expect(st.cardErrors).toEqual({ 2: 'x' });
    st.clearDraft(1);
    st.clearCardError(2);
    expect(useWorkoutStore.getState().drafts).toEqual({});
    expect(useWorkoutStore.getState().cardErrors).toEqual({});
  });
  it('setView mantém rascunhos de exercícios que continuam', () => {
    useWorkoutStore.getState().setDraft(1, '10');
    useWorkoutStore.getState().setDraft(9, '20');
    useWorkoutStore.getState().setView(view([1, 2]));
    expect(useWorkoutStore.getState().drafts).toEqual({ 1: '10' });
  });
});
