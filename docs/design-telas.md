# Design de Telas — App de Controle de Treinos

Complementa `docs/telas.md` (estrutura e fluxos) com a direção visual, tokens e
definição detalhada de cada tela. Em caso de conflito de comportamento, vale
`docs/PRD.md`.

------------------------------------------------------------------------

# 1. Direção visual: "Placar de academia"

**Tarefa principal do app:** registrar o que foi feito em poucos toques, no meio
do treino, com pouca atenção e às vezes mãos suadas.

**Personalidade:** atlética, direta, sem enfeite. Escuro por padrão (academia com
pouca luz, tela grande acesa por muito tempo), alto contraste, um único acento.
Lembra um placar: números grandes e condensados, informação em blocos.

**Decisões que sustentam a direção:**

- **Tipografia condensada** para títulos e números (peso e carga são o dado mais
  importante da tela); texto corrido em grotesca humanista legível.
- **Um único acento** (verde-limão) reservado para: ação principal, item feito,
  item ativo. Tudo o mais é neutro. Assim o olho acha o "próximo toque" sem ler.
- **Sequência 1–5 é uma sequência real**, então aparece como trilho de 5 passos
  (não como decoração). O dia atual é o único preenchido.
- **Progresso segmentado** (um segmento por exercício) em vez de barra contínua:
  cada exercício é um toque, e o segmento mostra qual falta.
- **Alvos grandes**: controles frequentes com no mínimo 48 dp.

**Fora da direção (evitar):** gradiente roxo, Inter/Roboto/Arial como fonte
principal, cards genéricos iguais sem hierarquia, números decorativos sem
significado, confetes/gamificação (o app não é coach nem rede social).

------------------------------------------------------------------------

# 2. Tokens

Implementar em `src/constants/theme.ts` (única fonte; nenhum valor solto nos
componentes). Estilização com `StyleSheet` do React Native.

## 2.1 Cor (tema escuro — MVP)

| Token               | Valor     | Uso                                        | Contraste |
| ------------------- | --------- | ------------------------------------------ | --------- |
| `bg`                | `#0E0F0C` | fundo das telas                            | —         |
| `surface`           | `#181A15` | cartões                                    | —         |
| `surfaceRaised`     | `#22251D` | cartão selecionado, sheets, input          | —         |
| `border`            | `#2E3227` | divisores, contorno de cartão              | 3:1 em UI |
| `text`              | `#F2F4EA` | texto principal                            | ~16:1     |
| `textSecondary`     | `#A9AD9A` | rótulos, metadados                         | ~8:1      |
| `textMuted`         | `#7C8070` | somente texto grande ou decorativo         | ~4.6:1    |
| `accent`            | `#C6F24E` | ação principal, feito, ativo               | ~15:1     |
| `onAccent`          | `#0E0F0C` | texto/ícone sobre `accent`                 | ~15:1     |
| `danger`            | `#FF6B5E` | descartar, erro                            | ~7:1      |
| `focus`             | `#F2F4EA` | anel de foco (2 dp, offset 2 dp)           | —         |

Regras: estado nunca só por cor (sempre ícone e/ou texto: ✓ "Feito", ○ "Pendente").
Tema claro fica no backlog futuro; manter tudo via tokens para permitir depois.

## 2.2 Tipografia

Carregar via `expo-font` (pacotes `@expo-google-fonts/*`, offline após bundle).

| Papel          | Fonte                      | Tamanho/linha | Uso                              |
| -------------- | -------------------------- | ------------- | -------------------------------- |
| `display`      | Barlow Condensed 700       | 56/56         | "DIA 3", números de estatística  |
| `title`        | Barlow Condensed 700       | 28/32         | títulos de tela, nome do treino  |
| `numeric`      | Barlow Condensed 600       | 40/44         | carga (kg), cronômetro           |
| `body`         | Barlow 500                 | 16/22         | texto, listas                    |
| `label`        | Barlow 600, caixa alta     | 12/16, +0,8   | rótulos ("ÚLTIMA CARGA")         |

