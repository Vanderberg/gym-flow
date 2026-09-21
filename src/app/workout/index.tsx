import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { ProgramBadge } from '@/components/common/ProgramBadge';
import { SegmentedProgress } from '@/components/common/SegmentedProgress';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { RestTimerBar } from '@/components/workout/RestTimerBar';
import { RestTimerToggle } from '@/components/workout/RestTimerToggle';
import { FinishBar } from '@/components/workout/FinishBar';
import { WarmupNote } from '@/components/workout/WarmupNote';
import { colors, sizes, spacing, typography } from '@/constants/theme';
import { formatWeight } from '@/domain/workout/weight';
import { useRestTimer } from '@/hooks/useRestTimer';
import { useSettings } from '@/hooks/useSettings';
import { useWorkoutSession } from '@/hooks/useWorkoutSession';
import { useWorkoutStore } from '@/store/workoutStore';

const FINISH_ERROR = 'Não foi possível finalizar. Nada foi alterado.';

export default function WorkoutScreen() {
  const w = useWorkoutSession();
  const { view, status } = w;
  const timer = useRestTimer();
  const { setRestTimerEnabled } = useSettings();
  const { reset: resetTimer } = timer;
  const [confirming, setConfirming] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const { load } = w;

  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (status === 'noSession') {
      resetTimer();
      router.replace('/');
    }
  }, [status, resetTimer]);

  const confirmFinish = async () => {
    setConfirming(false);
    const ok = await w.finish();
    if (ok) resetTimer();
    setFinishError(ok ? null : FINISH_ERROR);
  };

  const markCompleted = async (exerciseId: number, completed: boolean) => {
    await w.setCompleted(exerciseId, completed);
    if (!useWorkoutStore.getState().cardErrors[exerciseId]) timer.onExerciseMarked(completed);
  };

  if (status === 'error' && !view) {
    return (
      <View style={styles.screen}>
        <EmptyState
          title="Não foi possível carregar o treino"
          actionLabel="Tentar de novo"
          onAction={() => void load()}
        />
      </View>
    );
  }
  if (!view) {
    return (
      <View style={styles.screen}>
        <Text style={styles.muted}>Carregando…</Text>
      </View>
    );
  }
  const { done, total } = view.progress;
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            onPress={() => router.back()}
            style={styles.back}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>
          <Text
            accessibilityRole="header"
            style={styles.title}
          >{`TREINO ${view.workout.code}`}</Text>
          <RestTimerToggle
            enabled={timer.enabled}
            onPress={() => void setRestTimerEnabled(!timer.enabled).catch(() => undefined)}
          />
        </View>
        <Text style={styles.workoutName}>{view.workout.name}</Text>
        <ProgramBadge name={view.program.name} />
        <SegmentedProgress done={done} total={total} />
        {view.workout.warmupNote ? <WarmupNote text={view.workout.warmupNote} /> : null}
        {finishError ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {finishError}
          </Text>
        ) : null}
        {view.items.length === 0 ? (
          <EmptyState title="Este treino não tem exercícios" />
        ) : (
          view.items.map((item) => (
            <ExerciseCard
              key={item.exerciseId}
              item={item}
              expanded={w.expanded[item.exerciseId] ?? !item.completed}
              weightText={w.drafts[item.exerciseId] ?? formatWeight(item.weight)}
              error={w.cardErrors[item.exerciseId]}
              onToggle={() =>
                w.toggleExpanded(item.exerciseId, w.expanded[item.exerciseId] ?? !item.completed)
              }
              onSetCompleted={(c) => void markCompleted(item.exerciseId, c)}
              onWeightChange={(t) => w.setDraft(item.exerciseId, t)}
              onWeightCommit={() => void w.saveWeight(item.exerciseId)}
              onAdjust={(d) => void w.adjustWeight(item.exerciseId, d)}
              onUseLast={() => void w.applyLastWeight(item.exerciseId)}
            />
          ))
        )}
      </ScrollView>
      {timer.enabled ? (
        <RestTimerBar
          state={timer.state}
          remainingMs={timer.remainingMs}
          onStart={timer.start}
          onPause={timer.pause}
          onResume={timer.resume}
          onStop={timer.stop}
          onDismiss={timer.dismiss}
        />
      ) : null}
      <FinishBar onPress={() => setConfirming(true)} />
      <ConfirmDialog
        visible={confirming}
        title="Finalizar treino?"
        message={`${done} de ${total} exercícios realizados. (${total - done} pendentes serão registrados como não realizados)`}
        confirmLabel="Finalizar"
        onConfirm={() => void confirmFinish()}
        onCancel={() => setConfirming(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  back: {
    minWidth: sizes.touch,
    minHeight: sizes.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { ...typography.title, color: colors.text },
  title: { ...typography.title, color: colors.text },
  workoutName: { ...typography.body, color: colors.text, fontWeight: '700' },
  muted: { ...typography.body, color: colors.textSecondary, padding: spacing.xl },
  error: { ...typography.body, color: colors.danger },
});
