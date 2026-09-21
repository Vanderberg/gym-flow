# Implementation Plan: Histórico de Sessões

**Branch**: `main` (diretório da spec: `009-historico-sessoes`) | **Date**: 2026-09-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/009-historico-sessoes/spec.md`
**Backlog**: BL-070, BL-071, BL-072, BL-073, BL-074
**Requisitos de produto**: RF-14, RF-15, RF-16
**Depende de**: 002 (`SessionRepository`, transações), 003 (seed), 007 (`parseWeightInput`, `WeightInput`, `computeProgress`, `formatDuration`, componentes comuns)

## Summary

Entregar a aba **Histórico**: lista de sessões finalizadas (mais recentes primeiro, agrupadas por mês, com data, programa,
treino, "N / M realizados" e duração), filtro por programa (só em memória), detalhe da sessão (exercícios com marcação,
peso e prescrição atual da ficha quando existir) e **modo de edição** (EDITAR → Salvar/Cancelar) que grava todas as
alterações de marcação e peso em **uma única transação**, sem nunca mudar programa, treino, data nem a sequência. As regras
ficam em `application/` (`ListHistory`, `GetSessionDetail`, `SaveSessionEdits`) e em funções puras do domínio
(`groupByMonth`, `buildEditChanges`). Duas leituras agregadas novas em `SessionRepository` evitam N+1 na lista de 500
sessões. Decisões em [research.md](research.md); modelo em [data-model.md](data-model.md); contratos em
[contracts/](contracts/).

## Technical Context

**Language/Version**: TypeScript strict (projeto da 001)

**Primary Dependencies**: nenhuma nova (Expo Router, Zustand, RNTL; `FlatList` do React Native)

**Storage**: nenhuma migration nova; leitura de `workout_session`, `workout_session_exercise`, `training_program`, `workout`, `workout_exercise`, `exercise`; escrita só de `workout_session_exercise` (`completed`, `weight`) por `Salvar`; usa o índice `ix_workout_session_program_finished` da 002

**Testing**: Jest; unitários das funções puras; integração dos casos de uso com `better-sqlite3` (listar, detalhar, editar em uma transação, persistência, 500 sessões); RNTL para lista, filtro, detalhe e edição

**Target Platform**: Android e iOS (código compartilhado)

**Project Type**: mobile-app (projeto único)

**Performance Goals**: lista de 500 sessões consultada em < 300 ms sobre SQLite em memória e rolando sem travar (`FlatList` com `getItemLayout` de altura fixa); abrir o detalhe em < 200 ms

**Constraints**: offline; sem regra de negócio nos componentes; sessões finalizadas nunca são apagadas nem têm programa/treino/data alterados (constituição V); "Salvar" é transacional (X); datas locais (X)

**Scale/Scope**: 2 telas (lista e detalhe/edição), 3 casos de uso, 2 leituras novas no repositório, 2 funções puras, 1 store, ~6 componentes

## Constitution Check

| Princípio | Avaliação |
|-----------|-----------|
| I. Offline-first | ✅ SQLite é a fonte de verdade; `historyStore` guarda só o filtro e o rascunho da edição |
| II. Domínio puro e camadas | ✅ `groupByMonth` e `buildEditChanges` puros em `domain/history`; consultas em `data/`; casos de uso em `application/`; telas sem regra |
| III. TypeScript estrito | ✅ Tipos explícitos (`HistoryItem`, `SessionDetail`, `EditChanges`); sem `any` |
| IV. Registro livre e finalização flexível | ✅ Editar marcação e peso sem ordem; só realizado/não realizado e carga (nula ou ≥ 0); sem repetições realizadas |
| V. Histórico preservado | ✅ Sessões nunca apagadas; `Salvar` altera só `completed` e `weight`; programa, treino e data permanecem; sem exclusão nesta spec |
| VI. Programa e sequência independentes | ✅ Editar não toca `program_sequence_state` nem `app_settings`; nenhuma regra por nome de programa |
| VII. Prescrição como dado | ✅ Prescrição e técnica exibidas como texto da ficha atual, sem interpretar; a sessão não guarda cópia |
| VIII. Sem recomendações | ✅ Só registro; sem sugestão de carga |
| IX. Estatísticas | ✅ Não se aplica (a lista não calcula frequência nem cadência); editar não altera sessões finalizadas contadas, só marcações |
| X. Transações e datas locais | ✅ `SaveSessionEdits` em uma transação; datas exibidas pela data local do fim da sessão (`localDateOf(finished_at)`) |
| XI. Testes por camada | ✅ Unitários, integração (criar/finalizar/editar/persistir, BL-104 estendido) e RNTL (listar, filtrar, editar, cancelar) |
| XII. Simplicidade | ✅ Sem dependência nova; sem exclusão, busca nem paginação além da lista virtualizada |

Sem violações ⇒ Complexity Tracking vazio. Reavaliação pós-design: **sem mudanças, continua passando**.

## Project Structure

### Documentation (this feature)

```text
specs/009-historico-sessoes/
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
├── domain/history/
│   ├── types.ts                    # HistoryItem, SessionDetail, DetailRow, EditChanges
│   ├── groupByMonth.ts             # groupByMonth(items) → seções "SETEMBRO 2026" (data local)
│   └── editChanges.ts              # buildEditChanges(original, draft) → mudanças; hasChanges(changes)
├── domain/session/
│   └── SessionRepository.ts        # (002) + listFinishedSummaries, getFinishedDetail (novas leituras agregadas)
├── data/repositories/
│   └── SqliteSessionRepository.ts  # (002) implementa as duas leituras com JOIN e agregação
├── application/
│   ├── ListHistory.ts              # lista com contagens, duração e programa (filtro opcional)
│   ├── GetSessionDetail.ts         # detalhe: sessão + linhas + prescrição atual da ficha quando existir
│   └── SaveSessionEdits.ts         # uma transação: marcações e pesos alterados; recusa sessão não finalizada
├── store/
│   └── historyStore.ts             # filtro por programa (memória) e rascunho da edição
├── hooks/
│   ├── useHistoryList.ts           # carrega a lista, filtro, recarrega ao focar a aba
│   └── useSessionEdit.ts           # entrar/sair da edição, alternar linha, editar peso, salvar/cancelar
├── utils/
│   └── monthLabel.ts               # monthLabel('2026-09') → "SETEMBRO 2026"
├── app/
│   ├── (tabs)/history.tsx          # lista (FlatList), filtro, estados
│   └── history/
│       └── [sessionId].tsx         # detalhe e edição (empilhada, sem abas)
└── components/
    ├── common/                     # FilterSelect (design §3, novo aqui), Button, Sheet, ConfirmDialog, EmptyState, ProgramBadge, WeightInput (007)
    └── history/
        ├── SessionListItem.tsx     # item de 72 dp: data, programa, treino, "N / M", duração
        ├── MonthHeader.tsx         # "SETEMBRO 2026"
        ├── SessionDetailRow.tsx    # ✓/○, nome, prescrição, peso ou "sem carga"/"não realizado"; modo editável
        └── EditActionBar.tsx       # EDITAR / Salvar / Cancelar
