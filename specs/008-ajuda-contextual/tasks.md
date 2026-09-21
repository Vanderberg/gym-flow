---
description: "Task list for Ajuda Contextual"
---

# Tasks: Ajuda Contextual

**Input**: `specs/008-ajuda-contextual/` (plan.md, spec.md, research.md, data-model.md, contracts/use-cases.md, contracts/ui.md, contracts/legend-content.md, quickstart.md)
**Backlog**: BL-110 (exibição), BL-111, BL-112, BL-113, BL-114, BL-115, BL-116
**Requisitos de produto**: RF-21, RF-22, RF-23, RF-24, RF-25, RF-26
**Depende de**: specs 001–007 concluídas (seed, tela de treino com slots `onHelp`/`onInfo`, `TechniqueChip`, rascunho de peso, `Sheet` comum)
**Tests**: incluídos — a constituição (XI) exige testes de domínio, persistência e fluxos de UI (abrir a ajuda sem alterar a sessão). Escreva cada teste antes da implementação e veja-o falhar.
**Design**: tokens e componentes de `docs/design-telas.md` §2–3 e §5.2 ("Placar de academia"). Nenhuma tela usa cor, tamanho ou espaçamento literal.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1 (legenda de técnicas), US2 (detalhes do exercício), US3 (ajuda direta por técnica)
- Cada fase lista os BL/RF que cobre; todo commit referencia o BL da tarefa (ex.: `feat(008): BL-111 ...`).

---

## Phase 1: Setup

- [ ] T001 Verificar que as specs 001–007 estão concluídas: `npm run check` passa e `specs/INDEX.md` marca `001` a `007` como `concluída`; se não, parar e avisar
- [ ] T002 [P] Criar as pastas com `.gitkeep` onde ainda não existirem: `src/domain/help/`, `src/components/help/`, `src/components/common/`, `src/constants/`, `src/store/`, `src/hooks/`, `tests/unit/domain/help/`, `tests/unit/constants/`, `tests/unit/store/`, `tests/unit/hooks/`, `tests/unit/help/`, `tests/ui/common/`, `tests/ui/help/`, `tests/integration/application/`, `tests/integration/seed/`

---

## Phase 2: Foundational (bloqueia todas as histórias)

**Purpose**: tipos, estado das folhas, ícones do design e o hook de abertura (tudo verde sozinho)

- [ ] T003 [P] Criar `src/domain/help/types.ts` com `LegendEntry`, `MuscleInfo` e `HelpSheetState` exatamente como em `data-model.md`
- [ ] T004 [P] Escrever `tests/unit/store/helpStore.test.ts` e implementar `src/store/helpStore.ts` (Zustand): estado `HelpSheetState` (`NONE`, `LEGEND` com `term?`, `EXERCISE` com `exerciseId`), `opening: boolean` (abertura em curso), `restoreFocusExerciseId: number | null`; ações `openLegend(term?)`, `openExercise(id)`, `close()`, `markOpening(exerciseId | null)`, `cancelOpening()`; casos: abrir e fechar voltam a `NONE`; abrir uma folha substitui a outra; `markOpening` seguido de `cancelOpening` volta a `opening = false`; `close()` limpa `opening` mas guarda `restoreFocusExerciseId` até ser consumido; o store não importa `workoutStore`, cronômetro nem repositórios
- [ ] T005 [P] Escrever `tests/ui/common/HelpIcon.test.tsx` e `tests/ui/common/InfoIcon.test.tsx` (RNTL) e implementar `src/components/common/HelpIcon.tsx` (`?`) e `src/components/common/InfoIcon.tsx` (`ⓘ`) conforme `docs/design-telas.md` §3 (teste: pressionar e soltar fora não dispara `onPress` e chama o cancelamento): botão de 44 dp com ícone de 20 dp (`@expo/vector-icons`, traço 2 dp), `accessibilityLabel` "Legenda das técnicas" / "Informações do exercício", `onPressIn` (usado para marcar a abertura), `onPressOut` (cancelamento) e `onPress`, só tokens de `theme.ts`
- [ ] T006 Escrever `tests/unit/hooks/useHelp.test.ts` e implementar `src/hooks/useHelp.ts` (`openLegend(term?)`, `openExercise(exerciseId)`, `close()`, `onTriggerPressIn(exerciseId | null)`, `onTriggerPressOut()`): `onTriggerPressOut` chama `cancelOpening()` se nenhuma folha abriu (pressionar e arrastar para fora não deixa `opening` ligado e a perda de foco seguinte grava normalmente); `onTriggerPressIn` chama `helpStore.markOpening` **antes** do `onPress`; `open*` mudam só o `helpStore`; `close()` devolve o `exerciseId` a receber o foco; nenhuma escrita em repositório, casos de uso ou `workoutStore` (spies) — depende de T004