Números com algarismos tabulares; respeitar tamanho de fonte do sistema (sem
desabilitar `allowFontScaling`; layouts devem quebrar linha, não cortar).

## 2.3 Espaçamento, forma e movimento

- Escala de espaçamento: 4 · 8 · 12 · 16 · 24 · 32 (margem lateral de tela: 16).
- Raio: `sm` 8 (chips, inputs), `md` 14 (cartões), `lg` 24 (sheets). Botão primário
  `md`, altura 56.
- Elevação: sem sombras; separação por `surface` vs `bg` e `border`.
- Movimento: 120–180 ms, `ease-out`. Marcar exercício: segmento de progresso
  preenche + ícone ✓ aparece. Com "reduzir movimento" ativo, trocar por mudança
  instantânea. Nenhum estado depende de animação.
- Feedback tátil leve (`expo-haptics`) ao marcar/desmarcar e finalizar.

------------------------------------------------------------------------

# 3. Componentes base

Extensões de um conjunto mínimo em `src/components/common/` (não criar
variações paralelas):

- **Button** — `primary` (fundo `accent`), `secondary` (contorno `border`),
  `danger` (texto `danger`, contorno), `ghost`. Altura 56 (primário) / 48.
  Estados: default, pressed (escurece 8%), disabled (opacidade 40% + texto
  explicando o motivo quando relevante), loading (spinner + `accessibilityState.busy`).
- **Card** — `surface`, raio `md`, padding 16, contorno `border` 1 dp.
- **SequenceRail** — 5 passos ligados por linha; passo atual preenchido com
  `accent` e número; anteriores com ✓ discreto só quando a sequência já rodou
  neste ciclo; demais vazios. Cada passo tem `accessibilityLabel` ("Dia 3, Perna
  Completo, próximo treino").
- **SegmentedProgress** — N segmentos (um por exercício); feitos em `accent`.
  Acompanha texto "4 / 6 realizados" (nunca só a barra).
- **ExerciseCard** — ver seção 5.
- **WeightInput** — campo numérico grande com teclado decimal, sufixo "kg",
  botões `−` / `+` de 2,5 kg (apenas ajuda de digitação, não sugestão).
- **StatCard** — número em `display`, rótulo em `label`, sem gradiente.
- **BottomTabs** — 4 abas: Treino, Histórico, Estatísticas, Config. Aba ativa:
  ícone preenchido + rótulo em `text` + indicador superior de 3 dp em `accent`;
  inativas: ícone contornado + rótulo `textSecondary`. Altura 64 + safe area.
- **Sheet / ConfirmDialog** — sheet inferior (raio `lg`) para confirmações;
  ação destrutiva nunca é a ação primária padrão.
- **EmptyState** — ícone simples, título curto, uma frase, uma ação útil.

Ícones: um único conjunto (`@expo/vector-icons`, Lucide/Feather-like), traço 2 dp.

------------------------------------------------------------------------

# 4. Home

**Objetivo:** mostrar imediatamente o próximo treino e permitir começar.
**Ação primária:** COMEÇAR TREINO (ou CONTINUAR TREINO).

```text
┌───────────────────────────────┐
│ MEU TREINO                    │  título (Config fica na aba inferior)
│                               │
│  ①──②──●3──④──⑤              │  SequenceRail (dia 3 é o próximo)
│                               │
│ ┌───────────────────────────┐ │
│ │ PRÓXIMO TREINO            │ │  label
│ │ DIA 3                     │ │  display 56
│ │ Perna Completo            │ │  title
│ │ 6 exercícios              │ │  body secundário
│ │                           │ │
│ │ [   COMEÇAR TREINO   ]    │ │  primary, 56 dp, largura total
│ └───────────────────────────┘ │
│                               │
│ ┌────────────┐ ┌────────────┐ │
│ │ ÚLTIMO     │ │ ESTE MÊS   │ │  2 StatCards
│ │ Dia 2·16/09│ │ 8 treinos  │ │
│ └────────────┘ └────────────┘ │
│                               │
│   Reiniciar sequência         │  ghost, discreto, no rodapé
├───────────────────────────────┤
│ Treino  Histórico  Stats  Cfg │
└───────────────────────────────┘
```

**Estados:**

- *Carregando* (leitura do SQLite): esqueleto do cartão principal com a mesma
  altura, sem salto de layout.
- *Treino em andamento:* o cartão troca o rótulo para "TREINO EM ANDAMENTO",
  mostra "4 / 6 realizados" e o botão vira **CONTINUAR TREINO**; ao abrir o app
  com sessão pendente, exibir diálogo "Existe um treino em andamento. Deseja
  continuar?" com **Continuar** (primário) e **Descartar sessão** (danger,
  com segunda confirmação).
