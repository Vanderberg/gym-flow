import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Sheet } from '@/components/common/Sheet';
import { InProgressBlockSheet } from '@/components/settings/InProgressBlockSheet';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { colors, spacing, typography } from '@/constants/theme';
import type { BackupSummary } from '@/domain/backup/types';
import { useBackup } from '@/hooks/useBackup';

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** AAAA-MM-DD → DD/MM/AAAA (dia local, sem conversão de fuso). */
const brDate = (iso: string) => iso.replace(ISO_DAY, '$3/$2/$1');

function confirmMessage(summary: BackupSummary): string {
  if (summary.sessionCount === 0 || !summary.firstDate || !summary.lastDate) {
    return 'Este backup não tem treinos. Seu histórico atual será apagado, e a posição na sequência e as configurações serão substituídas. Isso não pode ser desfeito.';
  }
  const count = summary.sessionCount === 1 ? '1 treino' : `${summary.sessionCount} treinos`;
  const period =
    summary.firstDate === summary.lastDate
      ? `em ${brDate(summary.firstDate)}`
      : `de ${brDate(summary.firstDate)} a ${brDate(summary.lastDate)}`;
  return `${count}, ${period}. Seu histórico atual, a posição na sequência e as configurações serão substituídos. Isso não pode ser desfeito.`;
}

/** BL-140/141: seção "Backup" de Configurações. Só composição; a regra vive nos casos de uso. */
export function BackupSection() {
  const {
    busy,
    notice,
    pendingImport,
    dismissNotice,
    exportBackup,
    importBackup,
    confirmImport,
    cancelImport,
    blocked,
    dismissBlocked,
    discardInProgress,
  } = useBackup();
  return (
    <>
      <Text style={styles.section}>BACKUP</Text>
      <SettingsRow label="Exportar dados" disabled={busy} onPress={() => void exportBackup()} />
      <SettingsRow label="Importar dados" disabled={busy} onPress={() => void importBackup()} />
      <ConfirmDialog
        visible={pendingImport !== null}
        title="Substituir histórico?"
        message={pendingImport ? confirmMessage(pendingImport) : ''}
        confirmLabel="Substituir histórico"
        destructive
        onCancel={cancelImport}
        onConfirm={() => void confirmImport()}
      />
      <InProgressBlockSheet
        visible={blocked}
        message="Há um treino em andamento. Finalize ou descarte para importar o backup."
        onClose={dismissBlocked}
        onContinue={() => {
          dismissBlocked();
          router.push('/workout');
        }}
        onDiscard={() => void discardInProgress().catch(() => undefined)}
      />
      <Sheet visible={notice !== null} onClose={dismissNotice}>
        <Text accessibilityRole="header" style={styles.title}>
          {notice?.title}
        </Text>
        <Text style={styles.message}>{notice?.message}</Text>
        <Button label="Entendi" onPress={dismissNotice} variant="primary" />
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  section: { ...typography.label, color: colors.textSecondary, marginTop: spacing.lg },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.xs },
  message: { ...typography.body, color: colors.textSecondary },
});
