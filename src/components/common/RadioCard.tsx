import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, sizes, spacing, typography } from '@/constants/theme';

interface Props {
  title: string;
  description?: string;
  selected: boolean;
  onPress?: () => void;
  disabled?: boolean;
  disabledReason?: string;
}

export function RadioCard({
  title,
  description,
  selected,
  onPress,
  disabled = false,
  disabledReason,
}: Props) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityHint={description}
      accessibilityState={{ selected, checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.card, selected && styles.selected, disabled && styles.disabled]}
    >
      <Text style={[styles.mark, selected && { color: colors.accent }]}>
        {selected ? '●' : '○'}
      </Text>
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
        {disabled && disabledReason ? (
          <Text style={styles.description}>{disabledReason}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: sizes.row,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { borderColor: colors.accent, backgroundColor: colors.surfaceRaised },
  disabled: { opacity: 0.4 },
  mark: { ...typography.body, color: colors.textSecondary },
  texts: { flex: 1, gap: spacing.xs },
  title: { ...typography.body, color: colors.text, fontWeight: '700' },
  description: { ...typography.body, color: colors.textSecondary },
});
