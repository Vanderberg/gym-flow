# Research: Backup e restauração do histórico

## D1 — Formato do arquivo
**Decisão**: JSON versionado (`format: "gymflow-backup"`, `schemaVersion: 1`), UTF-8, indentado, extensão `.json`.
**Racional**: legível, estável entre migrations (independe do schema SQLite), validável em código puro e fácil de testar. Uma cópia do `.db` quebraria com mudanças de schema e carregaria o seed.
**Alternativas**: cópia do arquivo SQLite (acopla ao schema, inclui o seed); CSV (não representa a estrutura aninhada).

## D2 — Chaves de referência
**Decisão**: programa pelo `name`, treino pelo `code` dentro do programa, exercício pelo `name_key`. Nunca ids autoincrementais.
**Racional**: ids mudam entre instalações; o seed é idempotente e identifica programas por nome, treinos por código e exercícios por `name_key` (UNIQUE). Isso torna o arquivo portátil entre aparelhos.
**Risco**: renomear programa, treino ou exercício no seed invalida backups antigos. É coberto pela regra "referência desconhecida recusa o arquivo" e pela premissa da spec.

## D3 — Validação do exercício da sessão
**Decisão**: o exercício deve **existir** na tabela `exercise` (mesmo inativo); não se exige que pertença ao treino da sessão hoje.
**Racional**: o histórico já admite exercício que saiu do treino por atualização do seed (`DetailRow.inWorkout`). Exigir pertencimento recusaria backups legítimos. O edge case da spec foi ajustado para "exercício inexistente".

## D4 — Sessão em andamento
**Decisão**: bloquear em dois momentos: ao escolher o arquivo e de novo na confirmação, dentro da transação.
**Racional**: o índice único `ux_workout_session_in_progress` garante no máximo uma sessão em andamento; reconferir dentro da transação evita estado inconsistente se uma sessão for iniciada entre o resumo e a confirmação.

## D5 — Substituição atômica
**Decisão**: em `db.transaction`: apagar `workout_session_exercise` e `workout_session`; reescrever `program_sequence_state` (programas ausentes do arquivo voltam à posição 1) e `app_settings` (id = 1); inserir as sessões em ordem de `startedAt` e depois seus exercícios. Qualquer erro dispara ROLLBACK (já suportado por `Database.transaction`).
**Racional**: reaproveita a interface existente; ids novos são atribuídos na inserção e nada depende dos ids antigos.
**Cuidado**: `PRAGMA foreign_keys = ON` está ativo; a ordem de delete e insert respeita as FKs.

## D6 — Exportação via arquivo temporário
**Decisão**: gravar `gymflow-backup-AAAA-MM-DD.json` em `Paths.cache` (expo-file-system, classe `File`), chamar `Sharing.shareAsync(uri, { mimeType: 'application/json', UTI: 'public.json' })` e apagar o arquivo no `finally` e no início da próxima exportação. Se `Sharing.isAvailableAsync()` for falso, informar erro em português.
**Racional**: a folha de compartilhamento exige um URI de arquivo local; apagar no `finally` atende à mitigação do parecer LGPD.

## D7 — Importação via seletor do sistema
**Decisão**: `File.pickFileAsync()` do próprio `expo-file-system` (SDK 57; sem `expo-document-picker`), sem filtro de MIME; usar `canceled`/`result`, ler o texto com `file.text()` e apagar a cópia depois, se houver. Rejeitar antes de ler se `file.size` passar de um limite defensivo (10 MB).
**Racional**: provedores como Drive e WhatsApp no Android podem entregar o `.json` como `application/octet-stream` ou `text/plain`. Filtrar por MIME bloquearia arquivos legítimos; a validação do conteúdo é a defesa real. Confirmado nos tipos do SDK 57 instalado (`File.types.d.ts`): `pickFileAsync` devolve `{ result: File, canceled: false }` ou `{ result: null, canceled: true }`.

## D8 — Porta para o sistema de arquivos
**Decisão**: interface `BackupFileGateway { shareBackup(fileName, text); pickBackupText(): Promise<string | null> }` em `application/`, implementada em `data/backup/ExpoBackupFileGateway.ts`. Cancelamento do usuário vira `null` ou retorno silencioso, sem erro.
**Racional**: mantém os casos de uso testáveis sem módulos nativos.

## D9 — Recarregar o app após importar
**Decisão**: `useBackup` chama o `reload` dos stores existentes (configurações, histórico, estatísticas, home) após sucesso; sem reinício do app.
**Racional**: FR-014; os stores só guardam estado derivado de leitura do banco.

## D10 — Dependências
**Decisão**: `npx expo install expo-file-system expo-sharing` para obter as versões compatíveis com o SDK 57; reconfirmar a API (`File`, `Paths`) na documentação do SDK 57 na implementação. Mocks em `jest.setup.js`.
**Alternativas rejeitadas**: `expo-document-picker` (redundante: o `expo-file-system` 57 já traz `File.pickFileAsync`); `react-native-share` ou similares (dependência de terceiros fora do Expo, sem ganho).
