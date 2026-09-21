# Implementation Plan: Configurações de Programa e Sequência

**Branch**: `main` (diretório da spec: `005-configuracoes-programa-sequencia`) | **Date**: 2026-09-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-configuracoes-programa-sequencia/spec.md`
**Backlog**: BL-033 (exibição da agenda), BL-040, BL-041, BL-042 (só exibição), BL-102, BL-103
**Depende de**: 002 (repositórios, `SettingsRepository`, `SessionRepository`), 003 (seed), 004 (`ResetSequence`, `GetNextWorkout`)

## Summary

Entregar a aba **Configurações** e as telas empilhadas de seleção de programa, seleção de tipo de sequência, agenda
semanal (somente leitura) e reiniciar sequência. As regras ficam em `application/`: `SelectProgram` (bloqueia com
sessão em andamento), `SelectSequenceStrategy` (sem bloqueio) e `GetProgramAgenda` (monta a visão da agenda com a
função pura `buildAgendaView` do domínio). O reinício reutiliza `ResetSequence` da 004, sempre para o programa ativo.
A UI só chama hooks/casos de uso e reflete o resultado; escolhas salvam ao toque (SC-001: 2 toques). Decisões em
[research.md](research.md); modelo em [data-model.md](data-model.md); contratos em [contracts/](contracts/).

## Technical Context

**Language/Version**: TypeScript strict (projeto da 001)

**Primary Dependencies**: nenhuma nova (Expo Router, Zustand e RNTL já fazem parte da stack)

**Storage**: nenhuma migration nova; usa `app_settings`, `program_sequence_state`, `weekly_schedule`, `workout_session`

**Testing**: Jest; unitário de `buildAgendaView`; integração dos casos de uso com `better-sqlite3` (BL-102, BL-103); RNTL para as telas (constituição XI)

**Target Platform**: Android e iOS (código compartilhado)

**Project Type**: mobile-app (projeto único)

**Performance Goals**: abrir Configurações e trocar programa/tipo em < 300 ms percebidos (operações locais simples)

**Constraints**: offline; sem regra de negócio em componentes; nenhuma escolha altera sessões nem posições (SC-002); sem código por nome de programa

**Scale/Scope**: 4 telas (Configurações, programa, tipo de sequência, agenda), 3 casos de uso, 1 função de domínio, 1 hook e 1 store

## Constitution Check

| Princípio | Avaliação |
|-----------|-----------|
| I. Offline-first | ✅ SQLite é a fonte de verdade; o store Zustand só guarda as configurações carregadas e é recarregado após cada escrita |
| II. Domínio puro e camadas | ✅ `buildAgendaView` puro em `domain/sequence`; regras de bloqueio em `application/`; telas só usam hooks |
| III. TypeScript estrito | ✅ Erro tipado `SessionInProgressError`; união discriminada para linhas da agenda |
| IV. Registro livre e sessão persistida | ✅ Descartar usa `SessionRepository.discardSession` (não altera sequência nem estatísticas); nenhuma sessão é criada por configurar |
| V. Histórico preservado | ✅ Nenhum caso de uso escreve em `workout_session*`, salvo o descarte explícito e confirmado da sessão em andamento |
| VI. Programa e sequência independentes | ✅ Programa e tipo são casos de uso separados; nenhum `if` por nome de programa; agenda por programa |
| VII. Prescrição como dado | ✅ Não se aplica |
| VIII. Sem recomendações | ✅ Textos de agenda/dia opcional vêm da `weekly_schedule.note`; nenhum texto gerado pelo app |
| IX. Estatísticas | ✅ Não se aplica |
| X. Transações e datas locais | ✅ Cada troca é uma escrita única em `app_settings` (registro `id = 1`); descarte é transacional na 002 |
| XI. Testes por camada | ✅ Unitário (agenda), integração (BL-102/103, bloqueio, persistência) e RNTL (fluxos das telas) |
| XII. Simplicidade | ✅ Sem dependência nova; agenda sem edição (YAGNI) |

Sem violações ⇒ Complexity Tracking vazio. Reavaliação pós-design: **sem mudanças, continua passando**.

## Project Structure

### Documentation (this feature)

```text
specs/005-configuracoes-programa-sequencia/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── use-cases.md
│   └── ui.md
└── tasks.md             # /speckit-tasks (não criado aqui)
```

### Source Code (repository root)

```text
src/
├── domain/sequence/
│   └── agendaView.ts               # buildAgendaView(schedule, workouts) → AgendaView (puro)
├── application/
│   ├── SelectProgram.ts            # bloqueia com sessão em andamento; SessionInProgressError
│   ├── SelectSequenceStrategy.ts   # sem bloqueio; não toca em posições
│   └── GetProgramAgenda.ts         # carrega agenda + treinos e devolve AgendaView
├── store/
│   └── settingsStore.ts            # settings carregadas + sessão em andamento (resumo); reload() após escrita
├── hooks/
│   └── useSettings.ts              # expõe ações e estado para as telas
├── app/
│   ├── (tabs)/settings.tsx         # lista: programa, tipo, agenda (só WEEKLY), reiniciar (só CONTINUOUS)
│   └── settings/
│       ├── program.tsx             # RadioCards de programa
│       ├── sequence.tsx            # RadioCards de tipo
│       └── schedule.tsx            # agenda somente leitura / estado vazio
└── components/
    ├── common/                     # reutilizados de docs/design-telas.md §3 (RadioCard, Sheet, ConfirmDialog, EmptyState, Button, Card)
    └── settings/
        ├── SettingsRow.tsx         # linha 56 dp: rótulo + valor + ›  (extensão explícita, ver "Direção visual")
        └── InProgressBlockSheet.tsx  # Continuar / Descartar, sobre Sheet + ConfirmDialog
