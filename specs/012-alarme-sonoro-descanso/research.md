# Research: Alarme Sonoro do Cronômetro de Descanso

## 1. Biblioteca de reprodução de áudio

**Decision**: `expo-audio` (pacote oficial Expo, versão `57.x`, compatível com `expo ~57.0.24` já
usado no projeto).

**Rationale**: é a API de áudio recomendada atualmente pelo Expo (substitui o `expo-av`, que está
em depreciação); não exige nenhuma permissão de dispositivo para reprodução (só recursos de
gravação pedem permissão, que esta feature não usa); API pequena (`useAudioPlayer`,
`setAudioModeAsync`) suficiente para tocar um som curto uma vez.

**Alternatives considered**:
- `expo-av`: descartado por estar em depreciação no ciclo atual do Expo SDK — evitar dívida
  técnica de migrar de novo em breve (XII: dependências devem ser maduras).
- `expo-notifications` (som de notificação local): descartado porque exige permissão de
  notificação nova, violando FR-007/XII sem necessidade (o app já mostra o aviso na própria tela,
  não precisa de uma notificação do sistema).
- Nenhuma biblioteca (usar só `Vibration`): não atende ao pedido central da feature (FR-001 exige
  som).

## 2. Respeitar o modo silencioso (FR-006)

**Decision**: chamar `setAudioModeAsync({ playsInSilentMode: false })` uma vez na inicialização do
`RestTimerProvider` (mesmo nível em que hoje se usa `Vibration`).

**Rationale**: o padrão do `expo-audio` é `playsInSilentMode: true` (toca mesmo em silencioso,
comportamento de alarme) — o oposto do que a Clarification decidiu. Definir explicitamente
`false` faz o som ser suprimido tanto no interruptor físico de silencioso do iOS quanto no modo
"silencioso"/"vibrar" do Android (o próprio pacote trata os dois sistemas por baixo do mesmo
flag), sem necessidade de checar plataforma manualmente.

**Alternatives considered**: detectar o modo silencioso manualmente por plataforma (ex.: ler o
ringer mode do Android via módulo nativo próprio) — descartado por ser exatamente o que o flag
`playsInSilentMode: false` já resolve nas duas plataformas, sem código extra nem dependência
adicional.

## 3. Arquivo de som

**Decision**: um único arquivo curto (≈1 s, dois beeps), formato `.wav` PCM 16-bit mono,
bundlado em `assets/sounds/rest-timer-end.wav`, carregado com
`useAudioPlayer(require('../../assets/sounds/rest-timer-end.wav'))`. O arquivo é gerado uma vez
por um script Node (`scripts/generate-rest-timer-sound.js`, sem dependência nova: só escreve
bytes PCM/cabeçalho WAV) e commitado como asset binário — não precisa ser regenerado em runtime.

**Rationale**: `.wav` é suportado nativamente em Android e iOS pelo `expo-audio` sem codec extra;
gerar o `.wav` com um script Node simples (seno + cabeçalho WAV escritos à mão) evita depender de
uma ferramenta externa (`ffmpeg`/`sox`, indisponíveis neste ambiente) ou de um arquivo de áudio de
terceiros com licença a verificar. Um som curto evita qualquer configuração de duração/loop (a
máquina de estados já entra em `FINISHED` uma vez; o som só precisa tocar e parar por conta
própria).

**Alternatives considered**: baixar um asset de terceiros — descartado por trazer uma questão de
licença desnecessária para um beep tão simples; `.mp3` — descartado porque geração manual de MP3
válido sem encoder é inviável, enquanto WAV é um formato trivial de escrever a partir de bytes.

## 4. Interromper o som ao iniciar um novo descanso (FR-004)

**Decision**: manter a referência do player (`AudioPlayer` retornado por `useAudioPlayer`) no
mesmo `RestTimerProvider` e chamar `player.pause()` (ou `seekTo(0)` + `pause()`) sempre que
`start()` for chamado enquanto o player anterior ainda estiver tocando — mesmo ponto onde o
`evaluate()` já é chamado a cada tick.

**Rationale**: reaproveita o ciclo de vida já existente do provider (mesmo `useEffect` que hoje
gerencia `vibrate`); não precisa de estado novo no domínio nem no store — é puramente um efeito
colateral local ao componente, como a vibração.

**Alternatives considered**: modelar "tocando som" como parte do `RestTimerState` no domínio —
descartado porque violaria II (domínio puro não deve saber de áudio) sem necessidade: o próprio
provider já sabe quando um novo `start()` ocorre (mudança de `status` para `RUNNING` com um novo
`endsAt`).

## Resumo — NEEDS CLARIFICATION resolvidos

Nenhum item do Technical Context ficou como `NEEDS CLARIFICATION`; as decisões acima cobrem
biblioteca, comportamento no modo silencioso e formato do asset.
