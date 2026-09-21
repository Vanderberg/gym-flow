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
- **A sequência é mostrada como ela é**: na sequência contínua, um trilho com um
  passo por treino do programa (o atual é o único preenchido); nos dias da
  semana, uma faixa SEG…DOM com o treino de cada dia. Nunca como decoração.
- **Programa e tipo de sequência são configurações independentes**: o programa
  ativo aparece sempre como selo, e a sequência muda só o indicador da Home.
- **Informação essencial sempre visível; complementar sob demanda** (`?` legenda
  e `ⓘ` músculos, em bottom sheet).
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
| `display`      | Barlow Condensed 700       | 56/56         | código do treino, estatísticas   |
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

Conjunto mínimo em `src/components/common/` (não criar variações paralelas):

- **Button** — `primary` (fundo `accent`), `secondary` (contorno `border`),
  `danger` (texto `danger`, contorno), `ghost`. Altura 56 (primário) / 48.
  Estados: default, pressed (escurece 8%), disabled (opacidade 40% + texto
  explicando o motivo quando relevante), loading (spinner + `accessibilityState.busy`).
- **Card** — `surface`, raio `md`, padding 16, contorno `border` 1 dp.
- **ProgramBadge** — pílula com o nome do programa ativo (`label`, contorno
  `border`). Aparece na Home, no cabeçalho do treino e nos itens do histórico
  quando o filtro é "Todos".
- **SequenceRail** — para `CONTINUOUS`: N passos ligados por linha, N = quantidade
  de treinos do programa (5 no Padrão, 4 no Monstro). Passo atual preenchido com
  `accent`; concluídos no ciclo com ✓; demais vazios. O rótulo de cada passo é o
  código do treino (`1…5` ou `A…D`).
- **WeekStrip** — para `WEEKLY`: 7 colunas SEG…DOM; cada uma mostra o código do
  treino ("A"), "—" (descanso) ou "opc." (opcional). Hoje = preenchido com `accent`;
  dias em que houve sessão finalizada = ponto + ✓ (sem depender de cor).
- **SegmentedProgress** — N segmentos (um por exercício); feitos em `accent`.
  Acompanha texto "4 / 6 realizados" (nunca só a barra).
- **ExerciseCard** — ver seção 5.
- **PrescriptionBlock** — exibe `prescription` (em `numeric` reduzido, ex.
  "3 × 6/8/10"), `technique` como **TechniqueChip** (contorno `accent`, caixa alta,
  ex. DROP-SET) e `notes` em `body` secundário. Só exibição: nunca interpreta o
  texto. Aceita texto longo com quebra de linha.
- **HelpIcon (`?`) / InfoIcon (`ⓘ`)** — botões de 44 dp (ícone 20 dp) com
  `accessibilityLabel` "Legenda das técnicas" e "Informações do exercício".
- **LegendSheet / MuscleInfoSheet** — bottom sheets somente leitura (seção 5.2).
- **WeightInput** — campo numérico grande com teclado decimal, sufixo "kg",
  botões `−` / `+` de 2,5 kg (apenas ajuda de digitação, não sugestão).
- **StatCard** — número em `display`, rótulo em `label`, sem gradiente.
- **BottomTabs** — 4 abas: Treino, Histórico, Estatísticas, Config. Aba ativa:
  ícone preenchido + rótulo em `text` + indicador superior de 3 dp em `accent`;
  inativas: ícone contornado + rótulo `textSecondary`. Altura 64 + safe area.
- **SettingsRow** — linha de 56 dp: rótulo, valor atual e `›`; sem `onPress` vira
  linha somente leitura (sem `›`).
- **RadioCard** — opção única em cartão (círculo ● / ○ + título + descrição), usado
  nas seleções de programa e de tipo de sequência. Selecionado = borda `accent` +
  ● preenchido (não só cor).
- **FilterSelect** — botão "Todos ▼" que abre sheet com a lista (Todos + programas).
- **Sheet / ConfirmDialog** — sheet inferior (raio `lg`); ação destrutiva nunca é
  a primária padrão.
- **EmptyState** — ícone simples, título curto, uma frase, uma ação útil.

