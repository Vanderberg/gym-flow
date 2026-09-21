import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Sheet } from '@/components/common/Sheet';
import { colors, spacing, typography } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
  onDiscard: () => void;
}

export function InProgressBlockSheet({ visible, onClose, onContinue, onDiscard }: Props) {
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <Sheet visible={visible && !confirming} onClose={onClose}>
        <Text accessibilityRole="header" style={styles.title}>
          Treino em andamento
        </Text>
        <Text style={styles.message}>
          Há um treino em andamento. Continue ou descarte para trocar de programa.
        </Text>
        <Button label="Continuar" onPress={onContinue} variant="primary" />
        <Button label="Descartar" onPress={() => setConfirming(true)} variant="ghost" />
      </Sheet>
      <ConfirmDialog
        visible={visible && confirming}
        title="Descartar treino?"
        message="Descartar o treino em andamento? Isso não altera sua sequência nem suas estatísticas."
        confirmLabel="Descartar treino"
        destructive
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          onDiscard();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text, marginBottom: spacing.xs },
  message: { ...typography.body, color: colors.textSecondary },
});
