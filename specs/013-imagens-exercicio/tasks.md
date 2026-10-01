# Tasks: Imagens de exercício na execução do treino

**Input**: Design documents from `/specs/013-imagens-exercicio/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui.md, design/tokens.md

**Tests**: MANDATORY (constituição XI/TDD: teste falho → código mínimo → refatorar). Escrever cada
teste desta lista e confirmar que falha antes de implementar a task de código correspondente.

**Organization**: Tasks agrupadas por user story (US1 = P1, US2 = P2), conforme spec.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1 ou US2, conforme spec.md
- Caminhos de arquivo exatos em cada task

---

## Phase 1: Setup

**Purpose**: Estrutura mínima compartilhada pelas duas user stories

- [x] T001 Criar `src/assets/exercises/index.ts` exportando `EXERCISE_IMAGES: Record<string, ImageSourcePropType>` vazio (sem imagens ainda) e um comentário explicando a convenção (chave = `normalizeName(exercise.name)`, uma linha `require(...)` por imagem), conforme [research.md](research.md) D1/D2

**Checkpoint**: registro de assets existe e pode ser importado; nenhuma imagem real ainda cadastrada (intencional — cobertura parcial é o cenário real).

---

## Phase 2: Foundational

**Purpose**: Nenhuma — esta feature não tem infraestrutura bloqueante além do Setup (sem schema,
sem caso de uso novo, sem store novo). US1 e US2 seguem direto para suas fases.

---

## Phase 3: User Story 1 - Ver imagem do exercício durante o treino (Priority: P1) 🎯 MVP

**Goal**: Exercícios com imagem cadastrada exibem a imagem na tela de execução, enquadrada sem
esticar, inclusive em bi-sets (cada item do par com sua própria imagem).

**Independent Test**: Registrar uma imagem de teste em `EXERCISE_IMAGES`, iniciar um treino com um
exercício desse nome e verificar que a imagem aparece no card correspondente.

### Tests for User Story 1 ⚠️ (escrever e ver falhar antes de implementar)

- [x] T002 [P] [US1] Teste unitário: `resolveExerciseImage('supino reto')` (ou função equivalente) retorna a entrada de `EXERCISE_IMAGES` quando a chave normalizada existe, inclusive com variação de maiúsculas/acentos, em `tests/unit/components/workout/ExerciseImage.test.tsx`
- [x] T003 [US1] Teste RNTL: `ExerciseCard` de um exercício com imagem cadastrada renderiza o `<Image>` correspondente, em `tests/ui/workout/workout.test.tsx` (novo `describe('imagem do exercício')`) — não paralelizável com T004 (mesmo arquivo)
- [x] T004 [US1] Teste RNTL: num treino com bi-set (dois `WorkoutScreenItem` distintos), cada card resolve e renderiza sua própria imagem de forma independente, em `tests/ui/workout/workout.test.tsx` — não paralelizável com T003 (mesmo arquivo)

### Implementation for User Story 1

- [x] T005 [US1] Implementar `src/components/workout/ExerciseImage.tsx`: recebe `name: string`, deriva a chave com `normalizeName` (`src/utils/normalizeName.ts`), resolve `EXERCISE_IMAGES[chave]` e renderiza `<Image resizeMode="cover" style={{ height: EXERCISE_IMAGE_HEIGHT, borderRadius: radius.md }} />` quando encontrada (branch de placeholder fica para a US2); tokens conforme [design/tokens.md](design/tokens.md) (depende de T001, faz T002 passar)
- [x] T006 [US1] Integrar `<ExerciseImage name={item.name} />` no topo de `src/components/workout/ExerciseCard.tsx`, antes do `header`, visível tanto recolhido quanto expandido (depende de T005, faz T003 e T004 passarem)

**Checkpoint**: exercícios com imagem cadastrada aparecem corretamente na tela de execução,
inclusive em bi-sets. MVP entregável.

---

## Phase 4: User Story 2 - Layout consistente quando não há imagem (Priority: P2)

**Goal**: Exercícios sem imagem cadastrada (maioria hoje, especialmente Treino Monstro) mostram um
placeholder genérico na mesma área de tamanho fixo, sem quebrar o layout nem afetar o resto do
card.

**Independent Test**: Iniciar um treino com um exercício cujo nome não está em `EXERCISE_IMAGES` e
verificar que o placeholder aparece, com a mesma altura/borda usada pelos exercícios com imagem.

### Tests for User Story 2 ⚠️ (escrever e ver falhar antes de implementar)

- [x] T007 [P] [US2] Teste unitário: `ExerciseImage`/função de resolução retorna "sem imagem" (placeholder) para um nome sem entrada em `EXERCISE_IMAGES`, em `tests/unit/components/workout/ExerciseImage.test.tsx`
- [x] T008 [US2] Teste RNTL: `ExerciseCard` de um exercício sem imagem renderiza o placeholder (glifo `▦` sobre `colors.surfaceRaised`) na mesma área de tamanho fixo, em `tests/ui/workout/workout.test.tsx` — não paralelizável com T009 (mesmo arquivo)
- [x] T009 [US2] Teste RNTL: numa lista com exercícios com e sem imagem misturados, nenhum `onSetCompleted`, `onWeightChange`, `onWeightCommit` ou outro callback de sessão é chamado pela renderização do bloco de imagem/placeholder (garante FR-005), em `tests/ui/workout/workout.test.tsx` — não paralelizável com T008 (mesmo arquivo)

### Implementation for User Story 2

- [x] T010 [US2] Implementar o branch de placeholder em `src/components/workout/ExerciseImage.tsx`: quando `EXERCISE_IMAGES[chave]` não existe, renderizar um `View` com a mesma altura fixa (`EXERCISE_IMAGE_HEIGHT`), `colors.surfaceRaised`, borda `colors.border`, `radius.md`, contendo o glifo `▦` em `colors.textMuted` centralizado — conforme [design/tokens.md](design/tokens.md) (depende de T005; faz T007 e T008 passarem)

**Checkpoint**: todos os exercícios, com ou sem imagem, mostram um bloco visualmente consistente;
nenhuma regressão em marcar, registrar peso, cronômetro ou finalizar (T009 cobre isso).

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T011 Validar manualmente o roteiro de [quickstart.md](quickstart.md) (incluir uma imagem de teste, conferir corte/enquadramento, placeholder, bi-set) em Android — pendente (sem dispositivo/emulador neste ambiente)
- [x] T012 Rodar `typecheck` + `lint` + testes: limpos (0 erros, 83 suites / 426 testes passando). `format:check` falha, mas por um problema pré-existente no repositório (247 arquivos, incluindo `.prettierrc`/`package.json` nunca tocados) já presente antes desta feature — confirmado rodando `prettier --check .` numa árvore limpa (`git stash`)
- [x] T013 Revisão de código (requesting-code-review): "ready to merge, with fixes" — único ponto Importante corrigido: `resolveExerciseImage` lançava `ValidationError` para nome vazio/só espaços em vez de cair no placeholder (teste de regressão adicionado em `tests/unit/components/workout/ExerciseImage.test.tsx`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências
- **Foundational (Phase 2)**: vazia, não bloqueia nada
- **US1 (Phase 3)**: depende do Setup (T001); é o MVP
- **US2 (Phase 4)**: depende de T005 (mesmo arquivo `ExerciseImage.tsx`), mas é testável e
  entregável de forma independente do resto da US1 (bloco "não encontrado" é um caminho próprio)
- **Polish (Phase 5)**: depende de US1 e US2 concluídas

### Parallel Opportunities

- T002 (arquivo próprio) pode ser escrito em paralelo com T003/T004
- T003 e T004 tocam o mesmo arquivo (`tests/ui/workout/workout.test.tsx`) — sequenciais entre si
- T007 (arquivo próprio) pode ser escrito em paralelo com T008/T009
- T008 e T009 tocam o mesmo arquivo (`tests/ui/workout/workout.test.tsx`) — sequenciais entre si
- T005 e T010 tocam o mesmo arquivo (`ExerciseImage.tsx`) — não paralelizar entre si

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 (Setup)
2. Phase 3 (US1) — imagens aparecem para os exercícios já cadastrados
3. **Parar e validar**: conferir com uma imagem real de teste antes de seguir

### Incremental Delivery

1. Setup → US1 (MVP, imagens quando existem) → US2 (placeholder cobre o resto, hoje a maioria dos
   exercícios) → Polish
