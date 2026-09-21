# Research: Configurações de Programa e Sequência

## D1 — Bloqueio da troca de programa no caso de uso
- **Decision**: `SelectProgram.execute(programId)` consulta `SessionRepository.getInProgress()`; se existir sessão e o programa alvo for diferente do ativo, lança `SessionInProgressError` (com `sessionId`, `programId`, `workoutName`). Escolher o programa que já é o ativo é no-op mesmo com sessão em andamento.
- **Rationale**: clarificação 1; a regra não pode depender da UI (constituição II). A UI captura o erro e abre `InProgressBlockSheet`.
- **Alternatives**: desabilitar a opção só na UI (regra vaza para a apresentação; teste de integração impossível).

## D2 — Descartar libera a troca, sem trocar sozinho
- **Decision**: o sheet oferece **Continuar** (navega para `/workout`) e **Descartar** (confirmação → `SessionRepository.discardSession`). Após descartar, a tela permanece e o usuário toca de novo no programa desejado.
- **Rationale**: spec: "descartar libera a troca"; evita trocar programa como efeito colateral de uma confirmação de descarte. Descartar não altera sequência nem estatísticas (002).
- **Alternatives**: descartar e trocar em um passo (efeito duplo numa confirmação só).

## D3 — Tipo de sequência sem bloqueio e sem tocar em estado
- **Decision**: `SelectSequenceStrategy.execute(type)` valida o tipo e faz uma escrita em `app_settings`; não lê sessões nem escreve em `program_sequence_state`.
- **Rationale**: clarificação 2 e SC-002.

## D4 — Agenda somente leitura via função pura
- **Decision**: `buildAgendaView(schedule, workouts)` devolve `{ kind: 'NO_SCHEDULE' }` para agenda vazia, ou `{ kind: 'DAYS', days }` com 7 linhas SEG→DOM, cada uma `WORKOUT` (nome do treino), `REST` ou `OPTIONAL` (com `note`). Dia sem linha em agenda existente = `REST`. `GetProgramAgenda(programId)` carrega os dados e chama a função.
- **Rationale**: clarificações 3 e 4; mesmas regras semânticas da estratégia semanal (004) sem duplicar a decisão de "próximo treino": aqui só se exibe.
- **Alternatives**: reutilizar `WeeklyScheduleSequenceStrategy` 7 vezes com datas fictícias (acopla exibição a datas).

## D5 — Reiniciar sempre do programa ativo
- **Decision**: a tela chama `ResetSequence.execute(activeProgramId)` (004) após confirmação com o nome do programa; a linha só aparece com `sequenceType = CONTINUOUS`. Cancelar não escreve nada.
- **Rationale**: clarificação 5; reutiliza a validação da 004 (`ValidationError` em `WEEKLY`).

## D6 — Estado de UI
- **Decision**: `settingsStore` (Zustand) guarda `settings` e o resumo da sessão em andamento; `reload()` lê do SQLite depois de cada escrita e ao abrir a aba. O store nunca é a fonte de verdade.
- **Rationale**: constituição I; SC-003 (a escolha sobrevive ao reabrir, pois vem do banco).

## D7 — "Continuar" e dependência de rota
- **Decision**: "Continuar" faz `router.push('/workout')`. A tela `workout` é da Sprint 4; até lá o teste RNTL verifica apenas a chamada de navegação (mock do router).
- **Rationale**: evita acoplar esta spec à tela de treino.

## D8 — Escopo do cronômetro
- **Decision**: a linha de cronômetro (BL-043, P1) não entra nesta spec; a tela mostra só Programa, Tipo de sequência, Agenda (só `WEEKLY`) e Reiniciar (só `CONTINUOUS`).
- **Rationale**: fora do escopo declarado (BL-033, 040–042, 102–103).
