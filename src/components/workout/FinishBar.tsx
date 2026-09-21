import { useEffect, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { Button } from '@/components/common/Button';
import { colors, spacing } from '@/constants/theme';

/** Barra fixa inferior; some enquanto o teclado está aberto. Sempre habilitada. */
export function FinishBar({ onPress }: { onPress: () => void }) {
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  if (keyboardOpen) return null;
  return (
    <View style={styles.bar}>
      <Button label="FINALIZAR TREINO" onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    padding: spacing.lg,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
