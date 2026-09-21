# Contrato: cronômetro de descanso (UI)

Direção visual: `docs/design-telas.md` §1–3, §5.3 e §8 ("Placar de academia"); tokens de `src/constants/theme.ts`; tempo em `numeric`
(Barlow Condensed 600). Textos em pt-BR.

## Configurações (`/(tabs)/settings`, spec 005)

Seção "DESCANSO":

```text
DESCANSO
 Cronômetro de descanso        [ Switch ]
 Tempo de descanso             01:30  ›     (desabilitado se o cronômetro está desativado)
```

- O switch chama `SetRestTimerEnabled`; ao tocar em "Tempo de descanso" abre `RestDurationSheet` com campo mm:ss (teclado numérico), valor atual e **Salvar**.
- Fora de 00:05–60:00: "Informe um tempo entre 00:05 e 60:00" ligada ao campo; nada é salvo. Persiste ao reabrir o app.

## Tela de treino (`/workout`, spec 007)

- **Cabeçalho**: ícone ⏱ (`RestTimerToggle`, 44 dp) sempre presente; alterna a mesma configuração persistida; estado ativado/desativado com ícone e `accessibilityState` (não só cor). Desativar durante a contagem a encerra.
- **Barra** (`RestTimerBar`, acima da barra FINALIZAR; só com o cronômetro ativo):
  - parado: botão **Iniciar descanso** (1 toque);
  - contando: tempo `mm:ss` em `numeric`, **Pausar** e **Encerrar**;
  - pausado: tempo `mm:ss`, **Retomar** e **Encerrar**;
  - terminado: "Descanso terminado" (ícone e texto) e **OK** (dispensa).
- **Início**: com o cronômetro ativo, marcar um exercício como feito inicia a contagem (reinicia se já em curso); desmarcar não faz nada. Ignorável: não bloqueia marcar, digitar peso nem finalizar.
- **Fim com o app aberto**: vibração curta (400 ms) e "Descanso terminado". **Em segundo plano**: sem alerta; ao voltar, a barra mostra o estado correto ("Descanso terminado" se já passou, sem vibrar; ou o tempo restante, com erro < 1 s).
- **Fora da tela de treino**: a contagem segue (o ticker roda no nível do app); ao terminar com o app aberto o aparelho vibra em qualquer tela, e ao voltar ao treino a barra mostra "Descanso terminado".
- Fechar o app à força apaga a contagem (não é persistida). Finalizar o treino encerra e limpa o cronômetro.
- Abrir/fechar as folhas de ajuda (`?`/`ⓘ`) não pausa nem reinicia a contagem.
- Nada do cronômetro altera marcações, pesos, sequência nem sessão.

## Acessibilidade

A barra anuncia só o início e o fim ("Descanso iniciado", "Descanso terminado"), nunca cada segundo: `accessibilityLiveRegion="polite"` no Android e `AccessibilityInfo.announceForAccessibility` no iOS; botões ≥ 48 dp com rótulos ("Pausar descanso", "Retomar descanso", "Encerrar descanso", "Iniciar descanso"); o estado "terminado" nunca depende só de cor.
