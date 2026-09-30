# Implementation Plan: Alarme Sonoro do Cronômetro de Descanso

**Branch**: `main` (diretório da spec: `012-alarme-sonoro-descanso`) | **Date**: 2026-09-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/012-alarme-sonoro-descanso/spec.md`
**Depende de**: 011-cronometro-descanso (`RestTimerProvider`, `restTimerMachine`, `useRestTimerStore`, `app_settings.rest_timer_enabled`)

## Summary

Adicionar um som curto de alarme ao mesmo evento que hoje já dispara a vibração ao final do
cronômetro de descanso (`justFinished` em `RestTimerProvider.tsx`). O som toca uma única vez,
só com o app em primeiro plano, respeita o modo silencioso/vibrar do aparelho (decidido em
Clarifications) e é interrompido se um novo descanso começar antes de terminar de tocar.
Não há configuração nova, tela nova nem mudança em sequência, sessão ou pesos — é um reforço
sensorial do aviso que já existe. Requer uma única dependência nova (`expo-audio`, pacote
oficial e mantido do Expo, sem permissão de dispositivo) para reproduzir o arquivo de áudio
bundlado em `assets/`.

## Technical Context

**Language/Version**: TypeScript strict (projeto da 001)

**Primary Dependencies**: `expo-audio` (nova; ver Complexity Tracking) para reprodução local do
som; reaproveita `Vibration` e `AppState` do React Native já usados pela 011

**Storage**: nenhuma migration; nenhum campo novo em `app_settings` — o som usa o mesmo
`rest_timer_enabled` já existente (FR-005)

**Testing**: Jest com relógio simulado (padrão da 011); `expo-audio` é injetado por parâmetro no
`RestTimerProvider` (mesmo padrão do `vibrate` atual), permitindo mock nos testes sem tocar áudio
real; RNTL não muda (nenhuma tela nova)

**Target Platform**: Android e iOS (código compartilhado)

**Project Type**: mobile-app (projeto único)

**Performance Goals**: o som deve iniciar no mesmo tick (~250 ms) em que a vibração já dispara
hoje; nenhuma regressão na precisão do cronômetro (SC-002 da 011)

**Constraints**: offline; sem permissão de dispositivo nova; som respeita o modo silencioso do
aparelho (FR-006); não altera marcações, pesos, sequência nem sessão (FR-008); domínio do
cronômetro continua puro — a chamada de áudio fica no `RestTimerProvider` (camada de
componente/efeito), igual à vibração hoje, nunca em `domain/restTimer`

**Scale/Scope**: 1 dependência nova, 1 asset de áudio, alterações pontuais em
`RestTimerProvider.tsx` (+ testes); nenhum arquivo novo em `domain/`, `application/` ou `store/`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação |
|-----------|-----------|
| I. Offline-first | ✅ Áudio é um arquivo local bundlado no app; nenhuma rede envolvida |
| II. Domínio puro e camadas | ✅ Nenhuma regra nova em `domain/`; o efeito sonoro fica no `RestTimerProvider` (mesma camada da vibração atual), reagindo ao `justFinished` já emitido pela máquina de estados pura |
| III. TypeScript estrito | ✅ Sem `any`; prop `playSound` tipada como função, seguindo o padrão de `vibrate` |
| IV. Registro livre | ✅ Não se aplica (som não bloqueia nem ordena nada) |
| V. Histórico preservado | ✅ Não escreve em sessões |
| VI. Programa e sequência independentes | ✅ Não toca programa nem sequência |
| VII. Prescrição como dado | ✅ Não se aplica |
| VIII. Sem recomendações | ✅ Som é só aviso de término, não recomendação |
| IX. Estatísticas | ✅ Não se aplica |
| X. Transações e datas locais | ✅ Não persiste nada; nenhuma escrita em `app_settings` |
| XI. Testes por camada | ✅ Teste RNTL do `RestTimerProvider` estendido (som injetado e mockado, igual à vibração); teste de regressão para "som para ao iniciar novo descanso" |
| XII. Simplicidade e privacidade | ⚠️ Requer 1 dependência nova (`expo-audio`) — justificado no Complexity Tracking abaixo; nenhuma permissão de dispositivo nova (mantém a garantia) |

Sem violações que bloqueiem o design; a única ressalva (nova dependência) está documentada e
justificada em Complexity Tracking. Reavaliação pós-design: **sem mudanças, continua passando**
(ver Phase 1 abaixo).

## Project Structure

### Documentation (this feature)

```text
specs/012-alarme-sonoro-descanso/
├── plan.md              # este arquivo
├── research.md          # Phase 0: escolha da lib de áudio e do arquivo de som
├── quickstart.md        # Phase 1: passos manuais de verificação (Android/iOS)
├── parecer-lgpd.md       # já gravado (nenhuma das três formas se aplica)
└── checklists/
    └── requirements.md
```

Sem `data-model.md` nem `contracts/`: a feature não introduz entidade nova nem interface
pública/contrato (reaproveita o estado em memória já modelado pela 011); Phase 1 gera apenas
`quickstart.md`.

### Source Code (repository root)

```text
src/
└── components/
    └── RestTimerProvider.tsx   # (011) + toca o som no mesmo ponto em que hoje vibra;
                                 #        para o som se um novo `start()` ocorrer antes do fim
assets/
└── sounds/
    └── rest-timer-end.wav      # asset de áudio novo, bundlado (gerado por scripts/generate-rest-timer-sound.js)
scripts/
└── generate-rest-timer-sound.js  # gera o .wav uma vez (seno + cabeçalho WAV, sem dependência nova)
tests/
└── ui/restTimer/
    └── restTimerProvider.test.ts  # (011) + casos: som toca ao terminar em primeiro plano,
                                     #   não toca em segundo plano, não toca ao Encerrar,
                                     #   para o som anterior ao iniciar novo descanso
```

**Structure Decision**: mesma raiz Expo da 011; nenhuma camada nova. O `RestTimerProvider` já é
o único lugar que reage a `justFinished` fora do domínio puro, então o som entra ali, ao lado da
`vibrate` existente, seguindo o mesmo padrão de injeção por prop usado nos testes.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| Nova dependência (`expo-audio`) | Reproduzir um som local é o pedido central da feature (FR-001); React Native/Expo não expõem reprodução de áudio sem uma lib — `Vibration` (já usada) não produz som | Não há alternativa sem dependência: notificações locais exigiriam permissão nova (viola FR-007/XII); `expo-av` foi descartado por estar em depreciação no SDK atual do projeto (`expo ~57`), preferindo o pacote oficial mais recente e mantido |
