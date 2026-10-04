# Data Model: Backup e restauração do histórico

Sem mudança de schema SQLite nem migration. Esta feature lê e reescreve tabelas existentes
(`workout_session`, `workout_session_exercise`, `program_sequence_state`, `app_settings`) e define
um documento de troca (ver [contracts/backup-file-v1.md](contracts/backup-file-v1.md)).

## BackupDocument (v1)

| Campo | Tipo | Regra |
|-------|------|-------|
| `format` | `"gymflow-backup"` | literal obrigatório |
| `schemaVersion` | inteiro ≥ 1 | deve ser ≤ `BACKUP_SCHEMA_VERSION` (1); maior ⇒ "versão mais recente" |
| `exportedAt` | string ISO local com deslocamento | formato de `nowLocalIso` |
| `settings` | `BackupSettings` | obrigatório |
| `sequenceState` | `BackupSequenceState[]` | no máximo um item por programa |
| `sessions` | `BackupSession[]` | pode ser vazio |

### BackupSettings
| Campo | Tipo | Regra |
|-------|------|-------|
| `activeProgram` | string | nome de programa existente no app |
| `sequenceType` | `"CONTINUOUS"` \| `"WEEKLY"` | |
| `restTimerEnabled` | boolean | |
| `restTimerSeconds` | inteiro > 0 | |

### BackupSequenceState
| Campo | Tipo | Regra |
|-------|------|-------|
| `program` | string | nome de programa existente |
| `currentPosition` | inteiro ≥ 1 | ≤ quantidade de treinos do programa (validado contra o catálogo) |

### BackupSession
| Campo | Tipo | Regra |
|-------|------|-------|
| `program` | string | nome de programa existente |
| `workout` | string | `code` de treino existente nesse programa |
| `startedAt` | string ISO local com deslocamento | |
| `finishedAt` | string ISO local com deslocamento | obrigatório (só sessões finalizadas); ≥ `startedAt` |
| `completed` | boolean | espelha `workout_session.completed` |
| `exercises` | `BackupSessionExercise[]` | sem `exercise` repetido na mesma sessão; nenhuma sessão repetida no arquivo (mesmo `program`, `workout`, `startedAt`) |

### BackupSessionExercise
| Campo | Tipo | Regra |
|-------|------|-------|
| `exercise` | string | `name_key` de exercício existente (mesmo inativo) |
| `completed` | boolean | |
| `weight` | número ou `null` | `null` ou ≥ 0 |

## Tipos de domínio auxiliares

- **BackupSnapshot**: leitura do banco já com chaves estáveis (nomes/códigos/`name_key`), entrada de `buildBackupDocument`. Contém só sessões com `finished_at` não nulo.
- **BackupCatalog**: conjuntos de chaves válidas no app: `programs: Set<string>`, `workoutsByProgram: Map<string, Set<string>>` (o tamanho do conjunto é a quantidade de treinos do programa, usada para validar `currentPosition`), `exerciseKeys: Set<string>`. Entrada de `checkBackupReferences`.
- **BackupSummary**: `{ sessionCount: number; firstDate: string | null; lastDate: string | null }` (datas `AAAA-MM-DD` locais, fatiadas da string). Exibido antes da confirmação.
- **BackupValidationError**: erro de domínio com `kind` (`INVALID_FORMAT`, `INVALID_VALUE`, `UNSUPPORTED_VERSION`, `UNKNOWN_REFERENCE`) e mensagem em português.

## Regras de substituição (ConfirmImportBackup)

Dentro de uma transação:
1. Se há sessão em andamento ⇒ aborta (bloqueio).
2. Apaga `workout_session_exercise` e `workout_session`.
3. Para cada programa do app: `program_sequence_state.current_position` = valor do arquivo, ou 1 se ausente.
4. `app_settings` (id = 1): programa ativo (resolvido por nome → id), tipo de sequência e cronômetro do arquivo.
5. Insere sessões em ordem de `startedAt`, com `program_id`/`workout_id` resolvidos pelas chaves, e seus exercícios (`exercise_id` por `name_key`); `created_at`/`updated_at` = `startedAt`/`finishedAt`.
6. Qualquer erro ⇒ ROLLBACK; estado anterior intacto.

Não altera `training_program`, `workout`, `exercise`, `workout_exercise`, `weekly_schedule`.
