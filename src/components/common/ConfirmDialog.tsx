import { StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';
import { Button } from './Button';
import { Sheet } from './Sheet';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** A ação destrutiva nunca é a primária: o cancelamento recebe o destaque. */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  destructive = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <Sheet visible={visible} onClose={onCancel}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.message}>{message}</Text>
      <Button label={cancelLabel} onPress={onCancel} variant="primary" />
      <Button label={confirmLabel} onPress={onConfirm} variant={destructive ? 'danger' : 'ghost'} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text, marginBottom: spacing.xs },
  message: { ...typography.body, color: colors.textSecondary },
});
