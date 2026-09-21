import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, sizes, spacing, typography } from '@/constants/theme';
import type { Period } from '@/domain/statistics/types';

const ITEMS: { period: Period; short: string; full: string }[] = [
  { period: 'WEEK', short: 'Semana', full: 'Semana' },
  { period: 'MONTH', short: 'Mês', full: 'Mês' },
  { period: 'QUARTER', short: 'Trim.', full: 'Trimestre' },
  { period: 'SEMESTER', short: 'Sem.', full: 'Semestre' },
  { period: 'YEAR', short: 'Ano', full: 'Ano' },
];

interface Props {
  value: Period;
  onChange: (period: Period) => void;
}

export function PeriodSelector({ value, onChange }: Props) {
  return (
    <View accessibilityRole="tablist" style={styles.row}>
      {ITEMS.map((i) => {
        const selected = i.period === value;
        return (
          <Pressable
            key={i.period}
            accessibilityRole="tab"
            accessibilityLabel={i.full}
            accessibilityState={{ selected }}
            onPress={() => onChange(i.period)}
            style={[styles.tab, selected && styles.selected]}
          >
            <Text style={[styles.text, selected && styles.textSelected]}>{i.short}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs },
  tab: {
    flex: 1,
    minHeight: sizes.touch,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: { backgroundColor: colors.accent, borderColor: colors.accent },
  text: { ...typography.label, textTransform: 'none', color: colors.textSecondary },
  textSelected: { color: colors.onAccent, fontWeight: '700' },
});
