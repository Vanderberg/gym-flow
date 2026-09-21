import { StyleSheet, Text } from 'react-native';
import { colors, typography } from '@/constants/theme';

export function PeriodHeader({ label }: { label: string }) {
  return (
    <Text accessibilityRole="header" style={styles.text}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({ text: { ...typography.label, color: colors.textSecondary } });
