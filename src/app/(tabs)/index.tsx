import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { ProgramBadge } from '@/components/common/ProgramBadge';
import { SequenceRail } from '@/components/common/SequenceRail';
import { Sheet } from '@/components/common/Sheet';
import { WeekStrip } from '@/components/common/WeekStrip';
import { HomeSkeleton } from '@/components/home/HomeSkeleton';
import { NextWorkoutCard } from '@/components/home/NextWorkoutCard';
import { ProgramWorkoutsSheet } from '@/components/home/ProgramWorkoutsSheet';
import { SuggestionCard } from '@/components/home/SuggestionCard';
import { colors, spacing, typography } from '@/constants/theme';
import { useHome } from '@/hooks/useHome';

const swallow = () => undefined;

export default function HomeScreen() {
  const home = useHome();
  const { view, status } = home;
  const [browsing, setBrowsing] = useState(false);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const [dialogDismissed, setDialogDismissed] = useState(false);

  const showPending =
    view?.card.kind === 'IN_PROGRESS' && !home.pendingDialogShown && !dialogDismissed;

  const dismiss = () => {
    setDialogDismissed(true);
    home.markDialogShown();
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={styles.title}>
        MEU TREINO
      </Text>
      {status === 'error' && !view ? (
        <View style={styles.error}>
          <Text style={styles.errorText}>Não foi possível carregar seus treinos</Text>
          <Button label="Tentar de novo" onPress={() => void home.reload()} />
        </View>
      ) : !view ? (
        <HomeSkeleton />
      ) : (
        <>
          <ProgramBadge name={view.program.name} />
          <Text style={styles.sequence}>
            {view.sequenceType === 'CONTINUOUS' ? 'Sequência contínua' : 'Dias da semana'}
          </Text>
          {view.indicator.kind === 'RAIL' ? <SequenceRail steps={view.indicator.steps} /> : null}
          {view.indicator.kind === 'WEEK' ? <WeekStrip days={view.indicator.days} /> : null}
          {home.notice ? <Text style={styles.notice}>{home.notice}</Text> : null}
          <NextWorkoutCard
            view={view}
            onStart={(id) => void home.start(id).catch(swallow)}
            onContinue={home.continueWorkout}
            onBrowse={() => setBrowsing(true)}
            onSwitchToContinuous={() => void home.switchToContinuous().catch(swallow)}
          />
          {view.suggestion ? <SuggestionCard text={view.suggestion} /> : null}
          <ProgramWorkoutsSheet
            visible={browsing}
            workouts={view.browsableWorkouts}
            onClose={() => setBrowsing(false)}
            onSelect={(id) => {
              setBrowsing(false);
              void home.start(id).catch(swallow);
            }}
          />
          <Sheet visible={showPending} onClose={dismiss}>
            <Text accessibilityRole="header" style={styles.dialogTitle}>
              Você possui um treino em andamento
            </Text>
            <Button
              label="Continuar"
              onPress={() => {
                dismiss();
                home.continueWorkout();
              }}
            />
            <Button
              label="Descartar"
              variant="danger"
              onPress={() => {
                dismiss();
                setConfirmingDiscard(true);
              }}
            />
          </Sheet>
          <ConfirmDialog
            visible={confirmingDiscard}
            title="Descartar treino"
            message="Descartar o treino em andamento? Isso não altera sua sequência nem suas estatísticas."
            confirmLabel="Descartar treino"
            destructive
            onCancel={() => setConfirmingDiscard(false)}
            onConfirm={() => {
              setConfirmingDiscard(false);
              void home.discard().catch(swallow);
            }}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg },
  title: { ...typography.title, color: colors.text },
  sequence: { ...typography.label, color: colors.textSecondary },
  notice: { ...typography.body, color: colors.danger },
  error: { gap: spacing.md, alignItems: 'stretch' },
  errorText: { ...typography.body, color: colors.text },
  dialogTitle: { ...typography.title, color: colors.text },
});
