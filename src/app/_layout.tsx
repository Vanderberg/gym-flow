import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RestTimerProvider } from '@/components/RestTimerProvider';
import { DatabaseGate } from '@/data/database/DatabaseGate';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DatabaseGate>
        <RestTimerProvider>
          {/* Tema é sempre escuro (colors.bg): ícones claros na barra de status em ambas as plataformas. */}
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="workout/index" />
            <Stack.Screen name="workout/summary" />
            <Stack.Screen name="history/[sessionId]" />
            <Stack.Screen
              name="settings/program"
              options={{ headerShown: true, title: 'Programa de treino' }}
            />
            <Stack.Screen
              name="settings/sequence"
              options={{ headerShown: true, title: 'Tipo de sequência' }}
            />
            <Stack.Screen
              name="settings/schedule"
              options={{ headerShown: true, title: 'Agenda semanal' }}
            />
          </Stack>
        </RestTimerProvider>
      </DatabaseGate>
    </SafeAreaProvider>
  );
}