Ícones: um único conjunto (`@expo/vector-icons`, Lucide/Feather-like), traço 2 dp.

------------------------------------------------------------------------

# 4. Home

**Objetivo:** mostrar o contexto atual (programa + tipo de sequência) e o próximo
treino, e permitir começar. **Ação primária:** COMEÇAR TREINO (ou CONTINUAR TREINO).

O cartão principal é o mesmo nas duas sequências; muda só o indicador acima dele.

## 4.1 Sequência contínua (ex.: Treino Padrão)

```text
┌───────────────────────────────┐
│ MEU TREINO                    │
│ [Treino Padrão]  Sequência contínua
│                               │
│  ✓──✓──●3──④──⑤              │  SequenceRail
│                               │
│ ┌───────────────────────────┐ │
│ │ PRÓXIMO TREINO            │ │
│ │ DIA 3                     │ │  código do treino em display
│ │ Perna Completo            │ │
│ │ 6 exercícios              │ │
│ │ [   COMEÇAR TREINO   ]    │ │
│ └───────────────────────────┘ │
└───────────────────────────────┘
```

## 4.2 Dias da semana (ex.: Treino Monstro)

```text
┌───────────────────────────────┐
│ MEU TREINO                    │
│ [Treino Monstro]  Dias da semana
│                               │
│ SEG TER QUA QUI SEX SÁB DOM   │  WeekStrip (hoje = quinta)
│  A   B   —  [C]  D  opc. —    │
│                               │
│ ┌───────────────────────────┐ │
│ │ QUINTA-FEIRA              │ │  label = dia da semana local
│ │ TREINO C                  │ │
│ │ Pernas completas          │ │
│ │ 9 exercícios              │ │
│ │ [   COMEÇAR TREINO   ]    │ │
│ └───────────────────────────┘ │
└───────────────────────────────┘
```

O app **não** cria nem registra sessão sozinho: o dia programado só mostra o
treino; a sessão começa no toque em COMEÇAR.

## 4.2.1 Sugestão do programa

Se o programa define `home_suggestion` (Treino Monstro: cardio), a Home mostra um
cartão discreto "SUGESTÃO DA FICHA" abaixo do cartão principal, com o
texto da ficha (caminhada ligeira, sem correr; 30 min de manhã e 30 min à noite,
ou 1 h, longe do treino). É só texto, não tem botão, não registra nada e não
aparece em programas que não a definem.

> Componentes da Home (spec 006): `NextWorkoutCard`, `SuggestionCard`,
> `ProgramWorkoutsSheet` e `HomeSkeleton` em `src/components/home/`; `SequenceRail`,
> `WeekStrip` e `ProgramBadge` em `src/components/common/`.

## 4.3 Estados

- *Dia de descanso* (`null` na agenda): o cartão vira "QUARTA-FEIRA · DESCANSO",
  sem botão primário; ação secundária **Ver treinos do programa**.
  **Decidido (spec 006):** essa ação abre `ProgramWorkoutsSheet` para iniciar
  qualquer treino do programa mesmo assim, sem alterar a agenda.
- *Dia opcional* (sábado e domingo do Monstro): cartão "SÁBADO · OPCIONAL" (ou "DOMINGO · OPCIONAL") com o texto da
  ficha, "Opcional: abdominais supra/infra e oblíquos", e **Ver treinos do
  programa** (mesma ação). Não é um treino A–D e não gera sessão.
- *Programa sem agenda* (ex.: Treino Padrão com "Dias da semana"): cartão
  "Sem agenda configurada para este programa" + botão **Voltar para sequência contínua**
  (chama `SelectSequenceStrategy('CONTINUOUS')`; não há botão de iniciar). Nunca mostrar tela vazia.
- *Carregando* (leitura do SQLite): esqueleto do cartão principal com a mesma
  altura, sem salto de layout.
- *Treino em andamento:* o cartão troca o rótulo para "TREINO EM ANDAMENTO",
  mostra o treino, "4 / 9 realizados" e o botão vira **CONTINUAR TREINO**. Ao
  abrir o app com sessão pendente, diálogo "Você possui um treino em andamento"
  com o nome do treino, **Continuar** (primário) e **Descartar** (danger, com
  segunda confirmação). Descartar não altera a sequência.
