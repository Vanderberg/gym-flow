# Feature Specification: Configurações de Programa e Sequência

**Feature Branch**: `005-configuracoes-programa-sequencia`
**Created**: 2026-09-19
**Status**: Draft
**Backlog**: BL-033, BL-034, BL-040, BL-041, BL-042, BL-102, BL-103 (Sprint 3)
**Requisitos de produto**: RF-02, RF-03, RF-13, RF-14
**Depende de**: 002, 003, 004
**Input**: User description: "Permitir escolher o programa ativo, o tipo de sequência, ver/configurar a agenda semanal e reiniciar a sequência."

## Clarifications

### Session 2026-09-21

- Q: Trocar o programa ativo com sessão em andamento? → A: Bloqueia a troca e oferece Continuar a sessão ou Descartar (descartar e então trocar).
- Q: Trocar o tipo de sequência com sessão em andamento? → A: Permitida sem restrição; a sessão em andamento não é afetada e o novo tipo vale para o próximo treino.
- Q: A agenda semanal é somente leitura ou editável nesta spec? → A: Somente leitura (agenda vinda do seed); edição fica para uma spec futura.
- Q: O que a tela de agenda mostra para programa sem agenda? → A: Estado vazio "Este programa não tem agenda semanal", sem lista de dias.
- Q: "Reiniciar sequência" reinicia qual programa? → A: Só o programa ativo; a confirmação cita o nome do programa.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Escolher programa ativo (Priority: P1)

Como usuário, quero alternar entre Treino Padrão e Treino Monstro, para treinar o programa que estou seguindo.

**Why this priority**: Núcleo do conceito de programas.

**Independent Test**: Trocar de programa e voltar; histórico e posições preservados.

**Acceptance Scenarios**:

1. **Given** Treino Padrão ativo, **When** seleciono Treino Monstro, **Then** ele passa a ser o ativo e persiste ao reabrir o app.
2. **Given** sessões antigas, **When** troco de programa, **Then** nenhuma é alterada ou apagada.
3. **Given** troca e retorno, **When** volto ao programa anterior, **Then** ele retoma sua própria posição.
4. **Given** sessão em andamento de outro programa, **When** tento trocar, **Then** a troca é bloqueada e o app oferece Continuar a sessão ou Descartar; descartar libera a troca e nada é perdido sem confirmação.

---

### User Story 2 - Escolher tipo de sequência (Priority: P1)

Como usuário, quero escolher entre contínua e dias da semana, independente do programa.

**Why this priority**: Segunda dimensão do conceito central.

**Independent Test**: Alternar o tipo e conferir que histórico e posições ficam intactos.

**Acceptance Scenarios**:

1. **Given** contínua, **When** escolho semanal, **Then** a escolha persiste e a Home passa a usar a agenda.
2. **Given** troca de tipo, **When** verifico posições e sessões, **Then** nada muda.
3. **Given** sessão em andamento, **When** troco o tipo de sequência, **Then** a troca é permitida e a sessão em andamento continua intacta.
4. **Given** semanal em programa sem agenda, **When** escolho, **Then** a escolha é permitida e o app orienta que não há agenda, com atalho para voltar à contínua (sem falha; ver spec 004).

---

### User Story 3 - Ver agenda semanal e reiniciar (Priority: P2)

Como usuário, quero ver a agenda semanal do programa (somente leitura) e reiniciar a sequência contínua quando quiser.

**Why this priority**: Complementa; o essencial funciona com a agenda do seed.

**Independent Test**: Abrir a agenda do Monstro e reiniciar a contínua com confirmação.

**Acceptance Scenarios**:

1. **Given** Treino Monstro ativo (em qualquer tipo de sequência), **When** abro a agenda, **Then** vejo cada dia da semana com seu treino, descanso ou dia opcional.
2. **Given** sequência contínua, **When** confirmo "Reiniciar" (a confirmação cita o nome do programa ativo), **Then** o próximo do programa ativo volta ao primeiro treino, com histórico preservado e outros programas intactos.
3. **Given** modo semanal, **When** vejo Configurações, **Then** "Reiniciar" não aparece.
4. **Given** programa ativo sem agenda (ex.: Treino Padrão, em qualquer tipo de sequência), **When** abro a agenda, **Then** vejo o estado vazio "Este programa não tem agenda semanal", sem lista de dias.

### Edge Cases

- Cancelar a confirmação de reinício não altera nada.
- Trocar programa/sequência não cria sessão.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O usuário MUST poder selecionar o programa ativo e o tipo de sequência, com persistência.
- **FR-002**: Trocar programa ou sequência MUST NOT alterar ou apagar sessões finalizadas nem estados de sequência. A única exceção é o descarte explícito e confirmado da sessão em andamento (FR-005).
- **FR-003**: O app MUST exibir a agenda semanal do programa ativo, somente leitura (sem edição nesta spec), acessível em Configurações em qualquer tipo de sequência.
- **FR-004**: O app MUST oferecer "Reiniciar sequência" apenas no modo contínuo, com confirmação, e reiniciar somente o programa ativo.
- **FR-005**: Com sessão em andamento, o app MUST bloquear a troca de programa e oferecer Continuar ou Descartar; descartar libera a troca sem alterar sequência nem estatísticas; depois de descartar, o usuário toca novamente no programa desejado (a troca não é aplicada automaticamente).
- **FR-006**: Testes MUST cobrir troca de programa e de sequência preservando histórico (BL-102, BL-103).

### Key Entities

- **Configurações** (programa ativo, tipo de sequência), **Agenda semanal**, **Estado de sequência**.

## Success Criteria *(mandatory)*

- **SC-001**: Trocar programa ou sequência leva no máximo 2 toques a partir de Configurações.
- **SC-002**: 100% das sessões finalizadas e das posições permanecem idênticas após qualquer troca de programa ou de tipo de sequência.
- **SC-003**: A escolha sobrevive ao fechar e reabrir o app.

## Assumptions

- Agenda semanal nesta etapa é **somente leitura**, usando a do seed; a edição pelo usuário é uma spec futura (BL-042 é atendido aqui só na exibição).
- Escolha do tipo de sequência é global (registro único de configurações).
