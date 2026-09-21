import { useHistoryStore } from '../../../src/store/historyStore';

const r = {
  exerciseId: 1,
  name: 'A',
  completed: false,
  weight: null,
  prescription: null,
  technique: null,
  notes: null,
  inWorkout: true,
};

describe('historyStore', () => {
  beforeEach(() => useHistoryStore.setState({ programFilter: null, edit: null, invalid: {} }));
  it('filtro isolado do rascunho; rascunho não altera original', () => {
    const st = useHistoryStore.getState();
    st.setProgramFilter(2);
    st.startEdit(9, [r]);
    useHistoryStore.getState().toggleCompleted(1);
    useHistoryStore.getState().setWeight(1, 50);
    const s = useHistoryStore.getState();
    expect(s.programFilter).toBe(2);
    expect(s.edit!.original[0]).toMatchObject({ completed: false, weight: null });
    expect(s.edit!.draft[0]).toMatchObject({ completed: true, weight: 50 });
    s.cancelEdit();
    expect(useHistoryStore.getState().edit).toBeNull();
    useHistoryStore.getState().clearProgramFilter();
    expect(useHistoryStore.getState().programFilter).toBeNull();
  });
});
