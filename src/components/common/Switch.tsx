import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, sizes, spacing } from '@/constants/theme';

interface Props {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
}

/** Alvo >= 48 dp; ligado/desligado por posição do botão e ícone, além da cor. */
export function Switch({ value, onValueChange, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={styles.target}
    >
      <View style={[styles.track, value && styles.trackOn]}>
        <View style={[styles.knob, value && styles.knobOn]}>
          <Text style={styles.icon}>{value ? '✓' : '–'}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  target: {
    minWidth: sizes.touch,
    minHeight: sizes.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: {
    width: sizes.touch,
    height: spacing.xl + spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    padding: spacing.xs,
  },
  trackOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  knob: {
    width: spacing.xl,
    height: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  knobOn: { backgroundColor: colors.onAccent, alignSelf: 'flex-end' },
  icon: { color: colors.bg, fontSize: 12, lineHeight: 14, fontWeight: '700' },
});
