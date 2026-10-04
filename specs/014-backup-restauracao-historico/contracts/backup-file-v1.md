# Contrato: arquivo de backup v1

Arquivo texto UTF-8, JSON, nome `gymflow-backup-AAAA-MM-DD.json` (data local do aparelho). Gerado
por `ExportBackup`, lido por `PrepareImportBackup`. Qualquer divergência de formato recusa o
arquivo inteiro.

## Exemplo

```json
{
  "format": "gymflow-backup",
  "schemaVersion": 1,
  "exportedAt": "2026-10-01T21:40:00-03:00",
  "settings": {
    "activeProgram": "Treino Monstro",
    "sequenceType": "WEEKLY",
    "restTimerEnabled": true,
    "restTimerSeconds": 90
  },
  "sequenceState": [
    { "program": "Treino Padrão", "currentPosition": 3 },
    { "program": "Treino Monstro", "currentPosition": 1 }
  ],
  "sessions": [
    {
      "program": "Treino Padrão",
      "workout": "1",
      "startedAt": "2026-09-28T18:00:00-03:00",
      "finishedAt": "2026-09-28T19:05:00-03:00",
      "completed": true,
      "exercises": [
        { "exercise": "supino_inclinado", "completed": true, "weight": 32.5 },
        { "exercise": "elevacao_lateral", "completed": false, "weight": null }
      ]
    }
  ]
}
```

(Os valores de `workout` e `exercise` do exemplo são ilustrativos; valem os `code` e `name_key` reais do seed.)

## Regras de validação (ordem)

1. Texto é JSON válido e objeto na raiz ⇒ senão `INVALID_FORMAT`.
2. `format === "gymflow-backup"` ⇒ senão `INVALID_FORMAT`.
3. `schemaVersion` inteiro ≥ 1; se > 1 ⇒ `UNSUPPORTED_VERSION` ("arquivo de uma versão mais recente do app").
4. Campos e tipos conforme [data-model.md](../data-model.md); campos desconhecidos são ignorados (compatibilidade para frente dentro da mesma versão); ausência ou tipo errado ⇒ `INVALID_VALUE`.
5. Datas casam com `AAAA-MM-DDTHH:mm:ss±HH:mm`; `finishedAt` ≥ `startedAt` ⇒ senão `INVALID_VALUE`.
6. `weight` nulo ou ≥ 0 e finito; `restTimerSeconds` inteiro > 0; `currentPosition` inteiro ≥ 1 ⇒ senão `INVALID_VALUE`.
7. Unicidade: um `sequenceState` por programa; um `exercise` por sessão; nenhuma sessão repetida (mesmo `program`, `workout` e `startedAt`) ⇒ senão `INVALID_VALUE`.
8. Referências (contra o catálogo do app): `activeProgram`, `program`, `workout` (dentro do programa) e `exercise` existem ⇒ senão `UNKNOWN_REFERENCE`. Além disso, `currentPosition` deve ser ≤ quantidade de treinos do programa ⇒ senão `INVALID_VALUE` (evita quebrar a resolução do próximo treino).
9. Tamanho do arquivo ≤ 10 MB (verificado antes de ler) ⇒ senão `INVALID_FORMAT`.

Nenhuma validação altera o banco; a escrita só ocorre em `ConfirmImportBackup`.

## Garantias da exportação

- Só sessões com `finished_at` não nulo; sessão em andamento nunca é exportada.
- Nenhum identificador do aparelho ou do usuário; nenhum dado do seed além das chaves de referência.
- Datas exportadas exatamente como armazenadas (sem conversão de fuso).
- Ordem estável: sessões por `startedAt` crescente; `sequenceState` por nome do programa.

## Versionamento

Mudança incompatível ⇒ incrementar `schemaVersion`; um parser da v1 recusa versões maiores. Ler
versões antigas fica a cargo de quem introduzir a nova versão.
