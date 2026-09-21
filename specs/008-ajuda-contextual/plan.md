# Implementation Plan: Ajuda Contextual

**Branch**: `main` (diretório da spec: `008-ajuda-contextual`) | **Date**: 2026-09-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/008-ajuda-contextual/spec.md`
**Backlog**: BL-110 (exibição), BL-111, BL-112, BL-113, BL-114, BL-115, BL-116
**Requisitos de produto**: RF-21, RF-22, RF-23, RF-24, RF-25, RF-26
**Depende de**: 003 (seed com `primary_muscle`, `secondary_muscles`, `description` e `technique`), 007 (tela de treino, slots `onHelp`/`onInfo`, `TechniqueChip`, rascunho de peso)

## Summary

Entregar a ajuda contextual da tela de treino: a **legenda de técnicas** (`?`, folha inferior com conteúdo estático), os
**detalhes do exercício** (`ⓘ`, folha inferior com músculo principal, secundários e descrição) e o `?` ao lado do chip de
técnica, que abre a legenda já posicionada na entrada correspondente. Tudo é **somente leitura**: o estado das folhas vive
num `helpStore` de UI, separado do estado da sessão e do rascunho de peso, e nenhum caso de uso de escrita é chamado ao
abrir ou fechar (FR-004, BL-116). O conteúdo da legenda é uma constante do app; os detalhes do exercício vêm do banco
(`ExerciseRepository`). Abrir a ajuda com peso digitado e ainda não salvo mantém o rascunho e não grava nada (FR-004a).
Decisões em [research.md](research.md); modelo em [data-model.md](data-model.md); contratos em [contracts/](contracts/).

## Technical Context

**Language/Version**: TypeScript strict (projeto da 001)

**Primary Dependencies**: nenhuma nova (`Sheet` comum, Expo Router, Zustand, RNTL, ícones do design)

**Storage**: nenhuma migration nova; leitura de `exercise` (e de `workout_exercise.technique` só nos testes de conteúdo)

**Testing**: Jest; unitários das funções puras e do conteúdo da legenda; integração do caso de uso e do conteúdo do seed; RNTL para as folhas e para "abrir/fechar não altera nada" (BL-116)

**Target Platform**: Android e iOS (código compartilhado)

**Project Type**: mobile-app (projeto único)

**Performance Goals**: abrir qualquer folha em < 200 ms percebidos (conteúdo local; `ⓘ` lê um exercício por id)

**Constraints**: offline; sem regra de negócio nos componentes; conteúdo informativo, sem recomendação (constituição VIII); abrir/fechar nunca escreve; a correspondência técnica → legenda usa só o campo `technique` (VII)

**Scale/Scope**: 2 folhas, 1 caso de uso de leitura, 2 funções puras, 1 store, 1 constante de conteúdo, 3 componentes de ícone/atalho

## Constitution Check

| Princípio | Avaliação |
|-----------|-----------|
| I. Offline-first | ✅ Legenda estática no app; detalhes do exercício lidos do SQLite; `helpStore` guarda só estado de UI |
| II. Domínio puro e camadas | ✅ `findLegendEntry` e `buildMuscleInfo` puros em `domain/help`; leitura em `application/GetExerciseInfo`; componentes sem regra |
| III. TypeScript estrito | ✅ `HelpSheetState` como união discriminada; sem `any` |
| IV. Registro livre e sessão persistida | ✅ Nenhuma escrita; sessão em andamento e rascunho de peso intactos ao abrir/fechar |
| V. Histórico preservado | ✅ Somente leitura |
| VI. Programa e sequência independentes | ✅ Nenhuma regra por nome de programa; funciona em qualquer treino |
| VII. Prescrição como dado | ✅ A correspondência usa **só** `technique` (valor padronizado do seed) para localizar conteúdo estático; prescrição e observações nunca são lidas; nenhum comportamento ou layout é derivado da técnica |
| VIII. Sem recomendações | ✅ Conteúdo educativo sob demanda em folha inferior, sem carga, treino ou dieta; `ⓘ` preenchido para todo exercício do seed (teste) |
| IX. Estatísticas | ✅ Não se aplica |
| X. Transações e datas locais | ✅ Não se aplica (sem escrita) |
| XI. Testes por camada | ✅ Unitários (legenda, músculos), integração (conteúdo do seed, leitura) e RNTL (BL-116: estado idêntico antes e depois) |
| XII. Simplicidade | ✅ Sem dependência nova; conteúdo em uma constante; sem pesquisa nem favoritos |

Sem violações ⇒ Complexity Tracking vazio. Reavaliação pós-design: **sem mudanças, continua passando**.

## Project Structure

### Documentation (this feature)

```text
specs/008-ajuda-contextual/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── use-cases.md
│   ├── ui.md
│   └── legend-content.md
└── tasks.md             # /speckit-tasks (não criado aqui)
```

### Source Code (repository root)

```text
src/
├── constants/
│   └── techniqueLegend.ts          # TECHNIQUE_LEGEND: LegendEntry[] (conteúdo estático, pt-BR)
├── domain/help/
│   ├── legend.ts                   # findLegendEntry(technique) → LegendEntry | null (correspondência exata)
│   ├── muscleInfo.ts               # buildMuscleInfo(exercise) → MuscleInfo ("Não informado" só como rede de segurança)
│   └── types.ts                    # LegendEntry, MuscleInfo, HelpSheetState
├── application/
│   └── GetExerciseInfo.ts          # leitura: ExerciseRepository.getById → MuscleInfo (sem escrita)
├── store/
│   └── helpStore.ts                # HelpSheetState (nenhuma / legenda [+ termo] / exercício) e exerciseId para devolver o foco
├── hooks/
│   └── useHelp.ts                  # openLegend(term?), openExercise(id), close(); marca a abertura para não confirmar o rascunho
├── app/
│   └── workout/index.tsx           # (007) liga ? no cabeçalho, ⓘ nos cartões e ? nos chips; monta as duas folhas
└── components/
    ├── common/                     # Sheet (existente) + HelpIcon, InfoIcon (design §3)
    └── help/
        ├── LegendSheet.tsx         # lista rolável de termos; rola até o termo inicial
        └── MuscleInfoSheet.tsx     # músculo principal, secundários, descrição
