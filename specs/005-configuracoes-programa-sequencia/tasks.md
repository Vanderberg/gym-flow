---
description: "Task list for Configurações de Programa e Sequência"
---

# Tasks: Configurações de Programa e Sequência

**Input**: `specs/005-configuracoes-programa-sequencia/` (plan.md, spec.md, research.md, data-model.md, contracts/use-cases.md, contracts/ui.md, quickstart.md)
**Backlog**: BL-033 (exibição da agenda), BL-040, BL-041, BL-042 (só exibição), BL-034 (tela de reiniciar), BL-102, BL-103
**Requisitos de produto**: RF-02, RF-03, RF-13, RF-14
**Depende de**: specs 001–004 concluídas (repositórios, seed, `ResetSequence`, `GetNextWorkout`)
**Tests**: incluídos — a constituição (XI) exige testes de persistência e de fluxos de UI. Escreva cada teste antes da implementação e veja-o falhar.
**Design**: tokens e componentes de `docs/design-telas.md` §2–3 ("Placar de academia"). Nenhuma tela usa cor, tamanho ou espaçamento literal.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1 (escolher programa ativo), US2 (escolher tipo de sequência), US3 (ver agenda e reiniciar)
- Cada fase lista os BL/RF que cobre; todo commit referencia o BL da tarefa (ex.: `feat(005): BL-040 ...`).

---

## Phase 1: Setup

- [X] T001 Verificar que as specs 001–004 estão concluídas: `npm run check` passa e `specs/INDEX.md` marca `001` a `004` como `concluída`; se não, parar e avisar
- [X] T002 [P] Criar as pastas com `.gitkeep` onde ainda não existirem: `src/app/settings/`, `src/components/common/`, `src/components/settings/`, `src/hooks/`, `src/store/`, `tests/ui/settings/`, `tests/ui/common/`, `tests/unit/store/`, `tests/unit/domain/sequence/`, `tests/integration/application/`

---

## Phase 2: Foundational (bloqueia todas as histórias) — BL-033

**Purpose**: tokens de design, componentes comuns, visão da agenda (usada por US2 e US3), store, hook e esqueleto da aba

- [X] T003 [P] Criar (se ainda não existir; senão só conferir) `src/constants/theme.ts` exportando os tokens de `docs/design-telas.md` §2 com os valores exatos: cores (`bg`, `surface`, `surfaceRaised`, `border`, `text`, `textSecondary`, `textMuted`, `accent`, `onAccent`, `danger`, `focus`), tipografia, espaçamento, raios `md`/`lg` e movimento
- [X] T004 [P] Escrever `tests/ui/common/RadioCard.test.tsx` (RNTL): renderiza título e descrição; `onPress` dispara; selecionado expõe `accessibilityState.selected = true`; desabilitado não dispara e mostra o motivo quando informado (o componente é criado na tarefa seguinte)
- [X] T005 [P] Criar (se ainda não existirem) em `src/components/common/` os componentes usados por esta spec, conforme `docs/design-telas.md` §3 e só com tokens de `theme.ts` (o teste da `RadioCard` da tarefa anterior falha antes e passa aqui): `Button.tsx` (`primary`/`danger`/`ghost`, estados default/pressed/disabled/loading), `RadioCard.tsx` (círculo ●/○ + título + descrição; selecionado = borda `accent` + ● preenchido; `accessibilityRole="radio"` e `accessibilityState.selected`), `Sheet.tsx` (sheet inferior, raio `lg`), `ConfirmDialog.tsx` (ação destrutiva nunca é a primária padrão), `EmptyState.tsx` (ícone, título, frase, ação opcional)
- [X] T006 [P] Criar `src/components/settings/SettingsRow.tsx`: linha de 56 dp, rótulo à esquerda, valor atual + `›` à direita, `accessibilityRole="button"`, alvo ≥ 48 dp; variante sem `›` e sem `onPress` para linhas somente leitura (extensão explícita do plano)
- [X] T007 [P] Criar `src/store/settingsStore.ts` (Zustand): estado `SettingsState` de `data-model.md` (`settings`, `inProgress`), ação `reload()` que lê `SettingsRepository.get()` e `SessionRepository.getInProgress()` do SQLite; o store não grava nada e não é fonte de verdade
- [X] T008 Escrever `tests/unit/store/settingsStore.test.ts` (repositórios falsos): `reload()` popula `settings` e `inProgress`; sem sessão em andamento → `inProgress = null`; nova chamada reflete mudança no repositório — e ajustar T007 até passar
- [X] T009 [P] Escrever `tests/unit/domain/sequence/agendaView.test.ts`: agenda vazia → `NO_SCHEDULE`; Treino Monstro (seg A, ter B, qua descanso, qui C, sex D, sáb e dom opcionais com nota) → 7 dias SEG→DOM na ordem correta; opcional devolve `note` como está; dia sem linha em agenda existente → `REST`; `workoutId` nulo e não opcional → `REST`; treino ausente/inativo em `workouts` → `REST`; sempre 7 itens
- [X] T010 [P] Escrever `tests/integration/application/getProgramAgenda.test.ts` (seed): Treino Monstro devolve `DAYS` com 7 itens conforme a agenda do seed; Treino Padrão devolve `NO_SCHEDULE`; não escreve em nenhuma tabela
- [X] T011 Implementar `src/domain/sequence/agendaView.ts` (`buildAgendaView(schedule, workouts): AgendaView`, puro, tipos de `data-model.md`; exportar também os tipos em `src/domain/sequence/types.ts`) — faz T009 passar
- [X] T012 Implementar `src/application/GetProgramAgenda.ts` (`execute(programId): Promise<AgendaView>`, lê `ScheduleRepository.getSchedule` e `ProgramRepository.listWorkouts` e chama `buildAgendaView`) — faz T010 passar
- [X] T013 Criar `src/hooks/useSettings.ts` expondo `settings`, `inProgress`, `reload()`, `selectProgram(id)`, `selectSequenceStrategy(type)`, `resetSequence()` e `discardInProgress()`; delega aos casos de uso (T018, T024 e `ResetSequence` da 004) e a `DiscardInProgressSession` (criar em `src/application/DiscardInProgressSession.ts` conforme `specs/006-home-proximo-treino/contracts/use-cases.md`: `getInProgress()` → `discardSession(id)`; sem sessão = no-op; reaproveitado pela Home da 006) e chama `reload()` após cada escrita; nenhuma regra de negócio no hook
- [X] T014 Criar o esqueleto de `src/app/(tabs)/settings.tsx` (aba "Config", ícone e rótulo conforme `BottomTabs` do design) com título "CONFIGURAÇÕES" e as linhas ainda sem ação: Programa de treino, Tipo de sequência; a linha "Agenda semanal" (sempre visível) entra com a tela da agenda e "Reiniciar sequência" (só `CONTINUOUS`) na US3

