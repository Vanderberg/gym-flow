import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/common/EmptyState';
import { FilterSelect } from '@/components/common/FilterSelect';
import { MONTH_HEADER_HEIGHT, MonthHeader } from '@/components/history/MonthHeader';
import { SESSION_ITEM_HEIGHT, SessionListItem } from '@/components/history/SessionListItem';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { HistoryItem } from '@/domain/history/types';
import { useHistoryList } from '@/hooks/useHistoryList';
import { useHistoryStore } from '@/store/historyStore';

type Row = { kind: 'month'; key: string; label: string } | { kind: 'item'; item: HistoryItem };

const ITEM_GAP = spacing.sm;
const heightOf = (r: Row) =>
  r.kind === 'month' ? MONTH_HEADER_HEIGHT : SESSION_ITEM_HEIGHT + ITEM_GAP;

export default function HistoryScreen() {
  const { sections, programs, status, reload, programFilter } = useHistoryList();
  const insets = useSafeAreaInsets();
  const setFilter = useHistoryStore((s) => s.setProgramFilter);
  const rows = useMemo<Row[]>(
    () =>
      sections.flatMap((s) => [
        { kind: 'month' as const, key: s.key, label: s.label },
        ...s.items.map((item) => ({ kind: 'item' as const, item })),
      ]),
    [sections],
  );

  let body;
  if (status === 'loading') {
    body = (
      <View style={styles.skeletons} testID="history-loading">
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.skeleton} />
        ))}
      </View>
    );
  } else if (status === 'error') {
    body = (
      <EmptyState
        title="Não foi possível carregar o histórico"
        actionLabel="Tentar de novo"
        onAction={() => void reload()}
      />
    );
  } else if (rows.length === 0) {
    body =
      programFilter === null ? (
        <EmptyState
          title="Ainda não existem treinos registrados."
          actionLabel="Ir para o treino"
          onAction={() => router.navigate('/')}
        />
      ) : (
        <EmptyState
          title="Nenhum treino deste programa."
          actionLabel="Limpar filtro"
          onAction={() => useHistoryStore.getState().clearProgramFilter()}
        />
      );
  } else {
    body = (
      <FlatList
        data={rows}
        keyExtractor={(r) => (r.kind === 'month' ? `m-${r.key}` : `s-${r.item.sessionId}`)}
        getItemLayout={(_, index) => {
          let offset = 0;
          for (let i = 0; i < index; i++) offset += heightOf(rows[i]);
          return { length: heightOf(rows[index]), offset, index };
        }}
        renderItem={({ item: r }) =>
          r.kind === 'month' ? (
            <MonthHeader label={r.label} />
          ) : (
            <View style={styles.itemBox}>
              <SessionListItem
                item={r.item}
                showProgram={programFilter === null}
                onPress={() => router.push(`/history/${r.item.sessionId}`)}
              />
            </View>
          )
        }
      />
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + spacing.lg }]}>
      <Text accessibilityRole="header" style={styles.title}>
        HISTÓRICO
      </Text>
      {status === 'ready' && (programs.length > 0 || programFilter !== null) ? (
        <FilterSelect
          options={programs.map((p) => ({ id: p.id, label: p.name }))}
          value={programFilter}
          onChange={setFilter}
        />
      ) : null}
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: spacing.lg, gap: spacing.md },
  title: { ...typography.title, color: colors.text },
  itemBox: { height: SESSION_ITEM_HEIGHT + ITEM_GAP },
  skeletons: { gap: spacing.sm },
  skeleton: {
    height: SESSION_ITEM_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
});
