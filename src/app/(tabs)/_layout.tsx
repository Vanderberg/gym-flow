import { Tabs } from 'expo-router';
import { sizes } from '@/constants/theme';

const tabOptions = (title: string) => ({
  title,
  tabBarAccessibilityLabel: title,
  tabBarItemStyle: { minHeight: sizes.touch },
});

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={tabOptions('Treino')} />
      <Tabs.Screen name="history" options={tabOptions('Histórico')} />
      <Tabs.Screen name="statistics" options={tabOptions('Estatísticas')} />
      <Tabs.Screen name="settings" options={tabOptions('Config')} />
    </Tabs>
  );
}