tests/
├── unit/domain/history/            # groupByMonth, editChanges
├── unit/utils/                     # monthLabel
├── integration/data/               # sessionHistoryQueries (listFinishedSummaries, getFinishedDetail)
├── integration/application/        # listHistory, getSessionDetail, saveSessionEdits, historyPreservation
└── ui/history/                     # historyList, historyFilter, sessionDetail, sessionEdit (RNTL)
```

**Structure Decision**: mesma raiz Expo; rota `(tabs)/history` e detalhe empilhado `history/[sessionId]` conforme
`docs/design-telas.md` §9. As leituras agregadas ficam na porta `SessionRepository` (domínio) e no adaptador SQLite (data),
como o resto dos repositórios da 002.

## Direção visual (continuidade)

Direção existente: **"Placar de academia"** (`docs/design-telas.md` §1–3, §6). Esta spec reutiliza os tokens de
`src/constants/theme.ts` e os componentes comuns (`Button`, `Sheet`, `ConfirmDialog`, `EmptyState`, `ProgramBadge`,
`WeightInput`, `SegmentedProgress` quando útil), sem nova direção.

- **Componente do design criado aqui**: `FilterSelect` (§3: botão "Todos ▼" que abre `Sheet` com Todos + programas), reutilizado
  pela spec 010; nasce em `components/common/` exatamente como especificado.
- **Extensões deliberadas e visíveis**: `SessionListItem`, `MonthHeader`, `SessionDetailRow` e `EditActionBar` (composições
  da tela previstas em §6, não listadas em §3). Adicioná-las a §3.
- **Estados cobertos**: carregando (4 esqueletos), erro (mensagem + "Tentar de novo"), vazio ("Ainda não existem treinos
  registrados." + "Ir para o treino"), vazio com filtro ("Nenhum treino deste programa." + "Limpar filtro"), edição com
  alterações pendentes (Cancelar confirma), peso inválido ("Informe um valor maior ou igual a 0" bloqueia Salvar), nome
  longo em até 2 linhas, item inteiro como botão de altura mínima 72 dp; feito/não realizado nunca só por cor (✓/○ e texto).
- **Auditoria de consistência**: tarefa final compara as telas com tokens e componentes.

## Divergências de documentação a corrigir no mesmo trabalho

`docs/design-telas.md` §6 e `docs/telas.md` devem registrar as regras clarificadas (edição em lote com Salvar/Cancelar em
uma transação; prescrição atual da ficha só quando o exercício ainda está no treino; filtro só em memória; itens com
"N / M" e duração) e `docs/arquitetura.md` a nova leitura agregada. Tarefa dedicada em `tasks.md`.

## Complexity Tracking

Sem violações.