- *Concluído hoje* (só semanal): o cartão do treino do dia mostra "✓ Concluído hoje";
  o botão continua ativo.
- *Erro de banco:* cartão "Não foi possível carregar seus treinos" + **Tentar de novo**.
- A Home não tem cartões ÚLTIMO / ESTE MÊS nem "Reiniciar sequência" (o reinício fica em Configurações).
- Nome de treino longo: até 2 linhas, sem cortar o botão.

------------------------------------------------------------------------

# 5. Tela de treino

**Objetivo:** registrar rápido o que foi feito, em qualquer ordem.
**Ações:** marcar exercício (frequente), FINALIZAR TREINO (primária no fim).

```text
┌───────────────────────────────┐
│ ‹  TREINO C            [?] ⏱ │  ? = legenda das técnicas; ⏱ = descanso
│    Pernas completas           │
│    [Treino Monstro]           │  ProgramBadge
│ ▰▰▰▰▱▱▱▱▱   4 / 9 realizados  │  SegmentedProgress + texto
├───────────────────────────────┤
│ ┌───────────────────────────┐ │
│ │ ✓ Agachamento livre/Smith ⓘ│ │  feito: borda accent, colapsado
│ │   3 × 12/10/8 · 100 kg    │ │
│ └───────────────────────────┘ │
│ ┌───────────────────────────┐ │
│ │ ○ Cadeira extensora      ⓘ│ │  pendente e expandido
│ │ 3 × 10/10/10              │ │  prescription
│ │ [DROP-SET]                │ │  technique (chip)
│ │ Pirâmide crescente        │ │  notes
│ │ ÚLTIMA CARGA  60 kg       │ │  referência histórica (mesmo programa)
│ │ [ − ]   [  60  ] kg  [ + ]│ │
│ │ [ Usar 60 kg ]            │ │
│ │              [ ✓ FEITO ]  │ │
│ └───────────────────────────┘ │
│           …                   │
├───────────────────────────────┤
│ [    FINALIZAR TREINO    ]    │  barra fixa inferior, sempre habilitada
└───────────────────────────────┘
```

Regra de UI: informação essencial (nome, prescrição, técnica, carga, estado) fica
sempre visível; complementar (legenda, músculos, descrição) só sob demanda.

**Aquecimento e bi-sets:**

- **Aquecimento é livre:** a nota do treino (`warmup_note`: "Aquecimento de manguito rotador + aquecimento livre",
  igual em todos os treinos) aparece como texto sob o cabeçalho. Não é cartão,
  não é marcável e não entra em "X / Y realizados".
- **Bi-set = dois cartões vizinhos:** cada exercício do par tem seu cartão, carga e
  marcação; ambos mostram o chip BI-SET e a observação "Bi-set com ...". Uma barra
  lateral fina em `accent` liga os dois cartões do par (sem depender de cor: o
  chip e a observação já dizem que são um par).

**Comportamento:**

- Exercícios na ordem padrão (`display_order`), mas **qualquer um** pode ser
  expandido e marcado. Nenhum bloqueio ou ordem forçada.
- Tocar em ✓ FEITO marca; tocar no cartão feito reabre para editar ou
  **desmarcar**.
- Carga não é obrigatória para marcar como feito (`weight` pode ser nulo).
- "Última carga" é só referência, buscada no **mesmo programa**; o app não sugere
  aumentar/diminuir. O chip "Usar X kg" é atalho de digitação e nunca preenche
  sozinho. Sem histórico do exercício: "Sem carga anterior".
- Cada alteração persiste imediatamente (sessão recuperável).
- FINALIZAR sempre ativo (mesmo com 0 feitos).
- Prescrições longas quebram linha; o cartão colapsado mostra só a primeira linha
  da prescrição + carga.

## 5.1 Finalização

```text
Finalizar treino?
7 de 9 exercícios realizados.
(2 pendentes serão registrados como não realizados)
[ CANCELAR ]   [ FINALIZAR ]
```

