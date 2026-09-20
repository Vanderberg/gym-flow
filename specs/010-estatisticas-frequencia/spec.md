# Feature Specification: Estatísticas de Frequência

**Feature Branch**: `010-estatisticas-frequencia`
**Created**: 2026-09-19
**Status**: Draft
**Backlog**: BL-080..BL-087, BL-105 (Sprint 6)
**Depende de**: 007
**Input**: User description: "Estatísticas de frequência e cadência por semana, mês, trimestre, semestre e ano, com filtro por programa."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Frequência por período (Priority: P1)

Como usuário, quero ver quantos treinos fiz na semana, mês, trimestre, semestre e ano.

**Why this priority**: Objetivo central de acompanhamento.

**Independent Test**: Com sessões conhecidas, conferir a contagem em cada período.

**Acceptance Scenarios**:

1. **Given** sessões finalizadas, **When** escolho um período, **Then** vejo a quantidade de treinos nele.
2. **Given** sessão em andamento ou descartada, **When** calculo, **Then** ela não entra.
3. **Given** sem sessões no período, **When** consulto, **Then** vejo zero e mensagem vazia.

---

### User Story 2 - Média semanal e intervalo médio (Priority: P1)

Como usuário, quero a média de treinos por semana e o intervalo médio entre treinos.

**Why this priority**: Mostra regularidade além da contagem.

**Independent Test**: Sessões em datas fixas com médias calculadas manualmente.

**Acceptance Scenarios**:

1. **Given** 8 treinos em 4 semanas, **When** vejo a média, **Then** mostra 2 por semana.
2. **Given** treinos em 1, 3 e 7 do mês, **When** vejo intervalo médio, **Then** mostra 3 dias.
3. **Given** menos de 2 treinos, **When** vejo intervalo médio, **Then** mostra "—".

---

### User Story 3 - Filtro por programa (Priority: P2)

Como usuário, quero filtrar as estatísticas por programa.

**Why this priority**: Comparar uso de cada programa.

**Independent Test**: Alternar filtro e conferir números.

**Acceptance Scenarios**:

1. **Given** sessões de dois programas, **When** filtro por um, **Then** todas as métricas usam só as dele; "Todos" soma tudo.

### Edge Cases

- Semana atual incompleta na média: definida em Assumptions.
- Dois treinos no mesmo dia contam como dois; intervalo 0 dia.
- Limites de período no dia local (virada de mês/ano).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O app MUST calcular quantidade, média por semana e intervalo médio para semana, mês, trimestre, semestre e ano.
- **FR-002**: O cálculo MUST usar apenas sessões finalizadas, em serviço único e centralizado.
- **FR-003**: O app MUST oferecer filtro por programa (Todos / cada programa).
- **FR-004**: O app MUST exibir somente frequência e cadência; MUST NOT exibir volume, carga total, peso corporal ou recomendações.
- **FR-005**: Datas MUST usar o dia local.

### Key Entities

- **Sessão** (data, programa, status); métricas derivadas, não armazenadas.

## Success Criteria *(mandatory)*

- **SC-001**: Testes (BL-105) cobrem contagem, média, intervalo, filtros de período e datas de borda.
- **SC-002**: Trocar período ou filtro atualiza os números em menos de 1 segundo percebido.
- **SC-003**: Números idênticos aos calculados manualmente em conjunto de referência.

## Assumptions

- Média semanal = treinos no período ÷ semanas do período até hoje (semana corrente proporcional), confirmar na clarificação.
- Períodos são calendário atual (semana seg–dom, mês, trimestre, semestre, ano).
