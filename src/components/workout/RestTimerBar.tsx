import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Platform, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/common/Button';
import { colors, spacing, typography } from '@/constants/theme';
import { formatMmSs } from '@/domain/restTimer/duration';
import type { RestTimerState } from '@/domain/restTimer/types';

interface Props {
  state: RestTimerState;
  remainingMs: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onDismiss: () => void;
}

/** Barra acima de FINALIZAR; anuncia só início e fim, nunca cada segundo. */
export function RestTimerBar({
  state,
  remainingMs,
  onStart,
  onPause,
  onResume,
  onStop,
  onDismiss,
}: Props) {
  const status = state.status;
  const prev = useRef(status);
  useEffect(() => {
    const before = prev.current;
    prev.current = status;
    let message: string | null = null;
    if (status === 'RUNNING' && before !== 'RUNNING' && before !== 'PAUSED') {
      message = 'Descanso iniciado';
    } else if (status === 'FINISHED' && before !== 'FINISHED') {
      message = 'Descanso terminado';
    }
    if (message && Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(message);
  }, [status]);

  // Rótulo fixo por estado: a região viva só anuncia quando o estado muda, não a cada segundo.
  const live = status === 'FINISHED' ? 'Descanso terminado' : 'Descanso iniciado';

  return (
    <View style={styles.bar}>
      {status === 'IDLE' ? (
        <Button label="Iniciar descanso" variant="ghost" onPress={onStart} />
      ) : null}
      {status === 'RUNNING' || status === 'PAUSED' ? (
        <View style={styles.row}>
          <Text accessibilityLiveRegion="polite" accessibilityLabel={live} style={styles.time}>
            {formatMmSs(remainingMs)}
          </Text>
          <View style={styles.actions}>
            {status === 'RUNNING' ? (
              <Button label="Pausar" accessibilityLabel="Pausar descanso" onPress={onPause} />
            ) : (
              <Button label="Retomar" accessibilityLabel="Retomar descanso" onPress={onResume} />
            )}
            <Button
              label="Encerrar"
              variant="ghost"
              accessibilityLabel="Encerrar descanso"
              onPress={onStop}
            />
          </View>
        </View>
      ) : null}
      {status === 'FINISHED' ? (
        <View style={styles.row}>
          <Text accessibilityLiveRegion="polite" accessibilityLabel={live} style={styles.done}>
            ⏱ Descanso terminado
          </Text>
          <Button label="OK" onPress={onDismiss} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  actions: { flexDirection: 'row', gap: spacing.sm },
  time: { ...typography.title, color: colors.text, fontVariant: ['tabular-nums'] },
  done: { ...typography.body, color: colors.accent, fontWeight: '700', flexShrink: 1 },
});