Depois, resumo: treino concluído, "7 de 9 exercícios realizados" e duração, com o botão
**Voltar ao início** (sem linha "Próximo", que fica na Home). Sem confete.

Spec 007 (tela de treino): sem ação de descartar (fica na Home); `?` e `ⓘ` só com a spec 008 e ⏱ só
com a spec 011; bi-set sem barra lateral, cada exercício é um cartão independente com chip BI-SET e
observação do parceiro. Padrões: `ExerciseCard`, `WarmupNote`, `FinishBar` e `FinishSummaryView`.

## 5.2 Ajuda contextual (somente leitura)

Abrir ou fechar qualquer sheet **não** altera exercício, peso, sequência,
cronômetro nem sessão; o estado do cartão (expandido, valor digitado) é mantido.

**LegendSheet (`?`)** — lista rolável de termos, cada um com título em `title` e
descrição em `body`: BI-SET, DROP-SET, PIRÂMIDE CRESCENTE, PIRÂMIDE DECRESCENTE,
FALHA, EXCÊNTRICA, CONCÊNTRICA, PROGRESSÃO DE CARGA e outros usados pelo programa.
Conteúdo estático do app. *P1 (BL-115):* um `?` ao lado de cada TechniqueChip abre
o sheet já rolado até aquele termo.

**MuscleInfoSheet (`ⓘ`)**:

```text
SUPINO RETO
MÚSCULO PRINCIPAL      Peitoral maior
MÚSCULOS SECUNDÁRIOS   Tríceps · Deltoide anterior
DESCRIÇÃO
Exercício de empurrar que enfatiza a musculatura do peito…
```

**Regra de conteúdo:** o `ⓘ` aparece em **todo** exercício de **todo** programa, e
o sheet vem sempre preenchido (músculo principal, secundários e descrição). O seed
MUST fornecer `primary_muscle`, `secondary_muscles` e `description` para cada
exercício (BL-110); como o exercício é uma única entidade reutilizada, a mesma
informação vale em qualquer treino ou programa que o use. "Não informado" é só
rede de segurança para exercícios que o usuário venha a criar no futuro; não deve
aparecer para nenhum exercício do seed. Fecha com toque no fundo, botão
**Fechar** ou Escape/voltar.

## 5.3 Cronômetro de descanso (P1, só se habilitado)

Ao marcar um exercício, barra de descanso acima do botão Finalizar: tempo em
`numeric` (`01:30`), **Pausar** e **Encerrar**. Ignorável, não bloqueia nada. Pode
ser ativado/desativado durante o treino pelo ícone ⏱ do cabeçalho.

Implementação (spec 011): parado, a barra mostra **Iniciar descanso**; marcar um
exercício inicia (ou reinicia) a contagem; ao terminar com o app aberto vibra 400 ms
e mostra "Descanso terminado" + **OK**; em segundo plano não há alerta. O estado vive
só em memória. O ⏱ altera a configuração persistida. Em Configurações (seção
DESCANSO): switch e "Tempo de descanso" (00:05–60:00, entrada mm:ss). Componentes:
`RestTimerBar`, `RestTimerToggle`, `Switch`, `SettingsSwitchRow`, `RestDurationSheet`.

## 5.4 Estados

- *Sem exercícios no treino:* EmptyState "Este treino não tem exercícios"
  (finalizar continua permitido).
- *Erro ao salvar:* aviso inline no cartão + **Tentar de novo**; o valor digitado
  não se perde.
- *Nome longo:* quebra em 2 linhas.
- *Teclado aberto:* a lista rola para manter o campo visível; a barra FINALIZAR
  se esconde enquanto digita.
- *Carga inválida:* "Informe um valor maior ou igual a 0", ligada ao campo.

------------------------------------------------------------------------

# 6. Histórico

**Objetivo:** consultar sessões finalizadas, mais recentes primeiro.

