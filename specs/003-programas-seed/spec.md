# Feature Specification: Programas Iniciais (Seed)

**Feature Branch**: `003-programas-seed`
**Created**: 2026-09-19
**Status**: Draft
**Backlog**: BL-020, BL-021, BL-022, BL-023, BL-110 (dados), BL-120, BL-124 (Sprint 2)
**Depende de**: 002
**Input**: User description: "Carregar Treino Padrão e Treino Monstro conforme docs/fichas-treino.md, de forma idempotente."

## Clarifications

### Session 2026-09-20

- Q: Quais as configurações padrão do primeiro uso? → A: Programa ativo = Treino Padrão, tipo de sequência = contínua (`CONTINUOUS`), cronômetro desligado com 90 s.
- Q: Quais dias da agenda do Monstro são opcionais? → A: Sábado e domingo são opcionais, ambos com o texto dos abdominais supra/infra e oblíquos; quarta é descanso puro, sem texto.
- Q: Qual a nota de aquecimento de cada treino? → A: Todos os treinos, dos dois programas, têm a mesma nota: "Aquecimento de manguito rotador + aquecimento livre".
- Q: O que a carga faz quando o conteúdo do seed muda numa versão futura? → A: A cada execução atualiza o conteúdo de programa vindo do seed (nomes, prescrição, técnica, notas, agenda, textos) para refletir a versão do app; nunca altera sessões, configurações nem posição de sequência.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Treino Padrão disponível (Priority: P1)

Como usuário, quero o Treino Padrão pronto no app com seus cinco dias, para começar a treinar sem cadastrar nada.

**Why this priority**: Programa mais simples; valida o fluxo ponta a ponta.

**Independent Test**: Primeira abertura lista o programa com 5 treinos e seus exercícios.

**Acceptance Scenarios**:

1. **Given** instalação nova, **When** o app abre, **Then** existe o Treino Padrão com Dia 1–5 (Peito e Tríceps, Costas e Bíceps, Perna Completo, Ombro Isolado, Bíceps e Tríceps).

---

### User Story 2 - Treino Monstro fiel à ficha (Priority: P1)

Como usuário, quero o Treino Monstro com os 43 exercícios (A=11, B=10, C=10, D=12), prescrição, técnica e observações exatamente como na ficha, para treinar sem consultar o papel.

**Why this priority**: É o programa principal do usuário.

**Independent Test**: Comparar o conteúdo carregado com `docs/fichas-treino.md`.

**Acceptance Scenarios**:

1. **Given** instalação nova, **When** consulto o Treino Monstro, **Then** vejo os treinos A–D com as quantidades corretas.
2. **Given** um bi-set da ficha, **When** consulto, **Then** cada exercício do par é um item próprio com técnica BI-SET e nota indicando o parceiro.
3. **Given** qualquer treino de qualquer programa, **When** consulto, **Then** há a nota "Aquecimento de manguito rotador + aquecimento livre", que não conta como exercício.
4. **Given** a agenda do Monstro, **When** consulto, **Then** os dias seguem a ficha (segunda A, terça B, quarta descanso sem texto, quinta C, sexta D), sábado e domingo são dias opcionais com o texto dos abdominais e a sugestão de cardio do programa.

---

### User Story 3 - Carga de dados repetível e completa (Priority: P1)

Como dono do app, quero que a carga inicial possa rodar várias vezes sem duplicar nem apagar dados do usuário, e que nenhum exercício fique sem músculos e descrição.

**Why this priority**: Evita corrupção em atualizações e garante a ajuda contextual.

**Independent Test**: Rodar a carga duas vezes e comparar contagens; verificar completude dos exercícios.

**Acceptance Scenarios**:

1. **Given** configurações já alteradas pelo usuário (ex.: programa ativo Treino Monstro), **When** a carga roda de novo, **Then** as configurações permanecem como estavam.
2. **Given** uma prescrição do seed alterada numa versão nova do app, **When** a carga roda, **Then** o conteúdo do programa reflete o novo texto e as sessões antigas permanecem intactas.
3. **Given** dados já carregados e sessões existentes, **When** a carga roda de novo, **Then** nada é duplicado e as sessões permanecem.
4. **Given** qualquer exercício de qualquer programa, **When** verifico, **Then** tem músculo principal, secundários e descrição.

### Edge Cases

- Interrupção no meio da carga: retomar sem duplicar.
- Exercício com mesmo nome em programas distintos reutiliza a mesma entidade.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST carregar Treino Padrão e Treino Monstro como dados, sem regra especial por nome de programa.
- **FR-002**: O sistema MUST carregar prescrição, técnica e observações como texto, sem interpretá-las.
- **FR-003**: Bi-sets MUST ser dois exercícios distintos, cada um com técnica e nota do parceiro.
- **FR-004**: O sistema MUST carregar em todo treino (dos dois programas) a nota de aquecimento "Aquecimento de manguito rotador + aquecimento livre", agenda semanal do Monstro (quarta descanso; sábado e domingo opcionais, cada um com a nota dos abdominais) e sugestão da Home.
- **FR-005**: A carga MUST ser idempotente e, a cada execução, atualizar o conteúdo de programa vindo do seed (nomes, prescrição, técnica, notas, agenda, textos) para refletir a versão do app, sem duplicar; MUST NOT alterar sessões, configurações nem posição de sequência.
- **FR-006**: Todo exercício MUST ter músculo principal, secundários e descrição; teste automatizado MUST falhar se faltar.
- **FR-007**: A carga MUST criar o estado de sequência inicial de cada programa (posição 1) e, se ainda não existirem, as configurações padrão: programa ativo Treino Padrão, sequência contínua, cronômetro desligado com 90 s; configurações já existentes MUST NOT ser sobrescritas.

### Key Entities

- Reutiliza as entidades da spec 002; conteúdo do Treino Monstro em `docs/fichas-treino.md` e do Treino Padrão em `docs/PRD.md` (seção 7).

## Success Criteria *(mandatory)*

- **SC-001**: 100% dos exercícios da ficha (43 no Monstro + Padrão) conferem com a transcrição.
- **SC-002**: Duas execuções seguidas da carga produzem contagens idênticas.
- **SC-003**: 0 exercícios sem músculos/descrição.

## Assumptions

- Variação "tríceps testa unilateral no cross" tratada como exercício distinto do "Tríceps testa" (a confirmar, ver `CLAUDE.md`).
- Texto exato do cardio será confirmado na fase de clarificação; a nota de aquecimento já está definida (ver Clarifications).
- A lista de exercícios do Treino Padrão vem do PRD (seção 7), pois `docs/fichas-treino.md` só a resume.
- Músculos/descrições dos exercícios são conteúdo estático redigido para o app, não recomendação.
