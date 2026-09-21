import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/common/Button';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { HomeView } from '@/domain/home/types';
import { CARD_MIN_HEIGHT } from './HomeSkeleton';

interface Props {
  view: HomeView;
  onStart: (workoutId: number) => void;
  onContinue: () => void;
  onBrowse: () => void;
  onSwitchToContinuous: () => void;
}

function Body({ view, onStart, onContinue, onBrowse, onSwitchToContinuous }: Props) {
  const card = view.card;
  switch (card.kind) {
    case 'IN_PROGRESS':
      return (
        <>
          <Text style={styles.label}>TREINO EM ANDAMENTO</Text>
          <Text style={styles.name}>{card.workoutName}</Text>
          <Text style={styles.meta}>
            {card.done} / {card.total} realizados
          </Text>
          <Button label="CONTINUAR TREINO" onPress={onContinue} />
        </>
      );
    case 'WORKOUT': {
      const { workout, dayLabel } = card;
      const label = dayLabel
        ? `${dayLabel} · TREINO ${workout.code}`
        : `PRÓXIMO TREINO · DIA ${workout.code}`;
      return (
        <>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.name} numberOfLines={2}>
            {workout.name}
          </Text>
          <Text style={styles.meta}>{workout.exerciseCount} exercícios</Text>
          {card.doneToday ? <Text style={styles.done}>✓ Concluído hoje</Text> : null}
          <Button label="COMEÇAR TREINO" onPress={() => onStart(workout.id)} />
        </>
      );
    }
    case 'REST':
      return (
        <>
          <Text style={styles.label}>{card.dayLabel} · DESCANSO</Text>
          {view.browsableWorkouts.length > 0 ? (
            <Button label="Ver treinos do programa" variant="ghost" onPress={onBrowse} />
          ) : null}
        </>
      );
    case 'OPTIONAL_DAY':
      return (
        <>
          <Text style={styles.label}>{card.dayLabel} · OPCIONAL</Text>
          {card.note ? <Text style={styles.name}>{card.note}</Text> : null}
          {view.browsableWorkouts.length > 0 ? (
            <Button label="Ver treinos do programa" variant="ghost" onPress={onBrowse} />
          ) : null}
        </>
      );
    case 'NO_SCHEDULE':
      return (
        <>
          <Text style={styles.name}>Sem agenda configurada para este programa</Text>
          <Button label="Voltar para sequência contínua" onPress={onSwitchToContinuous} />
        </>
      );
    case 'NO_WORKOUTS':
      return <Text style={styles.name}>Este programa não tem treinos ativos</Text>;
  }
}

export function NextWorkoutCard(props: Props) {
  return (
    <View style={styles.card}>
      <Body {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: CARD_MIN_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    justifyContent: 'center',
  },
  label: { ...typography.label, color: colors.accent },
  name: { ...typography.title, color: colors.text },
  meta: { ...typography.body, color: colors.textSecondary },
  done: { ...typography.label, color: colors.accent },
});