**Checkpoint**: T004–T006 passam; `npm run check` verde.

---

## Phase 3: User Story 1 — Legenda de técnicas (P1) 🎯 MVP — BL-111, BL-112, BL-116 · RF-21, RF-22, RF-26

**Goal**: abrir a legenda de técnicas por um `?` no cabeçalho da tela de treino, sob demanda, sem alterar a sessão nem o rascunho de peso.
**Independent Test**: abrir e fechar a legenda em treino em andamento, também com peso digitado e não salvo (quickstart, itens 1, 3 e 4).

### Tests

- [ ] T007 [P] [US1] Escrever `tests/unit/constants/techniqueLegend.test.ts`: `TECHNIQUE_LEGEND` tem as 8 entradas de `contracts/legend-content.md` na ordem definida; títulos únicos e em caixa alta; textos não vazios e com no máximo ~120 caracteres; nenhum texto contém verbos de recomendação ("recomenda", "deve usar", "aumente", "reduza a carga para") nem menciona carga, treino ou dieta prescritivos; os quatro valores de `TECHNIQUES` do seed (`BI-SET`, `DROP-SET`, `FALHA`, `PROGRESSÃO DE CARGA`) têm entrada
- [ ] T008 [P] [US1] Escrever `tests/integration/seed/helpContent.test.ts` (`createTestDb()` + seed da 003), parte da legenda (SC-004, FR-001a): para todo `workout_exercise.technique` não nulo dos dois programas existe entrada em `TECHNIQUE_LEGEND` com título igual (comparação exata); o teste falha com mensagem clara se o seed usar uma técnica sem entrada
- [ ] T009 [P] [US1] Escrever `tests/ui/help/legendSheet.test.tsx` (RNTL, tela de treino com casos de uso simulados): a legenda não aparece automaticamente; tocar em `?` do cabeçalho (1 toque — SC-001) abre a folha inferior com todas as entradas na ordem, título e descrição; fecha por toque no fundo, botão **Fechar** e voltar do Android; a tela de treino permanece como estava (mesma lista, mesmo progresso, cartões expandidos); acessibilidade: folha modal com foco no título
- [ ] T010 [P] [US1] Escrever `tests/ui/help/helpDoesNotChangeSession.test.tsx` (BL-116, FR-004, FR-004a): com espiões em `SetExerciseCompleted`, `SetExerciseWeight`, `FinishWorkout` e `StartWorkout`, abrir e fechar a legenda não chama nenhum deles; `workoutStore` (marcações, pesos, cartões expandidos, rascunhos) idêntico antes e depois; **rascunho de peso**: digitar "62" sem confirmar, tocar em `?`, conferir que `SetExerciseWeight` não foi chamado e o campo continua com "62"; ao fechar o foco volta ao campo; a perda de foco seguinte (fora da ajuda) grava normalmente; os dois casos de ordem de eventos: perda de foco do campo **antes** do `onPressIn` e **depois** dele; nos dois `SetExerciseWeight` não é chamado e o rascunho fica; FEITO e finalizar gravam o pendente como na spec 007

### Implementation

