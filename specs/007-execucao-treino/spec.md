# Feature Specification: Execução do Treino

**Feature Branch**: `007-execucao-treino`
**Created**: 2026-09-19
**Status**: Draft
**Backlog**: BL-060..BL-067, BL-121, BL-104 (Sprint 4 / 7)
**Requisitos de produto**: RF-04, RF-05, RF-06, RF-07, RF-08, RF-09, RF-10, RF-11, RF-27, RF-28
**Depende de**: 002, 003, 006
**Input**: User description: "Tela de treino: marcar exercícios em qualquer ordem, registrar peso, ver última carga e prescrição, finalizar (mesmo incompleto) e recuperar sessão."

## Clarifications

### Session 2026-09-21

- Q: Na contínua, de onde a sequência avança ao finalizar? → A: Do treino finalizado: a nova posição é a seguinte à posição do treino finalizado (último → primeiro), mesmo que a posição atual fosse outra.
- Q: O que aparece depois de finalizar? → A: Resumo com "N de M exercícios realizados", duração e "Voltar ao início"; sem a linha "Próximo" (a Home mostra o próximo treino).
- Q: Onde o usuário pode descartar a sessão em andamento? → A: Só na Home (spec 006); a tela de treino não tem ação de descartar.
- Q: Quando o peso digitado é salvo? → A: Ao terminar de digitar (perda de foco, botões − / + ou "Usar X kg"); o valor pendente também é descarregado ao marcar FEITO e ao finalizar, então nada digitado se perde.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Marcar exercícios e finalizar (Priority: P1)

Como usuário, quero marcar exercícios em qualquer ordem e finalizar o treino, mesmo incompleto.

**Why this priority**: É o ato central do app.

**Independent Test**: Iniciar treino, marcar alguns exercícios fora de ordem, finalizar.

**Acceptance Scenarios**:

1. **Given** treino em andamento, **When** marco/desmarco um exercício qualquer, **Then** o estado é salvo imediatamente, sem exigir ordem.
2. **Given** 0 ou mais exercícios marcados, **When** finalizo com confirmação, **Then** a sessão vira "finalizada" e, na contínua, a posição passa a ser a seguinte à do treino finalizado (último → primeiro).
3. **Given** sequência contínua com posição diferente da do treino finalizado (ex.: sequência reiniciada com a sessão em andamento), **When** finalizo o treino da posição 3, **Then** a nova posição é a 4, independentemente da posição anterior.
4. **Given** finalização concluída, **When** o resumo aparece, **Then** vejo "N de M exercícios realizados", a duração (início → fim) e **Voltar ao início**, sem "Próximo"; o aquecimento não entra na contagem.
5. **Given** finalização, **When** ocorre falha no meio, **Then** nada é gravado parcialmente e a sessão segue em andamento.

---

### User Story 2 - Peso, última carga e prescrição (Priority: P1)

Como usuário, quero registrar o peso de cada exercício, ver a última carga usada e a prescrição da ficha.

**Why this priority**: Acompanhar progressão de carga e seguir a ficha.

**Independent Test**: Registrar peso em uma sessão, finalizar e iniciar outra do mesmo programa.

**Acceptance Scenarios**:

1. **Given** exercício, **When** informo peso, **Then** valores vazios ou ≥ 0 são aceitos e negativos rejeitados; o valor é salvo ao terminar de digitar (perda de foco, − / + ou "Usar X kg").
2. **Given** sessão anterior finalizada do mesmo programa com peso, **When** abro o exercício, **Then** vejo essa última carga; de outro programa, não.
3. **Given** exercício com prescrição/técnica/observação, **When** vejo o treino, **Then** o texto aparece como na ficha, sem interpretação.
4. **Given** um bi-set, **When** vejo os dois exercícios, **Then** cada um tem marcação e carga próprias e indica o parceiro.
5. **Given** valor digitado ainda não confirmado, **When** marco FEITO ou toco em FINALIZAR, **Then** o valor pendente é salvo antes e entra na sessão finalizada.

---

### User Story 3 - Aquecimento livre e recuperação de sessão (Priority: P1)

Como usuário, quero ver a nota de aquecimento (que não conta como exercício) e retomar uma sessão interrompida.

**Why this priority**: Fidelidade à ficha e resiliência.

**Independent Test**: Fechar o app no meio do treino e reabrir.

**Acceptance Scenarios**:

1. **Given** treino com aquecimento, **When** abro a tela, **Then** vejo a nota, sem checkbox e sem entrar nas contagens.
2. **Given** app fechado durante o treino, **When** reabro e escolho Continuar, **Then** marcações e pesos estão preservados.
3. **Given** sessão em andamento, **When** vejo a tela de treino, **Then** não há ação de descartar (o descarte é feito na Home, spec 006, sem afetar sequência ou estatísticas).

### Edge Cases

- Peso decimal com vírgula ou ponto.
- Finalizar sem nenhum exercício marcado é permitido.
- Treino finalizado no modo semanal não altera a posição da sequência contínua (o tipo de sequência é lido no momento de finalizar).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A tela MUST listar exercícios do treino com prescrição, técnica e observações.
- **FR-002**: O usuário MUST poder marcar/desmarcar exercícios em qualquer ordem; a ordem de exibição é apenas visual.
- **FR-003**: O usuário MUST poder registrar peso por exercício (vazio ou ≥ 0); o valor MUST ser gravado ao terminar de digitar e MUST ser descarregado ao marcar FEITO e ao finalizar, sem perder o que foi digitado.
- **FR-004**: O app MUST exibir última carga derivada da última sessão finalizada do mesmo programa com peso.
- **FR-005**: O app MUST permitir finalizar com qualquer número de exercícios marcados, de forma transacional: exercícios → finalizada → atualizar sequência (se contínua; nova posição = seguinte à do treino finalizado, via `advancePosition` da spec 004) → limpar sessão em andamento.
- **FR-005a**: Após finalizar, o app MUST exibir um resumo com exercícios realizados de total, duração e **Voltar ao início**; o resumo NÃO exibe "Próximo treino" (fora de escopo; a Home o mostra).
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

- Ajuda `?`/`ⓘ` é entregue na spec 008; sem os handlers dela, os ícones não são renderizados e o layout reserva o espaço. O cronômetro é da spec 011.
- O peso não tem limite superior nesta spec e é arredondado a 2 casas decimais.
- Um segundo toque em FINALIZAR depois de a sessão já estar finalizada não altera nada: o app navega ao resumo.
- Bi-set são dois cartões independentes, cada um com o chip da técnica e a observação do parceiro exibidos como estão; o app não deriva vínculo visual a partir da técnica.
