import { ScrollView, StyleSheet, Text } from 'react-native';
import { EmptyState } from '@/components/common/EmptyState';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { colors, sizes, spacing, typography } from '@/constants/theme';
import type { AgendaDay } from '@/domain/sequence/types';
import { useSettings } from '@/hooks/useSettings';

const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

function dayValue(day: AgendaDay): string {
  if (day.kind === 'WORKOUT') return day.workoutName;
  if (day.kind === 'OPTIONAL') return day.note ?? 'Opcional';
  return 'Descanso';
}

export default function ScheduleScreen() {
  const { settings, programs, agenda } = useSettings();
  const program = programs.find((p) => p.id === settings?.activeProgramId);
  const title = `AGENDA · ${(program?.name ?? '').toLocaleUpperCase('pt-BR')}`;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {agenda?.kind === 'DAYS' ? (
        agenda.days.map((d) => (
          <SettingsRow key={d.weekday} label={WEEKDAYS[d.weekday - 1]} value={dayValue(d)} />
        ))
      ) : agenda?.kind === 'NO_SCHEDULE' ? (
        <EmptyState
          title="Este programa não tem agenda semanal"
          message="A agenda vale só para programas que definem dias da semana."
        />
      ) : null}
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
  title: { ...typography.title, color: colors.text, marginBottom: spacing.sm },
});
