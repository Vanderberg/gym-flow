import { createContext, useContext, type ReactNode } from 'react';
import type { Database } from './Database';

const DatabaseContext = createContext<Database | null>(null);

export function DatabaseProvider({
  database,
  children,
}: {
  database: Database;
  children: ReactNode;
}) {
  return <DatabaseContext.Provider value={database}>{children}</DatabaseContext.Provider>;
}

export function useDatabase(): Database {
  const db = useContext(DatabaseContext);
  if (!db) throw new Error('useDatabase deve ser usado dentro de DatabaseGate');
  return db;
}
