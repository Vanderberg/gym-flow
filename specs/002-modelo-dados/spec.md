# Feature Specification: Modelo de Dados e Repositórios

**Feature Branch**: `002-modelo-dados`
**Created**: 2026-09-19
**Status**: Draft
**Backlog**: BL-012, BL-013, BL-014, BL-015 (Sprint 2)
**Depende de**: 001
**Input**: User description: "Criar as entidades de programa, treino, exercício, agenda semanal, estado de sequência por programa e sessões, conforme docs/modelo-dados.md."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Programas, treinos e exercícios armazenáveis (Priority: P1)

Como dono do app, quero que programas, seus treinos e exercícios (com prescrição, técnica e observações) possam ser guardados e consultados, para que qualquer programa seja cadastrado como dado.

**Why this priority**: É a base de conteúdo de todo o app.

**Independent Test**: Gravar um programa com treinos e exercícios e recuperá-lo idêntico.

**Acceptance Scenarios**:

1. **Given** um programa com 2 treinos, **When** salvo e consulto, **Then** recebo treinos e exercícios na ordem definida.
2. **Given** um exercício usado em dois treinos, **When** consulto, **Then** existe um único exercício referenciado duas vezes.
3. **Given** o mesmo exercício adicionado duas vezes ao mesmo treino, **When** salvo, **Then** a duplicidade é rejeitada.

---

### User Story 2 - Agenda semanal e estado de sequência por programa (Priority: P1)

Como dono do app, quero que cada programa tenha sua agenda por dia da semana e sua própria posição na sequência contínua, para alternar programas sem misturar estados.

**Why this priority**: Sustenta as sequências e a troca de programa.

**Independent Test**: Gravar agenda (com dias sem treino) e posição para dois programas e confirmar que são independentes.

**Acceptance Scenarios**:

1. **Given** um programa com agenda, **When** consulto um dia sem treino, **Then** recebo "sem treino".
2. **Given** dois programas com posições diferentes, **When** altero um, **Then** o outro não muda.

---

### User Story 3 - Sessões com integridade (Priority: P1)

Como dono do app, quero registrar sessões que guardam programa, treino, exercícios marcados e cargas, para que o histórico permaneça correto mesmo se o conteúdo do programa mudar.

**Why this priority**: Histórico e estatísticas dependem das sessões.

**Independent Test**: Criar sessão, marcar exercícios com peso, finalizar; confirmar persistência e a regra de peso.

**Acceptance Scenarios**:

1. **Given** uma sessão, **When** informo peso negativo, **Then** é rejeitado; peso vazio ou zero é aceito.
2. **Given** uma finalização, **When** qualquer etapa falha, **Then** nada é gravado parcialmente.
3. **Given** que existe no máximo uma sessão em andamento, **When** tento criar outra, **Then** é impedido.

### Edge Cases

- Remover/alterar exercício de programa não deve corromper sessões antigas.
- Datas de sessão usam o dia local do usuário.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST armazenar programas, treinos, exercícios e a relação treino–exercício com prescrição, técnica e observações como texto.
- **FR-002**: Um exercício reutilizado MUST ser uma única entidade referenciada por vários treinos, sem duplicar no mesmo treino.
- **FR-003**: O sistema MUST armazenar agenda semanal por programa, permitindo dia sem treino e nota do dia.
- **FR-004**: O sistema MUST manter posição na sequência contínua separada por programa.
- **FR-005**: O sistema MUST armazenar sessões com programa, treino, datas, status e exercícios com marcação e peso.
- **FR-006**: O peso MUST ser vazio ou maior/igual a zero; a "última carga" MUST ser derivada, nunca armazenada.
- **FR-007**: O sistema MUST guardar configurações globais em registro único (programa ativo, tipo de sequência, cronômetro).
- **FR-008**: O sistema MUST guardar nota de aquecimento por treino e sugestão da Home por programa.
- **FR-009**: O sistema MUST guardar músculo principal, secundários e descrição por exercício.

### Key Entities

- **Programa**, **Treino**, **Exercício**, **Exercício do treino**, **Agenda semanal**, **Estado de sequência**, **Sessão**, **Exercício da sessão**, **Configurações** — conforme `docs/modelo-dados.md`.

## Success Criteria *(mandatory)*

- **SC-001**: Todas as regras de integridade listadas nas histórias são cobertas por testes automatizados.
- **SC-002**: Gravar e recuperar uma sessão completa (15 exercícios) leva menos de 1 segundo percebido.
- **SC-003**: 0 casos em que falha na finalização deixa dados parciais.

## Assumptions

- `docs/modelo-dados.md` é a referência do esquema; divergências atualizam a documentação.
- Esta spec entrega estrutura e acesso a dados; conteúdo real vem da spec 003.
