import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { HistoryItem } from '@/domain/history/types';

export const SESSION_ITEM_HEIGHT = 72;

interface Props {
  item: HistoryItem;
  showProgram: boolean;
  onPress: () => void;
}

export function SessionListItem({ item, showProgram, onPress }: Props) {
  const day = item.localDate.slice(8, 10);
  const count = `${item.done} / ${item.total} realizados${item.complete ? ' ✓' : ''}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${day}, ${item.workoutCode} — ${item.workoutName}, ${count}`}
      onPress={onPress}
      style={styles.item}
    >
      <Text style={styles.day}>{day}</Text>
      <View style={styles.body}>
        <Text numberOfLines={2} style={styles.title}>
          {`${item.workoutCode} — ${item.workoutName}`}
        </Text>
        <Text style={styles.meta}>
          {showProgram ? `${item.programName} · ` : ''}
          {count} · {item.durationLabel}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    height: SESSION_ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
  },
  day: { ...typography.title, color: colors.accent, minWidth: 40 },
  body: { flex: 1 },
  title: { ...typography.body, color: colors.text, fontWeight: '700' },
  meta: { ...typography.label, color: colors.textSecondary, textTransform: 'none' },
});
