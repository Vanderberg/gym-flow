# Feature Specification: Estatísticas de Frequência

**Feature Branch**: `010-estatisticas-frequencia`
**Created**: 2026-09-19
**Status**: Draft
**Backlog**: BL-080..BL-087, BL-105 (Sprint 6)
**Requisitos de produto**: RF-17, RF-18
**Depende de**: 007
**Input**: User description: "Estatísticas de frequência e cadência por semana, mês, trimestre, semestre e ano, com filtro por programa."

## Clarifications

### Session 2026-09-21

- Q: Estatísticas só do período atual ou também dos anteriores? → A: Só o período atual: o usuário escolhe a granularidade (semana, mês, trimestre, semestre, ano) e vê o período em curso; sem setas de navegação entre períodos.
- Q: Como a média por semana é calculada no período em curso? → A: Semanas de calendário (segunda a domingo) que o período já tocou até hoje, contando a semana atual inteira; média = treinos ÷ esse número inteiro. Para o período "Semana", o divisor é 1.
- Q: Quais visões extras do design entram (distribuição por dia, calendário)? → A: Nenhuma: só os três números (treinos no período, média por semana, intervalo médio); sem distribuição por dia nem calendário de pontos.
- Q: Sessão finalizada sem nenhum exercício marcado entra nas estatísticas? → A: Sim: toda sessão finalizada conta, independentemente de quantos exercícios foram marcados.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Frequência por período (Priority: P1)

Como usuário, quero ver quantos treinos fiz na semana, mês, trimestre, semestre e ano.

**Why this priority**: Objetivo central de acompanhamento.

**Independent Test**: Com sessões conhecidas, conferir a contagem em cada período.

**Acceptance Scenarios**:

1. **Given** sessões finalizadas, **When** escolho um período (semana, mês, trimestre, semestre ou ano), **Then** vejo a quantidade de treinos no período em curso; não há navegação para períodos anteriores.
2. **Given** sessão em andamento ou descartada, **When** calculo, **Then** ela não entra.
3. **Given** sem sessões no período, **When** consulto, **Then** vejo zero e mensagem vazia.
4. **Given** sessão finalizada com 0 exercícios marcados, **When** calculo, **Then** ela conta como um treino (toda sessão finalizada entra).

---

### User Story 2 - Média semanal e intervalo médio (Priority: P1)

Como usuário, quero a média de treinos por semana e o intervalo médio entre treinos.

**Why this priority**: Mostra regularidade além da contagem.

**Independent Test**: Sessões em datas fixas com médias calculadas manualmente.

**Acceptance Scenarios**:

1. **Given** 8 treinos em 4 semanas de calendário já tocadas pelo período, **When** vejo a média, **Then** mostra 2 por semana.
2. **Given** treinos em 1, 3 e 7 do mês, **When** vejo intervalo médio, **Then** mostra 3 dias.
3. **Given** menos de 2 treinos, **When** vejo intervalo médio, **Then** mostra "—".
4. **Given** o período "Semana", **When** vejo a média por semana, **Then** o divisor é 1 (a média é igual à quantidade).
5. **Given** um mês em curso que já tocou 5 semanas de calendário e 17 treinos, **When** vejo a média, **Then** mostra 3,4 por semana (a semana atual conta inteira).

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
- Sessão finalizada com 0 exercícios marcados conta como treino; editar marcações no histórico não altera as estatísticas.
- O intervalo médio usa só as sessões dentro do período e do filtro, pela data local de finalização (diferença em dias corridos entre treinos consecutivos).
- Limites de período no dia local (virada de mês/ano).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001a**: O app MUST exibir apenas o período em curso da granularidade escolhida, sem navegação para períodos anteriores nesta spec.
- **FR-001**: O app MUST calcular quantidade, média por semana e intervalo médio para semana, mês, trimestre, semestre e ano. A média por semana MUST ser treinos ÷ semanas de calendário (segunda a domingo) já tocadas pelo período até hoje, contando a semana atual inteira; no período "Semana" o divisor é 1.
- **FR-002**: O cálculo MUST usar apenas sessões finalizadas (todas contam, mesmo com 0 exercícios marcados), em serviço único e centralizado sobre `workout_session`, pela data local de finalização.
- **FR-003**: O app MUST oferecer filtro por programa (Todos / cada programa).
- **FR-004a**: A tela MUST exibir apenas os três números (treinos no período, média por semana e intervalo médio); a distribuição por dia (SEG…DOM) e o calendário de pontos do design ficam fora desta spec.
- **FR-004**: O app MUST exibir somente frequência e cadência; MUST NOT exibir volume, carga total, peso corporal ou recomendações.
- **FR-005**: Datas MUST usar o dia local.

### Key Entities

- **Sessão** (data, programa, status); métricas derivadas, não armazenadas.

## Success Criteria *(mandatory)*

- **SC-001**: Testes (BL-105) cobrem contagem, média, intervalo, filtros de período e datas de borda.
- **SC-002**: Trocar período ou filtro atualiza os números em menos de 1 segundo percebido.
- **SC-003**: Números idênticos aos calculados manualmente em conjunto de referência.

## Assumptions

- Média por semana = treinos no período ÷ número de semanas de calendário (segunda a domingo) que o período já tocou até hoje, contando a semana atual inteira (divisor inteiro ≥ 1); resultado com uma casa decimal.
- Períodos são o calendário atual (semana seg–dom, mês, trimestre, semestre, ano) e só o período em curso é exibido; a navegação entre períodos (setas `‹ ›` do design) fica fora desta spec.
