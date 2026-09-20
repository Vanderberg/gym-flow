# Feature Specification: Histórico de Sessões

**Feature Branch**: `009-historico-sessoes`
**Created**: 2026-09-19
**Status**: Draft
**Backlog**: BL-070, BL-071, BL-072, BL-073, BL-074 (Sprint 5)
**Depende de**: 007
**Input**: User description: "Listar, detalhar, filtrar por programa e editar sessões finalizadas."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Lista e detalhe (Priority: P1)

Como usuário, quero ver meus treinos passados, com programa e treino identificados, e abrir os detalhes.

**Why this priority**: Consulta básica do que foi feito.

**Independent Test**: Com sessões de dois programas, listar e abrir uma.

**Acceptance Scenarios**:

1. **Given** sessões finalizadas, **When** abro Histórico, **Then** vejo lista da mais recente à mais antiga com data, programa e treino.
2. **Given** uma sessão, **When** abro, **Then** vejo exercícios marcados/não marcados e pesos.
3. **Given** nenhuma sessão, **When** abro Histórico, **Then** vejo estado vazio explicativo.

---

### User Story 2 - Editar sessão (Priority: P1)

Como usuário, quero corrigir marcações e pesos de uma sessão passada.

**Why this priority**: Esquecimentos acontecem; dados devem ser corrigíveis.

**Independent Test**: Editar peso e marcação e reabrir.

**Acceptance Scenarios**:

1. **Given** sessão finalizada, **When** marco/desmarco ou altero peso, **Then** a alteração persiste.
2. **Given** edição, **When** salvo, **Then** programa e treino da sessão não mudam.
3. **Given** peso negativo, **When** tento salvar, **Then** é rejeitado.
4. **Given** edição, **When** conferir sequência, **Then** ela não foi alterada.

---

### User Story 3 - Filtrar por programa (Priority: P2)

Como usuário, quero filtrar o histórico por programa (Todos / cada programa).

**Why this priority**: Conveniência.

**Independent Test**: Alternar filtros e conferir a lista.

**Acceptance Scenarios**:

1. **Given** sessões de dois programas, **When** filtro por um, **Then** só aparecem as dele; "Todos" restaura.

### Edge Cases

- Programa ou exercício alterado depois: a sessão antiga continua legível.
- Datas exibidas no dia local.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O histórico MUST listar apenas sessões finalizadas, ordenadas da mais recente.
- **FR-002**: Cada item MUST identificar data, programa e treino.
- **FR-003**: O detalhe MUST mostrar exercícios, marcações e pesos.
- **FR-004**: O usuário MUST poder marcar/desmarcar e alterar peso; MUST NOT alterar programa ou treino da sessão.
- **FR-005**: O filtro por programa MUST oferecer "Todos" e cada programa.

### Key Entities

- **Sessão**, **Exercício da sessão**, **Programa**.

## Success Criteria *(mandatory)*

- **SC-001**: Encontrar e abrir uma sessão específica em até 3 toques.
- **SC-002**: 100% das edições persistem após reabrir o app.
- **SC-003**: Lista com 500 sessões rola sem travamentos perceptíveis.

## Assumptions

- Excluir sessão não faz parte desta spec.
- Marcar/desmarcar exercícios na edição não muda o status "finalizada".