**Checkpoint**: testes da `RadioCard`, do store e da agenda passam; a aba abre sem erro; `npm run check` verde.

---

## Phase 3: User Story 1 — Escolher programa ativo (P1) 🎯 MVP (BL-040, BL-102 · RF-02, RF-14)

**Goal**: alternar entre os programas com persistência, histórico e posições preservados, e bloqueio com sessão em andamento.
**Independent Test**: trocar de programa e voltar; sessões e posições idênticas; com sessão em andamento a troca é bloqueada (quickstart, itens 2–3).

### Tests

- [X] T015 [P] [US1] Escrever `tests/integration/application/selectProgram.test.ts` (`createTestDb()` + seed): troca Padrão → Monstro grava só `active_program_id` e persiste em nova conexão ao mesmo banco; `workout_session`, `workout_session_exercise` e `program_sequence_state` idênticos antes e depois (SC-002); voltar ao Padrão retoma a própria posição; com sessão em andamento e alvo ≠ ativo lança `SessionInProgressError` (com `sessionId`, `programId`, `workoutName`) e nada muda; escolher o programa já ativo com sessão em andamento é no-op; programa inexistente ou inativo lança erro da 002; após `discardSession` a troca funciona e a sequência e as sessões finalizadas continuam intactas
- [X] T016 [P] [US1] Escrever `tests/ui/settings/program.test.tsx` (RNTL, casos de uso e router simulados): lista os programas ativos com o selecionado marcado; tocar em outro chama `selectProgram` e o selecionado muda (2 toques a partir de Configurações); aviso "Trocar de programa não apaga seu histórico." visível; com `SessionInProgressError` abre o sheet de bloqueio e a seleção não muda; "Continuar" chama `router.push('/workout')`; "Descartar" pede confirmação, cancelar não escreve nada, confirmar chama `discardInProgress` e a tela permanece para nova escolha; abrir e fechar o sheet não altera nada

### Implementation

- [X] T017 [US1] Implementar `SessionInProgressError` em `src/application/errors.ts` (campos `sessionId`, `programId`, `workoutName`, como em `data-model.md`)
- [X] T018 [US1] Implementar `src/application/SelectProgram.ts` conforme `contracts/use-cases.md`: valida o programa (ativo e existente), no-op se já for o ativo, consulta `SessionRepository.getInProgress()` e lança `SessionInProgressError` se alvo ≠ ativo, senão `SettingsRepository.save` só com `activeProgramId`; sem `if` por nome de programa e sem escrita em sessões ou posições — faz T015 passar
- [X] T019 [P] [US1] Criar `src/components/settings/InProgressBlockSheet.tsx` sobre `Sheet` e `ConfirmDialog`: texto "Há um treino em andamento. Continue ou descarte para trocar de programa."; botões **Continuar** e **Descartar** (confirmação "Descartar o treino em andamento? Isso não altera sua sequência nem suas estatísticas."; **Descartar** nunca é o botão primário); recebe callbacks, sem regra de negócio
- [X] T020 [US1] Criar `src/app/settings/program.tsx`: RadioCards de `listPrograms()` (nome + descrição informativa que não vincula sequência), aviso fixo de histórico, seleção por toque via `useSettings().selectProgram`, captura de `SessionInProgressError` abrindo `InProgressBlockSheet`; ligar a linha "Programa de treino" de `settings.tsx` (valor = nome do programa ativo) — faz T016 passar