```text
┌───────────────────────────────┐
│ HISTÓRICO          [ Todos ▼ ]│  FilterSelect (P1)
│                               │
│ SETEMBRO 2026                 │
│ ┌───────────────────────────┐ │
│ │ 19  Treino Monstro        │ │  data à esquerda; programa; treino
│ │ SET D — Peito e tríceps   │ │
│ │     8 / 10 · 52 min       │ │
│ └───────────────────────────┘ │
│ │ 12  Treino Padrão         │ │
│ │ SET Dia 2 — Costas e Bíc. │ │
│ │     ✓ 6 / 6               │ │
└───────────────────────────────┘
```

- Item inteiro é um botão (altura mínima 72). 6/6 mostra ✓ + contagem.
- Programa e treino sempre visíveis no item (a sessão os registra). Com filtro por
  programa ativo, o nome do programa pode sair do item.
- *Vazio:* "Ainda não existem treinos registrados." + **Ir para o treino**.
  *Vazio com filtro:* "Nenhum treino deste programa." + **Limpar filtro**.
- *Carregando:* 4 esqueletos. *Erro:* mensagem + **Tentar de novo**.
- `FlatList` para listas longas.

## 6.1 Detalhe da sessão

```text
‹  TREINO D — PEITO E TRÍCEPS
   Treino Monstro · 19/09/2026 · 8 / 10 realizados

 ✓ Supino reto           80 kg
   4 × 8
 ✓ Crucifixo reto        20 kg
   3 × 12
 ○ Voador                não realizado
   3 × até a falha
                              [ EDITAR ]
```

Feito = ✓ + peso; não realizado = ○ + o texto "não realizado"; sem peso mostra
"sem carga". A prescrição aparece abaixo do nome como registro do programa.

## 6.2 Edição

Linhas editáveis: alternar feito/não feito e editar carga (WeightInput).
**Salvar** (primário) e **Cancelar** (confirma se houver alterações). Não permite
trocar programa nem treino da sessão. Salvar não altera a sequência atual.

------------------------------------------------------------------------

# 7. Estatísticas

**Objetivo:** frequência e cadência (só isso) do período e do programa escolhidos.

```text
┌───────────────────────────────┐
│ ESTATÍSTICAS       [ Todos ▼ ]│  filtro: Todos / Treino Padrão / Treino Monstro
│ [Semana][Mês][Trim.][Sem.][Ano]│
│ ‹  SETEMBRO 2026  ›           │
│ ┌───────────────────────────┐ │
│ │ TREINOS NO PERÍODO   17   │ │
│ └───────────────────────────┘ │
│ ┌────────────┐ ┌────────────┐ │
│ │ POR SEMANA │ │ INTERVALO  │ │
│ │ 3,4        │ │ 2,0 dias   │ │
│ └────────────┘ └────────────┘ │
│ DIAS COM TREINO (calendário)  │
└───────────────────────────────┘
```

- Setas `‹ ›` navegam períodos; o próximo é desabilitado no período atual.
- **Semana:** distribuição por dia (SEG…DOM) com ponto e texto. **Demais
  períodos:** mesmas métricas agregadas; calendário de pontos no mês (P1).
- Filtro por programa recalcula tudo; o filtro escolhido fica visível ao lado do
  título e aparece na leitura por leitor de tela.
- Intervalo médio com menos de 2 treinos: "—" + "precisa de ao menos 2 treinos".
- *Sem dados (ou nenhum treino do programa filtrado):* "Complete seu primeiro
  treino para começar a acompanhar sua frequência." + **Ir para o treino**.
- Só sessões finalizadas; nunca carga, peso corporal ou recomendação.

------------------------------------------------------------------------

# 8. Configurações

```text
CONFIGURAÇÕES

PROGRAMA
 Programa de treino            Treino Padrão  ›
 Tipo de sequência             Sequência contínua  ›
 Agenda semanal                ›      (só com "Dias da semana")

DESCANSO
 Cronômetro de descanso        [ Switch ]
 Tempo de descanso             01:30  ›     (desabilitado se cronômetro off)

SEQUÊNCIA
 Reiniciar sequência           ›      (só com "Sequência contínua")
```

Linhas de 56 dp; rótulo à esquerda, valor atual + `›` à direita. "Gerenciar
treinos/exercícios" ficam fora do MVP e não aparecem.

