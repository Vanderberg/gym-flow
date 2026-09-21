import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { WeekStripDay } from '@/domain/home/types';
import { weekdayLabel } from '@/utils/weekdayLabel';

export function WeekStrip({ days }: { days: WeekStripDay[] }) {
  return (
    <View style={styles.row} accessibilityLabel="Semana">
      {days.map((d) => {
        const short = weekdayLabel(d.weekday, 'SHORT');
        const spoken = `${weekdayLabel(d.weekday, 'LONG')}, ${d.label}${d.isToday ? ', hoje' : ''}${d.hasSession ? ', treino feito' : ''}`;
        return (
          <View
            key={d.weekday}
            accessible
            accessibilityLabel={spoken}
            style={[styles.col, d.isToday && styles.today]}
          >
            <Text style={[styles.day, d.isToday && { color: colors.onAccent }]}>{short}</Text>
            <Text style={[styles.code, d.isToday && { color: colors.onAccent }]}>{d.label}</Text>
            <Text style={[styles.mark, d.isToday && { color: colors.onAccent }]}>
              {d.hasSession ? '✓' : ' '}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs },
  col: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  today: { backgroundColor: colors.accent, borderColor: colors.accent },
  day: { ...typography.label, color: colors.textMuted },
  code: { ...typography.body, color: colors.text, fontWeight: '700' },
  mark: { ...typography.label, color: colors.accent },
});
