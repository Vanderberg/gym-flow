# Contrato de migrations e acesso ao banco

## Interface `Database` (`src/data/database/`)

```ts
interface Database {
  exec(sql: string): Promise<void>;
  run(sql: string, params?: SqlValue[]): Promise<void>;
  getAll<T>(sql: string, params?: SqlValue[]): Promise<T[]>;
  getFirst<T>(sql: string, params?: SqlValue[]): Promise<T | null>;
  transaction<T>(work: (db: Database) => Promise<T>): Promise<T>; // COMMIT no sucesso, ROLLBACK em qualquer erro
}
```

Implementações: adaptador `expo-sqlite` (app) e adaptador `better-sqlite3` (testes).

## Migration (`src/data/migrations/`)

```ts
interface Migration {
  version: number;                        // 1, 2, 3… sem lacunas
  up(db: Database): Promise<void>;        // roda dentro de transaction()
}
```

## Runner

```ts
runMigrations(db: Database, migrations: Migration[]): Promise<MigrationResult>
type MigrationResult =
  | { status: 'ready'; version: number }
  | { status: 'error'; error: Error; version: number }; // version = última aplicada com sucesso
```

### Garantias

1. Executa apenas migrations com `version > user_version`, em ordem crescente.
2. Cada migration + atualização de `user_version` na mesma transação.
3. Em erro: rollback; `user_version` e dados permanecem como antes; retorna `status: 'error'` (não lança para a UI).
4. Idempotente: chamar de novo com tudo aplicado retorna `ready` sem alterações.
5. `user_version` maior que a maior migration ⇒ `error`, sem alterar o banco.

## Gate de UI

`DatabaseGate` (em `src/app/_layout.tsx`): `migrando` → `ready` monta as rotas; `error` mostra "Não foi possível atualizar seus dados" + botão **Tentar novamente**, que chama `runMigrations` outra vez.
