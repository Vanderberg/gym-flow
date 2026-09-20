# Data Model: Fundação do Projeto

Esta spec não cria tabelas de domínio (spec 002). Define apenas o mecanismo de versão do esquema.

## Versão do esquema

- **Onde**: `PRAGMA user_version` do banco SQLite (inteiro, padrão 0 em banco novo).
- **Significado**: número da última migration aplicada com sucesso.
- **Invariantes**:
  - Nunca decresce.
  - Só é atualizado dentro da mesma transação da migration correspondente.
  - Após uma falha, permanece o valor anterior.

## Migration

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `version` | inteiro ≥ 1 | Único e estritamente crescente (1, 2, 3…) sem lacunas |
| `up(db)` | função | Aplica a mudança usando a interface `Database` |

## Estados do runner

```text
início ─▶ lê user_version ─▶ pendentes = migrations com version > user_version
  ├─ sem pendentes ─▶ pronto
  └─ para cada pendente (em ordem): BEGIN ─▶ up ─▶ user_version = version ─▶ COMMIT
        └─ erro ─▶ ROLLBACK ─▶ estado "erro" (dados anteriores intactos; permite tentar novamente)
```

## Regras de validação

- Lista de migrations com versões duplicadas, fora de ordem ou com lacuna ⇒ erro de programação detectado por teste.
- Banco com `user_version` maior que a maior migration conhecida (app desatualizado) ⇒ estado "erro" sem alterar o banco.

## Migration 0001 (baseline)

Sem alterações de esquema; apenas eleva `user_version` para 1. Serve para exercitar o runner em instalação nova.