- [ ] T011 [US1] Criar `src/constants/techniqueLegend.ts` exportando `TECHNIQUE_LEGEND: LegendEntry[]` com as 8 entradas e os textos de `contracts/legend-content.md` (pt-BR, sem recomendação) — faz T007 e T008 passarem
- [ ] T012 [P] [US1] Criar `src/components/help/LegendSheet.tsx` sobre `Sheet` comum: lista rolável de termos (título em `title`, descrição em `body`), botão **Fechar**, fecha por toque no fundo e voltar do Android, `accessibilityViewIsModal` e foco no título ao abrir; sem regra de negócio e sem `initialTerm` ainda (entra na US3)
- [ ] T013 [US1] Ajustar `src/hooks/useWorkoutSession.ts` (spec 007) para que o handler de perda de foco do peso seja **adiado por um tick** (`setTimeout(0)`) e **não confirme** o valor quando `helpStore.opening` estiver marcado ao vencer o tick, e para que a lista da tela de treino use `keyboardShouldPersistTaps="handled"` e para que o foco volte ao campo do cartão (`restoreFocusExerciseId`) ao fechar a folha; o rascunho permanece em `workoutStore.drafts`; nenhuma outra regra de salvamento muda
- [ ] T014 [US1] Em `src/app/workout/index.tsx` ligar o `HelpIcon` ao slot `onHelp` do cabeçalho (`onPressIn` → `useHelp.onTriggerPressIn(null)`, `onPressOut` → `onTriggerPressOut()`, `onPress` → `openLegend()`) e montar `LegendSheet` a partir do `helpStore` — faz T009 e T010 passarem

**Checkpoint**: US1 testável sozinha; `npm run check` verde.

---

## Phase 4: User Story 2 — Detalhes do exercício (P1) — BL-110 (exibição), BL-113, BL-114, BL-116 · RF-23, RF-24, RF-25, RF-26

**Goal**: ver músculo principal, secundários e descrição de qualquer exercício de qualquer programa por um `ⓘ`, sem alterar a sessão.
**Independent Test**: abrir `ⓘ` em qualquer exercício dos dois programas (quickstart, itens 2–4). Depende só da Phase 2 e da tela de treino da 007 (não depende da US1).

### Tests

- [ ] T015 [P] [US2] Escrever `tests/unit/domain/help/muscleInfo.test.ts`: `buildMuscleInfo` separa `secondary_muscles` por vírgula ("Tríceps, Deltoide anterior" → `['Tríceps','Deltoide anterior']`), remove espaços e vazios; campos nulos ou vazios → "Não informado" (`secondaryMuscles` vira `['Não informado']`); preserva `name` e `description`
- [ ] T016 [P] [US2] Escrever `tests/integration/application/getExerciseInfo.test.ts` (`createTestDb()` + seed): devolve `MuscleInfo` de um exercício do Padrão e de um do Monstro; exercício reutilizado por dois treinos devolve a mesma informação; id inexistente → `NotFoundError`; nenhuma escrita; snapshot das tabelas `workout_session`, `workout_session_exercise`, `program_sequence_state` e `app_settings` de uma sessão em andamento idêntico antes e depois de executar o fluxo de leitura da ajuda (BL-116); o carregamento responde em menos de 200 ms sobre o SQLite em memória
- [ ] T017 [P] [US2] Acrescentar a `tests/integration/seed/helpContent.test.ts` a parte dos exercícios (SC-003, FR-002): para todo exercício do seed (Padrão e Monstro) `buildMuscleInfo` não usa o fallback "Não informado" em nenhum campo (músculo principal, secundários e descrição preenchidos)
- [ ] T018 [P] [US2] Escrever `tests/ui/help/muscleInfoSheet.test.tsx` (RNTL): `ⓘ` aparece em todo cartão de exercício, de qualquer programa; tocar abre a folha com nome, "MÚSCULO PRINCIPAL", "MÚSCULOS SECUNDÁRIOS" (separados por " · ") e "DESCRIÇÃO"; fecha por toque no fundo, **Fechar** e voltar do Android; a tela permanece como estava; a informação não aparece permanentemente
- [ ] T019 [P] [US2] Acrescentar a `tests/ui/help/helpDoesNotChangeSession.test.tsx` os casos do `ⓘ`: abrir e fechar não chama nenhum caso de uso de escrita e deixa `workoutStore` idêntico; com peso digitado e não salvo, abrir o `ⓘ` não grava, o rascunho continua no campo e o foco volta ao campo do mesmo cartão ao fechar

### Implementation

