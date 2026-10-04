# Implementation Plan: Backup e restauração do histórico

**Branch**: `014-backup-restauracao-historico` | **Date**: 2026-10-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/014-backup-restauracao-historico/spec.md`
**Backlog**: BL-140 (exportar), BL-141 (importar com validação e confirmação), BL-142 (restauração atômica), BL-143 (testes de ida e volta) — novo épico, a registrar em `docs/backlog.md` na implementação
**Requisito de produto**: RF-31 (novo; a registrar em `docs/PRD.md` na T040)
**Parecer LGPD**: [parecer-lgpd.md](parecer-lgpd.md) — a feature só reempacota dado já local, por ação explícita do titular; sem rede nem permissão
**Depende de**: 002 (schema), 005 (Configurações), 007 (sessões)

## Summary

Seção "Backup" em Configurações com "Exportar dados" e "Importar dados". Exportar lê o banco, monta
um documento JSON versionado (formato v1, ver [contracts/backup-file-v1.md](contracts/backup-file-v1.md))
e o entrega pela folha de compartilhamento do sistema. Importar abre o seletor de arquivos do
sistema, valida o documento por completo em código puro, mostra o resumo e pede confirmação; ao
confirmar, substitui sessões finalizadas, estado de sequência e configurações em **uma única
transação**. Referências a programas, treinos e exercícios usam chaves estáveis do seed (nome do
programa, `workout.code`, `exercise.name_key`), nunca ids autoincrementais. Sessão em andamento
bloqueia a importação.

## Technical Context

**Language/Version**: TypeScript (strict) em React Native + Expo SDK 57
**Primary Dependencies**: existentes (expo-sqlite, expo-router, Zustand) + duas novas, pequenas e oficiais do Expo: `expo-file-system` (arquivo temporário, seletor de arquivos `File.pickFileAsync` e leitura do arquivo escolhido) e `expo-sharing` (folha de compartilhamento). Versões fixadas com `npx expo install` (compatíveis com o SDK 57)
**Storage**: SQLite local (sem mudança de schema nem migration); arquivo temporário no cache do app durante a exportação
**Testing**: Jest + RNTL; integração sobre better-sqlite3 em memória (helper `tests/integration/helpers/testDb.ts`); módulos nativos novos mockados em `jest.setup.js`
**Target Platform**: Android e iOS (código compartilhado)
**Project Type**: app mobile (Expo)
**Performance Goals**: exportar e restaurar ~400 sessões em < 5 s (SC-005), em lote dentro de uma transação
**Constraints**: offline; nenhuma chamada de rede; conteúdo do backup nunca vai para log; nenhuma permissão declarada
**Scale/Scope**: uso pessoal; de centenas a poucos milhares de sessões

## Constitution Check

| Princípio | Avaliação |
|-----------|-----------|
| I. Offline-first | ✅ Sem rede; SQLite continua fonte de verdade; Zustand não persiste nada novo |
| II. Domínio puro e camadas | ✅ Serialização e validação em `domain/backup` (puro, sem React/SQLite/Expo); `application/` com os casos de uso; `data/` com o repositório SQLite e o gateway de arquivo (Expo); UI só botões e diálogos |
| III. TypeScript estrito | ✅ Entrada tratada como `unknown` e estreitada por funções de validação; sem `any` |
| IV. Registro livre | ✅ Não alterado; sessão em andamento bloqueia a importação e não entra no backup |
| V. Histórico preservado | ⚠️ **Violação intencional**: a importação apaga e reescreve as sessões finalizadas. Ver Complexity Tracking |
| VI. Programa e sequência independentes | ✅ Estado de sequência restaurado por programa; o nome do programa é só chave de referência, nenhuma regra por nome |
| VII. Prescrição como dado | ✅ Prescrição não entra no backup (vem do seed) |
| VIII. Sem recomendações | ✅ Não se aplica |
| IX. Estatísticas | ✅ Calculadas sobre `workout_session` restaurada, sem tabelas novas |
| X. Transações e datas locais | ✅ Restauração em `db.transaction`; datas gravadas e restauradas como strings ISO com deslocamento, sem conversão UTC |
| XI. Testes por camada e TDD | ✅ Unitário (validação/serialização), integração (ida e volta, rollback, estatísticas, bloqueio), RNTL (seção Backup, confirmação) |
| XII. Simplicidade e privacidade | ⚠️ "Nenhum dado sai do aparelho": a exportação entrega dados por ação **explícita** do usuário. Duas dependências oficiais do Expo, ambas necessárias. Ver Complexity Tracking |

**Pós-design**: as duas lacunas (V e XII) permanecem e são resolvidas por emenda à constituição
(tarefa explícita em `tasks.md`), não por contorno no código.

## Project Structure

### Documentation (this feature)

```text
specs/014-backup-restauracao-historico/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── backup-file-v1.md
├── parecer-lgpd.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── domain/backup/
│   ├── types.ts                 # BackupDocument v1, BackupSnapshot, BackupCatalog, BackupSummary
│   ├── buildBackupDocument.ts   # snapshot -> documento (puro)
│   ├── parseBackup.ts           # texto -> documento validado ou BackupValidationError (puro)
│   ├── checkBackupReferences.ts # documento + catálogo do app -> ok ou erro de referência (puro)
│   ├── summarizeBackup.ts       # documento -> { sessionCount, firstDate, lastDate }
│   ├── backupFileName.ts        # data local -> gymflow-backup-AAAA-MM-DD.json
│   └── BackupRepository.ts      # interface: readSnapshot(), readCatalog(), hasInProgressSession(), replaceAll()
├── application/
│   ├── ExportBackup.ts          # lê snapshot, monta documento, entrega ao gateway
│   ├── PrepareImportBackup.ts   # bloqueia com sessão em andamento; lê, valida, devolve resumo
│   ├── ConfirmImportBackup.ts   # reconfere sessão em andamento e substitui tudo
│   └── BackupFileGateway.ts     # porta: shareBackup(name, text), pickBackupText()
├── data/
│   ├── repositories/SqliteBackupRepository.ts   # leitura e substituição transacional
│   └── backup/ExpoBackupFileGateway.ts          # expo-file-system + expo-sharing
├── hooks/useBackup.ts           # fachada da seção; recarrega stores após importar
├── components/settings/BackupSection.tsx        # botões e diálogos (resumo, confirmação, resultado)
└── app/(tabs)/settings.tsx      # renderiza <BackupSection />

