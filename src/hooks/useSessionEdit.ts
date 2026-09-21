import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { GetSessionDetail } from '@/application/GetSessionDetail';
import { SaveSessionEdits } from '@/application/SaveSessionEdits';
import { useDatabase } from '@/data/database/DatabaseProvider';
import { createRepositories } from '@/data/repositories';
import { buildEditChanges, hasChanges } from '@/domain/history/editChanges';
import type { SessionDetail } from '@/domain/history/types';
import { useHistoryStore } from '@/store/historyStore';

export function useSessionEdit(sessionId: number) {
  const db = useDatabase();
  const repos = useMemo(() => createRepositories(db), [db]);
  const edit = useHistoryStore((s) => s.edit);
  const invalid = useHistoryStore((s) => s.invalid);
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [failed, setFailed] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setDetail(await new GetSessionDetail(repos).execute(sessionId));
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [repos, sessionId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );
  useEffect(() => () => useHistoryStore.getState().cancelEdit(), []);

  const editing = edit !== null && edit.sessionId === sessionId;
  const changes = editing ? buildEditChanges(edit.original, edit.draft) : { rows: [] };
  const dirty = hasChanges(changes);
  const canSave = editing && !Object.values(invalid).some(Boolean);

  const startEdit = () => {
    if (detail) useHistoryStore.getState().startEdit(sessionId, detail.rows);
    setSaveError(null);
  };
  const save = async () => {
    try {
      if (dirty) await new SaveSessionEdits({ db }).execute({ sessionId, changes });
      useHistoryStore.getState().cancelEdit();
      setSaveError(null);
      await load();
    } catch {
      setSaveError('Não foi possível salvar. Nada foi alterado.');
    }
  };
  return {
    detail,
    failed,
    editing,
    rows: editing ? edit.draft : (detail?.rows ?? []),
    dirty,
    canSave,
    saveError,
    reload: load,
    startEdit,
    save,
    toggle: (id: number) => useHistoryStore.getState().toggleCompleted(id),
    setWeight: (id: number, w: number | null, inv: boolean) =>
      useHistoryStore.getState().setWeight(id, w, inv),
    discard: () => useHistoryStore.getState().cancelEdit(),
  };
}