- [ ] T020 [P] [US2] Implementar `src/domain/help/muscleInfo.ts` (`buildMuscleInfo(exercise)`, puro) — faz T015 passar
- [ ] T021 [US2] Implementar `src/application/GetExerciseInfo.ts` conforme `contracts/use-cases.md` (`ExerciseRepository.getById` → `buildMuscleInfo`; `NotFoundError` se não existe; sem escrita) — faz T016 e T017 passarem
- [ ] T022 [P] [US2] Criar `src/components/help/MuscleInfoSheet.tsx` sobre `Sheet` comum (layout de `contracts/ui.md`, rótulos em caixa alta com `label`, valores em `body`), botão **Fechar**, modal para leitores de tela com foco no título; sem regra de negócio
- [ ] T023 [US2] Em `src/components/workout/ExerciseCard.tsx` passar o slot `onInfo` para renderizar o `InfoIcon` (44 dp, `onPressIn` → `useHelp.onTriggerPressIn(exerciseId)`, `onPressOut` → `onTriggerPressOut()`, `onPress` → `openExercise(exerciseId)`) e em `src/app/workout/index.tsx` montar `MuscleInfoSheet` lendo `GetExerciseInfo` do exercício aberto (estado de carregamento curto e "Não foi possível carregar" com **Fechar**) — faz T018 e T019 passarem

**Checkpoint**: US1 e US2 funcionam de forma independente.

---

## Phase 5: User Story 3 — Ajuda direta por técnica (P2) — BL-115 · RF-21, RF-22

**Goal**: um `?` ao lado do chip da técnica abre a legenda já posicionada na explicação daquela técnica.
**Independent Test**: tocar o `?` ao lado de "DROP-SET" e ver a explicação correta; técnica sem entrada não mostra `?` (quickstart, item 3). Depende da `LegendSheet` da US1.

### Tests

- [ ] T024 [P] [US3] Escrever `tests/unit/domain/help/legend.test.ts`: `findLegendEntry('DROP-SET')` devolve a entrada; `null` → `null`; `'drop-set'` (minúsculas), `'DROP-SET '` (espaço) e `'DROP SET'` → `null` (correspondência exata); a função recebe só o valor de `technique` (assinatura sem prescrição nem observações) e cada um dos quatro valores do seed encontra entrada
- [ ] T025 [P] [US3] Escrever `tests/ui/common/TechniqueChip.test.tsx` (extensão do componente da 007, RNTL): sem `onHelp` o chip não mostra `?`; com `onHelp` mostra o `?` adjacente (44 dp, `accessibilityLabel` "Explicação de <técnica>"); tocar chama `onHelp` com o valor da técnica; o chip continua exibindo a técnica como texto, sem alterar o conteúdo
- [ ] T026 [P] [US3] Escrever `tests/ui/help/techniqueHelp.test.tsx` (RNTL, tela de treino): exercício com `technique = 'DROP-SET'` mostra o `?` do chip, e tocar abre a `LegendSheet` já rolada até a entrada DROP-SET e destacada (sem depender só de cor); exercício sem técnica e exercício com técnica sem entrada correspondente não mostram `?` no chip; o `?` do cabeçalho continua abrindo a legenda no topo; prescrição e observações com o texto "drop-set" não fazem o `?` aparecer (só o campo `technique` conta); cartão colapsado (feito) não mostra o chip nem o `?`; abrir e fechar mantém o rascunho de peso e não grava nada

### Implementation

- [ ] T027 [P] [US3] Implementar `src/domain/help/legend.ts` (`findLegendEntry(technique)`, puro, comparação `===` com o título) — faz T024 passar
- [ ] T028 [US3] Estender `src/components/help/LegendSheet.tsx` com `initialTerm?`: ao abrir com termo, rola até a entrada de mesmo `title` e a destaca (token de foco do design e marcador não colorido); sem termo abre no topo
- [ ] T029 [US3] Estender `src/components/common/TechniqueChip.tsx` (spec 007) com `onHelp?` e, em `src/components/workout/ExerciseCard.tsx` e `src/components/common/PrescriptionBlock.tsx`, passar `onHelp` somente quando `findLegendEntry(item.technique)` existir (`onPressIn` → `useHelp.onTriggerPressIn(exerciseId)`, `onPressOut` → `onTriggerPressOut()`, `onPress` → `openLegend(technique)`; só no cartão expandido); montar a `LegendSheet` com `initialTerm` a partir do `helpStore` em `src/app/workout/index.tsx` — faz T025 e T026 passarem

