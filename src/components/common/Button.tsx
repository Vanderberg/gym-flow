import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, sizes, spacing, typography } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'danger' | 'ghost';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  accessibilityLabel,
}: Props) {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'danger' && styles.danger,
        variant === 'ghost' && styles.ghost,
        pressed && styles.pressed,
        inactive && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.onAccent : colors.text} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'primary' && { color: colors.onAccent },
            variant === 'danger' && { color: colors.danger },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: sizes.button,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  primary: { backgroundColor: colors.accent, borderColor: colors.accent },
  danger: { borderColor: colors.danger },
  ghost: { borderColor: 'transparent' },
  pressed: { opacity: 0.92 },
  disabled: { opacity: 0.4 },
  text: { ...typography.body, color: colors.text, fontWeight: '700' },
});
