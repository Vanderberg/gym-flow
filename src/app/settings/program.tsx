import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SessionInProgressError } from '@/application/errors';
import { RadioCard } from '@/components/common/RadioCard';
import { InProgressBlockSheet } from '@/components/settings/InProgressBlockSheet';
import { colors, sizes, spacing, typography } from '@/constants/theme';
import { useSettings } from '@/hooks/useSettings';

export default function ProgramScreen() {
  const { settings, programs, selectProgram, discardInProgress } = useSettings();
  const [blocked, setBlocked] = useState(false);

  const onSelect = async (id: number) => {
    try {
      await selectProgram(id);
    } catch (e) {
      if (e instanceof SessionInProgressError) setBlocked(true);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.label}>TIPO DE TREINO</Text>
      {programs.map((p) => (
        <RadioCard
          key={p.id}
          title={p.name}
          description={p.description ?? undefined}
          selected={settings?.activeProgramId === p.id}
          onPress={() => void onSelect(p.id)}
        />
      ))}
      <Text style={styles.notice}>Trocar de programa não apaga seu histórico.</Text>
      <InProgressBlockSheet
        visible={blocked}
        onClose={() => setBlocked(false)}
        onContinue={() => {
          setBlocked(false);
          router.push('/workout');
        }}
        onDiscard={() => {
          setBlocked(false);
          void discardInProgress();
        }}
      />
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
  notice: { ...typography.body, color: colors.textSecondary },
});