**Checkpoint**: todas as histórias independentes do ponto de vista de teste.

---

## Phase 6: Polish & cross-cutting

- [ ] T030 [P] Escrever `tests/unit/help/purity.test.ts`: lê `src/domain/help/`, `src/store/helpStore.ts` e `src/hooks/useHelp.ts` e falha se importarem `react` (no domínio), `expo-*`, `better-sqlite3`, `src/data/` ou qualquer módulo de cronômetro (`/timer|cronometro/i`); e falha se `src/domain/help/legend.ts` referenciar `prescription` ou `notes` (constituição II, VII e FR-004b; garante que abrir a ajuda não toca o cronômetro da spec 011)
- [ ] T031 [P] Atualizar `docs/design-telas.md` §5.2 (rascunho de peso preservado ao abrir a ajuda e foco devolvido ao fechar; `?` do chip só com entrada correspondente ao valor exato de `technique`; legenda cobre todo valor de `technique` do seed; lista de termos igual à constante) e §3 (`HelpIcon`, `InfoIcon`, `LegendSheet`, `MuscleInfoSheet` já listados: conferir estados)
- [ ] T032 [P] Atualizar `docs/telas.md` (ajuda contextual e regras clarificadas), `docs/prototipo-telas.html` se o protótipo divergir e `docs/backlog.md` (BL-110..116; em BL-043 registrar que o teste "abrir a ajuda com o cronômetro ativo não o pausa nem reinicia" é da spec 011)
- [ ] T033 Auditoria de consistência visual: comparar `LegendSheet`, `MuscleInfoSheet`, `HelpIcon`, `InfoIcon` e a extensão do `TechniqueChip` com `theme.ts` e `docs/design-telas.md` §2–3 e §5.2 (nenhum valor literal de cor/tamanho, alvos ≥ 44 dp, termo destacado sem depender só de cor, folhas modais para leitores de tela) e corrigir qualquer desvio
- [ ] T034 Rodar `npm run check` (lint, tipos e testes) e os passos do `quickstart.md` (incluindo a validação manual em Android e iOS e a revisão dos textos da legenda pelo dono do app); marcar a spec como `concluída` em `specs/INDEX.md`

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → histórias → Polish. Na Phase 2, T003, T004 e T005 são paralelizáveis; T006 depende de T004.
- **US1** depende só da Phase 2 e da tela de treino da 007. **US2** depende da Phase 2 e da tela de treino (não da US1). **US3** depende da `LegendSheet` da US1 (T012) e do `useHelp`; não depende da US2. Entre US2 e US3 os arquivos compartilhados (`ExerciseCard.tsx`, `src/app/workout/index.tsx`, `helpDoesNotChangeSession.test.tsx`, `helpContent.test.ts`) impedem trabalho em paralelo: T019, T023 e T029 editam o mesmo cartão e a mesma tela; T008/T017 e T010/T019 editam os mesmos arquivos de teste.
- T013 (ajuste no hook da 007) precisa estar pronto antes dos testes de rascunho passarem (T010, T019, T026).
- Polish só depois das histórias desejadas; T033 depois de todas as folhas.

### Parallel examples

```text
Phase 2:  T003 T004 T005
US1:      T007 T008 T009 T010   → T012 (paralelo com T011)
US2:      T015 T016 T017 T018 T019   → T020 T022 (T021 depois de T020)
US3:      T024 T025 T026             → T027 (T028 e T029 em sequência)
Polish:   T030 T031 T032
```

## Implementation Strategy

1. **MVP**: Phases 1–3 (legenda de técnicas sob demanda, sem alterar a sessão) — já cobre RF-21 e RF-22.
2. Incremental: US2 (detalhes do exercício, com o teste de conteúdo do seed) → US3 (atalho por técnica) → Polish (docs, pureza e auditoria visual).
3. Um item só está concluído com lint, tipos e testes passando.
