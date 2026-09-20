# Feature Specification: Fundação do Projeto

**Feature Branch**: `001-fundacao-projeto`
**Created**: 2026-09-19
**Status**: Draft
**Backlog**: BL-001, BL-002, BL-003, BL-010, BL-011 (Sprint 1)
**Input**: User description: "Com base no backlog, criar a fundação do app: projeto multiplataforma, navegação, qualidade de código e armazenamento local versionado."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - App abre em Android e iOS (Priority: P1)

Como dono do app, quero um aplicativo que inicia nos dois sistemas com as cinco áreas de navegação (Home, Treino, Histórico, Estatísticas, Configurações), para ter a base sobre a qual as demais funções serão construídas.

**Why this priority**: Nada mais pode ser entregue ou validado sem um app que rode.

**Independent Test**: Abrir o app em um aparelho/emulador Android e em um iOS e navegar entre as cinco áreas.

**Acceptance Scenarios**:

1. **Given** o app instalado, **When** abro o app, **Then** vejo a Home em textos pt-BR sem erros.
2. **Given** a Home aberta, **When** navego a cada área, **Then** cada uma exibe uma tela (mesmo vazia) e é possível voltar.

---

### User Story 2 - Armazenamento local com evolução controlada (Priority: P1)

Como dono do app, quero que os dados fiquem só no aparelho, com a estrutura de armazenamento versionada, para que futuras mudanças não percam meu histórico.

**Why this priority**: Toda função posterior persiste dados; migrar sem perda é requisito de base.

**Independent Test**: Abrir o app em instalação limpa e em instalação com versão anterior do armazenamento; ambos chegam à versão atual sem perda.

**Acceptance Scenarios**:

1. **Given** instalação nova, **When** o app abre pela primeira vez, **Then** o armazenamento é criado na versão atual.
2. **Given** armazenamento em versão anterior com dados, **When** o app abre após atualização, **Then** os dados são preservados e a estrutura é atualizada.
3. **Given** o aparelho sem internet, **When** uso o app, **Then** tudo funciona.

---

### User Story 3 - Qualidade de código automatizada (Priority: P2)

Como desenvolvedor, quero verificações automáticas de tipos, estilo e testes, para detectar regressões desde o início.

**Why this priority**: Protege o restante do desenvolvimento, mas não é visível ao usuário.

**Independent Test**: Executar os comandos de verificação e obter resultado passa/falha.

**Acceptance Scenarios**:

1. **Given** código com erro de tipo ou estilo, **When** rodo a verificação, **Then** ela falha apontando o problema.
2. **Given** o projeto limpo, **When** rodo verificação e testes, **Then** tudo passa.

### Edge Cases

- Migration falha no meio: o armazenamento não deve ficar em estado parcial.
- App aberto sem permissões adicionais: nenhuma permissão desnecessária é solicitada.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O app MUST executar em Android e iOS a partir do mesmo código.
- **FR-002**: O app MUST oferecer navegação entre Home, Treino, Histórico, Estatísticas e Configurações.
- **FR-003**: O app MUST persistir dados apenas localmente, sem login, backend ou sincronização.
- **FR-004**: A estrutura de armazenamento MUST ser versionada e atualizada de forma incremental e transacional.
- **FR-005**: O projeto MUST ter verificação de tipos estrita, estilo e testes executáveis por comando único.
- **FR-006**: O app MUST NOT solicitar permissões desnecessárias.
- **FR-007**: Todos os textos de interface MUST estar em português (pt-BR).

### Key Entities

- **Versão do esquema**: registro de qual versão do armazenamento está aplicada.

## Success Criteria *(mandatory)*

- **SC-001**: O app inicia e exibe a Home em até 3 segundos em aparelho de referência.
- **SC-002**: 100% das áreas de navegação são alcançáveis em ambos os sistemas.
- **SC-003**: Atualizar de qualquer versão anterior do armazenamento preserva 100% dos dados de teste.
- **SC-004**: Todas as verificações automáticas passam no projeto recém-criado.

## Assumptions

- Stack definida em `docs/arquitetura.md` e na constituição; esta spec descreve apenas o resultado esperado.
- Comandos de build/teste/lint serão registrados no `CLAUDE.md` ao final desta spec.
- Telas nesta etapa são esqueletos; conteúdo vem das specs seguintes.