tests/
├── unit/domain/backup/          # build, parse, references, summarize, fileName
├── integration/application/backup.test.ts       # ida e volta, rejeições, rollback, estatísticas, bloqueio
├── integration/data/backup.repository.test.ts
└── ui/settings/BackupSection.test.tsx
```

**Structure Decision**: segue a árvore existente (`domain/`, `application/`, `data/`, `hooks/`,
`components/`). A única porta nova é o gateway de arquivo, para que `application/` seja testável
sem módulos nativos.

## Complexity Tracking

| Violação | Por que é necessária | Alternativa mais simples rejeitada porque |
|----------|---------------------|-------------------------------------------|
| Princípio V (importar substitui o histórico finalizado) | Restaurar num aparelho novo ou após reinstalar é o objetivo da feature; o usuário decidiu "substituir tudo", com confirmação explícita e atomicidade | Mesclar (rejeitado pelo usuário: exige regra de identidade e conflito); nunca importar (inutiliza o backup). Mitigação: validação total antes de tocar no banco, resumo e confirmação, transação com rollback, bloqueio com sessão em andamento. **Requer emenda MINOR à constituição**: restauração de backup confirmada é a única operação que substitui o histórico |
| Princípio XII ("nenhum dado sai do aparelho") | Exportar é, por definição, entregar um arquivo ao usuário | Backup automático ou nuvem (fora de escopo, exigiria emenda maior). Mitigação: só sai por ação explícita do usuário, sem rede e sem permissão. **Requer emenda MINOR**: exportação iniciada pelo usuário é permitida |
