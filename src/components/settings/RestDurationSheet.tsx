import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '@/components/common/Button';
import { Sheet } from '@/components/common/Sheet';
import { colors, radius, sizes, spacing, typography } from '@/constants/theme';
import { formatMmSs, parseDurationInput } from '@/domain/restTimer/duration';

export const REST_DURATION_ERROR = 'Informe um tempo entre 00:05 e 60:00';

interface Props {
  visible: boolean;
  currentSeconds: number;
  onSave: (seconds: number) => void;
  onClose: () => void;
}

export function RestDurationSheet({ visible, currentSeconds, onSave, onClose }: Props) {
  return (
    <Sheet visible={visible} onClose={onClose}>
      <DurationForm currentSeconds={currentSeconds} onSave={onSave} onClose={onClose} />
    </Sheet>
  );
}

/** Montado só com o sheet aberto: o estado reinicia a cada abertura. */
function DurationForm({ currentSeconds, onSave, onClose }: Omit<Props, 'visible'>) {
  const [text, setText] = useState(formatMmSs(currentSeconds * 1000));
  const [error, setError] = useState(false);

  const save = () => {
    const parsed = parseDurationInput(text);
    if (!parsed.ok) {
      setError(true);
      return;
    }
    onSave(parsed.seconds);
  };

  return (
    <>
      <Text accessibilityRole="header" style={styles.title}>
        Tempo de descanso
      </Text>
      <TextInput
        accessibilityLabel="Tempo de descanso (mm:ss)"
        accessibilityHint={error ? REST_DURATION_ERROR : undefined}
        keyboardType="numbers-and-punctuation"
        value={text}
        onChangeText={(t) => {
          setText(t);
          setError(false);
        }}
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={colors.textMuted}
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {REST_DURATION_ERROR}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Button label="Cancelar" variant="ghost" onPress={onClose} />
        <Button label="Salvar" onPress={save} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text },
  input: {
    minHeight: sizes.button,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    backgroundColor: colors.surface,
    ...typography.title,
  },
  inputError: { borderColor: colors.danger },
  error: { ...typography.body, color: colors.danger },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md },
});
