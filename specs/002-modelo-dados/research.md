# Research: Modelo de Dados e Repositórios

Nenhuma incógnita restante (NEEDS CLARIFICATION = 0).

## R1 — Uma migration para o esquema inteiro
- **Decision**: `0002-schema` cria todas as 9 tabelas, índices e CHECKs de uma vez, já incluindo as colunas das seções 14 e 15 de `docs/modelo-dados.md` (`primary_muscle`, `secondary_muscles`, `description`, `warmup_note`, `note`, `home_suggestion`) em vez de `ALTER TABLE` posteriores.
- **Rationale**: app ainda sem versão distribuída; nada a migrar. Esquema final legível em um lugar.
- **Alternatives**: uma migration por tabela (ruído sem ganho); manter `ALTER TABLE` da doc (histórico artificial).

## R2 — `PRAGMA foreign_keys = ON`
- **Decision**: ativado em `openDatabase` (001) logo após abrir, **fora** de transação (o pragma é ignorado dentro de transação). Teste de schema falha se FK não estiver ativa; o helper `better-sqlite3` também o ativa.
- **Rationale**: sem isso o SQLite não bloqueia a exclusão de itens usados por sessão (FR-010).
- **Dependência**: confirmar/ajustar a tarefa T017 da 001 na implementação.

## R3 — Desativar em vez de excluir
- **Decision**: FKs sem `ON DELETE` (comportamento `NO ACTION`/restrição imediata) de sessões para programa/treino/exercício; repositórios expõem `deactivate*`, nunca `delete*` desses três.
- **Rationale**: FR-010 e constituição V. Exclusão física continua possível só onde nada referencia (ex.: correção de seed), rejeitada pelo banco se referenciado.

## R4 — Nome de exercício único
- **Decision**: coluna `name_key TEXT NOT NULL UNIQUE` com o nome normalizado por `normalizeName` (`src/utils/normalizeName.ts`): `trim`, espaços internos colapsados, `normalize('NFC')` e `toLocaleLowerCase('pt-BR')`. `name` guarda o texto como cadastrado. Buscas e upserts usam `name_key`.
- **Rationale**: o `COLLATE NOCASE` do SQLite só ignora caixa em ASCII, então "Tríceps testa" e "TRÍCEPS TESTA" seriam distintos; nomes em pt-BR têm acentos. A chave normalizada garante a unicidade no schema para qualquer caractere.
- **Alternatives**: `COLLATE NOCASE` (falha com acentos); função SQL customizada (indisponível em `expo-sqlite`).

## R5 — Uma sessão em andamento
- **Decision**: índice único parcial sobre expressão constante: `CREATE UNIQUE INDEX ux_workout_session_in_progress ON workout_session ((1)) WHERE finished_at IS NULL`. Em andamento = `finished_at IS NULL` (e `completed = 0`).
- **Rationale**: garantido no schema (constituição X). Descartar = `DELETE` da sessão e suas linhas em transação, só se `finished_at IS NULL`.
- **Alternatives**: checar na aplicação (corrida/bug pode duplicar).

## R6 — CHECK constraints
- **Decision**: `weight IS NULL OR weight >= 0`; `completed IN (0,1)`; `sequence_type IN ('CONTINUOUS','WEEKLY')`; `weekday BETWEEN 1 AND 7`; `position >= 1`; `current_position >= 1`; `optional IN (0,1)`; `active IN (0,1)`; `finished_at IS NOT NULL` quando `completed = 1`.
- **Rationale**: regras de integridade no schema (X); também exige atualizar `docs/modelo-dados.md` (só tinha exemplo sem CHECK).

## R7 — Portas e adaptadores
- **Decision**: interfaces `*Repository` em `src/domain/<área>/`, implementações `Sqlite*Repository` em `src/data/repositories/`, recebendo `Database` por construtor. Linhas SQL (`snake_case`) mapeadas para objetos (`camelCase`) em `mappers.ts`. Erros de integridade traduzidos para erros tipados (`ValidationError`, `ConflictError`) em `errors.ts`.
- **Rationale**: constituição II; testes de domínio futuros usam fakes das interfaces.

## R8 — Datas
- **Decision**: `utils/localDate.ts` com `nowLocalIso(clock = () => new Date())` → `YYYY-MM-DDTHH:mm:ss±HH:MM` (hora local + deslocamento) e `localDateOf(iso)` → `YYYY-MM-DD` (fatia da string, sem `new Date`). Repositórios recebem um `Clock` injetável.
- **Rationale**: FR-011; evita conversão UTC. Testes com relógio falso (23h30 em fuso −03:00 continua no mesmo dia).
- **Nota**: comparação de instantes usa `Date.parse`; ordenação por texto só vale com mesmo deslocamento (documentado em `docs/modelo-dados.md` §16).

## R9 — Criação de sessão
- **Decision**: `SessionRepository.startSession(programId, workoutId)` em uma transação: insere `workout_session` e uma `workout_session_exercise` por `workout_exercise` do treino (ordem `display_order`), `completed=0`, `weight=NULL`. Falha na segunda etapa ⇒ nada gravado; segunda sessão em andamento ⇒ `ConflictError`.
- **Rationale**: cenários 3 e 4 da US3; clarificação 1.

## R10 — "Última carga"
- **Decision**: `SessionRepository.getLastWeight(programId, exerciseId)`: `SELECT weight` da última sessão finalizada (`completed = 1`) do programa com `weight IS NOT NULL`, ordenada por `finished_at DESC, id DESC`. Sem coluna nova.
- **Rationale**: FR-006. Exposta aqui por ser derivada do schema; uso pela UI é da spec 007.
- **Nota de ordenação**: `finished_at DESC` como texto pode errar entre fusos diferentes; `id DESC` desempata e aproxima a ordem real. Aceito para uso pessoal.

## R11 — Seed e escrita de conteúdo
- **Decision**: `ProgramRepository`/`ExerciseRepository` oferecem `upsert*` por chave natural (`exercise.name`, `(program_id, code)`, `(workout_id, exercise_id)`, `(program_id, weekday)`) para a spec 003.
- **Rationale**: seed idempotente sem lógica SQL na 003.

## R12 — `updated_at`
- **Decision**: repositórios definem `updated_at` a cada escrita usando o `Clock`; sem triggers.
- **Rationale**: simplicidade e testabilidade com relógio falso.
