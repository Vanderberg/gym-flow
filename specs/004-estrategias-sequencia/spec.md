# Feature Specification: Estratégias de Sequência

**Feature Branch**: `004-estrategias-sequencia`
**Created**: 2026-09-19
**Status**: Draft
**Backlog**: BL-030, BL-031, BL-032, BL-034, BL-035, BL-100, BL-101 (Sprint 3)
**Depende de**: 002
**Input**: User description: "Definir qual é o próximo treino conforme o tipo de sequência (contínua ou semanal) para o programa ativo."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sequência contínua (Priority: P1)

Como usuário, quero que o próximo treino avance somente quando eu finalizar um treino, independente de calendário, para não perder a ordem se faltar dias.

**Why this priority**: Modo padrão de uso.

**Independent Test**: Simular finalizações sucessivas e conferir o próximo treino a cada passo.

**Acceptance Scenarios**:

1. **Given** primeiro treino do programa, **When** finalizo, **Then** o próximo é o segundo.
2. **Given** posição no meio, **When** passam vários dias sem treinar, **Then** o próximo continua o mesmo.
3. **Given** último treino, **When** finalizo, **Then** o próximo volta ao primeiro.
4. **Given** sessão descartada ou em andamento, **When** consulto, **Then** a posição não muda.

---

### User Story 2 - Sequência semanal (Priority: P1)

Como usuário, quero que o treino do dia seja definido pela agenda semanal do programa, para seguir "cada dia da semana tem um treino".

**Why this priority**: Necessária ao Treino Monstro na forma semanal.

**Independent Test**: Para cada dia da semana da agenda, conferir o resultado (treino, descanso, opcional).

**Acceptance Scenarios**:

1. **Given** dia com treino na agenda, **When** consulto, **Then** recebo esse treino.
2. **Given** dia de descanso, **When** consulto, **Then** recebo "sem treino".
3. **Given** sábado opcional com texto, **When** consulto, **Then** recebo "sem treino" com o texto do dia.
4. **Given** virada de semana (domingo → segunda), **When** consulto, **Then** o resultado segue a agenda do novo dia local.
5. **Given** programa sem agenda no modo semanal, **When** consulto, **Then** recebo "sem agenda configurada" (não um erro).

---

### User Story 3 - Reiniciar sequência contínua (Priority: P1)

Como usuário, quero reiniciar a sequência de um programa para o primeiro treino, sem perder histórico.

**Why this priority**: Recomeço de ciclo é comum.

**Independent Test**: Avançar, reiniciar, conferir posição e histórico intactos.

**Acceptance Scenarios**:

1. **Given** posição no meio, **When** reinicio, **Then** o próximo é o primeiro e o histórico permanece.
2. **Given** modo semanal, **When** procuro reiniciar, **Then** a opção não existe.
3. **Given** dois programas, **When** reinicio um, **Then** o outro não muda.

### Edge Cases

- Troca de programa e depois retorno: cada programa retoma sua própria posição.
- Troca de tipo de sequência não altera posições nem sessões.
- Fuso/horário: usar sempre a data local, sem deslocar o dia.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST resolver o próximo treino a partir de programa ativo + tipo de sequência, sem lógica por nome de programa.
- **FR-002**: Na contínua, a posição MUST avançar somente ao finalizar sessão e ser mantida por programa.
- **FR-003**: Na semanal, o resultado MUST vir da agenda do programa para o dia da semana local.
- **FR-004**: O sistema MUST expor o motivo quando não há treino (descanso, dia opcional com texto, sem agenda).
- **FR-005**: Reiniciar MUST existir apenas na contínua, voltar ao primeiro treino e nunca apagar histórico.
- **FR-006**: Qualquer programa MUST poder usar qualquer tipo de sequência.

### Key Entities

- **Estado de sequência**, **Agenda semanal**, **Resultado do próximo treino** (treino, ou ausência com motivo/nota).

## Success Criteria *(mandatory)*

- **SC-001**: Todos os casos de BL-100 e BL-101 (primeiro, meio, último→primeiro, reinício; treino, descanso, sábado opcional, domingo, virada de semana) passam em testes automatizados.
- **SC-002**: 0 casos em que a posição avança sem finalização.
- **SC-003**: Adicionar um novo tipo de sequência não exige alterar as existentes.

## Assumptions

- Comportamento do modo semanal em programa sem agenda será decidido na clarificação (padrão assumido: mensagem "sem agenda" na Home).
- Semana considerada de segunda a domingo, dia local.
