import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { InfoIcon } from '@/components/common/InfoIcon';
import { Button } from '@/components/common/Button';
import { PrescriptionBlock } from '@/components/common/PrescriptionBlock';
import { WeightInput } from '@/components/common/WeightInput';
import { colors, radius, sizes, spacing, typography } from '@/constants/theme';
import type { WorkoutScreenItem } from '@/domain/workout/types';
import { findLegendEntry } from '@/domain/help/legend';
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
  onInfoPressIn?: () => void;
  onInfoPressOut?: () => void;
  onTechniqueHelp?: (technique: string) => void;
  onTechniquePressIn?: () => void;
  onTechniquePressOut?: () => void;
  restoreFocus?: boolean;
  onFocusRestored?: () => void;
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
  onInfoPressIn,
  onInfoPressOut,
  onTechniqueHelp,
  onTechniquePressIn,
  onTechniquePressOut,
  restoreFocus,
  onFocusRestored,
}: Props) {
  const inputRef = useRef<TextInput>(null);
  useEffect(() => {
    if (restoreFocus && expanded) {
      inputRef.current?.focus();
      onFocusRestored?.();
    }
  }, [restoreFocus, expanded, onFocusRestored]);
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
          <InfoIcon onPress={onInfo} onPressIn={onInfoPressIn} onPressOut={onInfoPressOut} />
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
            techniqueHelp={
              onTechniqueHelp && item.technique && findLegendEntry(item.technique)
                ? {
                    onPress: () => onTechniqueHelp(item.technique as string),
                    ...(onTechniquePressIn ? { onPressIn: onTechniquePressIn } : {}),
                    ...(onTechniquePressOut ? { onPressOut: onTechniquePressOut } : {}),
                  }
                : undefined
            }
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
            inputRef={inputRef}
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
