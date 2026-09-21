import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';

interface Props {
  label: string;
  value: string;
  hint?: string;
  /** Rótulo lido por leitores de tela; padrão "Rótulo: valor". */
  accessibilityLabel?: string;
}

export function StatCard({ label, value, hint, accessibilityLabel }: Props) {
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel ?? `${label}: ${value}`}
      style={styles.card}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  label: { ...typography.label, color: colors.textSecondary },
  value: { ...typography.title, fontSize: 40, lineHeight: 44, color: colors.text },
  hint: { ...typography.label, textTransform: 'none', color: colors.textMuted },
});
