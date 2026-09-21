# Feature Specification: Histórico de Sessões

**Feature Branch**: `009-historico-sessoes`
**Created**: 2026-09-19
**Status**: Draft
**Backlog**: BL-070, BL-071, BL-072, BL-073, BL-074 (Sprint 5)
**Requisitos de produto**: RF-14, RF-15, RF-16
**Depende de**: 007
**Input**: User description: "Listar, detalhar, filtrar por programa e editar sessões finalizadas."

## Clarifications

### Session 2026-09-21

- Q: Como a edição de uma sessão passada é salva? → A: Modo de edição como no design: EDITAR libera as linhas; as alterações ficam pendentes até Salvar (uma transação para todas); Cancelar descarta, com confirmação se houver alterações.
- Q: Prescrição no detalhe de uma sessão antiga? → A: Mostra a prescrição atual da ficha quando o exercício ainda está no treino; se ele saiu da ficha, mostra só o nome, a marcação e o peso, sem prescrição.
- Q: O que cada item da lista mostra? → A: Data, programa, treino, "N / M realizados" (com ✓ quando completo) e duração, como no design; com o filtro por programa ativo, o nome do programa pode sair do item.
- Q: O filtro por programa é lembrado? → A: Só em memória enquanto o app está aberto; volta a "Todos" ao reabrir o app; independente do filtro das estatísticas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Lista e detalhe (Priority: P1)

Como usuário, quero ver meus treinos passados, com programa e treino identificados, e abrir os detalhes.

**Why this priority**: Consulta básica do que foi feito.

**Independent Test**: Com sessões de dois programas, listar e abrir uma.

**Acceptance Scenarios**:

1. **Given** sessões finalizadas, **When** abro Histórico, **Then** vejo lista da mais recente à mais antiga; cada item mostra data, programa, treino, "N / M realizados" (✓ quando completo) e duração; com o filtro por programa ativo, o nome do programa pode sair do item.
2. **Given** uma sessão, **When** abro, **Then** vejo exercícios marcados/não marcados e pesos, com a prescrição atual da ficha abaixo do nome quando o exercício ainda está no treino.
3. **Given** nenhuma sessão, **When** abro Histórico, **Then** vejo estado vazio explicativo.
4. **Given** exercício que saiu da ficha depois da sessão (ou prescrição alterada), **When** abro a sessão, **Then** o exercício continua listado com nome, marcação e peso, sem prescrição quando não está mais no treino.

---

### User Story 2 - Editar sessão (Priority: P1)

Como usuário, quero corrigir marcações e pesos de uma sessão passada.

**Why this priority**: Esquecimentos acontecem; dados devem ser corrigíveis.

**Independent Test**: Editar peso e marcação e reabrir.

**Acceptance Scenarios**:

1. **Given** sessão finalizada aberta, **When** toco em EDITAR, marco/desmarco ou altero peso e toco em Salvar, **Then** todas as alterações persistem juntas, em uma transação.
2. **Given** edição, **When** salvo, **Then** programa, treino e data da sessão não mudam.
3. **Given** peso negativo, **When** tento salvar, **Then** é rejeitado.
4. **Given** edição, **When** conferir sequência, **Then** ela não foi alterada.
5. **Given** edição com alterações pendentes, **When** toco em Cancelar, **Then** o app pede confirmação e, confirmado, nada é gravado e a sessão continua como estava; sem alterações, Cancelar sai sem confirmação.
6. **Given** edição com alterações pendentes, **When** saio da tela (botão voltar, gesto de voltar ou troca de aba), **Then** o app pede a mesma confirmação do Cancelar; confirmado, descarta as alterações, e senão permanece na edição.

---

### User Story 3 - Filtrar por programa (Priority: P2)

Como usuário, quero filtrar o histórico por programa (Todos / cada programa).

**Why this priority**: Conveniência.

**Independent Test**: Alternar filtros e conferir a lista.

**Acceptance Scenarios**:

1. **Given** sessões de dois programas, **When** filtro por um, **Then** só aparecem as dele; "Todos" restaura.
2. **Given** filtro por um programa, **When** fecho e reabro o app, **Then** o filtro volta a "Todos" (não é persistido) e não afeta o filtro das estatísticas.
3. **Given** filtro que não tem sessões, **When** vejo a lista, **Then** aparece "Nenhum treino deste programa." com **Limpar filtro**.

### Edge Cases

- Programa ou exercício alterado depois: a sessão antiga continua legível; a prescrição exibida é a atual da ficha (não é guardada na sessão) e some se o exercício saiu do treino.
- Datas exibidas no dia local.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O histórico MUST listar apenas sessões finalizadas, ordenadas da mais recente.
- **FR-002**: Cada item MUST identificar data, programa e treino e mostrar "N / M realizados" (✓ quando N = M) e a duração da sessão; com filtro por programa ativo, o nome do programa MAY ser omitido.
- **FR-003**: O detalhe MUST mostrar exercícios, marcações e pesos e, quando o exercício ainda está no treino, a prescrição atual da ficha como está (sem interpretar); a sessão não guarda cópia da prescrição.
- **FR-004**: O usuário MUST poder marcar/desmarcar e alterar peso de uma sessão finalizada em um modo de edição (EDITAR → Salvar/Cancelar); as alterações ficam pendentes até Salvar, que grava tudo em uma única transação; Cancelar descarta (com confirmação se houver alterações). MUST NOT alterar programa, treino ou data da sessão. Qualquer saída da tela com alterações pendentes (Cancelar, voltar, gesto de voltar ou troca de aba) MUST pedir confirmação antes de descartar.
- **FR-005**: O filtro por programa MUST oferecer "Todos" e cada programa; o estado do filtro é só de memória (volta a "Todos" ao reabrir o app) e independente do filtro das estatísticas.

### Key Entities

- **Sessão**, **Exercício da sessão**, **Programa**.

## Success Criteria *(mandatory)*

- **SC-001**: Encontrar e abrir uma sessão específica em até 3 toques.
- **SC-002**: 100% das edições persistem após reabrir o app.
- **SC-003**: Lista com 500 sessões rola sem travamentos perceptíveis.

## Assumptions

- Excluir sessão não faz parte desta spec.
- Marcar/desmarcar exercícios na edição não muda o status "finalizada".
