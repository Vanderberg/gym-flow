# Feature Specification: Home e Próximo Treino

**Feature Branch**: `006-home-proximo-treino`
**Created**: 2026-09-19
**Status**: Draft
**Backlog**: BL-050, BL-051, BL-052, BL-053, BL-122, BL-123 (Sprint 4)
**Depende de**: 004, 005
**Input**: User description: "A Home mostra o programa atual, o próximo treino, permite iniciar e detecta treino em andamento."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver o próximo treino e iniciar (Priority: P1)

Como usuário, quero abrir o app e ver qual treino fazer hoje, para iniciar com um toque.

**Why this priority**: É a porta de entrada do uso diário.

**Independent Test**: Com programa e sequência definidos, a Home mostra o treino correto e o botão inicia uma sessão.

**Acceptance Scenarios**:

1. **Given** programa ativo e sequência contínua, **When** abro a Home, **Then** vejo programa, tipo de sequência e o próximo treino com seus exercícios em resumo.
2. **Given** próximo treino exibido, **When** toco em "Iniciar treino", **Then** uma sessão em andamento é criada com programa e treino corretos.
3. **Given** sequência semanal e dia com treino, **When** abro a Home, **Then** vejo o treino do dia.

---

### User Story 2 - Dias sem treino e textos do programa (Priority: P1)

Como usuário, quero que dias de descanso e opcionais sejam claros e que a sugestão de cardio apareça, sem que o app crie sessão sozinho.

**Why this priority**: Evita confusão no modo semanal.

**Independent Test**: Simular cada tipo de dia da agenda do Monstro.

**Acceptance Scenarios**:

1. **Given** dia de descanso, **When** abro a Home, **Then** vejo "Dia de descanso" sem treino a iniciar.
2. **Given** dia opcional, **When** abro a Home, **Then** vejo o texto do dia (abdominais) e nenhuma sessão é criada.
3. **Given** programa com sugestão (Monstro), **When** abro a Home, **Then** vejo o texto de cardio como conteúdo do programa; programa sem sugestão não mostra bloco.

---

### User Story 3 - Treino em andamento (Priority: P1)

Como usuário, quero ser avisado de um treino não finalizado, para continuar ou descartar.

**Why this priority**: Evita perda de progresso e sessões duplicadas.

**Independent Test**: Criar sessão, fechar o app, reabrir.

**Acceptance Scenarios**:

1. **Given** sessão em andamento, **When** abro o app, **Then** a Home oferece "Continuar" e "Descartar".
2. **Given** "Descartar" confirmado, **When** volto à Home, **Then** sequência e estatísticas não mudaram.
3. **Given** sessão em andamento, **When** vejo a Home, **Then** não há botão de iniciar outro treino.

### Edge Cases

- Modo semanal em programa sem agenda: mensagem orientando, sem erro.
- Passagem da meia-noite com a Home aberta: ao voltar ao app, o dia é reavaliado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A Home MUST exibir programa ativo, tipo de sequência e resultado do próximo treino.
- **FR-002**: O usuário MUST poder iniciar o treino exibido, criando sessão em andamento.
- **FR-003**: O app MUST NOT criar sessão automaticamente.
- **FR-004**: A Home MUST exibir texto do dia opcional e sugestão do programa apenas quando existirem.
- **FR-005**: A Home MUST detectar sessão em andamento e oferecer Continuar/Descartar; descartar não altera sequência nem estatísticas.
- **FR-006**: A Home MUST NOT recomendar cargas, exercícios ou treinos; textos vêm do conteúdo do programa.

### Key Entities

- **Resultado do próximo treino**, **Sessão em andamento**, **Programa** (sugestão), **Agenda** (nota do dia).

## Success Criteria *(mandatory)*

- **SC-001**: Do abrir o app ao treino iniciado: no máximo 2 toques.
- **SC-002**: Em 100% dos estados (contínua, semanal treino/descanso/opcional/sem agenda, sessão em andamento) a Home exibe a informação correta.
- **SC-003**: 0 sessões criadas sem ação explícita do usuário.

## Assumptions

- Layout segue `docs/design-telas.md`.
- Sessão em andamento é única por vez.