- *Primeiro uso / sem histórico:* "ÚLTIMO" mostra "Ainda não há treinos" e
  "ESTE MÊS" mostra 0; nada quebrado.
- *Erro de banco:* cartão com mensagem "Não foi possível carregar seus treinos"
  e botão **Tentar de novo**.
- *Reiniciar sequência:* sheet "Reiniciar sequência? O próximo treino volta a
  ser o Dia 1. Seu histórico é mantido." → **Cancelar** / **Reiniciar**.
- Nome de treino longo: até 2 linhas, sem cortar o botão.

------------------------------------------------------------------------

# 5. Tela de treino

**Objetivo:** registrar rápido o que foi feito, em qualquer ordem.
**Ações:** marcar exercício (frequente), FINALIZAR TREINO (primária no fim).

```text
┌───────────────────────────────┐
│ ‹  DIA 3                 ⏱   │  voltar mantém sessão; ⏱ abre descanso
│    Perna Completo             │
│ ▰▰▰▰▱▱   4 / 6 realizados     │  SegmentedProgress + texto
├───────────────────────────────┤
│ ┌───────────────────────────┐ │
│ │ ✓ Agachamento Hack        │ │  feito: borda accent, ícone ✓,
│ │   3 × 10–12 · 100 kg      │ │  resumo em uma linha, colapsado
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ ○ Cadeira extensora       │ │  pendente e expandido
│ │   3 × 10–12               │ │
│ │ ÚLTIMA CARGA  45 kg       │ │  referência histórica (label)
│ │ CARGA                     │ │
│ │ [ − ]   [  45  ] kg  [ + ]│ │  WeightInput
│ │ [ Usar 45 kg ]            │ │  chip opcional: preenche a última carga
│ │              [ ✓ FEITO ]  │ │  botão 56 dp
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ ○ Adutora   3 × 10–12     │ │  pendente colapsado (toque expande)
│ └───────────────────────────┘ │
│           …                   │
├───────────────────────────────┤
│ [    FINALIZAR TREINO    ]    │  barra fixa inferior, sempre habilitada
└───────────────────────────────┘
```

**Comportamento:**

- Exercícios na ordem padrão (`display_order`) mas **qualquer um** pode ser
  expandido e marcado; nenhum bloqueio ou ordem forçada. Vários podem ficar
  expandidos; o último tocado fica em foco.
- Tocar em ✓ FEITO marca; tocar no cartão feito reabre para editar ou
  **desmarcar** (ação "Desmarcar" explícita no cartão expandido).
- Carga não é obrigatória para marcar como feito (`weight` pode ser nulo).
- "Última carga" é só referência; o app **não** sugere aumentar/diminuir. O chip
  "Usar X kg" é um atalho de digitação e nunca vem preenchido sozinho.
- Cada alteração persiste imediatamente (sessão recuperável, RF-13).
- Botão FINALIZAR sempre ativo (mesmo com 0 feitos).

**Finalização (sheet de confirmação):**

```text
Finalizar treino?
4 de 6 exercícios realizados.
(2 pendentes serão registrados como não realizados)
[ CANCELAR ]   [ FINALIZAR ]
```

Depois: tela de resumo com o treino concluído, "4 de 6 exercícios realizados",
duração e **Próximo: DIA 4 — Ombro Isolado**, botão **Voltar ao início**.
Sem confete ou parabéns exagerados.

