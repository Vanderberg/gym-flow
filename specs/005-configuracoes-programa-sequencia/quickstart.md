# Quickstart: Configurações de Programa e Sequência

Pré-requisito: specs 001–004 implementadas.

1. Unitário: `npm test -- tests/unit/domain/sequence/agendaView` (agenda vazia, Monstro com sábado/domingo opcionais, dia sem linha, treino inativo).
2. Integração (BL-102, BL-103): `npm test -- tests/integration/application` — trocar programa e voltar preserva sessões e posições; trocar tipo preserva tudo; bloqueio com sessão em andamento; descartar libera; persistência após "reabrir" (nova conexão ao mesmo banco).
3. UI (RNTL): `npm test -- tests/ui/settings` — fluxos de programa, tipo, agenda (com e sem agenda) e reiniciar (confirmar/cancelar, linha oculta em semanal).
4. Manual (Android e iOS): Configurações → Treino Monstro (2 toques) → Dias da semana → abrir agenda; voltar ao Treino Padrão e conferir estado vazio; criar uma sessão em andamento (helper de teste ou script de seed, já que `StartWorkout` é da spec 006), tentar trocar de programa e conferir o bloqueio.
5. Lint e tipos sem erros.
