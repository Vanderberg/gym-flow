import { Tabs } from 'expo-router';

const tabOptions = (title: string) => ({
  title,
  tabBarAccessibilityLabel: title,
  tabBarItemStyle: { minHeight: 48 },
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
