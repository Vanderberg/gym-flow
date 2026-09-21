import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { EditActionBar } from '@/components/history/EditActionBar';
import { SessionDetailRow } from '@/components/history/SessionDetailRow';
import { colors, sizes, spacing, typography } from '@/constants/theme';
import { useSessionEdit } from '@/hooks/useSessionEdit';

const formatDate = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;

interface RemoveEvent {
  preventDefault(): void;
  data: { action: unknown };
}

export default function SessionDetailScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const s = useSessionEdit(Number(sessionId));
  const navigation = useNavigation();
  const [confirm, setConfirm] = useState(false);
  const pendingAction = useRef<unknown>(null);
  const dirtyRef = useRef(false);
  const isDirty = s.editing && s.dirty;
  useEffect(() => {
    dirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    return navigation.addListener(
      'beforeRemove' as never,
      ((e: RemoveEvent) => {
        if (!dirtyRef.current) return;
        e.preventDefault();
        pendingAction.current = e.data.action;
        setConfirm(true);
      }) as never,
    );
  }, [navigation]);

  const cancel = () => (s.dirty ? setConfirm(true) : s.discard());
  const back = () => router.back();
  const confirmDiscard = () => {
    setConfirm(false);
    s.discard();
    dirtyRef.current = false;
    const action = pendingAction.current;
    pendingAction.current = null;
    if (action) (navigation as unknown as { dispatch(a: unknown): void }).dispatch(action);
  };

  const d = s.detail;
  return (
    <View style={styles.screen}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={back}
        style={styles.back}
      >
        <Text style={styles.backText}>‹</Text>
      </Pressable>
      {d ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text accessibilityRole="header" style={styles.title}>
            {`${d.workout.code} — ${d.workout.name}`}
          </Text>
          <Text style={styles.meta}>{d.program.name}</Text>
          <Text style={styles.meta}>{formatDate(d.localDate)}</Text>
          <Text style={styles.meta}>{`${d.done} / ${d.total} realizados`}</Text>
          {s.rows.map((r) => (
            <SessionDetailRow
              key={r.exerciseId}
              row={r}
              editing={s.editing}
              onToggle={() => s.toggle(r.exerciseId)}
              onWeight={(w, inv) => s.setWeight(r.exerciseId, w, inv)}
            />
          ))}
          {s.saveError ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {s.saveError}
            </Text>
          ) : null}
          <EditActionBar
            editing={s.editing}
            canSave={s.canSave}
            onEdit={s.startEdit}
            onSave={() => void s.save()}
            onCancel={cancel}
          />
        </ScrollView>
      ) : s.failed ? (
        <EmptyState title="Sessão não encontrada" actionLabel="Voltar" onAction={back} />
      ) : (
        <Text style={styles.meta}>Carregando…</Text>
      )}
      <ConfirmDialog
        visible={confirm}
        title="Descartar as alterações?"
        message="As alterações feitas nesta sessão serão perdidas."
        confirmLabel="Descartar"
        cancelLabel="Continuar editando"
        destructive
        onCancel={() => {
          pendingAction.current = null;
          setConfirm(false);
        }}
        onConfirm={confirmDiscard}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  back: {
    minHeight: sizes.touch,
    minWidth: sizes.touch,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  backText: { ...typography.title, color: colors.text },
  content: { padding: spacing.lg, gap: spacing.sm },
  title: { ...typography.title, color: colors.text },
  meta: { ...typography.body, color: colors.textSecondary },
  error: { ...typography.body, color: colors.danger },
});
