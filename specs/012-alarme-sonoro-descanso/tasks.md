---
description: "Task list for Alarme Sonoro do Cronômetro de Descanso"
---

# Tasks: Alarme Sonoro do Cronômetro de Descanso

**Input**: `specs/012-alarme-sonoro-descanso/` (plan.md, spec.md, research.md, quickstart.md)
**Depende de**: spec 011 (cronômetro de descanso) concluída
**Tests**: incluídos — a constituição (XI) exige testes de camada; `RestTimerProvider` já tem
suíte RNTL na 011 (`tests/ui/restTimer/restTimerProvider.test.tsx`), estendida aqui. Escreva cada
teste antes da implementação e veja-o falhar.
**Design**: `**Tela/UI:** não` (Clarifications) — nenhum componente novo, nenhum token de design
envolvido.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: US1 (ouvir o fim do descanso), US2 (não incomodar quando não deveria)
- Cada commit referencia esta spec (ex.: `feat(012): ...`).

---

## Phase 1: Setup

- [ ] T001 Instalar a dependência `expo-audio` compatível com `expo ~57.0.24`: `npx expo install expo-audio`; confirmar em `package.json` que a versão resolvida é `57.x`
- [ ] T002 [P] Criar `scripts/generate-rest-timer-sound.js` (Node puro, sem dependência nova): gera um `.wav` PCM 16-bit mono de ~1 s com dois beeps curtos (ex. 880 Hz, 120 ms cada, com um silêncio de ~80 ms entre eles) e grava em `assets/sounds/rest-timer-end.wav`; rodar o script uma vez (`node scripts/generate-rest-timer-sound.js`) e comitar o `.wav` gerado como asset binário

**Checkpoint**: `assets/sounds/rest-timer-end.wav` existe e `npx expo install` não reportou conflito de versão.

---

## Phase 2: Foundational

Não há fase Foundational nesta spec: não há tipo, entidade ou módulo de domínio novo (a feature
inteira é um efeito colateral local ao `RestTimerProvider` já existente da spec 011). Segue
direto para a Phase 3.

---

## Phase 3: User Story 1 — Ouvir quando o descanso termina (P1) 🎯 MVP

**Goal**: tocar um som de alarme uma única vez, junto com a vibração já existente, quando o
descanso termina naturalmente com o app em primeiro plano; o som não se repete nem continua
tocando sozinho, e um novo descanso interrompe o som do término anterior.
**Independent Test**: iniciar um descanso curto com o app em primeiro plano e esperar terminar
(quickstart, item 3, primeiro cenário).

### Tests

- [ ] T003 [US1] Estender `tests/ui/restTimer/restTimerProvider.test.tsx`: injetar uma prop nova `playSound` (mock `jest.fn()` retornando um objeto de player falso com `play`/`pause`/`seekTo`) no `mount()`; caso "toca o som uma vez ao terminar com o app ativo" (junto do `vibrate` já testado); caso "não toca de novo enquanto o estado permanece FINISHED" (avançar o relógio bastante depois do término e conferir que `play` não é chamado de novo); caso "inicia um novo descanso enquanto o som anterior ainda tocaria: o player recebe pause/seekTo antes do novo ciclo" (chamar `start()` de novo antes do fim do "tempo de tocar" e conferir a chamada de parada)

### Implementation

- [ ] T004 [US1] Em `src/components/RestTimerProvider.tsx`: aceitar uma prop `playSound` (com default real usando `expo-audio`: `useAudioPlayer(require('../../assets/sounds/rest-timer-end.wav'))`, expondo `play`); no mesmo ponto em que hoje chama `vibrate(VIBRATION_MS)` ao `justFinished`, chamar também `playSound()` (que internamente reinicia a posição do player para o começo e toca); quando um novo `start()` for observado (mudança de `endsAt`) enquanto o player ainda pode estar tocando, pausar/rebobinar o player antes — faz T003 passar

**Checkpoint**: US1 testável isoladamente; `npm run check` verde.

---

## Phase 4: User Story 2 — Não incomodar quando não deveria (P2)

