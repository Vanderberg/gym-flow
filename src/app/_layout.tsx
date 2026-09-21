import { Stack } from 'expo-router';
import { DatabaseGate } from '@/data/database/DatabaseGate';

export default function RootLayout() {
  return (
    <DatabaseGate>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="workout"
          options={{ headerShown: true, title: 'Treino em andamento' }}
        />
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
    </DatabaseGate>
  );
}
