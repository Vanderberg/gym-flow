import { Pressable, StyleSheet, Text } from 'react-native';
import { Sheet } from '@/components/common/Sheet';
import { colors, sizes, spacing, typography } from '@/constants/theme';
import type { WorkoutSummary } from '@/domain/home/types';

interface Props {
  visible: boolean;
  workouts: WorkoutSummary[];
  onClose: () => void;
  onSelect: (workoutId: number) => void;
}

export function ProgramWorkoutsSheet({ visible, workouts, onClose, onSelect }: Props) {
  return (
    <Sheet visible={visible} onClose={onClose}>
      <Text accessibilityRole="header" style={styles.title}>
        Treinos do programa
      </Text>
      {workouts.map((w) => (
        <Pressable
          key={w.id}
          accessibilityRole="button"
          accessibilityLabel={`${w.code} ${w.name}, ${w.exerciseCount} exercícios`}
          style={styles.row}
          onPress={() => onSelect(w.id)}
        >
          <Text style={styles.code}>{w.code}</Text>
          <Text style={styles.name}>{w.name}</Text>
          <Text style={styles.count}>{w.exerciseCount} exercícios</Text>
        </Pressable>
      ))}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text },
  row: {
    minHeight: sizes.row,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  code: { ...typography.title, color: colors.accent, minWidth: spacing.xxl },
  name: { ...typography.body, color: colors.text, flex: 1 },
  count: { ...typography.label, color: colors.textMuted },
});
