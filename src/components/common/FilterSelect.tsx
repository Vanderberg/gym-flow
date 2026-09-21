import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, sizes, spacing, typography } from '@/constants/theme';
import { Sheet } from './Sheet';

export interface FilterOption {
  id: number | null;
  label: string;
}

interface Props {
  options: FilterOption[];
  value: number | null;
  onChange: (id: number | null) => void;
  accessibilityLabel?: string;
}

/** Seletor de filtro com bottom sheet ("Todos ▼"). */
export function FilterSelect({ options, value, onChange, accessibilityLabel }: Props) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.id === value)?.label ?? 'Todos';
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? `Filtro: ${current}`}
        onPress={() => setOpen(true)}
        style={styles.trigger}
      >
        <Text style={styles.triggerText}>{`${current} ▼`}</Text>
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)}>
        {options.map((o) => (
          <Pressable
            key={String(o.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: o.id === value }}
            onPress={() => {
              setOpen(false);
              onChange(o.id);
            }}
            style={styles.option}
          >
            <Text style={styles.optionText}>{o.id === value ? `✓ ${o.label}` : o.label}</Text>
          </Pressable>
        ))}
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: sizes.touch,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  triggerText: { ...typography.body, color: colors.text },
  option: { minHeight: sizes.touch, justifyContent: 'center' },
  optionText: { ...typography.body, color: colors.text },
});
