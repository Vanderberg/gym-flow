import { Tabs } from 'expo-router';
import { colors, sizes } from '@/constants/theme';

const tabOptions = (title: string) => ({
  title,
  tabBarAccessibilityLabel: title,
  tabBarItemStyle: { minHeight: sizes.touch },
});

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen name="index" options={tabOptions('Treino')} />
      <Tabs.Screen name="history" options={tabOptions('Histórico')} />
      <Tabs.Screen name="statistics" options={tabOptions('Estatísticas')} />
      <Tabs.Screen name="settings" options={tabOptions('Config')} />
    </Tabs>
  );
}
