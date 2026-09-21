import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, sizes, typography } from '@/constants/theme';

interface Props {
  enabled: boolean;
  onPress: () => void;
}

/** Ícone de cronômetro do cabeçalho (44 dp); estado por ícone e accessibilityState, não só cor. */
export function RestTimerToggle({ enabled, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={
        enabled ? 'Desativar cronômetro de descanso' : 'Ativar cronômetro de descanso'
      }
      accessibilityState={{ selected: enabled }}
      onPress={onPress}
      style={styles.target}
    >
      <Text style={[styles.icon, { color: enabled ? colors.accent : colors.textMuted }]}>
        {enabled ? '⏱ ✓' : '⏱'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  target: {
    minWidth: sizes.toggle,
    minHeight: sizes.toggle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { ...typography.body, fontWeight: '700' },
});