**Checkpoint**: US1 testável sozinha (não depende de US2/US3).

---

## Phase 4: User Story 2 — Escolher tipo de sequência (P1) (BL-041, BL-103 · RF-03, RF-14)

**Goal**: alternar entre contínua e dias da semana, independente do programa, sem alterar nada além da configuração.
**Independent Test**: alternar o tipo e conferir histórico e posições intactos, inclusive com sessão em andamento (quickstart, itens 2–3).

### Tests

- [X] T021 [P] [US2] Escrever `tests/integration/application/selectSequenceStrategy.test.ts`: `CONTINUOUS` → `WEEKLY` grava só `sequence_type` e persiste em nova conexão; `workout_session*` e `program_sequence_state` idênticos (SC-002, BL-103); permitido com sessão em andamento, que continua legível e intacta; `WEEKLY` em programa sem agenda (Treino Padrão) é aceito e `GetNextWorkout` (004) devolve `NONE/NO_SCHEDULE`; tipo inválido lança `ValidationError`; nenhuma sessão é criada
- [X] T022 [P] [US2] Escrever `tests/integration/application/settingsPreservation.test.ts` (teste de propriedade, BL-102 + BL-103 combinados): sequência aleatória fixa (semente) de 20 trocas de programa e de tipo, com uma sessão finalizada e uma posição avançada por programa antes; ao final, contagens e conteúdo de `workout_session`, `workout_session_exercise` e `program_sequence_state` idênticos ao início
- [X] T023 [P] [US2] Escrever `tests/ui/settings/sequence.test.tsx` (RNTL): dois RadioCards (Sequência contínua / Dias da semana) com o texto explicativo do design; tocar em "Dias da semana" chama `selectSequenceStrategy('WEEKLY')` e marca a opção (2 toques); permitido com sessão em andamento (sem sheet); em `WEEKLY` num programa sem agenda a escolha é aceita e a tela mostra a orientação "Este programa não tem agenda semanal" com atalho "Voltar para sequência contínua" que chama `selectSequenceStrategy('CONTINUOUS')`

### Implementation

- [X] T024 [US2] Implementar `src/application/SelectSequenceStrategy.ts` conforme `contracts/use-cases.md`: valida `SequenceType`, `SettingsRepository.save` só com `sequenceType`; sem leitura de sessões e sem escrita em posições — faz T021 e T022 passarem
- [X] T025 [US2] Criar `src/app/settings/sequence.tsx`: RadioCards com os textos de `docs/design-telas.md` §8.2, seleção por toque via `useSettings().selectSequenceStrategy`, orientação com atalho quando `WEEKLY` e o programa ativo não tem agenda (usa `GetProgramAgenda`, T026); ligar a linha "Tipo de sequência" de `settings.tsx` (valor = "Sequência contínua" ou "Dias da semana") — faz T023 passar

**Checkpoint**: US1 e US2 funcionam de forma independente.

---

## Phase 5: User Story 3 — Ver agenda semanal e reiniciar (P2) (BL-033, BL-042, BL-034 · RF-13, RF-14)

**Goal**: ver a agenda do programa ativo (somente leitura) e reiniciar a sequência contínua com confirmação.
**Independent Test**: abrir a agenda do Monstro, ver o estado vazio no Padrão e reiniciar a contínua com confirmação (quickstart, itens 3–4).

### Tests

- [X] T026 [P] [US3] Escrever `tests/ui/settings/schedule.test.tsx` (RNTL): Monstro mostra "AGENDA · TREINO MONSTRO" e 7 linhas SEG→DOM sem `›` e sem ação de toque, dia opcional exibe o texto da nota; Padrão mostra, em qualquer tipo de sequência, o `EmptyState` "Este programa não tem agenda semanal" sem lista de dias; nenhuma edição é possível
- [X] T027 [P] [US3] Escrever `tests/ui/settings/resetSequence.test.tsx` (RNTL): linha "Reiniciar sequência" aparece só com `CONTINUOUS` e some com `WEEKLY`; tocar abre a confirmação citando o nome do programa ativo ("Reiniciar a sequência do <PROGRAMA>? O próximo treino volta ao primeiro. Seu histórico não é apagado."); **Cancelar** não chama `resetSequence`; **Reiniciar** chama `ResetSequence` com o id do programa ativo e fecha o diálogo
- [X] T028 [P] [US3] Escrever `tests/integration/application/resetSequenceFromSettings.test.ts`: reiniciar o programa ativo volta a posição a 1, o outro programa não muda, `workout_session*` idênticos e sessão em andamento mantida; em `WEEKLY` a chamada lança `ValidationError` e nada muda

