# Feature Specification: Ajuda Contextual

**Feature Branch**: `008-ajuda-contextual`
**Created**: 2026-09-19
**Status**: Draft
**Backlog**: BL-110 (exibição), BL-111, BL-112, BL-113, BL-114, BL-115, BL-116
**Requisitos de produto**: RF-21, RF-22, RF-23, RF-24, RF-25, RF-26
**Depende de**: 003, 007
**Input**: User description: "Legenda de técnicas (?) e detalhes do exercício (ⓘ) sob demanda, sem sair da sessão."

## Clarifications

### Session 2026-09-21

- Q: Abrir a ajuda com peso digitado e ainda não salvo? → A: Abrir a ajuda não grava nada: o valor digitado permanece como rascunho no campo e é salvo depois pelas regras normais da 007 (perda de foco fora da ajuda, FEITO ou finalizar).
- Q: Como o `?` de uma técnica encontra a explicação dela? → A: Correspondência exata entre o valor de `technique` (constantes do seed) e o título de uma entrada da legenda; sem correspondência, o chip não mostra `?`. Prescrição e observações nunca são lidas para isso.
- Q: A legenda cobre todas as técnicas usadas no seed? → A: Sim, com teste automatizado: todo valor de `technique` usado no seed (Padrão e Monstro) tem uma entrada na legenda; a legenda pode ter entradas extras.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Legenda de técnicas (Priority: P1)

Como usuário, quero abrir uma legenda das técnicas (bi-set, drop-set, pirâmides, falha, excêntrica, concêntrica, progressão de carga) durante o treino.

**Why this priority**: A ficha usa termos que precisam de explicação rápida.

**Independent Test**: Abrir e fechar a legenda em treino em andamento.

**Acceptance Scenarios**:

1. **Given** treino em andamento, **When** toco em `?`, **Then** abre a folha inferior com todas as técnicas e explicações.
2. **Given** folha inferior aberta, **When** fecho, **Then** volto ao treino no mesmo ponto, sem perder dados.
3. **Given** peso digitado e ainda não salvo, **When** abro e fecho a legenda, **Then** nada é gravado e o valor digitado continua no campo (rascunho).

---

### User Story 2 - Detalhes do exercício (Priority: P1)

Como usuário, quero ver músculo principal, secundários e descrição de um exercício.

**Why this priority**: Ajuda a executar corretamente sem sair da tela.

**Independent Test**: Abrir `ⓘ` em qualquer exercício de ambos os programas.

**Acceptance Scenarios**:

1. **Given** qualquer exercício, **When** toco em `ⓘ`, **Then** vejo músculo principal, secundários e descrição.
2. **Given** folha inferior aberta, **When** fecho, **Then** a tela do treino permanece como estava.
3. **Given** peso digitado e ainda não salvo, **When** abro e fecho o `ⓘ`, **Then** nada é gravado e o valor digitado continua no campo (rascunho).

---

### User Story 3 - Ajuda direta por técnica (Priority: P2)

Como usuário, quero um `?` ao lado de uma técnica especial para abrir direto a explicação dela.

**Why this priority**: Atalho; a legenda geral já atende.

**Independent Test**: Tocar `?` ao lado de "drop-set" e ver a explicação correta.

**Acceptance Scenarios**:

1. **Given** exercício com técnica especial, **When** toco no `?` da técnica, **Then** abre a legenda já posicionada na explicação daquela técnica.
2. **Given** exercício cuja técnica não corresponde a nenhuma entrada da legenda, **When** vejo o chip, **Then** o chip não mostra `?` (a legenda geral continua disponível pelo `?` do cabeçalho).

### Edge Cases

- Abrir ajuda com cronômetro ativo não o pausa nem reinicia.
- Exercício sem técnica, ou com técnica sem entrada na legenda, não exibe `?` próprio; o `?` do chip só aparece no cartão expandido (onde o chip existe).
- A correspondência usa só o campo `technique` (exata, sem interpretar prescrição nem observações).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O app MUST oferecer legenda estática das técnicas listadas, acessível por `?`.
- **FR-001a**: Todo valor de `technique` usado no seed MUST ter uma entrada na legenda (título igual ao valor); a legenda MAY ter entradas extras (ex.: pirâmides, excêntrica, concêntrica). Um teste automatizado falha se o seed usar uma técnica sem entrada.
- **FR-002**: O app MUST oferecer detalhes do exercício (músculo principal, secundários, descrição) por `ⓘ`, disponível para todo exercício de todo programa.
- **FR-003**: A ajuda MUST abrir sob demanda e nunca ser exibida permanentemente.
- **FR-004**: Abrir/fechar a ajuda MUST NOT alterar status de exercício, peso, sequência, cronômetro ou sessão (BL-116).
- **FR-004a**: Abrir a ajuda MUST NOT gravar o peso pendente de um campo em edição: o valor permanece como rascunho e é salvo pelas regras da spec 007.
- **FR-004b**: O `?` ao lado do chip de técnica MUST abrir a legenda posicionada na entrada cujo título é igual ao valor de `technique`; sem entrada correspondente, o `?` não é exibido. O app MUST NOT ler prescrição nem observações para isso.
- **FR-005**: O conteúdo da ajuda MUST ser texto informativo, sem recomendações.

### Key Entities

- **Técnica** (conteúdo estático da legenda), **Exercício** (músculos, descrição).

## Success Criteria *(mandatory)*

- **SC-001**: Abrir qualquer ajuda leva 1 toque e não muda de tela de fundo.
- **SC-002**: Teste automatizado comprova que estado da sessão é idêntico antes e depois de abrir/fechar.
- **SC-003**: 100% dos exercícios exibem `ⓘ` preenchido.
- **SC-004**: 100% dos valores de `technique` do seed têm entrada na legenda (verificado por teste).

## Assumptions

- Textos redigidos em pt-BR pelo projeto; revisão de conteúdo pelo dono do app.
- As ajudas são folhas inferiores, conforme `docs/design-telas.md`.
