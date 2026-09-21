export type SqlValue = string | number | null;

export interface Database {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: SqlValue[]): Promise<void>;
  getAll<T>(sql: string, params?: SqlValue[]): Promise<T[]>;
  getFirst<T>(sql: string, params?: SqlValue[]): Promise<T | null>;
  /** COMMIT no sucesso, ROLLBACK em qualquer erro. */
  transaction<T>(work: (db: Database) => Promise<T>): Promise<T>;
}
