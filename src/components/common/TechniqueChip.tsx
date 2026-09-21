import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, sizes, spacing, typography } from '@/constants/theme';

interface Props {
  label: string;
  onHelp?: () => void;
  onHelpPressIn?: () => void;
  onHelpPressOut?: () => void;
}

export function TechniqueChip({ label, onHelp, onHelpPressIn, onHelpPressOut }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.chip} accessibilityLabel={`Técnica ${label}`}>
        <Text style={styles.text}>{label.toUpperCase()}</Text>
      </View>
      {onHelp ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Explicação de ${label}`}
          onPressIn={onHelpPressIn}
          onPressOut={onHelpPressOut}
          onPress={onHelp}
          style={styles.help}
        >
          <Text style={styles.helpText}>?</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  chip: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: { ...typography.label, color: colors.accent },
  help: {
    minWidth: sizes.touch,
    minHeight: sizes.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: { ...typography.body, color: colors.textSecondary, fontWeight: '700' },
});
