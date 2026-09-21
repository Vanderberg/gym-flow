import { StyleSheet, Text, View } from 'react-native';
import { Switch } from '@/components/common/Switch';
import { colors, sizes, spacing, typography } from '@/constants/theme';

interface Props {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

/** Linha de 56 dp com rótulo e switch (variante da SettingsRow). */
export function SettingsSwitchRow({ label, value, onValueChange }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} accessibilityLabel={label} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: sizes.row,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: { ...typography.body, color: colors.text, flexShrink: 1 },
});
