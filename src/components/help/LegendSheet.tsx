import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/common/Button';
import { Sheet } from '@/components/common/Sheet';
import { TECHNIQUE_LEGEND } from '@/constants/techniqueLegend';
import { colors, radius, spacing, typography } from '@/constants/theme';

interface Props {
  visible: boolean;
  initialTerm?: string;
  onClose: () => void;
}

export function LegendSheet({ visible, initialTerm, onClose }: Props) {
  const [offsets, setOffsets] = useState<Record<string, number>>({});
  return (
    <Sheet visible={visible} onClose={onClose}>
      <View accessibilityViewIsModal style={styles.wrap}>
        <Text accessibilityRole="header" style={styles.heading}>
          LEGENDA DAS TÉCNICAS
        </Text>
        <ScrollView
          style={styles.list}
          contentOffset={{ x: 0, y: initialTerm ? (offsets[initialTerm] ?? 0) : 0 }}
        >
          {TECHNIQUE_LEGEND.map((e) => {
            const highlighted = e.title === initialTerm;
            return (
              <View
                key={e.title}
                accessible
                accessibilityState={{ selected: highlighted }}
                onLayout={(ev) => {
                  const y = ev.nativeEvent.layout.y;
                  setOffsets((o) => (o[e.title] === y ? o : { ...o, [e.title]: y }));
                }}
                style={[styles.entry, highlighted && styles.highlight]}
              >
                <Text style={styles.title}>{`${highlighted ? '▶ ' : ''}${e.title}`}</Text>
                <Text style={styles.body}>{e.description}</Text>
              </View>
            );
          })}
        </ScrollView>
        <Button label="Fechar" variant="ghost" onPress={onClose} />
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  heading: { ...typography.label, color: colors.textSecondary },
  list: { maxHeight: 420 },
  entry: { paddingVertical: spacing.md, paddingHorizontal: spacing.sm, gap: spacing.xs },
  highlight: { borderWidth: 2, borderColor: colors.focus, borderRadius: radius.sm },
  title: { ...typography.label, color: colors.accent },
  body: { ...typography.body, color: colors.text },
});