### Implementation

- [X] T029 [US3] Criar `src/app/settings/schedule.tsx`: título "AGENDA · <PROGRAMA ATIVO EM CAIXA ALTA>", 7 linhas `SettingsRow` somente leitura (dia + Treino X / Descanso / texto do dia opcional), `EmptyState` quando `NO_SCHEDULE`; ligar a linha "Agenda semanal" de `settings.tsx`, visível em qualquer tipo de sequência — faz T026 passar
- [X] T030 [US3] Em `src/app/(tabs)/settings.tsx` adicionar a linha "Reiniciar sequência" (só com `CONTINUOUS`) que abre `ConfirmDialog` com o texto do contrato de UI e, ao confirmar, chama `useSettings().resetSequence()` (→ `ResetSequence.execute(activeProgramId)` da 004); sem lógica de reinício no componente — faz T027 e T028 passarem

**Checkpoint**: todas as histórias independentes.

---

## Phase 6: Polish & cross-cutting

- [X] T031 [P] Atualizar `docs/design-telas.md`: §8.2 (escolher `WEEKLY` sem agenda não leva à agenda; mostra a orientação com atalho para a contínua), §8 (linha "Agenda semanal" visível em qualquer tipo de sequência) e §8.3 (agenda somente leitura, sem sheet de edição e sem `›`; estado vazio), §8.1 (bloqueio com sessão em andamento: sheet Continuar/Descartar em vez de seleção desabilitada), §12 itens 3–5 (marcar como decididos) e §3 (adicionar `SettingsRow`)
- [X] T032 [P] Atualizar `docs/telas.md` §6 (agenda somente leitura) e `docs/backlog.md` (BL-042: nesta etapa só exibição; edição da agenda como item futuro) e `docs/prototipo-telas.html` se o protótipo mostrar edição da agenda
- [X] T033 [P] Escrever `tests/ui/settings/settings.test.tsx` (RNTL) do fluxo completo da aba: Programa/Tipo mostram os valores atuais; a linha Agenda aparece nos dois tipos de sequência; `WEEKLY` esconde Reiniciar e `CONTINUOUS` o mostra; a escolha persiste após desmontar e montar de novo a tela (SC-003); nenhuma tela cria sessão
- [X] T034 Auditoria de consistência visual: comparar `settings.tsx`, `program.tsx`, `sequence.tsx`, `schedule.tsx` e os componentes novos com `theme.ts` e `docs/design-telas.md` §2–3 (nenhum valor literal de cor/tamanho, alvos ≥ 48 dp, estado selecionado não depende só de cor, labels de acessibilidade) e corrigir qualquer desvio
- [X] T035 Rodar `npm run check` (lint, tipos e testes) e os passos do `quickstart.md` (incluindo a validação manual em Android e iOS); marcar a spec como `concluída` em `specs/INDEX.md`

---

## Dependencies & Execution Order

- Phase 1 → Phase 2 → histórias. Na Phase 2, T004, T006, T007, T009 e T010 são paralelizáveis; T008 depende de T007; T011 e T012 dependem dos testes T009 e T010; T013 (hook) depende dos casos de uso (T018, T024 e `ResetSequence` da 004): criar o hook com as ações e ligar cada uma quando o caso de uso da história existir; T014 depende dos tokens e componentes.
- **US1**, **US2** e **US3** dependem só da Phase 2 e não dependem entre si (`GetProgramAgenda` está na Phase 2). `DiscardInProgressSession` é criado em T013 e reutilizado pela Home (spec 006).
- `settings.tsx` é editado por T014, T020, T025, T029 e T030: fazer em sequência, não em paralelo.
- Polish só depois das histórias desejadas. T034 depois de todas as telas.

### Parallel examples

```text
Phase 2:  T004 T006 T007 T009 T010
US1:      T015 T016 T019
US2:      T021 T022 T023
US3:      T026 T027 T028
Polish:   T031 T032 T033
```

## Implementation Strategy

1. **MVP**: Phases 1–3 (trocar programa com bloqueio de sessão em andamento).
2. Incremental: US2 (tipo de sequência) → US3 (agenda e reiniciar) → Polish (docs e auditoria visual).
3. Um item só está concluído com lint, tipos e testes passando.
