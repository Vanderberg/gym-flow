import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Database } from './Database';
import { DatabaseProvider } from './DatabaseProvider';
import { openDatabase } from './openDatabase';
import { bootstrapDatabase, type BootstrapResult } from '../bootstrap';

type State = { status: 'migrating' } | { status: 'error' } | { status: 'ready'; db: Database };

interface Props {
  children: ReactNode;
  open?: () => Promise<Database>;
  bootstrap?: (db: Database) => Promise<BootstrapResult>;
}

export function DatabaseGate({
  children,
  open = openDatabase,
  bootstrap = bootstrapDatabase,
}: Props) {
  const deps = useRef({ open, bootstrap });
  const [state, setState] = useState<State>({ status: 'migrating' });

  const start = useCallback(async () => {
    try {
      const { open: doOpen, bootstrap: doBootstrap } = deps.current;
      const db = await doOpen();
      const result = await doBootstrap(db);
      setState(result.status === 'ready' ? { status: 'ready', db } : { status: 'error' });
    } catch {
      setState({ status: 'error' });
    }
  }, []);

  const retry = useCallback(() => {
    setState({ status: 'migrating' });
    void start();
  }, [start]);

  useEffect(() => {
    deps.current = { open, bootstrap };
  });

  useEffect(() => {
    // Inicialização assíncrona do banco: o setState só ocorre após await.
    void start();
  }, [start]);

  if (state.status === 'ready') {
    return <DatabaseProvider database={state.db}>{children}</DatabaseProvider>;
  }
  if (state.status === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Não foi possível atualizar seus dados</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tentar novamente"
          onPress={retry}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <ActivityIndicator accessibilityLabel="Atualizando dados" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  message: { fontSize: 18, textAlign: 'center' },
  button: {
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: 24,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  buttonText: { fontSize: 16 },
});