**Goal**: nenhum som toca quando o app está em segundo plano no momento do término, quando o
cronômetro está desativado, quando o descanso é encerrado manualmente, ou quando o aparelho está
no modo silencioso/vibrar do sistema (FR-006).
**Independent Test**: repetir o término com o app em segundo plano e com o cronômetro desativado;
verificar em um aparelho físico no modo silencioso (quickstart, item 3, segundo e quarto
cenários).

### Tests

- [ ] T005 [US2] Estender `tests/ui/restTimer/restTimerProvider.test.tsx`: caso "terminado em segundo plano: não chama playSound" (reaproveitando o cenário de `AppState` já mockado no teste de vibração da 011, conferindo `playSound` junto de `vibrate`); caso "desativar a configuração durante a contagem não chama playSound" (a contagem já vai a `IDLE`, então nenhum término natural ocorre); caso "encerrar manualmente (`stop()`) antes do tempo zerar não chama playSound" (FR-003 — o estado vai a `IDLE` sem passar por `FINISHED`, então `justFinished` nunca é `true`)
- [ ] T006 [US2] Escrever um teste de configuração de modo de áudio em `tests/ui/restTimer/restTimerProvider.test.tsx` ou em um novo `tests/unit/restTimer/audioMode.test.ts`: ao montar o `RestTimerProvider`, uma função `setAudioMode` (injetável, default real chamando `setAudioModeAsync({ playsInSilentMode: false })` do `expo-audio`) é chamada exatamente uma vez na inicialização

### Implementation

- [ ] T007 [US2] Em `src/components/RestTimerProvider.tsx`: aceitar uma prop `setAudioMode` (default real via `expo-audio`) e chamá-la uma vez em um `useEffect` de inicialização (sem dependências que a repitam); confirmar que os casos que já não chamam `vibrate` (segundo plano, `Encerrar`, desativado) também não chamam `playSound`, pois ambos partem do mesmo `justFinished` — faz T005 e T006 passarem

**Checkpoint**: US1 e US2 funcionam juntas; nenhum som fora das condições da spec; `npm run check` verde.

---

## Phase 5: Polish & cross-cutting

- [ ] T008 [P] Atualizar `specs/011-cronometro-descanso/plan.md`? Não — a 011 permanece como está (histórico preservado); em vez disso, atualizar `docs/design-telas.md` §5.3 se mencionar explicitamente "só vibração" no aviso de fim, trocando para "vibração e som (respeita o modo silencioso)", e `docs/telas.md` no mesmo trecho
- [ ] T009 Verificação manual em aparelho físico (Android e iOS, quickstart item 3 completo): som toca no volume normal; nenhum som no modo silencioso/vibrar; som para ao iniciar novo descanso; nenhum som retroativo ao voltar de segundo plano; nenhum pedido de permissão novo
- [ ] T010 Rodar `npm run check` (lint, tipos e testes) e marcar esta spec como `concluída` em `specs/INDEX.md`

---

## Dependencies & Execution Order

- Phase 1 → Phase 3 → Phase 4 → Phase 5 (sem Phase 2 nesta spec).
- **US1** depende só da Phase 1 (dependência instalada e asset gerado). **US2** depende da US1
  porque estende o mesmo arquivo (`RestTimerProvider.tsx`) e o mesmo teste
  (`restTimerProvider.test.tsx`) — T005/T006/T007 vêm depois de T003/T004.
- T003 e T004 tocam o mesmo par de arquivos que T005/T006/T007; não há paralelismo entre as duas
  histórias (mesmo arquivo de implementação e mesmo arquivo de teste). T002 pode rodar em paralelo
  com T001 (arquivos diferentes).

### Parallel examples

```text
Setup:  T001  |  T002
US1:    T003 → T004
US2:    T005 T006 → T007
Polish: T008 (independente) → T009 → T010
```

## Implementation Strategy

1. **MVP**: Phase 1 + Phase 3 (US1) — o som já toca no caso feliz (app em primeiro plano).
2. Incremental: Phase 4 (US2) fecha as condições em que o som NÃO deve tocar (segundo plano,
   desativado, encerrado manualmente, modo silencioso) → Polish (docs e verificação manual).
3. Um item só está concluído com lint, tipos e testes passando.
