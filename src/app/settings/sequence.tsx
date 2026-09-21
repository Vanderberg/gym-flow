import { ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { RadioCard } from '@/components/common/RadioCard';
import { colors, sizes, spacing, typography } from '@/constants/theme';
import { useSettings } from '@/hooks/useSettings';

export default function SequenceScreen() {
  const { settings, agenda, selectSequenceStrategy } = useSettings();
  const type = settings?.sequenceType;
  const noAgenda = type === 'WEEKLY' && agenda?.kind === 'NO_SCHEDULE';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.label}>TIPO DE SEQUÊNCIA</Text>
      <RadioCard
        title="Sequência contínua"
        description="O próximo treino é definido pelo último treino finalizado."
        selected={type === 'CONTINUOUS'}
        onPress={() => void selectSequenceStrategy('CONTINUOUS')}
      />
      <RadioCard
        title="Dias da semana"
        description="O próximo treino é definido pela agenda do programa."
        selected={type === 'WEEKLY'}
        onPress={() => void selectSequenceStrategy('WEEKLY')}
      />
      {noAgenda ? (
        <>
          <EmptyState
            title="Este programa não tem agenda semanal"
            message="Escolha outro programa ou use a sequência contínua."
          />
          <Button
            label="Voltar para sequência contínua"
            variant="ghost"
            onPress={() => void selectSequenceStrategy('CONTINUOUS')}
          />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    maxWidth: sizes.maxContent,
    width: '100%',
    alignSelf: 'center',
  },
  label: { ...typography.label, color: colors.textSecondary },
});
