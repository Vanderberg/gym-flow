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

// Mock de expo-audio: é um módulo nativo (sem binding em Jest); os testes do
// RestTimerProvider injetam playSound/stopSound/setAudioMode por prop, então
// este mock só precisa não quebrar o import e o hook useAudioPlayer.
jest.mock('expo-audio', () => ({
  useAudioPlayer: () => ({ play: jest.fn(), pause: jest.fn(), seekTo: jest.fn() }),
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
}));

// Mocks de expo-file-system e expo-sharing (spec 014, backup): módulos nativos sem binding em
// Jest. Os testes de aplicação/UI injetam a porta BackupFileGateway; estes mocks só evitam
// quebra de import e permitem testar ExpoBackupFileGateway sobre um File falso.
jest.mock('expo-file-system', () => {
  class File {
    constructor(...parts) {
      this.uri = parts.map((p) => (typeof p === 'string' ? p : (p.uri ?? ''))).join('/');
      this.exists = false;
      this.size = 0;
    }
    create() {
      this.exists = true;
    }
    async write() {}
    async text() {
      return '';
    }
    delete() {
      this.exists = false;
    }
    static async pickFileAsync() {
      return { result: null, canceled: true };
    }
  }
  return { File, Paths: { cache: { uri: 'file:///cache' } } };
});

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));
