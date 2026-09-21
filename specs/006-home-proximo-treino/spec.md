# Feature Specification: Home e Próximo Treino

**Feature Branch**: `006-home-proximo-treino`
**Created**: 2026-09-19
**Status**: Draft
**Backlog**: BL-050, BL-051, BL-052, BL-053, BL-122, BL-123 (Sprint 4)
**Requisitos de produto**: RF-01, RF-04, RF-29, RF-30
**Depende de**: 004, 005
**Input**: User description: "A Home mostra o programa atual, o próximo treino, permite iniciar e detecta treino em andamento."

## Clarifications

### Session 2026-09-21

- Q: Na semanal, com o treino do dia já finalizado hoje, o que a Home mostra e permite? → A: Mostra o treino do dia com a marca "Concluído hoje"; o botão "COMEÇAR TREINO" continua disponível.
- Q: Em dia de descanso ou opcional, o usuário pode iniciar algum treino? → A: Sim: ação secundária "Ver treinos do programa" abre a lista de treinos do programa; escolher um inicia a sessão com esse treino, sem alterar a agenda.
- Q: Quais elementos extras da Home entram nesta spec? → A: SequenceRail (contínua) e WeekStrip (semanal), conforme `docs/design-telas.md` §3; os cartões ÚLTIMO e ESTE MÊS ficam para as specs de histórico e estatísticas.
- Q: A Home oferece "Reiniciar sequência"? → A: Não; o reinício fica só em Configurações (spec 005).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver o próximo treino e iniciar (Priority: P1)

Como usuário, quero abrir o app e ver qual treino fazer hoje, para iniciar com um toque.

**Why this priority**: É a porta de entrada do uso diário.

**Independent Test**: Com programa e sequência definidos, a Home mostra o treino correto e o botão inicia uma sessão.

**Acceptance Scenarios**:

1. **Given** programa ativo e sequência contínua, **When** abro a Home, **Then** vejo programa, tipo de sequência, o SequenceRail com a posição atual e o próximo treino com seus exercícios em resumo.
2. **Given** próximo treino exibido, **When** toco em "COMEÇAR TREINO", **Then** uma sessão em andamento é criada com programa e treino corretos.
3. **Given** sequência semanal e dia com treino, **When** abro a Home, **Then** vejo o WeekStrip (7 dias, hoje destacado) e o treino do dia.
4. **Given** sequência semanal e o treino do dia já finalizado hoje (mesmo programa e treino, data local), **When** abro a Home, **Then** vejo o treino com a marca "Concluído hoje" e o botão "COMEÇAR TREINO" continua disponível.
5. **Given** sequência semanal e sessão finalizada na quarta, **When** abro a Home na quinta, **Then** o WeekStrip marca a quarta como feita (ponto e ✓) e destaca a quinta como hoje.

---

### User Story 2 - Dias sem treino e textos do programa (Priority: P1)

Como usuário, quero que dias de descanso e opcionais sejam claros e que a sugestão de cardio apareça, sem que o app crie sessão sozinho.

**Why this priority**: Evita confusão no modo semanal.

**Independent Test**: Simular cada tipo de dia da agenda do Monstro.

**Acceptance Scenarios**:

1. **Given** dia de descanso, **When** abro a Home, **Then** vejo "Dia de descanso" sem botão primário de iniciar e com a ação secundária "Ver treinos do programa".
2. **Given** dia opcional, **When** abro a Home, **Then** vejo o texto do dia (abdominais), a ação secundária "Ver treinos do programa" e nenhuma sessão é criada.
3. **Given** dia de descanso ou opcional, **When** toco em "Ver treinos do programa" e escolho um treino, **Then** uma sessão em andamento é criada com o programa ativo e esse treino, e a agenda e a sequência não mudam.
4. **Given** programa com sugestão (Monstro), **When** abro a Home, **Then** vejo o texto de cardio como conteúdo do programa; programa sem sugestão não mostra bloco.

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

- Modo semanal em programa sem agenda: cartão "Sem agenda configurada para este programa" com atalho para trocar para sequência contínua (spec 004/005; a agenda não é editável), sem botão de iniciar e sem erro.
- Carregando e erro de leitura: esqueleto do cartão principal enquanto carrega; em erro, cartão "Não foi possível carregar seus treinos" com "Tentar de novo" (`docs/design-telas.md` §4.3).
- Programa sem treinos ativos: cartão "Este programa não tem treinos ativos", sem ação e sem erro.
- Passagem da meia-noite com a Home aberta: ao voltar ao app, o dia é reavaliado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A Home MUST exibir programa ativo, tipo de sequência e resultado do próximo treino.
- **FR-001a**: A Home MUST exibir o SequenceRail na contínua e o WeekStrip na semanal (com agenda), conforme `docs/design-telas.md` §3. Os cartões ÚLTIMO e ESTE MÊS e o botão "Reiniciar sequência" NÃO fazem parte da Home (o reinício fica em Configurações, spec 005).
- **FR-001b**: O WeekStrip MUST marcar, na semana corrente (segunda a domingo, data local), os dias com sessão finalizada do programa ativo, sem depender só de cor; o SequenceRail MUST marcar como concluídos os passos anteriores à posição atual.
- **FR-002**: O usuário MUST poder iniciar o treino exibido, criando sessão em andamento.
- **FR-002a**: Na semanal, a Home MUST marcar "Concluído hoje" quando existir sessão finalizada do mesmo programa e treino com data local de hoje, sem bloquear o início de outra sessão.
- **FR-002b**: Em dia de descanso ou opcional, a Home MUST oferecer "Ver treinos do programa"; iniciar por essa lista cria a sessão com o treino escolhido, sem alterar agenda nem sequência. Em programa sem agenda no modo semanal a ação não é oferecida (spec 004).
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

- Layout segue `docs/design-telas.md`, exceto os cartões ÚLTIMO e ESTE MÊS (specs de histórico e estatísticas).
- Sessão em andamento é única por vez.
- Antes de a US3 estar implementada, depois de iniciar um treino a Home ainda pode mostrar o botão COMEÇAR TREINO; um segundo toque é tratado como "Já existe um treino em andamento" (sem criar outra sessão).
