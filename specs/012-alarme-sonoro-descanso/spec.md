# Feature Specification: Alarme Sonoro do Cronômetro de Descanso

**Feature Branch**: `012-alarme-sonoro-descanso`

**Created**: 2026-09-29

**Status**: Draft

**Input**: User description: "Adicionar um alarme sonoro ao final do cronômetro de descanso (spec 011-cronometro-descanso). Hoje, ao terminar a contagem com o app em primeiro plano, o app vibra uma vez e mostra "Descanso terminado" (RestTimerProvider.tsx). Esta melhoria adiciona um som ao mesmo evento de término, mantendo o comportamento atual em segundo plano (sem alerta) e sem alterar sequência, sessão ou pesos."

**Depende de**: 011-cronometro-descanso (cronômetro de descanso: máquina de estados, vibração e aviso visual "Descanso terminado" já existentes)

## Clarifications

### Session 2026-09-29

- Q: O som de alarme deve tocar mesmo com o aparelho no modo silencioso/vibrar do sistema, ou deve respeitar esse modo (ficando mudo)? → A: O som respeita o modo silencioso do aparelho — comportamento de notificação comum, fica mudo se o usuário silenciou o telefone.
- Q: Esta feature inclui alguma tela/interface nova ou alterada? → A: Não — nenhuma tela nova ou alterada; o som é só um efeito colateral do término já sinalizado hoje (vibração + texto "Descanso terminado"), sem configuração nova visível.

**Tela/UI:** não

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ouvir quando o descanso termina (Priority: P1)

Durante o treino, o usuário marca um exercício e inicia o descanso. Enquanto conta os segundos, ele frequentemente não está olhando para a tela (troca de peso, conversa, foco no próximo exercício). Hoje só a vibração avisa o fim; um som torna o aviso perceptível mesmo quando o aparelho está no bolso, na bolsa da academia ou fora do campo de visão.

**Why this priority**: É o comportamento central pedido — sem ele a feature não existe.

**Independent Test**: Com o cronômetro ativo e o app em primeiro plano, iniciar o descanso e esperar o tempo esgotar; verificar que um som de alarme é reproduzido junto com a vibração e o aviso "Descanso terminado" já existentes.

**Acceptance Scenarios**:

1. **Given** o cronômetro de descanso está ativo (configuração) e em contagem (`RUNNING`) com o app em primeiro plano, **When** o tempo chega a zero, **Then** o app reproduz um som de alarme uma única vez, junto com a vibração já existente.
2. **Given** o app está em primeiro plano, **When** o som termina de tocar, **Then** ele não se repete nem continua tocando enquanto o estado permanece `FINISHED` (o usuário não precisa silenciar nada manualmente).

---

### User Story 2 - Não incomodar quando não deveria (Priority: P2)

O usuário não quer ser surpreendido por um som quando o app está em segundo plano (comportamento já definido pela spec 011) nem quando desativou o cronômetro de descanso nas configurações.

**Why this priority**: Preserva a promessa já feita pela spec 011 ("em segundo plano, sem alerta") e evita som indesejado quando a funcionalidade está desligada; sem isso a feature regride uma garantia existente.

**Independent Test**: Iniciar o descanso, colocar o app em segundo plano até o tempo esgotar e voltar ao app; verificar que nenhum som foi disparado enquanto em segundo plano. Repetir com o cronômetro desativado nas configurações e confirmar que nenhum som ocorre.

**Acceptance Scenarios**:

1. **Given** o descanso está em contagem, **When** o app vai para segundo plano e o tempo se esgota nesse período, **Then** nenhum som é reproduzido (mesma regra já aplicada à vibração pela spec 011).
2. **Given** o cronômetro de descanso está desativado nas configurações, **When** o usuário marca um exercício, **Then** nenhuma contagem inicia e, portanto, nenhum som ou vibração de término ocorre (comportamento herdado da spec 011, apenas confirmado aqui).

---

### Edge Cases

