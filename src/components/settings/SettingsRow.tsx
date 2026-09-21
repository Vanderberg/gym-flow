import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, sizes, spacing, typography } from '@/constants/theme';

interface Props {
  label: string;
  value?: string;
  onPress?: () => void;
  disabled?: boolean;
}

/** Linha de 56 dp; sem `onPress` vira linha somente leitura (sem `›`). */
export function SettingsRow({ label, value, onPress, disabled = false }: Props) {
  const content = (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.right}>
        {value ? <Text style={styles.value}>{value}</Text> : null}
        {onPress ? <Text style={styles.chevron}>›</Text> : null}
      </View>
    </>
  );
  const a11yLabel = value ? `${label}, ${value}` : label;
  if (!onPress) {
    return (
      <View accessible accessibilityLabel={a11yLabel} style={styles.row}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.row, disabled && styles.disabled]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: sizes.row,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  disabled: { opacity: 0.4 },
  label: { ...typography.body, color: colors.text, flexShrink: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  value: { ...typography.body, color: colors.textSecondary, flexShrink: 1, textAlign: 'right' },
  chevron: { ...typography.title, color: colors.textSecondary },
});
