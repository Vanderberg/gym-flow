# Quickstart: Alarme Sonoro do Cronômetro de Descanso

Pré-requisito: spec 011 (cronômetro de descanso) implementada.

1. Instalar dependência: `npx expo install expo-audio` (garante a versão compatível com o SDK do
   projeto).
2. Unitários/UI (RNTL): `npm test -- tests/ui/restTimer/restTimerProvider.test.tsx` — som toca uma
   vez ao terminar com o app em primeiro plano (junto da vibração); não toca se o término ocorreu
   em segundo plano; não toca ao **Encerrar** manualmente antes de zerar; para o som anterior se um
   novo descanso começar antes dele terminar de tocar.
3. Manual (Android e iOS):
   - Com o aparelho no volume normal (não silencioso): iniciar um descanso curto e confirmar que
     o som toca uma vez ao terminar, junto com a vibração e "Descanso terminado".
   - Colocar o aparelho no modo silencioso/vibrar do sistema: repetir o teste e confirmar que
     **nenhum som** toca (a vibração e o texto continuam aparecendo).
   - Iniciar um descanso, deixá-lo terminar, e imediatamente marcar outro exercício antes do som
     acabar: confirmar que o som anterior para e o novo ciclo funciona normalmente.
   - Colocar o app em segundo plano até o tempo esgotar, voltar ao app: confirmar que nenhum som
     retroativo toca (mesma regra já validada para a vibração na spec 011).
   - Confirmar que nenhum pedido de permissão nova aparece ao instalar/abrir o app.
4. Lint e tipos sem erros (`npm run check`).
