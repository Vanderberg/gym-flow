import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, sizes, typography } from '@/constants/theme';

interface Props {
  onPress: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  accessibilityLabel?: string;
  glyph?: string;
}

/** Botão de ajuda contextual (44+ dp). `?` legenda; `ⓘ` via InfoIcon. */
export function HelpIcon({
  onPress,
  onPressIn,
  onPressOut,
  accessibilityLabel = 'Legenda das técnicas',
  glyph = '?',
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      style={styles.btn}
    >
      <Text style={styles.glyph}>{glyph}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minWidth: sizes.touch,
    minHeight: sizes.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: { ...typography.title, color: colors.textSecondary },
});
