import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';

export const MONTH_HEADER_HEIGHT = 40;

export function MonthHeader({ label }: { label: string }) {
  return (
    <View style={styles.box}>
      <Text accessibilityRole="header" style={styles.text}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { height: MONTH_HEADER_HEIGHT, justifyContent: 'flex-end', paddingBottom: spacing.xs },
  text: { ...typography.label, color: colors.textSecondary },
});
