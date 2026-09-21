import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/common/Button';
import { Sheet } from '@/components/common/Sheet';
import { colors, spacing, typography } from '@/constants/theme';
import type { MuscleInfo } from '@/domain/help/types';

interface Props {
  visible: boolean;
  info: MuscleInfo | null;
  error?: boolean;
  onClose: () => void;
}

export function MuscleInfoSheet({ visible, info, error, onClose }: Props) {
  return (
    <Sheet visible={visible} onClose={onClose}>
      <View accessibilityViewIsModal style={styles.wrap}>
        {error ? (
          <Text accessibilityRole="header" style={styles.body}>
            Não foi possível carregar
          </Text>
        ) : info ? (
          <>
            <Text accessibilityRole="header" style={styles.heading}>
              {info.name}
            </Text>
            <Text style={styles.label}>MÚSCULO PRINCIPAL</Text>
            <Text style={styles.body}>{info.primaryMuscle}</Text>
            <Text style={styles.label}>MÚSCULOS SECUNDÁRIOS</Text>
            <Text style={styles.body}>{info.secondaryMuscles.join(' · ')}</Text>
            <Text style={styles.label}>DESCRIÇÃO</Text>
            <Text style={styles.body}>{info.description}</Text>
          </>
        ) : (
          <Text style={styles.body}>Carregando…</Text>
        )}
        <Button label="Fechar" variant="ghost" onPress={onClose} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  heading: { ...typography.title, color: colors.text },
  label: { ...typography.label, color: colors.textSecondary },
  body: { ...typography.body, color: colors.text },
});
