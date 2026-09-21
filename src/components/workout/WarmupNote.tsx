import { StyleSheet, Text } from 'react-native';
import { colors, typography } from '@/constants/theme';

/** Aquecimento livre: só texto, sem checkbox e fora das contagens. */
export function WarmupNote({ text }: { text: string }) {
  return <Text style={styles.text}>{text}</Text>;
}

const styles = StyleSheet.create({
  text: { ...typography.body, color: colors.textSecondary },
});
