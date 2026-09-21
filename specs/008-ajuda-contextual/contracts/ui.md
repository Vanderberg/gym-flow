# Contrato: ajuda contextual (UI)

Direção visual: `docs/design-telas.md` §1–3 e §5.2 ("Placar de academia"); tokens de `src/constants/theme.ts`. Textos em pt-BR.

## Pontos de acesso (tela de treino, spec 007)

| Onde | Componente | Ação |
|------|------------|------|
| Cabeçalho | `HelpIcon` `?` (44 dp, `accessibilityLabel` "Legenda das técnicas") | abre `LegendSheet` |
| Cada cartão de exercício | `InfoIcon` `ⓘ` (44 dp, `accessibilityLabel` "Informações do exercício") | abre `MuscleInfoSheet` daquele exercício |
| Ao lado do `TechniqueChip` (só no cartão expandido, onde o chip existe) | `?` pequeno, **só** se `findLegendEntry(technique)` existir | abre `LegendSheet` já rolada até aquele termo |

A ajuda nunca é exibida permanentemente; abre sob demanda com 1 toque e a tela de fundo não muda (SC-001).

## LegendSheet (`?`)

Folha inferior (raio `lg`) com lista rolável de termos: título em `title` e descrição em `body`, na ordem de
`TECHNIQUE_LEGEND`. Com termo inicial, rola até a entrada e a destaca (sem depender só de cor). Fecha por toque no fundo,
botão **Fechar** ou voltar do Android.

## MuscleInfoSheet (`ⓘ`)

```text
SUPINO RETO
MÚSCULO PRINCIPAL      Peitoral maior
MÚSCULOS SECUNDÁRIOS   Tríceps · Deltoide anterior
DESCRIÇÃO
Exercício de empurrar que enfatiza a musculatura do peito…
```

Sempre preenchida para todo exercício do seed; "Não informado" só como rede de segurança. Fecha como a legenda.

## Comportamento

- Abrir e fechar **não** altera exercício, peso, sequência, cronômetro nem sessão; o estado do cartão (expandido, valor digitado) é mantido.
- **Rascunho de peso**: com um valor digitado e não salvo, abrir a ajuda não grava nada; o valor continua no campo. Ao fechar, o foco volta ao campo que estava em edição, e o salvamento segue as regras da 007 (perda de foco fora da ajuda, FEITO ou finalizar).
- **Eventos**: o `?`/`ⓘ` marca a abertura no `onPressIn` e a desmarca no `onPressOut`/cancelamento se nenhuma folha abriu; o salvamento por perda de foco é adiado por um tick e cancelado durante a abertura; a lista usa `keyboardShouldPersistTaps="handled"`.
- Com o cronômetro ativo (spec 011), abrir a ajuda não o pausa nem o reinicia.
- Acessibilidade: a folha é modal (`accessibilityViewIsModal`), com foco no título ao abrir; alvos ≥ 44 dp nos ícones; termo destacado também por marcador não colorido.
