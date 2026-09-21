# Research: Programas Iniciais (Seed)

Nenhuma incógnita restante (NEEDS CLARIFICATION = 0). Pendências de **conteúdo** (não de arquitetura) listadas em R9.

## R1 — Dados como código tipado
- **Decision**: seed em arquivos TypeScript (`src/data/seed/*`), não JSON/SQL. Tipos `SeedExercise`, `SeedProgram`, `SeedWorkout`, `SeedWorkoutExercise`, `SeedScheduleDay`.
- **Rationale**: checagem de tipos estrita, sem parsing em tempo de execução, testável como dado puro; sem dependência nova.
- **Alternatives**: JSON + validação em runtime (mais código); SQL puro (não reutiliza repositórios nem `normalizeName`).

## R2 — Executor genérico e programa padrão
- **Decision**: `runSeed` percorre `SEED_DATA.programs` sem branch por nome. O programa ativo/tipo de sequência padrão vem de `isDefault: true` (um único programa) e `defaultSequenceType` nos dados.
- **Rationale**: constituição VI (nada por nome de programa); novos programas entram só como dados.

## R3 — Quando roda
- **Decision**: a cada abertura, logo após `runMigrations`, dentro de `bootstrapDatabase(db)`, antes de montar as rotas. Falha ⇒ mesmo estado de erro da 001 ("Tentar novamente").
- **Rationale**: a clarificação exige refletir o conteúdo da versão do app a cada execução; custo desprezível (~130 upserts).
- **Alternatives**: tabela/`user_version` de seed (estado extra sem ganho); rodar só na 1ª instalação (rejeitado na clarificação).

## R4 — Semântica de atualização
- **Decision**, tudo em **uma transação**, usando `createRepositories(tx, clock)` da 002:
  1. `upsertByName` de cada exercício do catálogo (atualiza músculos/descrição; mantém id) e mapa `nome → id`.
  2. `upsertProgram` (nome, descrição, `home_suggestion`); `upsertWorkout` por `(programa, code)` com `position` e `warmup_note`.
  3. `upsertWorkoutExercise` por `(treino, exercício)` com `display_order`, prescrição, técnica e notas.
  4. **Limpeza**: itens de treino que **não** estão mais no seed são removidos (`DELETE` em `workout_exercise`, seguro: sessões referenciam `exercise`, não `workout_exercise`); treinos que saíram do seed e exercícios que saíram do catálogo são **desativados** (`active = 0`), nunca excluídos (FR-010 da 002).
  4b. Agenda: `weekly_schedule` do programa é sincronizada com o seed (linhas fora do seed removidas). Programa que sai do seed é apenas desativado (`active = 0`).
  5. Agenda: `upsertEntry` para os 7 dias dos programas que têm agenda; programa sem agenda no seed não recebe linhas.
  6. Estado de sequência: se `get(programId)` é `null` ⇒ `upsert(programId, 1)`; caso contrário não toca.
  7. Configurações: se `get()` é `null` ⇒ `save` com os padrões; caso contrário não toca.
- **Nota**: a limpeza (passo 4) usa SQL direto na camada `data/seed/` (`sync.ts`) porque o contrato de repositórios da 002 não expõe remoção de itens; evita reabrir a spec 002. Sessões e configurações nunca são lidas para escrita.

## R5 — Bi-set, prescrição e notas
- **Decision**: cada exercício do par é um item próprio, `technique = 'BI-SET'` e `notes` transcritas literalmente da ficha (ex.: "Pegada normal. Bi-set com barra reta pegada invertida"; não se impõe o formato "Bi-set com <parceiro>" nem o nome completo do exercício), em posições vizinhas. Prescrição da ficha transcrita literalmente (com "×" e "–"); "—" da ficha vira `null` (técnica/notas).
- **Rationale**: constituição VII; `docs/fichas-treino.md` §1.

## R6 — Conferência contra a fonte
- **Decision**: teste unitário lê as tabelas de `docs/fichas-treino.md` (Monstro) e as listas do `docs/PRD.md` §7 (Padrão) e compara com `SEED_DATA` (nomes, ordem, prescrição, técnica, notas; "—" ⇒ vazio; `--` do PRD ⇒ `–`).
- **Rationale**: SC-001 (100% conferem com a transcrição) verificado automaticamente; corrigir a ficha exige atualizar docs e seed juntos.

## R7 — Reutilização de exercícios
- **Decision**: exercício reutilizado quando `normalizeName` coincide. Compartilhados entre programas (6): Elevação frontal, Elevação lateral, Supino inclinado, Adutora, Cadeira extensora, Mesa flexora. Não coincidem por nome (logo, distintos): "Leg Press" (Padrão) × "Leg press 45°" (Monstro), "Rosca martelo" × "Rosca martelo sentado", "Tríceps testa" × "Tríceps testa unilateral no cross", "Desenvolvimento" × "Desenvolvimento frontal no Smith".
- **Total**: 43 + 22 − 6 = **59** exercícios distintos; 28 + 43 = **71** itens de treino (Padrão reutiliza exercícios entre Dia 1/2/5: 22 distintos em 28 itens).

## R8 — Textos do programa
- **Warm-up**: constante única `WARMUP_NOTE = "Aquecimento de manguito rotador + aquecimento livre"` em todos os treinos (clarificação 3).
- **Dia opcional**: `note = "Abdominais supra/infra e oblíquos"` em sábado e domingo do Monstro; quarta sem texto (clarificação 2).
- **Cardio (`home_suggestion`, Monstro)**: "Caminhada ligeira, sem correr: 30 min de manhã e 30 min à noite, ou 1 h, longe do treino resistido." Reproduz só a divisão, sem o total ("360 horas" da ficha), como no protótipo e no `CLAUDE.md`.
- **Padrão**: sem `home_suggestion` e sem agenda.

## R9 — Conteúdo a redigir e revisar (não bloqueia o plano)
- **Músculos/descrição (ⓘ)** dos 59 exercícios: redigidos em pt-BR como texto informativo (movimento e músculos), sem carga, técnica ou recomendação (constituição VIII). Para o Padrão, usar como referência as ilustrações em `docs/treino padrao/` (músculos em laranja). O dono do app revisa o texto antes de considerar a spec concluída.
- **Cardio**: texto do R8 sujeito a confirmação do dono do app.
- **Variação "tríceps testa unilateral no cross"**: mantida como exercício distinto (suposição da spec).

## R10 — Integração com o gate da 001
- **Decision**: `bootstrapDatabase(db)` em `src/data/bootstrap.ts` executa migrations e seed em sequência e devolve `ready`/`error`; o `DatabaseGate` (001, T020/T021) passa a chamá-la em vez de `runMigrations` direto. Testes de UI da 001 continuam válidos (runner mockado).
- **Dependência**: ajuste pequeno no código da 001, listado nas tarefas da 003.
