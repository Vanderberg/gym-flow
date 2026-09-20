# Feature Specification: Cronômetro de Descanso

**Feature Branch**: `011-cronometro-descanso`
**Created**: 2026-09-19
**Status**: Draft
**Backlog**: BL-043, BL-090, BL-091, BL-092 (Sprint 7) — P1
**Depende de**: 007
**Input**: User description: "Cronômetro opcional de descanso configurável durante o treino."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configurar cronômetro (Priority: P1)

Como usuário, quero ativar/desativar o cronômetro e definir a duração do descanso.

**Why this priority**: Base para usar o cronômetro; opcional no MVP.

**Independent Test**: Alterar configuração e reabrir o app.

**Acceptance Scenarios**:

1. **Given** Configurações, **When** ativo e defino 90 s, **Then** a escolha persiste.
2. **Given** duração inválida (0 ou negativa), **When** salvo, **Then** é rejeitada.

---

### User Story 2 - Usar durante o treino (Priority: P1)

Como usuário, quero iniciar, pausar e encerrar o descanso durante o treino.

**Why this priority**: Entrega o valor do recurso.

**Independent Test**: Iniciar, pausar, retomar e encerrar em um treino.

**Acceptance Scenarios**:

1. **Given** cronômetro ativo e treino em andamento, **When** inicio, **Then** contagem regressiva a partir da duração configurada.
2. **Given** contagem, **When** pauso e retomo, **Then** continua de onde parou.
3. **Given** término ou encerramento, **When** ocorre, **Then** o cronômetro para e o app sinaliza o fim.
4. **Given** cronômetro desativado, **When** vejo o treino, **Then** nenhum controle aparece.

### Edge Cases

- App em segundo plano com contagem: tempo restante correto ao voltar.
- Cronômetro não altera marcações, pesos ou sequência.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O usuário MUST poder ativar/desativar o cronômetro e configurar a duração, com persistência.
- **FR-002**: Durante o treino, o usuário MUST poder iniciar, pausar, retomar e encerrar a contagem.
- **FR-003**: O app MUST sinalizar o fim da contagem.
- **FR-004**: O cronômetro MUST NOT afetar dados da sessão nem a sequência.

### Key Entities

- **Configurações** (cronômetro ativo, duração).

## Success Criteria *(mandatory)*

- **SC-001**: Iniciar o descanso leva 1 toque.
- **SC-002**: Erro de contagem inferior a 1 segundo após 5 minutos, inclusive com app em segundo plano.

## Assumptions

- Sinalização do fim: vibração/aviso visual, sem exigir permissões extras (detalhar no plano).
- Duração única global, sem valor por exercício.
