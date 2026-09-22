import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { FilterSelect } from '@/components/common/FilterSelect';
import { StatCard } from '@/components/common/StatCard';
import { PeriodHeader } from '@/components/statistics/PeriodHeader';
import { PeriodSelector } from '@/components/statistics/PeriodSelector';
import { colors, spacing, typography } from '@/constants/theme';
import { useStatistics } from '@/hooks/useStatistics';
import { formatDecimal } from '@/utils/formatDecimal';

export default function StatisticsScreen() {
  const s = useStatistics();
  const insets = useSafeAreaInsets();
  const { view, status } = s;
  const options = [
    { id: null, label: 'Todos' },
    ...(view?.programs ?? []).map((p) => ({ id: p.id, label: p.name })),
  ];
  const filterName = options.find((o) => o.id === s.programFilter)?.label ?? 'Todos';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
    >
      <View style={styles.header}>
        <Text
          accessibilityRole="header"
          accessibilityLabel={`Estatísticas, filtro: ${filterName}`}
          style={styles.title}
        >
          ESTATÍSTICAS
        </Text>
        <FilterSelect options={options} value={s.programFilter} onChange={s.setProgramFilter} />
      </View>
      <PeriodSelector value={s.period} onChange={s.setPeriod} />
      {status === 'error' && !view ? (
        <View style={styles.block}>
          <Text style={styles.text}>Não foi possível carregar as estatísticas</Text>
          <Button label="Tentar de novo" onPress={() => void s.reload()} />
        </View>
      ) : !view ? (
        <View accessibilityLabel="Carregando" style={styles.skeleton} />
      ) : (
        <>
          <PeriodHeader label={view.range.label} />
          {!view.hasAnySession ? (
            <EmptyState
              title="Complete seu primeiro treino para começar a acompanhar sua frequência."
              actionLabel="Ir para o treino"
              onAction={() => router.navigate('/')}
            />
          ) : (
            <>
              <View style={styles.row}>
                <StatCard label="Treinos no período" value={String(view.count)} />
              </View>
              <View style={styles.row}>
                <StatCard
                  label="Por semana"
                  value={view.count === 0 ? '—' : formatDecimal(view.weeklyAverage)}
                />
                <StatCard
                  label="Intervalo"
                  value={
                    view.averageIntervalDays === null
                      ? '—'
                      : formatDecimal(view.averageIntervalDays, { suffix: 'dias' })
                  }
                  hint={
                    view.averageIntervalDays === null ? 'precisa de ao menos 2 treinos' : undefined
                  }
                />
              </View>
              {view.count === 0 ? (
                <Text style={styles.text}>Nenhum treino neste período.</Text>
              ) : null}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.title, color: colors.text },
  row: { flexDirection: 'row', gap: spacing.md },
  block: { gap: spacing.md },
  text: { ...typography.body, color: colors.textSecondary },
  skeleton: { height: 120, backgroundColor: colors.surface },
});
