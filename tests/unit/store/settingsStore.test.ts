import { useSettingsStore, type SettingsDeps } from '../../../src/store/settingsStore';

function deps(over: { inProgress?: unknown; settings?: unknown } = {}): SettingsDeps {
  return {
    settings: {
      get: async () => over.settings ?? { activeProgramId: 1, sequenceType: 'CONTINUOUS' },
    },
    sessions: { getInProgress: async () => over.inProgress ?? null },
    programs: {
      listPrograms: async () => [{ id: 1, name: 'P1' }],
      listWorkouts: async () => [],
      getWorkoutWithExercises: async () => ({ name: 'Treino A' }),
    },
    schedule: { getSchedule: async () => [] },
  } as unknown as SettingsDeps;
}

describe('settingsStore', () => {
  it('reload popula settings e inProgress nulo', async () => {
    await useSettingsStore.getState().reload(deps());
    const s = useSettingsStore.getState();
    expect(s.settings?.activeProgramId).toBe(1);
    expect(s.inProgress).toBeNull();
    expect(s.agenda).toEqual({ kind: 'NO_SCHEDULE' });
  });

  it('reflete sessão em andamento e mudança no repositório', async () => {
    await useSettingsStore
      .getState()
      .reload(deps({ inProgress: { id: 7, programId: 1, workoutId: 3 } }));
    expect(useSettingsStore.getState().inProgress).toEqual({
      sessionId: 7,
      programId: 1,
      workoutName: 'Treino A',
    });
    await useSettingsStore
      .getState()
      .reload(deps({ settings: { activeProgramId: 2, sequenceType: 'WEEKLY' } }));
    expect(useSettingsStore.getState().settings?.sequenceType).toBe('WEEKLY');
    expect(useSettingsStore.getState().inProgress).toBeNull();
  });
});
