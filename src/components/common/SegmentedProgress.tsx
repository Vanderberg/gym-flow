import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';

interface Props {
  done: number;
  total: number;
}

/** N segmentos (um por exercício), sempre acompanhado do texto. */
export function SegmentedProgress({ done, total }: Props) {
  const text = `${done} / ${total} realizados`;
  return (
    <View accessible accessibilityLabel={text} style={styles.container}>
      <View style={styles.bar}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            testID={i < done ? 'segment-done' : 'segment-pending'}
            style={[styles.segment, i < done && styles.done]}
          />
        ))}
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  bar: { flexDirection: 'row', gap: spacing.xs },
  segment: { flex: 1, height: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.border },
  done: { backgroundColor: colors.accent },
  text: { ...typography.label, color: colors.textSecondary },
});