## 8.1 Seleção de programa

```text
TIPO DE TREINO

(●) Treino Padrão
    5 treinos em sequência
( ) Treino Monstro
    A/B/C/D · programação semanal
```

RadioCards. A descrição é informativa: **não** vincula o programa a uma sequência
(as duas configurações são independentes). Aviso fixo: "Trocar de programa não
apaga seu histórico."

Com **treino em andamento**, tocar em outro programa abre um sheet: "Há um treino
em andamento. Continue ou descarte para trocar de programa." com **Continuar** e
**Descartar** (confirmação; não altera sequência nem estatísticas). Nada muda
até o usuário escolher de novo (decidido na spec 005).

## 8.2 Seleção de tipo de sequência

```text
TIPO DE SEQUÊNCIA

(●) Sequência contínua
    O próximo treino é definido pelo último treino finalizado.
( ) Dias da semana
    O próximo treino é definido pela agenda do programa.
```

Escolher "Dias da semana" num programa sem agenda é permitido: a tela mostra
"Este programa não tem agenda semanal" com o atalho "Voltar para sequência
contínua". A linha "Agenda semanal" de Configurações é visível em qualquer tipo
de sequência. Trocar de tipo não altera o histórico.

## 8.3 Agenda semanal

Somente leitura nesta etapa; é **por programa** (título mostra o programa).
Programa sem agenda mostra estado vazio.

```text
AGENDA · TREINO MONSTRO

Segunda      Treino A
Terça        Treino B
Quarta       Descanso
Quinta       Treino C
Sexta        Treino D
Sábado       Opcional
Domingo      Opcional
```

Sem `›` e sem sheet de edição (edição da agenda é item futuro). Ordem SEG→DOM.

------------------------------------------------------------------------

# 9. Navegação e estrutura de rotas

- Abas inferiores (Expo Router `(tabs)`): `index` (Treino/Home), `history`,
  `statistics`, `settings`.
- `workout`, o detalhe/edição do histórico e as telas de seleção/agenda das
  configurações são telas empilhadas **sem abas**. Voltar do treino não descarta a
  sessão (fica em andamento).
- Se há sessão em andamento ao abrir o app, a Home oferece continuar.

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

# 11. Decisões de design

- **Chip "Usar última carga":** atalho de digitação; o campo nunca vem
  pré-preenchido. Se o PRD for lido de forma mais estrita ("apenas referência"),
  remover o chip.
- **Passo de 2,5 kg nos botões −/+:** ajuda de entrada, sem sugestão de carga.
- **Só tema escuro no MVP**; tema claro no backlog futuro.
- **Fontes:** Barlow / Barlow Condensed (empacotadas para funcionar offline).
- **Programa e sequência são independentes na UI:** nenhuma tela associa
  "Monstro" a "semanal" além de texto informativo.
- **Ajuda (`?`/`ⓘ`) sempre em bottom sheet**, nunca inline, para manter a tela de
  treino limpa.

# 12. Propostas de UI para pontos ainda em aberto na documentação

Estas propostas preenchem lacunas do PRD/arquitetura para que as telas façam
sentido; confirmar antes de implementar.

1. (decidido, spec 006) **Dia de descanso/opcional na Home:** mostrar o estado e oferecer **Ver
   treinos do programa** para treinar mesmo assim (sem criar sessão automática).
2. **Sábado e domingo "Opcional":** segundo a ficha e o dono do app, é abdominal (supra/infra e oblíquos),
   não um treino A–D. A Home mostra esse texto e nada é registrado. Falta decidir
   onde o texto é guardado (ex.: nota na agenda).
3. (decidido, specs 005/006) **`WEEKLY` num programa sem agenda:** Home mostra "Sem agenda configurada" e
   oferece **Voltar para sequência contínua**.
4. (decidido, spec 005) **Troca de programa com sessão em andamento:** bloqueada com explicação
   (opção "impedir" da arquitetura), em vez de finalizar automaticamente.
5. (adiado; spec 005 só exibe a agenda) **Agenda editável:** o usuário escolhe, para cada dia, um treino do programa,
   "Descanso" ou "Opcional".
