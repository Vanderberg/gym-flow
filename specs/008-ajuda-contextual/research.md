# Research: Ajuda Contextual

## D1 — Legenda como constante estática
- **Decision**: `TECHNIQUE_LEGEND` em `src/constants/techniqueLegend.ts`, lista ordenada de `{ title, description }` em pt-BR. O título é o valor canônico em caixa alta (`'BI-SET'`, `'DROP-SET'`, `'FALHA'`, `'PROGRESSÃO DE CARGA'` iguais às constantes `TECHNIQUES` do seed) mais entradas extras do PRD §21 (`'PIRÂMIDE CRESCENTE'`, `'PIRÂMIDE DECRESCENTE'`, `'EXCÊNTRICA'`, `'CONCÊNTRICA'`). Textos em [contracts/legend-content.md](contracts/legend-content.md).
- **Rationale**: FR-001 (conteúdo estático, sem banco); títulos iguais aos valores do seed permitem a correspondência exata do FR-004b.
- **Alternatives**: legenda no banco (complexidade sem ganho; conteúdo não é editável pelo usuário).

## D2 — Correspondência do `?` do chip (clarificação 2)
- **Decision**: `findLegendEntry(technique: string | null)`: correspondência **exata** (`===`) entre o valor de `technique` e o `title` de uma entrada; sem correspondência ou `null` → `null` e o chip não mostra `?`. Nunca lê `prescription` nem `notes`.
- **Rationale**: FR-004b e constituição VII (localiza conteúdo estático por rótulo padronizado; não interpreta texto livre nem deriva comportamento).
- **Alternatives**: correspondência aproximada ou por trecho da prescrição (interpretaria texto livre).

## D3 — Cobertura da legenda pelo seed (clarificação 3)
- **Decision**: teste de integração `helpContent`: para todo `workout_exercise.technique` não nulo após o seed, `findLegendEntry` devolve uma entrada; e para todo `exercise` do seed, `buildMuscleInfo` não usa o fallback ("Não informado") em nenhum campo. Um teste unitário confere títulos únicos e textos não vazios na constante.
- **Rationale**: FR-001a, SC-003, SC-004; seed novo com técnica sem entrada falha cedo.

## D4 — Detalhes do exercício por leitura sob demanda
- **Decision**: `GetExerciseInfo.execute(exerciseId)` lê `ExerciseRepository.getById` e devolve `MuscleInfo` (`name`, `primaryMuscle`, `secondaryMuscles: string[]` separado por vírgula, `description`). Campos ausentes viram "Não informado" (só rede de segurança). Sem escrita.
- **Rationale**: FR-002; evita inflar `WorkoutScreenItem` da 007 e mantém a leitura sob demanda (constituição VIII).
- **Alternatives**: trazer os detalhes junto com `GetWorkoutSession` (leituras desnecessárias em todo carregamento).

## D5 — Estado das folhas fora do estado da sessão
- **Decision**: `helpStore` (Zustand) guarda `HelpSheetState`: `NONE`, `LEGEND { term?: string }` ou `EXERCISE { exerciseId }`. Não compartilha estado com `workoutStore` (rascunhos, expandidos) nem com o cronômetro (spec 011). Abrir e fechar só muda o `helpStore`.
- **Rationale**: FR-004/BL-116: o estado da tela permanece intacto por construção; o cronômetro não é pausado nem reiniciado. O teste comportamental "abrir a ajuda com o cronômetro ativo não o pausa nem reinicia" é entregue pela spec 011; aqui só há o teste estático de que a ajuda não importa módulos de cronômetro.
- **Alternatives**: estado local dos componentes (perde a garantia testável de que nada mais é tocado).

## D6 — Rascunho de peso ao abrir a ajuda (clarificação 1)
- **Decision**: `useHelp` marca no `helpStore` que uma abertura de ajuda está em curso **antes** do campo perder o foco (no `onPressIn` do `?`/`ⓘ`); o handler de perda de foco do `WeightInput` (007, `useWorkoutSession`) consulta essa marca e **não** confirma o valor. O rascunho permanece em `workoutStore.drafts`. Ao fechar a folha, o foco volta ao campo do cartão que estava em edição (`restoreFocus` com o `exerciseId` guardado), de modo que a perda de foco seguinte (fora da ajuda), FEITO ou finalizar salvam pelas regras normais.
- **Robustez de eventos**: a ordem entre a perda de foco do campo e o `onPressIn` do botão não é garantida em React Native. Por isso: (a) a lista da tela de treino usa `keyboardShouldPersistTaps="handled"`, para tocar num botão não dissipar o teclado antes do toque; (b) o commit por perda de foco (spec 007) é adiado por um tick (`setTimeout(0)`) e cancelado se `helpStore.opening` estiver marcado quando o tick vencer; (c) `onPressIn` marca a abertura e `onPressOut`/cancelamento a desmarca (`cancelOpening`) quando nenhuma folha abriu, para a marca nunca ficar presa.
- **Rationale**: FR-004a; não grava nada ao abrir, não perde o que foi digitado e mantém a garantia da 007 de que o valor digitado acaba salvo.
- **Alternatives**: gravar ao abrir (viola FR-004a); descartar o rascunho (perde dado do usuário).

## D7 — Rolar até o termo
- **Decision**: `LegendSheet` recebe `initialTerm?`; ao abrir com termo, rola até a entrada de mesmo `title` (e a destaca com o token de foco do design, sem depender só de cor). Sem termo, abre no topo.
- **Rationale**: US3/BL-115.

## D8 — Pontos de acesso e reserva da 007
- **Decision**: o cabeçalho da tela de treino usa `HelpIcon` (`?`), cada `ExerciseCard` usa `InfoIcon` (`ⓘ`) e o `TechniqueChip` mostra `?` adjacente só com entrada na legenda; todos disparam `useHelp`. Os slots opcionais da 007 (`onHelp`, `onInfo`) passam a receber esses handlers; o ícone `?` do cabeçalho e o `ⓘ` aparecem em todos os exercícios de todos os programas.
- **Rationale**: FR-002/FR-003; a 007 já reserva o espaço sem botões mortos.

## D9 — Fechamento e acessibilidade
- **Decision**: fecha por toque no fundo, botão **Fechar** ou voltar do Android (`BackHandler` do `Sheet` comum); a folha é modal para leitores de tela (`accessibilityViewIsModal`), com o foco no título ao abrir. Não navega: a tela de fundo permanece (SC-001).
- **Rationale**: design §5.2 e acessibilidade.

## D10 — Conteúdo e revisão
- **Decision**: os textos vêm do PRD §21 e do design §5.2, redigidos como definições informativas, sem carga, treino ou dieta; o dono do app revisa o conteúdo (Assumptions). Um teste unitário rejeita verbos de recomendação óbvios ("recomenda", "deve usar", "aumente", "reduza a carga para").
- **Rationale**: FR-005 e constituição VIII.
