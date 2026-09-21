import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/common/Button';
import { PrescriptionBlock } from '@/components/common/PrescriptionBlock';
import { WeightInput } from '@/components/common/WeightInput';
import { colors, radius, sizes, spacing, typography } from '@/constants/theme';
import type { WorkoutScreenItem } from '@/domain/workout/types';
import { formatWeight } from '@/domain/workout/weight';

interface Props {
  item: WorkoutScreenItem;
  expanded: boolean;
  weightText: string;
  error?: string | null;
  onToggle: () => void;
  onSetCompleted: (completed: boolean) => void;
  onWeightChange: (text: string) => void;
  onWeightCommit: () => void;
  onAdjust: (delta: number) => void;
  onUseLast: () => void;
  onInfo?: () => void;
  onHelp?: () => void;
}

const STEP = 2.5;

export function ExerciseCard({
  item,
  expanded,
  weightText,
  error,
  onToggle,
  onSetCompleted,
  onWeightChange,
  onWeightCommit,
  onAdjust,
  onUseLast,
  onInfo,
  onHelp,
}: Props) {
  const firstLine = item.prescription ? item.prescription.split('\n')[0] : null;
  const weightSummary = item.weight !== null ? `${formatWeight(item.weight)} kg` : null;
  return (
    <View style={[styles.card, item.completed && styles.done]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${item.name}, ${item.completed ? 'feito' : 'pendente'}`}
          accessibilityState={{ expanded, checked: item.completed }}
          onPress={onToggle}
          style={styles.titleArea}
        >
          <Text style={[styles.mark, item.completed && styles.markDone]}>
            {item.completed ? '✓' : '○'}
          </Text>
          <Text numberOfLines={2} style={styles.name}>
            {item.name}
          </Text>
        </Pressable>
        {onInfo ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Informações" onPress={onInfo}>
            <Text style={styles.icon}>ⓘ</Text>
          </Pressable>
        ) : null}
        {onHelp ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Ajuda" onPress={onHelp}>
            <Text style={styles.icon}>?</Text>
          </Pressable>
        ) : null}
      </View>
      {!expanded ? (
        <Text style={styles.summary}>{[firstLine, weightSummary].filter(Boolean).join(' · ')}</Text>
      ) : (
        <View style={styles.body}>
          <PrescriptionBlock
            prescription={item.prescription}
            technique={item.technique}
            notes={item.notes}
          />
          <Text style={styles.last}>
            {item.lastWeight !== null
              ? `ÚLTIMA CARGA ${formatWeight(item.lastWeight)} kg`
              : 'Sem carga anterior'}
          </Text>
          <WeightInput
            value={weightText}
            onChangeText={onWeightChange}
            onBlur={onWeightCommit}
            onDecrement={() => onAdjust(-STEP)}
            onIncrement={() => onAdjust(STEP)}
            error={error}
            label={`Peso de ${item.name}`}
          />
          {item.lastWeight !== null ? (
            <Button
              label={`Usar ${formatWeight(item.lastWeight)} kg`}
              variant="ghost"
              onPress={onUseLast}
            />
          ) : null}
          {error ? (
            <Button label="Tentar de novo" variant="ghost" onPress={onWeightCommit} />
          ) : null}
          {item.completed ? (
            <Button label="DESMARCAR" variant="ghost" onPress={() => onSetCompleted(false)} />
          ) : (
            <Button label="✓ FEITO" onPress={() => onSetCompleted(true)} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  done: { borderColor: colors.accent },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  titleArea: {
    flex: 1,
    minHeight: sizes.touch,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  mark: { ...typography.title, color: colors.textMuted },
  markDone: { color: colors.accent },
  name: { ...typography.body, color: colors.text, flex: 1, fontWeight: '700' },
  icon: { ...typography.title, color: colors.textSecondary },
  summary: { ...typography.body, color: colors.textSecondary },
  body: { gap: spacing.md },
  last: { ...typography.label, color: colors.textSecondary },
});
