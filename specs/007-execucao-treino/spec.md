# Feature Specification: Execução do Treino

**Feature Branch**: `007-execucao-treino`
**Created**: 2026-09-19
**Status**: Draft
**Backlog**: BL-060..BL-067, BL-121, BL-104 (Sprint 4 / 7)
**Depende de**: 002, 003, 006
**Input**: User description: "Tela de treino: marcar exercícios em qualquer ordem, registrar peso, ver última carga e prescrição, finalizar (mesmo incompleto) e recuperar sessão."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Marcar exercícios e finalizar (Priority: P1)

Como usuário, quero marcar exercícios em qualquer ordem e finalizar o treino, mesmo incompleto.

**Why this priority**: É o ato central do app.

**Independent Test**: Iniciar treino, marcar alguns exercícios fora de ordem, finalizar.

**Acceptance Scenarios**:

1. **Given** treino em andamento, **When** marco/desmarco um exercício qualquer, **Then** o estado é salvo imediatamente, sem exigir ordem.
2. **Given** 0 ou mais exercícios marcados, **When** finalizo com confirmação, **Then** a sessão vira "finalizada" e, na contínua, a sequência avança.
3. **Given** finalização, **When** ocorre falha no meio, **Then** nada é gravado parcialmente e a sessão segue em andamento.

---

### User Story 2 - Peso, última carga e prescrição (Priority: P1)

Como usuário, quero registrar o peso de cada exercício, ver a última carga usada e a prescrição da ficha.

**Why this priority**: Acompanhar progressão de carga e seguir a ficha.

**Independent Test**: Registrar peso em uma sessão, finalizar e iniciar outra do mesmo programa.

**Acceptance Scenarios**:

1. **Given** exercício, **When** informo peso, **Then** valores vazios ou ≥ 0 são aceitos e negativos rejeitados.
2. **Given** sessão anterior finalizada do mesmo programa com peso, **When** abro o exercício, **Then** vejo essa última carga; de outro programa, não.
3. **Given** exercício com prescrição/técnica/observação, **When** vejo o treino, **Then** o texto aparece como na ficha, sem interpretação.
4. **Given** um bi-set, **When** vejo os dois exercícios, **Then** cada um tem marcação e carga próprias e indica o parceiro.

---

### User Story 3 - Aquecimento livre e recuperação de sessão (Priority: P1)

Como usuário, quero ver a nota de aquecimento (que não conta como exercício) e retomar uma sessão interrompida.

**Why this priority**: Fidelidade à ficha e resiliência.

**Independent Test**: Fechar o app no meio do treino e reabrir.

**Acceptance Scenarios**:

1. **Given** treino com aquecimento, **When** abro a tela, **Then** vejo a nota, sem checkbox e sem entrar nas contagens.
2. **Given** app fechado durante o treino, **When** reabro e escolho Continuar, **Then** marcações e pesos estão preservados.
3. **Given** Descartar, **When** confirmo, **Then** a sessão some sem afetar sequência ou estatísticas.

### Edge Cases

- Peso decimal com vírgula ou ponto.
- Finalizar sem nenhum exercício marcado é permitido.
- Treino do modo semanal finalizado não altera posição contínua.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A tela MUST listar exercícios do treino com prescrição, técnica e observações.
- **FR-002**: O usuário MUST poder marcar/desmarcar exercícios em qualquer ordem; a ordem de exibição é apenas visual.
- **FR-003**: O usuário MUST poder registrar peso por exercício (vazio ou ≥ 0).
- **FR-004**: O app MUST exibir última carga derivada da última sessão finalizada do mesmo programa com peso.
- **FR-005**: O app MUST permitir finalizar com qualquer número de exercícios marcados, de forma transacional: exercícios → finalizada → atualizar sequência (se contínua) → limpar sessão em andamento.
- **FR-006**: A sessão em andamento MUST ser persistida a cada alteração e recuperável.
- **FR-007**: A nota de aquecimento MUST ser exibida sem contar como exercício.
- **FR-008**: O app MUST NOT recomendar carga nem registrar repetições realizadas.

### Key Entities

- **Sessão**, **Exercício da sessão**, **Exercício do treino**, **Última carga** (derivada).

## Success Criteria *(mandatory)*

- **SC-001**: Marcar um exercício e registrar peso leva no máximo 3 toques.
- **SC-002**: 100% das marcações e pesos sobrevivem a fechar o app à força.
- **SC-003**: Testes de persistência (BL-104) cobrem criar, finalizar, recuperar e editar.
- **SC-004**: Finalização falhando nunca avança a sequência.

## Assumptions

- Cronômetro é opcional e vem na spec 011.
- Ajuda `?`/`ⓘ` é entregue na spec 008; esta tela apenas reserva os pontos de acesso.