**Cronômetro de descanso (P1, só se habilitado):** ao marcar um exercício, aparece
uma barra de descanso acima do botão Finalizar: tempo grande em `numeric`
(`01:30`), **Pausar** e **Encerrar**. É ignorável, não bloqueia nada e não tem
som obrigatório. Anunciar término por vibração e texto ("Descanso encerrado").

**Estados:**

- *Sem exercícios ativos no treino:* EmptyState "Este treino não tem exercícios"
  (finalizar continua permitido).
- *Erro ao salvar carga/marcação:* aviso inline no cartão ("Não foi possível
  salvar") com **Tentar de novo**; o valor digitado não é perdido.
- *Nome longo de exercício:* quebra em 2 linhas; o resumo "3 × 10–12 · 100 kg"
  vai para a linha de baixo.
- *Teclado aberto:* a lista rola para manter o campo visível; a barra
  FINALIZAR esconde enquanto digita.
- *Valor inválido de carga:* negativo/texto → mensagem "Informe um valor maior
  ou igual a 0" ligada ao campo.

------------------------------------------------------------------------

# 6. Histórico

**Objetivo:** consultar sessões finalizadas, mais recentes primeiro.

```text
┌───────────────────────────────┐
│ HISTÓRICO                     │
│                               │
│ SETEMBRO 2026                 │  cabeçalho de mês (label, sticky)
│ ┌───────────────────────────┐ │
│ │ 19  Dia 1 · Peito e Trí.. │ │  data em display pequeno à esquerda
│ │ SET 5 / 6 realizados · 52m│ │  duração só se disponível
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ 16  Dia 5 · Bíceps e Trí..│ │
│ │ SET 6 / 6 realizados      │ │
│ └───────────────────────────┘ │
├───────────────────────────────┤
```

- Item inteiro é um botão (toque abre detalhes), altura mínima 72.
- Sessão 6/6 mostra ✓ ao lado do texto; parcial mostra só a contagem.
- *Vazio:* ícone + "Ainda não existem treinos registrados." + botão
  **Ir para o treino**.
- *Carregando:* 4 esqueletos de item. *Erro:* mensagem + **Tentar de novo**.
- Listas longas com `FlatList` (paginação/virtualização).

## 6.1 Detalhe da sessão

```text
‹  DIA 1 — PEITO E TRÍCEPS
   19/09/2026 · 5 / 6 realizados

 ✓ Supino               80 kg
 ✓ Supino inclinado     70 kg
 ○ Fly                  não realizado
 ✓ Tríceps corda        40 kg
 ✓ Tríceps francês      30 kg
 ✓ Tríceps testa        25 kg
                              [ EDITAR ]
```

Feito = ✓ + texto do peso; não realizado = ○ + o texto "não realizado" (nunca só
cinza). Sem peso informado mostra "sem carga".

## 6.2 Edição

Mesmo layout com linhas editáveis: alternar feito/não feito e editar carga
(WeightInput). Botões **Salvar** (primário, altura 56) e **Cancelar**; cancelar
com alterações pendentes pede confirmação. Não permite trocar o dia do treino.
Salvar é transacional e não muda a sequência atual.

------------------------------------------------------------------------

# 7. Estatísticas

**Objetivo:** mostrar frequência e cadência (só isso) do período escolhido.

```text
┌───────────────────────────────┐
│ ESTATÍSTICAS                  │
│ [Semana][Mês][Trim.][Sem.][Ano]│  SegmentedControl rolável, ativo =
│ ‹  SETEMBRO 2026  ›           │  preenchido + rótulo em negrito
│                               │
│ ┌───────────────────────────┐ │
│ │ TREINOS NO PERÍODO        │ │
│ │ 17                        │ │  display
│ └───────────────────────────┘ │
│ ┌────────────┐ ┌────────────┐ │
│ │ POR SEMANA │ │ INTERVALO  │ │
│ │ 3,4        │ │ 2,0 dias   │ │
│ └────────────┘ └────────────┘ │
│                               │
│ CALENDÁRIO (mês) / DIAS (semana)
│  S  T  Q  Q  S  S  D          │
│  ●     ●        ●             │  pontos nos dias com treino
└───────────────────────────────┘
```

- Setas `‹ ›` navegam períodos anteriores; o próximo é desabilitado no período
  atual.
- **Semana:** mostra treinos e a distribuição por dia (SEG…DOM) com ponto e
  texto ("3 treinos"). **Mês/Trim./Sem./Ano:** mesmas métricas agregadas; o
  calendário de pontos aparece no mês (P1, BL-075).
- Dias com treino: ponto + `accessibilityLabel` ("dia 16, com treino").
- Intervalo médio com menos de 2 treinos: mostrar "—" com nota "precisa de ao
  menos 2 treinos".
- *Sem dados:* "Complete seu primeiro treino para começar a acompanhar sua
  frequência." + **Ir para o treino**.
- Contam só sessões finalizadas; nunca mostrar carga, peso corporal ou
  recomendação.

------------------------------------------------------------------------

# 8. Configurações

```text
CONFIGURAÇÕES

DESCANSO
 Cronômetro de descanso        [ Switch ]
 Tempo de descanso             01:30  ›     (desabilitado se cronômetro off;
                                             texto: "Ative o cronômetro")
TREINOS
 Gerenciar treinos             ›   (P2, marcado "Em breve")
 Gerenciar exercícios          ›   (P2, marcado "Em breve")

SEQUÊNCIA
 Reiniciar sequência           ›   (abre a mesma sheet da Home)
```

- Linhas de 56 dp com rótulo à esquerda e controle à direita; switch com texto
  "Ligado/Desligado" acessível.
- Tempo de descanso: seletor de minutos:segundos em sheet, passo de 5 s.
- Itens não implementados ficam visíveis porém desabilitados com "Em breve".

------------------------------------------------------------------------

# 9. Navegação e estrutura de rotas

- Abas inferiores (Expo Router `(tabs)`): `index` (Treino/Home), `history`,
  `statistics`, `settings`.
- `workout` e o detalhe/edição do histórico são telas empilhadas **sem abas**
  para maximizar espaço e evitar saída acidental; voltar do treino não descarta
  a sessão (ela fica em andamento).
- Deep link/relançamento: se há sessão em andamento, Home oferece continuar.

------------------------------------------------------------------------

# 10. Acessibilidade e responsividade

- Contraste: texto normal >= 4,5:1; texto grande e ícones/contornos >= 3:1
  (ver tabela de tokens).
- Alvos de toque: 48 dp para controles frequentes (marcar, carga, abas,
  finalizar); mínimo absoluto 44 dp.
- Todos os controles têm `accessibilityRole`, `accessibilityLabel` e
  `accessibilityState` (`checked`, `selected`, `disabled`, `busy`). Exemplo:
  "Agachamento Hack, 3 séries de 10 a 12, feito, 100 quilos".
- Foco visível em navegação por teclado/leitor de tela (anel `focus`).
- Anúncios (`AccessibilityInfo.announceForAccessibility`) ao marcar, finalizar e
  ao término do descanso.
- Fonte dinâmica do sistema respeitada; layouts quebram linha em vez de cortar.
- Larguras: 360 dp (mínimo) a tablets; em telas largas, limitar conteúdo a
  600 dp centralizado. Áreas seguras (notch/barra de gestos) respeitadas.
- Orientação: retrato prioritário; paisagem não quebra layout (rolagem).

------------------------------------------------------------------------

# 11. Decisões e pontos em aberto

- **Chip "Usar última carga":** adotado como atalho de digitação; o campo nunca
  vem pré-preenchido. Se o PRD for lido de forma mais estrita ("apenas
  referência"), remover o chip.
- **Passo de 2,5 kg nos botões −/+:** ajuda de entrada, sem sugestão de carga.
- **Só tema escuro no MVP**; tema claro fica no backlog futuro.
- **Fontes:** Barlow / Barlow Condensed (empacotadas para funcionar offline).
