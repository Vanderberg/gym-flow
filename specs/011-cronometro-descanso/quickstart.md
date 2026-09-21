# Quickstart: Cronômetro de Descanso

Pré-requisito: specs 001–010 implementadas.

1. Unitários: `npm test -- tests/unit/domain/restTimer tests/unit/store/restTimerStore tests/unit/hooks/useRestTimer` — transições `IDLE/RUNNING/PAUSED/FINISHED`; pausar e retomar continua de onde parou; reiniciar ao marcar de novo; relógio simulado avançando 5 minutos (erro < 1 s), inclusive com o app "em segundo plano" (sem ticks); `justFinished` só até 1,5 s do término (voltar de segundo plano não vibra); `parseDurationInput` ("01:30", "1:30", "90", "00:04", "60:01", vazio); `formatMmSs`.
2. Integração: `npm test -- tests/integration/application/restTimerSettings` — ativar/desativar e duração persistem em nova conexão; duração fora de 5–3600 lança `ValidationError` sem gravar; só `rest_timer_enabled`/`rest_timer_seconds` mudam.
3. UI (RNTL): `npm test -- tests/ui/restTimer` — barra (parado → Iniciar; contando; pausado; terminado); ⏱ alterna a configuração; Configurações (switch, sheet mm:ss, erro); marcar exercício inicia a contagem e desmarcar não; nenhum caso de uso de sessão é chamado; abrir e fechar a ajuda não pausa nem reinicia.
4. Manual (Android e iOS): ativar o cronômetro, marcar um exercício, conferir a contagem; pausar e retomar; deixar terminar com o app aberto (vibração e "Descanso terminado"); colocar o app em segundo plano, voltar antes e depois do término; fechar o app à força (a contagem some); conferir que o manifesto do Android contém `VIBRATE` e que nenhum pedido de permissão aparece.
5. Lint e tipos sem erros.

## Verificação da vibração (T019)

A permissão normal `VIBRATE` do Android é incluída pelo prebuild do Expo e não exige pedido em tempo de execução; o iOS não exige nada. `Vibration` do React Native é usado sem dependência nova.
