import { StyleSheet, Text, View } from 'react-native';

export default function StatisticsScreen() {
  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={styles.title}>
        Estatísticas
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '600' },
});
