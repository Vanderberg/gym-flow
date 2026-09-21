import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { RestDurationSheet } from '@/components/settings/RestDurationSheet';
import { SettingsSwitchRow } from '@/components/settings/SettingsSwitchRow';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { colors, sizes, spacing, typography } from '@/constants/theme';
import { formatMmSs } from '@/domain/restTimer/duration';
import { DEFAULT_REST_SECONDS } from '@/domain/restTimer/types';
import { useSettings } from '@/hooks/useSettings';

export default function SettingsScreen() {
  const { settings, programs, resetSequence, setRestTimerEnabled, setRestTimerDuration } =
    useSettings();
  const [editingRest, setEditingRest] = useState(false);
  const restEnabled = settings?.restTimerEnabled ?? false;
  const restSeconds = settings?.restTimerSeconds ?? DEFAULT_REST_SECONDS;
  const [confirmingReset, setConfirmingReset] = useState(false);
  const program = programs.find((p) => p.id === settings?.activeProgramId);
  const continuous = settings?.sequenceType === 'CONTINUOUS';

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={styles.title}>
        CONFIGURAÇÕES
      </Text>
      <SettingsRow
        label="Programa de treino"
        value={program?.name}
        onPress={() => router.push('/settings/program')}
      />
      <SettingsRow
        label="Tipo de sequência"
        value={
          settings
            ? settings.sequenceType === 'CONTINUOUS'
              ? 'Sequência contínua'
              : 'Dias da semana'
            : undefined
        }
        onPress={() => router.push('/settings/sequence')}
      />
      <SettingsRow label="Agenda semanal" onPress={() => router.push('/settings/schedule')} />
      {continuous ? (
        <SettingsRow label="Reiniciar sequência" onPress={() => setConfirmingReset(true)} />
      ) : null}
      <Text style={styles.section}>DESCANSO</Text>
      <SettingsSwitchRow
        label="Cronômetro de descanso"
        value={restEnabled}
        onValueChange={(v) => void setRestTimerEnabled(v).catch(() => undefined)}
      />
      <SettingsRow
        label="Tempo de descanso"
        value={formatMmSs(restSeconds * 1000)}
        disabled={!restEnabled}
        onPress={() => setEditingRest(true)}
      />
      <RestDurationSheet
        visible={editingRest}
        currentSeconds={restSeconds}
        onClose={() => setEditingRest(false)}
        onSave={(s) => {
          void setRestTimerDuration(s)
            .then(() => setEditingRest(false))
            .catch(() => undefined);
        }}
      />
      <ConfirmDialog
        visible={confirmingReset}
        title="Reiniciar sequência"
        message={`Reiniciar a sequência do ${program?.name ?? 'programa'}? O próximo treino volta ao primeiro. Seu histórico não é apagado.`}
        confirmLabel="Reiniciar"
        destructive
        onCancel={() => setConfirmingReset(false)}
        onConfirm={() => {
          setConfirmingReset(false);
          void resetSequence().catch(() => undefined);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
    maxWidth: sizes.maxContent,
    width: '100%',
    alignSelf: 'center',
  },
  section: { ...typography.label, color: colors.textSecondary, marginTop: spacing.lg },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.sm },
});
