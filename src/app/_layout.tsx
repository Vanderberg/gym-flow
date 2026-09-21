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
      </Stack>
    </DatabaseGate>
  );
}
