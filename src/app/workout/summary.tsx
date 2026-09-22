import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/common/EmptyState';
import { FinishSummaryView } from '@/components/workout/FinishSummaryView';
import { colors } from '@/constants/theme';
import { useFinishSummary } from '@/hooks/useFinishSummary';

export default function WorkoutSummaryScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { summary, failed } = useFinishSummary(Number(sessionId));
  const insets = useSafeAreaInsets();
  const back = () => router.replace('/');
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {summary ? (
        <FinishSummaryView summary={summary} onBack={back} />
      ) : failed ? (
        <EmptyState title="Resumo indisponível" actionLabel="Voltar ao início" onAction={back} />
      ) : (
        <Text style={styles.loading}>Carregando…</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  loading: { color: colors.textSecondary },
});
