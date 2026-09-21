import type { Ref } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, sizes, spacing, typography } from '@/constants/theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  onDecrement: () => void;
  onIncrement: () => void;
  error?: string | null;
  label?: string;
  inputRef?: Ref<TextInput>;
}

export function WeightInput({
  value,
  onChangeText,
  onBlur,
  onDecrement,
  onIncrement,
  error,
  label = 'Peso',
  inputRef,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Diminuir 2,5 quilos"
          onPress={onDecrement}
          style={styles.step}
        >
          <Text style={styles.stepText}>−</Text>
        </Pressable>
        <TextInput
          ref={inputRef}
          accessibilityLabel={label}
          keyboardType="decimal-pad"
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, error ? styles.inputError : null]}
        />
        <Text style={styles.unit}>kg</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Aumentar 2,5 quilos"
          onPress={onIncrement}
          style={styles.step}
        >
          <Text style={styles.stepText}>+</Text>
        </Pressable>
      </View>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  step: {
    width: sizes.touch,
    height: sizes.touch,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { ...typography.title, color: colors.text },
  input: {
    flex: 1,
    minHeight: sizes.touch,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
    ...typography.body,
  },
  inputError: { borderColor: colors.danger },
  unit: { ...typography.body, color: colors.textSecondary },
  error: { ...typography.body, color: colors.danger },
});
