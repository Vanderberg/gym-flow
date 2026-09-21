# Feature Specification: Cronômetro de Descanso

**Feature Branch**: `011-cronometro-descanso`
**Created**: 2026-09-19
**Status**: Draft
**Backlog**: BL-043, BL-090, BL-091, BL-092 (Sprint 7) — P1
**Requisitos de produto**: RF-19
**Depende de**: 007
**Input**: User description: "Cronômetro opcional de descanso configurável durante o treino."

## Clarifications

### Session 2026-09-21

- Q: Quando o cronômetro começa a contar? → A: Com o cronômetro ativo, marcar um exercício como feito inicia a contagem regressiva (se já estiver contando, reinicia a partir da duração configurada); a barra tem Pausar/Retomar e Encerrar, e um botão Iniciar aparece quando não há contagem em curso (1 toque).
- Q: O ícone ⏱ do cabeçalho da tela de treino altera a configuração persistida ou só a sessão? → A: Liga/desliga a mesma configuração persistida de Configurações (`rest_timer_enabled`); vale também nas próximas sessões.
- Q: Como o fim do descanso é sinalizado (inclusive em segundo plano)? → A: Com o app aberto: vibração curta e aviso visual ao terminar. Em segundo plano: nenhum alerta; ao voltar ao app, a barra mostra "Descanso terminado" (tempo calculado pelo horário de término). O estado do cronômetro é só de memória: se o app for fechado à força, a contagem some.
- Q: Quais os limites da duração do descanso? → A: Segundos inteiros de 5 a 3600 (5 s a 60 min); fora disso, "Informe um tempo entre 00:05 e 60:00" e nada é salvo; a tela mostra e aceita o valor em mm:ss (padrão 90 s = 01:30).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configurar cronômetro (Priority: P1)

Como usuário, quero ativar/desativar o cronômetro e definir a duração do descanso.

**Why this priority**: Base para usar o cronômetro; opcional no MVP.

**Independent Test**: Alterar configuração e reabrir o app.

**Acceptance Scenarios**:

1. **Given** Configurações, **When** ativo e defino 90 s, **Then** a escolha persiste.
2. **Given** duração fora do intervalo de 5 a 3600 segundos (0, negativa, menor que 00:05 ou maior que 60:00), **When** salvo, **Then** é rejeitada com "Informe um tempo entre 00:05 e 60:00" e nada é salvo; o valor é exibido e digitado em mm:ss (padrão 90 s = 01:30).

---

### User Story 2 - Usar durante o treino (Priority: P1)

Como usuário, quero iniciar, pausar e encerrar o descanso durante o treino.

**Why this priority**: Entrega o valor do recurso.

**Independent Test**: Iniciar, pausar, retomar e encerrar em um treino.

**Acceptance Scenarios**:

1. **Given** cronômetro ativo e treino em andamento, **When** marco um exercício como feito, **Then** a contagem regressiva começa a partir da duração configurada; se já estava contando, reinicia da duração cheia.
2. **Given** contagem, **When** pauso e retomo, **Then** continua de onde parou.
3. **Given** término da contagem com o app aberto, **When** o tempo chega a zero, **Then** o cronômetro para, o aparelho vibra brevemente e a barra mostra "Descanso terminado"; ao encerrar manualmente, o cronômetro só para (sem vibração).
4. **Given** cronômetro desativado, **When** vejo o treino, **Then** nenhum controle de contagem aparece (só o ícone ⏱ do cabeçalho, para reativá-lo).
5. **Given** cronômetro ativo sem contagem em curso, **When** toco em Iniciar, **Then** a contagem começa (1 toque) sem marcar nenhum exercício.
6. **Given** treino em andamento, **When** toco no ⏱ do cabeçalho, **Then** o cronômetro é ativado ou desativado na configuração persistida (o mesmo valor de Configurações); desativar durante uma contagem a encerra.
7. **Given** contagem em curso e app em segundo plano, **When** volto ao app depois do horário de término, **Then** a barra mostra "Descanso terminado" (sem alerta enquanto estava em segundo plano); voltando antes, o tempo restante está correto (erro < 1 s).
8. **Given** contagem em curso, **When** o app é fechado à força e reaberto, **Then** não há contagem em curso (o estado não é persistido).
9. **Given** contagem em curso, **When** volto à Home e o tempo termina com o app aberto, **Then** o aparelho vibra e, ao voltar à tela de treino, a barra mostra "Descanso terminado".

### Edge Cases

- App em segundo plano com contagem: tempo restante correto ao voltar.
- Cronômetro não altera marcações, pesos ou sequência.
- Contagem em curso e o usuário sai da tela de treino (o treino continua em andamento): a contagem segue; ao terminar com o app aberto, o aparelho vibra mesmo em outra tela, e ao voltar ao treino a barra mostra "Descanso terminado". Finalizar o treino encerra a contagem.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O usuário MUST poder ativar/desativar o cronômetro e configurar a duração (segundos inteiros de 5 a 3600, exibida em mm:ss), com persistência, em Configurações e pelo ícone ⏱ do cabeçalho da tela de treino (que altera a mesma configuração persistida).
- **FR-002**: Durante o treino, o usuário MUST poder iniciar (por um botão Iniciar), pausar, retomar e encerrar a contagem; com o cronômetro ativo, marcar um exercício como feito MUST iniciar a contagem (reiniciando-a se já estiver em curso). Desmarcar um exercício não inicia nem altera a contagem.
- **FR-003**: Ao terminar a contagem com o app aberto (em qualquer tela), o app MUST sinalizar o fim com vibração curta e aviso visual ("Descanso terminado"); em segundo plano não há alerta nem notificação (sem permissões extras), e ao voltar o app MUST mostrar o estado correto. O estado do cronômetro é só de memória, calculado pelo horário de término.
- **FR-004**: O cronômetro MUST NOT afetar dados da sessão nem a sequência.

### Key Entities

- **Configurações** (cronômetro ativo, duração).

## Success Criteria *(mandatory)*

- **SC-001**: Iniciar o descanso leva 1 toque.
- **SC-002**: Erro de contagem inferior a 1 segundo após 5 minutos, inclusive com app em segundo plano.

## Assumptions

- Sinalização do fim: vibração curta e aviso visual, sem exigir permissões extras nem notificações locais; o detalhe da vibração fica para o plano.
- Duração única global, sem valor por exercício.
