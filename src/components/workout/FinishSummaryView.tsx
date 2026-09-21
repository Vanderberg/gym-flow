import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/common/Button';
import { colors, spacing, typography } from '@/constants/theme';
import type { FinishSummary } from '@/domain/workout/types';

interface Props {
  summary: FinishSummary;
  onBack: () => void;
}

export function FinishSummaryView({ summary, onBack }: Props) {
  const duration =
    summary.durationMinutes < 1 ? 'menos de 1 min' : `${summary.durationMinutes} min`;
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Treino concluído
      </Text>
      <Text style={styles.line}>{`${summary.done} de ${summary.total} exercícios realizados`}</Text>
      <Text style={styles.line}>{duration}</Text>
      <Button label="Voltar ao início" onPress={onBack} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
  title: { ...typography.title, color: colors.text },
  line: { ...typography.body, color: colors.textSecondary },
});
