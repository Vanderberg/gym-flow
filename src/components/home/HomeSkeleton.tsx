import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

/** Mesma altura do cartão principal carregado (sem salto de layout). */
export const CARD_MIN_HEIGHT = 220;

export function HomeSkeleton() {
  return <View accessibilityLabel="Carregando" style={styles.card} />;
}

const styles = StyleSheet.create({
  card: {
    minHeight: CARD_MIN_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
});
