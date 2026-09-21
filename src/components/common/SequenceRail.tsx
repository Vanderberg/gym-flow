import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, sizes, spacing, typography } from '@/constants/theme';
import type { SequenceRailStep } from '@/domain/home/types';

const STATE_LABEL = { DONE: 'concluído', CURRENT: 'atual', PENDING: 'pendente' } as const;

export function SequenceRail({ steps }: { steps: SequenceRailStep[] }) {
  return (
    <View style={styles.row} accessibilityLabel="Sequência de treinos">
      {steps.map((step, i) => (
        <View key={`${step.code}-${i}`} style={styles.item}>
          <View
            accessible
            accessibilityLabel={`Treino ${step.code}, ${STATE_LABEL[step.state]}`}
            style={[
              styles.dot,
              step.state === 'CURRENT' && styles.current,
              step.state === 'DONE' && styles.done,
            ]}
          >
            <Text style={[styles.mark, step.state === 'CURRENT' && { color: colors.onAccent }]}>
              {step.state === 'DONE' ? '✓' : step.state === 'CURRENT' ? '●' : ''}
            </Text>
          </View>
          <Text style={[styles.code, step.state === 'CURRENT' && { color: colors.accent }]}>
            {step.code}
          </Text>
        </View>
      ))}
    </View>
  );
}

const DOT = sizes.touch / 2;
const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  item: { alignItems: 'center', gap: spacing.xs },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  current: { backgroundColor: colors.accent, borderColor: colors.accent },
  done: { borderColor: colors.textSecondary },
  mark: { ...typography.label, color: colors.textSecondary },
  code: { ...typography.label, color: colors.textMuted },
});
