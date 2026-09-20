# Feature Specification: Configurações de Programa e Sequência

**Feature Branch**: `005-configuracoes-programa-sequencia`
**Created**: 2026-09-19
**Status**: Draft
**Backlog**: BL-033, BL-040, BL-041, BL-042, BL-102, BL-103 (Sprint 3)
**Depende de**: 002, 003, 004
**Input**: User description: "Permitir escolher o programa ativo, o tipo de sequência, ver/configurar a agenda semanal e reiniciar a sequência."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Escolher programa ativo (Priority: P1)

Como usuário, quero alternar entre Treino Padrão e Treino Monstro, para treinar o programa que estou seguindo.

**Why this priority**: Núcleo do conceito de programas.

**Independent Test**: Trocar de programa e voltar; histórico e posições preservados.

**Acceptance Scenarios**:

1. **Given** Treino Padrão ativo, **When** seleciono Treino Monstro, **Then** ele passa a ser o ativo e persiste ao reabrir o app.
2. **Given** sessões antigas, **When** troco de programa, **Then** nenhuma é alterada ou apagada.
3. **Given** troca e retorno, **When** volto ao programa anterior, **Then** ele retoma sua própria posição.
4. **Given** sessão em andamento de outro programa, **When** tento trocar, **Then** o app aplica o comportamento definido (ver Assumptions) sem perder dados.

---

### User Story 2 - Escolher tipo de sequência (Priority: P1)

Como usuário, quero escolher entre contínua e dias da semana, independente do programa.

**Why this priority**: Segunda dimensão do conceito central.

**Independent Test**: Alternar o tipo e conferir que histórico e posições ficam intactos.

**Acceptance Scenarios**:

1. **Given** contínua, **When** escolho semanal, **Then** a escolha persiste e a Home passa a usar a agenda.
2. **Given** troca de tipo, **When** verifico posições e sessões, **Then** nada muda.
3. **Given** semanal em programa sem agenda, **When** escolho, **Then** o app orienta que não há agenda (sem falha).

---

### User Story 3 - Ver e ajustar agenda semanal e reiniciar (Priority: P2)

Como usuário, quero ver a agenda semanal do programa e reiniciar a sequência contínua quando quiser.

**Why this priority**: Complementa; o essencial funciona com a agenda do seed.

**Independent Test**: Abrir a agenda do Monstro e reiniciar a contínua com confirmação.

**Acceptance Scenarios**:

1. **Given** Treino Monstro, **When** abro a agenda, **Then** vejo cada dia da semana com seu treino, descanso ou dia opcional.
2. **Given** sequência contínua, **When** confirmo "Reiniciar", **Then** o próximo volta ao primeiro treino, com histórico preservado.
3. **Given** modo semanal, **When** vejo Configurações, **Then** "Reiniciar" não aparece.

### Edge Cases

- Cancelar a confirmação de reinício não altera nada.
- Trocar programa/sequência não cria sessão.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O usuário MUST poder selecionar o programa ativo e o tipo de sequência, com persistência.
- **FR-002**: Trocar programa ou sequência MUST NOT alterar ou apagar sessões nem estados de sequência.
- **FR-003**: O app MUST exibir a agenda semanal do programa selecionado.
- **FR-004**: O app MUST oferecer "Reiniciar sequência" apenas no modo contínuo, com confirmação.
- **FR-005**: O app MUST tratar troca com sessão em andamento sem perda de dados.
- **FR-006**: Testes MUST cobrir troca de programa e de sequência preservando histórico (BL-102, BL-103).

### Key Entities

- **Configurações** (programa ativo, tipo de sequência), **Agenda semanal**, **Estado de sequência**.

## Success Criteria *(mandatory)*

- **SC-001**: Trocar programa ou sequência leva no máximo 2 toques a partir de Configurações.
- **SC-002**: 100% das sessões e posições permanecem idênticas após qualquer troca.
- **SC-003**: A escolha sobrevive ao fechar e reabrir o app.

## Assumptions

- Troca com sessão em andamento: assumido **impedir a troca e oferecer continuar/descartar** a sessão (confirmar).
- Agenda semanal nesta etapa é **somente leitura**, usando a do seed; edição pelo usuário fica como decisão futura (confirmar; BL-042).
- Escolha do tipo de sequência é global (registro único de configurações).
