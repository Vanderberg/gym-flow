# Data Model: Programas Iniciais (Seed)

**Sem mudanças de esquema.** Esta spec só popula as tabelas criadas na spec 002. Este documento mapeia o
seed para as tabelas e fixa as contagens esperadas.

## Mapeamento seed → tabelas

| Dado do seed | Tabela.coluna | Regra |
|--------------|---------------|-------|
| Programa | `training_program` (`name`, `description`, `home_suggestion`, `active`) | upsert por `name`; sempre `active = 1` |
| Treino | `workout` (`program_id`, `code`, `name`, `position`, `warmup_note`) | upsert por `(program_id, code)`; `warmup_note = WARMUP_NOTE` |
| Exercício | `exercise` (`name`, `name_key`, `muscle_group`, `primary_muscle`, `secondary_muscles`, `description`) | upsert por `name_key`; todos os campos de músculo/descrição preenchidos |
| Item de treino | `workout_exercise` (`display_order`, `prescription`, `technique`, `notes`) | upsert por `(workout_id, exercise_id)`; `technique`/`notes` `NULL` quando a ficha traz "—" |
| Agenda | `weekly_schedule` (`weekday`, `workout_id`, `optional`, `note`) | upsert por `(program_id, weekday)`; só programas com agenda |
| Sequência inicial | `program_sequence_state` | `current_position = 1` **apenas se ausente** |
| Configurações | `app_settings` (`id = 1`) | criadas **apenas se ausentes** |

## Contagens esperadas após o seed

| Item | Quantidade |
|------|-----------|
| Programas | 2 (Treino Padrão, Treino Monstro) |
| Treinos | 9 (Padrão 5 + Monstro 4) |
| Exercícios distintos | 59 (43 + 22 − 6 compartilhados) |
| Itens de treino | 71 (Padrão 28 + Monstro 43) |
| Monstro por treino | A = 11, B = 10, C = 10, D = 12 |
| Padrão por treino | Dia 1 = 6, Dia 2 = 6, Dia 3 = 6, Dia 4 = 4, Dia 5 = 6 |
| Itens com `technique = 'BI-SET'` (Monstro) | 12 (A: 2, B: 4, C: 2, D: 4), sempre em pares vizinhos (6 pares) |
| Agenda | 7 linhas (só Monstro) |
| Estados de sequência | 2 (posição 1) |
| `app_settings` | 1 (`id = 1`) |

Os números são conferidos por teste contra `docs/fichas-treino.md` e `docs/PRD.md` §7.

## Agenda do Treino Monstro

| `weekday` | Dia | `workout_id` | `optional` | `note` |
|-----------|-----|--------------|-----------|--------|
| 1 | Segunda | A | 0 | — |
| 2 | Terça | B | 0 | — |
| 3 | Quarta | `NULL` | 0 | — (descanso puro) |
| 4 | Quinta | C | 0 | — |
| 5 | Sexta | D | 0 | — |
| 6 | Sábado | `NULL` | 1 | "Abdominais supra/infra e oblíquos" |
| 7 | Domingo | `NULL` | 1 | "Abdominais supra/infra e oblíquos" |

## Regras de validação do conteúdo (testadas em `seedData.test.ts`)

- Nomes de exercício únicos por `normalizeName`; todo item de treino aponta para exercício do catálogo.
- Todo exercício do catálogo tem `primaryMuscle`, `secondaryMuscles` e `description` não vazios (BL-124/SC-003).
- Todo bi-set: dois itens de mesma técnica `BI-SET` em posições vizinhas, cada um com `notes` não nulas contendo "bi-set" (sem diferenciar maiúsculas). O pareamento exato com o parceiro é conferido contra a ficha em `monstroData.test.ts`, não pelo validador genérico.
- `display_order` estritamente crescente por treino; `position` de treino 1..N sem lacunas.
- Exatamente um programa com `isDefault`.
- Nenhum texto exibido (prescrição, notas, descrições) vazio quando o campo é obrigatório no contrato.

## Ciclo de vida

```text
abertura do app → migrations → runSeed (transação):
   conteúdo do seed  ──upsert/limpeza──▶ programas, treinos, exercícios, itens, agenda
   estado/config     ──criar se ausente─▶ program_sequence_state, app_settings
   sessões           ──nunca tocadas────▶ workout_session*, program_sequence_state (posição existente)
```
