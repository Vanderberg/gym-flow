import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Sheet } from '@/components/common/Sheet';
import { colors, radius, sizes, spacing, typography } from '@/constants/theme';

interface Option {
  id: number;
  name: string;
}
interface Props {
  options: Option[];
  value: number | null;
  onChange: (id: number | null) => void;
  allLabel?: string;
}

/** Botão "Todos ▼" que abre um Sheet com as opções (reutilizável pela spec 010). */
export function FilterSelect({ options, value, onChange, allLabel = 'Todos' }: Props) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.id === value)?.name ?? allLabel;
  const pick = (id: number | null) => {
    onChange(id);
    setOpen(false);
  };
  const item = (id: number | null, name: string) => (
    <Pressable
      key={String(id)}
      accessibilityRole="button"
      accessibilityLabel={name}
      accessibilityState={{ selected: value === id }}
      onPress={() => pick(id)}
      style={styles.option}
    >
      <Text style={styles.optionText}>
        {value === id ? '✓ ' : ''}
        {name}
      </Text>
    </Pressable>
  );
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Filtro: ${current}`}
        onPress={() => setOpen(true)}
        style={styles.button}
      >
        <Text style={styles.buttonText}>{`${current} ▼`}</Text>
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)}>
        {item(null, allLabel)}
        {options.map((o) => item(o.id, o.name))}
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: sizes.touch,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  buttonText: { ...typography.body, color: colors.text },
  option: { minHeight: sizes.touch, justifyContent: 'center' },
  optionText: { ...typography.body, color: colors.text },
});
