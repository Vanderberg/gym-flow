# Quickstart: Backup e restauração do histórico

## Pré-requisitos
- `npm install` e `npx expo install expo-file-system expo-sharing`.
- Dispositivo ou emulador (Android e iOS); `npx expo start` (Android: `a`).

## Verificação automática
```bash
npm run check
```
Cobre unitários (`tests/unit/domain/backup/`), integração (`tests/integration/application/backup.test.ts`, `tests/integration/data/backup.repository.test.ts`) e UI (`tests/ui/settings/BackupSection.test.tsx`).

## Roteiro manual
1. Finalize 2 ou 3 treinos com pesos e deixe a sequência contínua num ponto intermediário. Em Configurações, ative o cronômetro.
2. Configurações → Backup → **Exportar dados**: a folha de compartilhamento abre com `gymflow-backup-AAAA-MM-DD.json`. Salve em Arquivos/Drive.
3. Cancele a folha numa segunda tentativa: nada muda e nenhum erro aparece.
4. Apague os dados (desinstale e reinstale, ou use um aparelho novo). Abra o app.
5. Configurações → Backup → **Importar dados**, escolha o arquivo: aparece o resumo (quantidade de sessões e período) e o aviso de que o histórico atual será substituído.
6. Cancele: nada muda. Repita e confirme: mensagem de sucesso.
7. Confira Histórico, Estatísticas, Home (próximo treino), "última carga" e Configurações: iguais ao momento do backup.
8. Inicie um treino e, com a sessão em andamento, tente importar: o app bloqueia e orienta finalizar ou descartar.
9. Tente importar um arquivo qualquer (foto, texto) e um JSON editado à mão (versão 99, programa inexistente): recusa com mensagem em português, sem alterar dados.
10. Modo avião ligado: exportar e importar funcionam normalmente (sem rede).

## Critérios de aceite (resumo)
FR-001..017 e SC-001..006 da [spec](spec.md).