tests/
├── unit/domain/sequence/           # agendaView.test.ts
├── integration/application/        # selectProgram, selectSequenceStrategy, getProgramAgenda, settingsPreservation
└── ui/settings/                    # settings, program, sequence, schedule, resetSequence (RNTL)
```

**Structure Decision**: mesma raiz Expo; rotas conforme `docs/design-telas.md` §9 (aba `settings` e telas
empilhadas sem abas). Regras em `domain/` e `application/`, apresentação sem regra de negócio.

## Direção visual (continuidade)

Direção existente: **"Placar de academia"** (tema escuro), com tokens e componentes base já especificados em
`docs/design-telas.md` §2–3. Esta spec **não define nova direção**: reutiliza os tokens de cor, tipografia, espaçamento
e forma (`bg`, `surface`, `surfaceRaised`, `border`, `text`, `textSecondary`, `accent`, `danger`, `focus`) e os
componentes `RadioCard`, `Sheet`/`ConfirmDialog`, `EmptyState`, `Button` (`primary`/`danger`/`ghost`) e `Card`.

- **Estado do código**: ainda não existe `src/` (a fundação 001 não foi implementada), então os tokens não estão em
  código. Regra para as tarefas: os tokens vivem em um único módulo `src/constants/theme.ts` e os componentes comuns
  em `src/components/common/`, criados a partir de `docs/design-telas.md` §2–3 pela primeira spec de UI que for
  implementada; se ainda não existirem quando esta spec começar, a primeira tarefa de UI os cria (não inventar
  valores). Nenhuma tela usa cor ou espaçamento literal.
- **Extensão deliberada e visível**: `SettingsRow` (linha de configuração de 56 dp com rótulo à esquerda e valor + `›`
  à direita, previsto em `docs/design-telas.md` §8, mas ainda não listado em §3). Deve ser adicionado a §3.
- **Estados cobertos**: agenda vazia (`EmptyState`), opção bloqueada por sessão em andamento (sheet com motivo),
  confirmação destrutiva (descartar) e de reinício; carregamento das configurações usa o esqueleto padrão da 001.
- **Auditoria de consistência**: tarefa final compara as telas com os tokens/componentes e corrige desvios.

## Divergências de documentação a corrigir no mesmo trabalho

`docs/design-telas.md` (§8.2, §8.3, §12 itens 3–5) e `docs/telas.md` (§6) descrevem agenda editável e "levar direto à
agenda" ao escolher `WEEKLY` sem agenda; a spec clarificada define agenda somente leitura, estado vazio e atalho para a
contínua. Tarefa dedicada em `tasks.md`.

## Complexity Tracking

Sem violações.