- O que acontece se o usuário voltar ao app **depois** que o descanso já terminou em segundo plano? (Resposta: mesma regra da vibração — nenhum som retroativo; o app mostra "Descanso terminado" ao reabrir, sem tocar o alarme.)
- O que acontece se o usuário encerrar o descanso manualmente (botão **Encerrar**) antes do tempo zerar? (Resposta: não é término natural — nenhum som, igual à vibração hoje.)
- O que acontece se um novo descanso for iniciado (ex.: marcar outro exercício) enquanto o som do término anterior ainda estiver tocando? (Resposta: o som anterior é interrompido; o novo ciclo de contagem começa normalmente e só soa quando ele próprio terminar.)
- O que acontece se o aparelho estiver no modo silencioso/vibrar do sistema? O som não toca (respeita o modo silencioso, ver FR-006); a vibração e o texto "Descanso terminado" continuam avisando normalmente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE reproduzir um som de alarme uma única vez quando o cronômetro de descanso chegar naturalmente a zero (transição para `FINISHED`) com o app em primeiro plano — no mesmo instante em que hoje dispara a vibração.
- **FR-002**: O sistema DEVE tocar o som apenas quando a mudança para `FINISHED` for detectada com o app ativo, nunca retroativamente ao reabrir o app após término em segundo plano (mesma regra da vibração existente).
- **FR-003**: O sistema NÃO DEVE tocar som quando o descanso for interrompido manualmente (**Encerrar**) antes de chegar a zero.
- **FR-004**: O sistema DEVE parar imediatamente qualquer som de término em andamento se um novo descanso for iniciado (nova marcação de exercício) antes do som terminar por conta própria.
- **FR-005**: O sistema NÃO DEVE introduzir nenhuma configuração nova visível ao usuário: o som fica sempre atrelado ao mesmo interruptor "cronômetro de descanso" (ativar/desativar) já existente na spec 011 — quando o cronômetro está desativado, não há contagem e, portanto, não há som.
- **FR-006**: O sistema DEVE respeitar o modo silencioso/vibrar do aparelho: quando o aparelho estiver nesse modo, o som NÃO DEVE tocar (comportamento de notificação comum), mantendo apenas a vibração e o aviso visual "Descanso terminado" já existentes.
- **FR-007**: O sistema NÃO DEVE exigir nenhuma nova permissão do usuário (mantém a garantia de "nenhuma permissão desnecessária" do produto).
- **FR-008**: O sistema NÃO DEVE alterar sequência, sessão, pesos, marcações ou qualquer outro dado por causa do som (o som é só um aviso, igual à vibração e ao texto "Descanso terminado" já existentes).

### Key Entities

Nenhuma entidade nova. Reaproveita o estado do cronômetro de descanso (`RestTimerState`, em memória) já definido pela spec 011; o som é apenas um efeito colateral do mesmo evento (`justFinished`) que hoje dispara a vibração.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Com o app em primeiro plano, 100% dos términos naturais do descanso disparam o som de alarme junto com a vibração já existente.
- **SC-002**: Com o app em segundo plano durante o término, 0% dos casos disparam som (mantém a garantia já validada para a vibração pela spec 011).
- **SC-003**: Encerrar o descanso manualmente nunca dispara o som (0% dos casos em teste).
- **SC-004**: Com o aparelho no modo silencioso, 100% dos términos naturais permanecem sem som (mantendo só vibração e o aviso visual), sem regressão do comportamento silencioso hoje esperado do sistema.

## Assumptions

- O som é um efeito sonoro curto (alarme/beep), não uma trilha longa; sua duração e volume ficam a critério da implementação, desde que perceptível em ambiente de academia.
- Não há necessidade de uma configuração separada para "som" vs. "vibração": ambos os avisos de término continuam controlados pelo único interruptor "cronômetro de descanso" já existente (RF-19 da spec 011). Se o usuário não quiser o som, a alternativa hoje é desativar o cronômetro por completo — não há, nesta feature, um controle fino adicional.
- FR-006 (resolvido em Clarifications): o som se comporta como uma notificação comum e respeita o modo silencioso/vibrar do aparelho — quem quer o aviso sonoro em qualquer condição já tem a vibração e o texto "Descanso terminado" hoje; o som é um reforço adicional, não uma garantia independente deles.
- A introdução de uma nova biblioteca de reprodução de áudio (sem novas permissões) é uma decisão técnica a ser detalhada no plano de implementação, não nesta especificação.
