# Tasks: Backup e restauração do histórico

**Input**: Design documents from `/specs/014-backup-restauracao-historico/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/backup-file-v1.md, design/tokens.md, parecer-lgpd.md

**Tests**: MANDATORY (constituição XI/TDD: teste falho → código mínimo → refatorar). Escrever cada
teste desta lista e confirmar que falha antes de implementar a task de código correspondente.

**Organization**: Tasks agrupadas por user story (US1 exportar, US2 restaurar, US3 proteção contra
arquivo inválido e falha — todas P1), conforme spec.md. A ordem de entrega é US1 → US2 → US3, porque
US2 reaproveita o formato definido em US1 e US3 endurece a validação e os erros de US2.

**Requisito de produto**: RF-31 (novo, a registrar em `docs/PRD.md`)

**Backlog**: BL-140 (exportar), BL-141 (importar com validação e confirmação), BL-142 (restauração
atômica), BL-143 (testes de ida e volta).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1, US2 ou US3, conforme spec.md
- Caminhos de arquivo exatos em cada task

---

## Phase 1: Setup

**Purpose**: Emenda da constituição, dependências e documentação de backlog

- [x] T001 Emendar a constituição (MINOR, 2.3.0 → 2.4.0) com `/speckit-constitution`: no princípio V, admitir a restauração de backup confirmada pelo usuário como a **única** operação que substitui o histórico finalizado; no princípio XII, admitir exportação de dados iniciada explicitamente pelo usuário (sem rede, sem permissão, sem backup automático). Atualizar o Sync Impact Report e a linha `Version`/`Last Amended` em `.specify/memory/constitution.md`. **Bloqueia todas as demais tasks** (decisão do usuário em 2026-10-01; ver Complexity Tracking em [plan.md](plan.md))
- [x] T002 Instalar as dependências com `npx expo install expo-file-system expo-sharing` em `package.json` (versões do SDK 57; `expo-document-picker` dispensada porque `File.pickFileAsync` já existe) e conferir nos tipos do SDK 57 a API usada (`File`, `Paths`, `File.pickFileAsync`, `Sharing.shareAsync`); divergências registradas em [research.md](research.md) D6/D7/D10
- [x] T003 [P] Adicionar mocks Jest de `expo-file-system` e `expo-sharing` em `jest.setup.js` (módulos nativos sem binding em Jest; apenas evitar quebra de import — o comportamento é injetado por prop/porta nos testes)
- [x] T004 [P] Registrar o épico BL-140..BL-143 (com origem na spec 014) em `docs/backlog.md` e mover a linha de `specs/INDEX.md` da 014 para `desenvolvendo` quando a implementação começar

**Checkpoint**: constituição emendada, dependências instaladas e mockadas; nenhum código de produção ainda.

---

## Phase 2: Foundational

**Purpose**: Tipos, contratos e porta compartilhados pelas três user stories

- [x] T005 [P] Criar `src/domain/backup/types.ts` com `BACKUP_FORMAT`, `BACKUP_SCHEMA_VERSION = 1`, `BackupDocument`, `BackupSettings`, `BackupSequenceState`, `BackupSession`, `BackupSessionExercise`, `BackupSnapshot`, `BackupCatalog`, `BackupSummary` e `BackupValidationError` (com `kind`: `INVALID_FORMAT` | `INVALID_VALUE` | `UNSUPPORTED_VERSION` | `UNKNOWN_REFERENCE`), conforme [data-model.md](data-model.md)
- [x] T006 [P] Criar a interface `src/domain/backup/BackupRepository.ts` com `readSnapshot()`, `readCatalog()`, `hasInProgressSession()` e `replaceAll(document)` (assinaturas conforme [data-model.md](data-model.md); sem implementação)
- [x] T007 [P] Criar a porta `src/application/BackupFileGateway.ts` com `shareBackup(fileName, text): Promise<void>` e `pickBackupText(): Promise<string | null>` (`null` = usuário cancelou), conforme [research.md](research.md) D8

**Checkpoint**: tipos, repositório (interface) e porta existem; US1, US2 e US3 podem começar.

---

## Phase 3: User Story 1 - Exportar meus dados para um arquivo (Priority: P1) 🎯 MVP

**Goal**: "Exportar dados" gera o JSON v1 com sessões finalizadas, estado de sequência e configurações e o entrega pela folha de compartilhamento, sem alterar dados.

**Independent Test**: Com histórico existente, `ExportBackup` entrega ao gateway um arquivo `gymflow-backup-AAAA-MM-DD.json` com o conteúdo esperado; a sessão em andamento não entra; o banco não muda.

### Tests for User Story 1 ⚠️ (escrever e ver falhar antes de implementar)

- [x] T008 [P] [US1] Teste unitário de `backupFileName(date)` (data local, zero à esquerda, virada de dia sem deslocamento UTC) em `tests/unit/domain/backup/backupFileName.test.ts`
- [x] T009 [P] [US1] Teste unitário de `buildBackupDocument(snapshot, exportedAt)`: campos do contrato, ordenação estável (sessões por `startedAt`, `sequenceState` por nome), zero sessões, `weight` nulo, nenhum campo do seed além das chaves, em `tests/unit/domain/backup/buildBackupDocument.test.ts`
- [x] T010 [P] [US1] Teste de integração de `SqliteBackupRepository.readSnapshot()` sobre better-sqlite3 em memória (seed + sessões finalizadas + uma em andamento): só finalizadas, chaves estáveis (nome, `code`, `name_key`), datas como gravadas, em `tests/integration/data/backup.repository.test.ts`
- [x] T011 [US1] Teste de integração de `ExportBackup`: entrega ao gateway fake o nome e o texto JSON esperados; histórico vazio gera arquivo válido; sessão em andamento fora do arquivo; banco inalterado; falha do gateway propaga erro sem alterar dados, em `tests/integration/application/backup.test.ts` (novo `describe('exportar')`)

### Implementation for User Story 1

- [x] T012 [P] [US1] Implementar `src/domain/backup/backupFileName.ts` (faz T008 passar)
- [x] T013 [P] [US1] Implementar `src/domain/backup/buildBackupDocument.ts` (faz T009 passar)
- [x] T014 [US1] Implementar `readSnapshot()` e `readCatalog()` em `src/data/repositories/SqliteBackupRepository.ts` e registrar `backup` em `createRepositories` (`src/data/repositories/index.ts`) (faz T010 passar; depende de T005, T006)
- [x] T015 [US1] Implementar `src/application/ExportBackup.ts`: lê snapshot, monta documento com `nowLocalIso`, serializa (`JSON.stringify` com 2 espaços) e chama `gateway.shareBackup` (faz T011 passar; depende de T012, T013, T014)
- [x] T016 [US1] Implementar `src/data/backup/ExpoBackupFileGateway.ts` (`shareBackup`): grava em `Paths.cache` com `File`, checa `Sharing.isAvailableAsync()`, chama `Sharing.shareAsync(uri, { mimeType: 'application/json', UTI: 'public.json' })` e apaga o arquivo no `finally` e no início da próxima exportação; nunca loga o conteúdo ([parecer-lgpd.md](parecer-lgpd.md)) (depende de T007)
- [x] T017 [US1] Teste RNTL da seção Backup (linha "Exportar dados" chama `exportBackup`, fica `disabled` durante a operação, cancelamento da folha não exibe nada, falha exibe `Sheet` "Não foi possível exportar") em `tests/ui/settings/BackupSection.test.tsx`
- [x] T018 [US1] Implementar `src/hooks/useBackup.ts` (apenas `exportBackup` e estado de ocupado/erro) e `src/components/settings/BackupSection.tsx` (título "BACKUP" + `SettingsRow` "Exportar dados" + `Sheet` de resultado), e renderizar `<BackupSection />` em `src/app/(tabs)/settings.tsx` abaixo de "DESCANSO"; usar **somente** componentes, tokens e textos de [design/tokens.md](design/tokens.md) (faz T017 passar)

**Checkpoint**: o usuário exporta o backup pela folha de compartilhamento. MVP entregável. Rodar `npm run check` e confirmar a saída antes de seguir.

---

## Phase 4: User Story 2 - Restaurar meus dados a partir de um arquivo (Priority: P1)

**Goal**: "Importar dados" valida o arquivo, mostra resumo, pede confirmação e substitui sessões, sequência e configurações em uma transação; o app reflete os dados restaurados sem reiniciar.

**Independent Test**: Exportar, apagar sessões, importar o arquivo: histórico, estatísticas, posição na sequência, configurações e "última carga" idênticos aos de antes.

### Tests for User Story 2 ⚠️ (escrever e ver falhar antes de implementar)

- [x] T019 [P] [US2] Teste unitário de `parseBackup(text)` — caminho feliz: documento v1 válido (do contrato) devolve o `BackupDocument`; campos desconhecidos ignorados; zero sessões válido, em `tests/unit/domain/backup/parseBackup.test.ts`
- [x] T020 [P] [US2] Teste unitário de `summarizeBackup(document)`: quantidade, primeira e última data local (fatiadas da string, sem conversão), zero sessões → datas `null`, em `tests/unit/domain/backup/summarizeBackup.test.ts`
- [x] T021 [P] [US2] Teste de integração de `SqliteBackupRepository.replaceAll()`: substitui sessões e exercícios, estado de sequência (programa ausente volta a 1) e `app_settings`; não toca `training_program`/`workout`/`exercise`/`workout_exercise`/`weekly_schedule`; ids resolvidos por chave, em `tests/integration/data/backup.repository.test.ts`
- [x] T022 [US2] Teste de integração de ida e volta em `tests/integration/application/backup.test.ts` (`describe('restaurar')`): exportar → limpar histórico → `PrepareImportBackup` (resumo) → `ConfirmImportBackup` → `GetStatistics`, `ListHistory`, `GetNextWorkout` e `getLastWeight` idênticos aos de antes; importar duas vezes seguidas não duplica; cancelar o seletor (`null`) não altera nada; datas sem deslocamento de dia (SC-001, FR-014, FR-016)

### Implementation for User Story 2

- [x] T023 [US2] Implementar o caminho feliz de `src/domain/backup/parseBackup.ts` (JSON → objeto → `BackupDocument` tipado, sem `any`; `unknown` estreitado por funções pequenas) (faz T019 passar; depende de T005)
- [x] T024 [P] [US2] Implementar `src/domain/backup/summarizeBackup.ts` (faz T020 passar)
- [x] T025 [US2] Implementar `replaceAll()` e `hasInProgressSession()` em `src/data/repositories/SqliteBackupRepository.ts` dentro de `db.transaction`, na ordem de [data-model.md](data-model.md) (apagar exercícios e sessões → sequência → settings → inserir sessões por `startedAt` → exercícios), reconferindo sessão em andamento na própria transação (faz T021 passar; depende de T014)
- [x] T026 [US2] Implementar `src/application/PrepareImportBackup.ts` (lê texto pelo gateway, `parseBackup`, `summarizeBackup`; devolve `{ document, summary }` ou resultado "cancelado") e `src/application/ConfirmImportBackup.ts` (chama `replaceAll`), registrando ambos em `src/application/index.ts` (faz T022 passar; depende de T023, T024, T025)
- [x] T027 [US2] Implementar `pickBackupText()` em `src/data/backup/ExpoBackupFileGateway.ts`: `File.pickFileAsync()`, retorna `null` se `canceled`, rejeita arquivo com `size` > 10 MB antes de ler, lê com `file.text()`, apaga a cópia no `finally` ([research.md](research.md) D7)
- [x] T028 [US2] Teste RNTL da importação feliz em `tests/ui/settings/BackupSection.test.tsx`: toque em "Importar dados" → `ConfirmDialog` "Substituir histórico?" com o resumo (N treinos, período) e `destructive` → cancelar não altera nada → confirmar exibe `Sheet` "Backup restaurado"; texto especial para zero sessões; linhas `disabled` durante a operação
- [x] T029 [US2] Estender `src/hooks/useBackup.ts` com `prepareImport`/`confirmImport` e recarga dos stores após sucesso (`settingsStore`, histórico, estatísticas, home — sem reinício do app) e `src/components/settings/BackupSection.tsx` com a linha "Importar dados", o `ConfirmDialog` e o `Sheet` de sucesso, usando só [design/tokens.md](design/tokens.md) (faz T028 passar; depende de T018, T026, T027)

**Checkpoint**: o usuário restaura o backup num banco limpo e vê tudo igual; pode ser demonstrado sem US3 (arquivos bons). Rodar `npm run check` e confirmar a saída antes de seguir.

---

## Phase 5: User Story 3 - Ser protegido contra arquivos inválidos e falhas (Priority: P1)

**Goal**: Qualquer arquivo ruim, versão futura, referência desconhecida, sessão em andamento ou falha de gravação deixa os dados exatamente como estavam, com mensagem clara em português.

**Independent Test**: Importar arquivos inválidos e simular falha no meio da gravação: o estado anterior permanece intacto em todos os casos.

### Tests for User Story 3 ⚠️ (escrever e ver falhar antes de implementar)

- [x] T030 [P] [US3] Teste unitário de `parseBackup` — rejeições: texto não JSON, raiz não objeto, `format` errado, `schemaVersion` ausente/não inteiro/maior que 1 (`UNSUPPORTED_VERSION`), campos obrigatórios ausentes, tipos errados, datas fora do formato, `finishedAt` < `startedAt`, `weight` negativo/NaN, `restTimerSeconds` ≤ 0, `currentPosition` < 1, programa repetido em `sequenceState`, exercício repetido na sessão, sessão repetida (mesmo programa, treino e `startedAt`), em `tests/unit/domain/backup/parseBackup.test.ts`
- [x] T031 [P] [US3] Teste unitário de `checkBackupReferences(document, catalog)`: `activeProgram`, `program`, `workout` (dentro do programa) e `exercise` inexistentes → `UNKNOWN_REFERENCE`; `currentPosition` maior que a quantidade de treinos do programa → `INVALID_VALUE`; exercício inativo mas existente é aceito, em `tests/unit/domain/backup/checkBackupReferences.test.ts`
- [x] T032 [US3] Teste de integração em `tests/integration/application/backup.test.ts` (`describe('proteção')`): arquivo vazio/truncado/imagem, versão futura, programa desconhecido → recusa e banco idêntico (comparar tabelas antes/depois); sessão em andamento bloqueia `PrepareImportBackup` e `ConfirmImportBackup`; sessão iniciada entre resumo e confirmação também bloqueia; falha injetada no meio de `replaceAll` (ex.: exercício que viola FK) → ROLLBACK e estado anterior intacto (SC-002, SC-003)
- [x] T033 [US3] Teste RNTL em `tests/ui/settings/BackupSection.test.tsx`: cada tipo de erro abre o `Sheet` correspondente com o texto de [design/tokens.md](design/tokens.md) ("Arquivo inválido", "Versão não suportada", "Backup incompatível", "Não foi possível restaurar"); sessão em andamento abre `InProgressBlockSheet` com a mensagem de importação e "Descartar" segue o fluxo de confirmação existente; cancelar o seletor não exibe nada

### Implementation for User Story 3

- [x] T034 [US3] Completar `src/domain/backup/parseBackup.ts` com todas as validações do contrato (ordem 1–7 de [contracts/backup-file-v1.md](contracts/backup-file-v1.md)), lançando `BackupValidationError` com mensagem em português (faz T030 passar; depende de T023)
- [x] T035 [P] [US3] Implementar `src/domain/backup/checkBackupReferences.ts` (regra 8 do contrato, incluindo `currentPosition` ≤ quantidade de treinos; `readCatalog()` em `SqliteBackupRepository.ts` passa a expor essa quantidade) (faz T031 passar)
- [x] T036 [US3] Integrar `readCatalog()` + `checkBackupReferences` e o bloqueio por `hasInProgressSession()` em `PrepareImportBackup`, e a reconferência da sessão em andamento em `ConfirmImportBackup`, com erros tipados (`BackupValidationError`, `InProgressSessionError`) em `src/application/errors.ts` (faz T032 passar; depende de T026, T034, T035)
- [x] T037 [US3] Estender `src/components/settings/InProgressBlockSheet.tsx` com a prop `message` (texto atual como padrão; retrocompatível com `src/app/settings/program.tsx`) — extensão sinalizada em [design/tokens.md](design/tokens.md)
- [x] T038 [US3] Mapear erros em `src/hooks/useBackup.ts` e exibir em `src/components/settings/BackupSection.tsx` os `Sheet` de erro e o `InProgressBlockSheet` (Continuar → rota da sessão; Descartar → `DiscardInProgressSession`), com os textos de [design/tokens.md](design/tokens.md) (faz T033 passar; depende de T029, T036, T037)

**Checkpoint**: nenhum arquivo ruim ou falha altera dados; as três user stories funcionam juntas. Rodar `npm run check` e confirmar a saída antes de seguir.

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Documentação, desempenho e verificação final

- [x] T039 [P] Teste de desempenho (≈400 sessões, SC-005 < 5 s para exportar e para restaurar) em `tests/integration/data/performance.test.ts`, seguindo o padrão do teste existente
- [x] T040 [P] Atualizar `docs/arquitetura.md` (camada `domain/backup`, porta de arquivo), `docs/modelo-dados.md` (formato de troca v1, sem mudança de schema), `docs/telas.md` e `docs/design-telas.md` (seção Backup em Configurações) e `docs/PRD.md` (novo RF-31: backup e restauração do histórico, mais critério de aceite), conforme regra "docs acompanham o código"
- [x] T041 [P] Atualizar `CLAUDE.md`: remover "sem backup" onde conflitar, descrever o backup (exportar/importar, substituir tudo, bloqueio com sessão em andamento), atualizar a versão citada da constituição (hoje diz v2.2.0) e manter o ponteiro do plano
- [x] T042 Confirmar que nenhum `console.*`/log recebe conteúdo do backup (mitigação 3 do parecer LGPD) e que o arquivo temporário é removido (inspeção + teste do gateway com `File` mockado); acrescentar teste de que exportar e importar não chamam a rede (`fetch` e `XMLHttpRequest` globais mockados para falhar o teste se forem usados; SC-006, FR-007) em `tests/integration/application/backup.test.ts`
- [x] T043 Rodar `npm run check` (typecheck + lint + format:check + testes) e confirmar a saída sem erros (constituição, Fluxo de Desenvolvimento)
- [ ] T044 Executar o roteiro manual de [quickstart.md](quickstart.md) em Android e iOS (incluindo modo avião e arquivo vindo do Drive/WhatsApp) e medir SC-004 (exportar em ≤ 3 toques; importar em ≤ 5) e marcar a spec 014 como `concluída` em `specs/INDEX.md`

---

## Dependencies & Execution Order

- **Fase 1**: T001 (emenda) bloqueia todo o resto; T002 antes de T003/T016/T027; T003 e T004 em paralelo depois de T002.
- **Fase 2** depende da Fase 1; T005, T006, T007 em paralelo.
- **US1** depende da Fase 2. **US2** depende de US1 (reaproveita formato, repositório e `BackupSection`). **US3** depende de US2 (endurece parse, `Prepare`/`Confirm` e a UI de erro).
- Dentro de cada story: testes primeiro (devem falhar), depois implementação. Tasks que editam o mesmo arquivo (`backup.test.ts`, `BackupSection.test.tsx`, `parseBackup.ts`, `SqliteBackupRepository.ts`, `useBackup.ts`, `BackupSection.tsx`) não são paralelizáveis entre si.

### Parallel opportunities

- US1: T008, T009 e T010 juntos; depois T012 e T013 juntos.
- US2: T019, T020 e T021 juntos; T024 em paralelo com T023.
- US3: T030 e T031 juntos; T035 em paralelo com T034.
- Polish: T039, T040 e T041 juntos.

## Implementation Strategy

1. **MVP = US1** (exportar): já protege o usuário contra perda, mesmo antes de existir restauração automática.
2. Entregar **US2** (restaurar) e depois **US3** (proteções); como a importação substitui tudo, **US2 só deve ir para o aparelho junto com US3** (a ordem de implementação é US2 → US3, mas a liberação de "Importar dados" para uso real exige as proteções).
3. Fechar com o Polish e a verificação em Android e iOS.
