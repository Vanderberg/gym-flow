# Feature Specification: Ajuda Contextual

**Feature Branch**: `008-ajuda-contextual`
**Created**: 2026-09-19
**Status**: Draft
**Backlog**: BL-110 (exibição), BL-111, BL-112, BL-113, BL-114, BL-115, BL-116
**Depende de**: 003, 007
**Input**: User description: "Legenda de técnicas (?) e detalhes do exercício (ⓘ) sob demanda, sem sair da sessão."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Legenda de técnicas (Priority: P1)

Como usuário, quero abrir uma legenda das técnicas (bi-set, drop-set, pirâmides, falha, excêntrica, concêntrica, progressão de carga) durante o treino.

**Why this priority**: A ficha usa termos que precisam de explicação rápida.

**Independent Test**: Abrir e fechar a legenda em treino em andamento.

**Acceptance Scenarios**:

1. **Given** treino em andamento, **When** toco em `?`, **Then** abre painel com todas as técnicas e explicações.
2. **Given** painel aberto, **When** fecho, **Then** volto ao treino no mesmo ponto, sem perder dados.

---

### User Story 2 - Detalhes do exercício (Priority: P1)

Como usuário, quero ver músculo principal, secundários e descrição de um exercício.

**Why this priority**: Ajuda a executar corretamente sem sair da tela.

**Independent Test**: Abrir `ⓘ` em qualquer exercício de ambos os programas.

**Acceptance Scenarios**:

1. **Given** qualquer exercício, **When** toco em `ⓘ`, **Then** vejo músculo principal, secundários e descrição.
2. **Given** painel aberto, **When** fecho, **Then** a tela do treino permanece como estava.

---

### User Story 3 - Ajuda direta por técnica (Priority: P2)

Como usuário, quero um `?` ao lado de uma técnica especial para abrir direto a explicação dela.

**Why this priority**: Atalho; a legenda geral já atende.

**Independent Test**: Tocar `?` ao lado de "drop-set" e ver a explicação correta.

**Acceptance Scenarios**:

1. **Given** exercício com técnica especial, **When** toco no `?` da técnica, **Then** abre a explicação daquela técnica.

### Edge Cases

- Abrir ajuda com cronômetro ativo não o pausa nem reinicia.
- Exercício sem técnica não exibe `?` próprio.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O app MUST oferecer legenda estática das técnicas listadas, acessível por `?`.
- **FR-002**: O app MUST oferecer detalhes do exercício (músculo principal, secundários, descrição) por `ⓘ`, disponível para todo exercício de todo programa.
- **FR-003**: A ajuda MUST abrir sob demanda e nunca ser exibida permanentemente.
- **FR-004**: Abrir/fechar a ajuda MUST NOT alterar status de exercício, peso, sequência, cronômetro ou sessão (BL-116).
- **FR-005**: O conteúdo da ajuda MUST ser texto informativo, sem recomendações.

### Key Entities

- **Técnica** (conteúdo estático da legenda), **Exercício** (músculos, descrição).

## Success Criteria *(mandatory)*

- **SC-001**: Abrir qualquer ajuda leva 1 toque e não muda de tela de fundo.
- **SC-002**: Teste automatizado comprova que estado da sessão é idêntico antes e depois de abrir/fechar.
- **SC-003**: 100% dos exercícios exibem `ⓘ` preenchido.

## Assumptions

- Textos redigidos em pt-BR pelo projeto; revisão de conteúdo pelo dono do app.
- Painel do tipo folha inferior, conforme `docs/design-telas.md`.
