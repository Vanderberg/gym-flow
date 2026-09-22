import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import type { ContributionGrid } from '@/domain/statistics/contributionGrid';

const CELL = 14;
const GAP = 4;

/** Grade de frequência (estilo "gráfico de contribuições"): um quadrado aceso por dia treinado. */
export function ContributionGridView({ grid }: { grid: ContributionGrid }) {
  const activeCount = grid.weeks.reduce((n, w) => n + w.days.filter((d) => d.active).length, 0);
  const totalDays = grid.weeks.length * 7;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{`FREQUÊNCIA (ÚLTIMAS ${grid.weeks.length} SEMANAS)`}</Text>
      <View
        accessible
        accessibilityLabel={`Treinou em ${activeCount} de ${totalDays} dias nas últimas ${grid.weeks.length} semanas`}
        style={styles.row}
      >
        {grid.weeks.map((week) => (
          <View key={week.start} style={styles.col} importantForAccessibility="no-hide-descendants">
            {week.days.map((day) => (
              <View key={day.date} style={[styles.cell, day.active && styles.active]} />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <View style={styles.cell} />
        <Text style={styles.legendText}>sem treino</Text>
        <View style={[styles.cell, styles.active]} />
        <Text style={styles.legendText}>treino</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  label: { ...typography.label, color: colors.textSecondary },
  row: { flexDirection: 'row', gap: GAP },
  col: { gap: GAP },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 3,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  active: { backgroundColor: colors.accent, borderColor: colors.accent },
  legend: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendText: { ...typography.label, color: colors.textMuted, marginRight: spacing.sm },
});
