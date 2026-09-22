import { useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import type { ContributionGrid } from '@/domain/statistics/contributionGrid';
import { weekdayLabel } from '@/utils/weekdayLabel';

const GAP = 4;
const MIN_CELL = 10;
const MAX_CELL = 22;
const LABEL_COL_WIDTH = 34;
const LEGEND_SWATCH = 12;

const formatShortDate = (localDate: string) => `${localDate.slice(8, 10)}/${localDate.slice(5, 7)}`;

/** Grade de frequência (estilo "gráfico de contribuições"): um quadrado aceso por dia treinado. */
export function ContributionGridView({ grid }: { grid: ContributionGrid }) {
  // Chute inicial plausível de largura: onLayout mede o valor real assim que a tela monta
  // (e em ambiente de teste, onLayout nunca dispara, então a grade precisa de algo para renderizar).
  const [gridWidth, setGridWidth] = useState(320);
  const activeCount = grid.weeks.reduce((n, w) => n + w.days.filter((d) => d.active).length, 0);
  const totalDays = grid.weeks.length * 7;
  const weekCount = grid.weeks.length;

  const onLayout = (e: LayoutChangeEvent) => setGridWidth(e.nativeEvent.layout.width);
  const availableForCells = Math.max(0, gridWidth - LABEL_COL_WIDTH - GAP - (weekCount - 1) * GAP);
  const cellSize = Math.min(
    MAX_CELL,
    Math.max(MIN_CELL, availableForCells / weekCount || MIN_CELL),
  );

  const firstDay = grid.weeks[0]?.days[0]?.date;
  const lastWeek = grid.weeks[weekCount - 1];
  const lastDay = lastWeek?.days[lastWeek.days.length - 1]?.date;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{`FREQUÊNCIA (ÚLTIMAS ${weekCount} SEMANAS)`}</Text>
      <View onLayout={onLayout} style={styles.gridRow}>
        <View style={styles.weekdayCol}>
          {Array.from({ length: 7 }, (_, i) => (
            <Text key={i} style={[styles.weekdayLabel, { height: cellSize }]} numberOfLines={1}>
              {weekdayLabel(i + 1, 'SHORT').slice(0, 3)}
            </Text>
          ))}
        </View>
        <View
          accessible
          accessibilityLabel={`Treinou em ${activeCount} de ${totalDays} dias nas últimas ${weekCount} semanas`}
          style={styles.weeksRow}
        >
          {grid.weeks.map((week) => (
            <View
              key={week.start}
              style={styles.weekCol}
              importantForAccessibility="no-hide-descendants"
            >
              {week.days.map((day) => (
                <View
                  key={day.date}
                  style={[
                    styles.cell,
                    { width: cellSize, height: cellSize },
                    day.active && styles.active,
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
      {firstDay && lastDay ? (
        <Text style={styles.range}>
          {`${formatShortDate(firstDay)} – ${formatShortDate(lastDay)}`}
        </Text>
      ) : null}
      <View style={styles.legend}>
        <View style={[styles.cell, styles.legendCell]} />
        <Text style={styles.legendText}>sem treino</Text>
        <View style={[styles.cell, styles.legendCell, styles.active]} />
        <Text style={styles.legendText}>treino</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  label: { ...typography.label, color: colors.textSecondary },
  gridRow: { flexDirection: 'row', width: '100%' },
  weekdayCol: { width: LABEL_COL_WIDTH, gap: GAP, marginRight: GAP },
  weekdayLabel: {
    ...typography.label,
    fontSize: 9,
    lineHeight: 10,
    letterSpacing: 0,
    color: colors.textMuted,
    textAlignVertical: 'center',
  },
  weeksRow: { flexDirection: 'row', gap: GAP },
  weekCol: { gap: GAP },
  cell: {
    borderRadius: 3,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  active: { backgroundColor: colors.accent, borderColor: colors.accent },
  range: { ...typography.label, fontSize: 10, color: colors.textMuted },
  legend: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendCell: { width: LEGEND_SWATCH, height: LEGEND_SWATCH },
  legendText: { ...typography.label, color: colors.textMuted, marginRight: spacing.sm },
});
