import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { TechniqueChip } from './TechniqueChip';

interface Props {
  prescription: string | null;
  technique: string | null;
  notes: string | null;
  techniqueHelp?: { onPress: () => void; onPressIn?: () => void; onPressOut?: () => void };
}

/** Exibe a prescrição como está na ficha; o app não interpreta. */
export function PrescriptionBlock({ prescription, technique, notes, techniqueHelp }: Props) {
  if (!prescription && !technique && !notes) return null;
  return (
    <View style={styles.container}>
      {prescription ? <Text style={styles.prescription}>{prescription}</Text> : null}
      {technique ? (
        <TechniqueChip
          label={technique}
          onHelp={techniqueHelp?.onPress}
          onHelpPressIn={techniqueHelp?.onPressIn}
          onHelpPressOut={techniqueHelp?.onPressOut}
        />
      ) : null}
      {notes ? <Text style={styles.notes}>{notes}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  prescription: { ...typography.body, color: colors.text },
  notes: { ...typography.body, color: colors.textSecondary },
});
