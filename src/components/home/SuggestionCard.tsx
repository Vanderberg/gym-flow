import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';

/** Texto do programa (não gerado pelo app), sem ações. */
export function SuggestionCard({ text }: { text: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>SUGESTÃO DA FICHA</Text>
      <Text style={styles.text}>{text}</Text>
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
    gap: spacing.xs,
  },
  label: { ...typography.label, color: colors.textMuted },
  text: { ...typography.body, color: colors.textSecondary },
});
