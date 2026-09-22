/* global jest */
// Mock oficial do react-native-safe-area-context para testes: fornece um valor
// padrão de insets (tudo zero) sem exigir um <SafeAreaProvider> real na árvore,
// já que os testes de UI renderizam as telas isoladamente.
// O arquivo de mock só tem `export default`; desembrulhamos aqui para que os
// imports nomeados (`useSafeAreaInsets`, `SafeAreaProvider`...) funcionem.
jest.mock('react-native-safe-area-context', () => {
  const mock = require('react-native-safe-area-context/jest/mock');
  return mock.default ?? mock;
});