tests/
├── unit/domain/help/               # legend, muscleInfo
├── unit/constants/                 # techniqueLegend (títulos únicos, textos não vazios, sem recomendação)
├── integration/application/        # getExerciseInfo
├── integration/seed/               # helpContent (SC-003, SC-004: exercícios e técnicas do seed)
└── ui/help/                        # legendSheet, muscleInfoSheet, helpDoesNotChangeSession (BL-116)
```

**Structure Decision**: mesma raiz Expo; a ajuda é sobreposta à tela de treino existente (folhas inferiores, sem nova rota),
conforme `docs/design-telas.md` §5.2. Regras em `domain/` e `application/`.

## Direção visual (continuidade)

Direção existente: **"Placar de academia"** (`docs/design-telas.md` §1–3, §5.2). Esta spec reutiliza os tokens de
`src/constants/theme.ts` e o componente comum `Sheet` (sheet inferior, raio `lg`); não define nova direção.

- **Componentes do design criados aqui** (especificados em §3, ainda não existem): `HelpIcon` (`?`) e `InfoIcon` (`ⓘ`,
  botões de 44 dp com ícone de 20 dp e `accessibilityLabel` "Legenda das técnicas" / "Informações do exercício"), e as
  folhas `LegendSheet` e `MuscleInfoSheet` (§5.2).
- **Extensão de componentes da 007**: `TechniqueChip` ganha um `?` adjacente opcional (`onHelp(technique)`), só renderizado
  quando há entrada na legenda; `ExerciseCard` e o cabeçalho passam os handlers `onInfo`/`onHelp` já previstos pela 007.
- **Estados cobertos**: fecha por toque no fundo, botão **Fechar** ou voltar do Android; estado do cartão (expandido, valor
  digitado) mantido ao fechar; exercício sem informação mostra "Não informado" (rede de segurança para exercícios criados no
  futuro; não ocorre no seed); acessibilidade: a folha recebe foco no título e `accessibilityViewIsModal`.
- **Auditoria de consistência**: tarefa final compara as folhas com tokens e componentes.

## Divergências de documentação a corrigir no mesmo trabalho

`docs/design-telas.md` §5.2 e `docs/telas.md` devem registrar as regras clarificadas (rascunho de peso preservado ao abrir a
ajuda; `?` do chip só com entrada correspondente na legenda; legenda cobre todo valor de `technique` do seed). Tarefa
dedicada em `tasks.md`.

## Complexity Tracking

Sem violações.
