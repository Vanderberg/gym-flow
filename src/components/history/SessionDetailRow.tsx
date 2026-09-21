import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WeightInput } from '@/components/common/WeightInput';
import { colors, radius, sizes, spacing, typography } from '@/constants/theme';
import type { DetailRow } from '@/domain/history/types';
import { formatWeight, parseWeightInput } from '@/domain/workout/weight';

interface Props {
  row: DetailRow;
  editing?: boolean;
  onToggle?: () => void;
  onWeight?: (weight: number | null, invalid: boolean) => void;
}

const STEP = 2.5;

export function SessionDetailRow({ row, editing = false, onToggle, onWeight }: Props) {
  const [text, setText] = useState(formatWeight(row.weight));
  const [error, setError] = useState<string | null>(null);

  const change = (t: string) => {
    setText(t);
    const p = parseWeightInput(t);
    if (p.ok) {
      setError(null);
      onWeight?.(p.value, false);
    } else {
      setError('Informe um valor maior ou igual a 0');
      onWeight?.(null, true);
    }
  };
  const step = (delta: number) => {
    const p = parseWeightInput(text);
    const base = p.ok ? (p.value ?? 0) : 0;
    change(formatWeight(Math.max(0, base + delta)));
  };

  const weightLabel = row.completed
    ? row.weight === null
      ? 'sem carga'
      : `${formatWeight(row.weight)} kg`
    : 'não realizado';
  const mark = row.completed ? '✓' : '○';
  const status = row.completed ? 'realizado' : 'não realizado';
  const label = `Exercício ${row.name}, ${status}${row.weight !== null ? `, ${formatWeight(row.weight)} quilos` : ''}`;

  const head = (
    <>
      <Text style={[styles.mark, row.completed && styles.markDone]}>{mark}</Text>
      <View style={styles.body}>
        <Text style={styles.name}>{row.name}</Text>
        {row.prescription ? <Text style={styles.meta}>{row.prescription}</Text> : null}
      </View>
      {!editing ? <Text style={styles.weight}>{weightLabel}</Text> : null}
    </>
  );

  return (
    <View style={styles.row}>
      {editing ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          onPress={onToggle}
          style={styles.line}
        >
          {head}
        </Pressable>
      ) : (
        <View style={styles.line}>{head}</View>
      )}
      {editing ? (
        <WeightInput
          label={`Peso de ${row.name}`}
          value={text}
          onChangeText={change}
          onBlur={() => undefined}
          onDecrement={() => step(-STEP)}
          onIncrement={() => step(STEP)}
          error={error}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  line: { minHeight: sizes.touch, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  mark: { ...typography.title, color: colors.textMuted, minWidth: 32, textAlign: 'center' },
  markDone: { color: colors.accent },
  body: { flex: 1 },
  name: { ...typography.body, color: colors.text, fontWeight: '700' },
  meta: { ...typography.body, color: colors.textSecondary },
  weight: { ...typography.body, color: colors.textSecondary },
});
