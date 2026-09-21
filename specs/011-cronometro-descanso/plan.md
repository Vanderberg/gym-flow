# Implementation Plan: Cronômetro de Descanso

**Branch**: `main` (diretório da spec: `011-cronometro-descanso`) | **Date**: 2026-09-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/011-cronometro-descanso/spec.md`
**Backlog**: BL-043, BL-090, BL-091, BL-092
**Requisitos de produto**: RF-19
**Depende de**: 002 (`app_settings.rest_timer_enabled`, `rest_timer_seconds`, `SettingsRepository`), 005 (tela de Configurações, `settingsStore`), 007 (tela de treino, slot ⏱ do cabeçalho, marcação de exercício), 008 (a ajuda não pode pausar nem reiniciar o cronômetro)

## Summary

Entregar o cronômetro de descanso opcional: configuração (ativar/desativar e duração de 00:05 a 60:00, exibida e digitada em
mm:ss) em **Configurações** e pelo ícone ⏱ do cabeçalho da tela de treino (mesma configuração persistida), e o uso durante o
treino: com o cronômetro ativo, **marcar um exercício inicia** a contagem regressiva (reinicia se já em curso), com barra
**Pausar/Retomar/Encerrar**, botão **Iniciar** quando parado e aviso de fim (vibração curta + "Descanso terminado" com o app
aberto; em segundo plano, sem alerta). O motor é uma **máquina de estados pura baseada em horário de término** (`endsAt`), o que
mantém o tempo correto em segundo plano (erro < 1 s em 5 min) sem persistência: o estado vive só na memória. Nenhum dado da
sessão nem a sequência são tocados. Decisões em [research.md](research.md); modelo em [data-model.md](data-model.md); contratos
em [contracts/](contracts/).

## Technical Context

**Language/Version**: TypeScript strict (projeto da 001)

**Primary Dependencies**: nenhuma nova (`Vibration` e `AppState` do React Native; Expo Router, Zustand, RNTL)

**Storage**: nenhuma migration; usa as colunas existentes `app_settings.rest_timer_enabled` e `rest_timer_seconds` (002); o estado da contagem **não** é persistido

**Testing**: Jest com relógio simulado; unitários exaustivos da máquina de estados e da validação de duração; integração da persistência da configuração com `better-sqlite3`; RNTL para a barra, o ⏱, Configurações e a integração com a tela de treino

**Target Platform**: Android e iOS (código compartilhado)

**Project Type**: mobile-app (projeto único)

**Performance Goals**: erro de contagem < 1 s após 5 minutos, inclusive com o app em segundo plano (SC-002); iniciar o descanso em 1 toque (SC-001); atualização da tela a cada ~250 ms sem regravar nada

**Constraints**: offline; sem permissão de execução nova nem notificações; sem dependência nova; não altera marcações, pesos, sequência nem sessão (FR-004); domínio puro (sem React/`Date.now` direto: relógio injetado)

**Scale/Scope**: 1 máquina de estados, 2 casos de uso de configuração, 1 store, 1 hook, 4 componentes, 1 seção em Configurações

## Constitution Check

| Princípio | Avaliação |
|-----------|-----------|
| I. Offline-first | ✅ Configuração persistida em SQLite; contagem só em memória (Zustand) por escolha explícita |
| II. Domínio puro e camadas | ✅ Máquina de estados, formatação e validação de duração puras em `domain/restTimer`; persistência em `application/`; componentes sem regra |
| III. TypeScript estrito | ✅ Estado como união discriminada (`IDLE`/`RUNNING`/`PAUSED`/`FINISHED`); sem `any` |
| IV. Registro livre | ✅ O cronômetro não bloqueia nem ordena nada; marcar/desmarcar continua livre |
| V. Histórico preservado | ✅ Não escreve em sessões |
| VI. Programa e sequência independentes | ✅ Não toca programa, sequência nem `app_settings` além dos dois campos do cronômetro; sem regra por programa |
| VII. Prescrição como dado | ✅ Não se aplica |
| VIII. Sem recomendações | ✅ O tempo de descanso é escolha do usuário; o app não sugere duração |
| IX. Estatísticas | ✅ Não se aplica |
| X. Transações e datas locais | ✅ Salvar configuração é uma escrita única em `app_settings` (id = 1); o horário de término usa relógio injetado |
| XI. Testes por camada | ✅ Unitários (máquina, fim em segundo plano, limites), integração (persistência) e RNTL (fluxos) |
| XII. Simplicidade e privacidade | ✅ Sem dependência nova nem notificações; sem permissões de execução; a vibração usa a API nativa do RN |

Sem violações ⇒ Complexity Tracking vazio. Reavaliação pós-design: **sem mudanças, continua passando**.

## Project Structure

### Documentation (this feature)

```text
specs/011-cronometro-descanso/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── use-cases.md
│   └── ui.md
└── tasks.md             # /speckit-tasks (não criado aqui)
```

### Source Code (repository root)

```text
src/
├── domain/restTimer/
│   ├── types.ts                    # RestTimerState (IDLE | RUNNING | PAUSED | FINISHED), TickResult
│   ├── restTimerMachine.ts         # start, pause, resume, stop, dismiss, evaluate(state, now) → { state, justFinished }, remainingMs
│   ├── duration.ts                 # MIN/MAX/DEFAULT, parseDurationInput('01:30'|'90'), validateDuration, formatMmSs
├── application/
│   ├── SetRestTimerEnabled.ts      # salva rest_timer_enabled (única escrita)
│   └── SetRestTimerDuration.ts     # valida 5..3600 s e salva rest_timer_seconds (ValidationError fora do intervalo)
├── store/
│   └── restTimerStore.ts           # RestTimerState em memória; ações com relógio injetado; nunca persiste
├── hooks/
│   └── useRestTimer.ts             # leitura do estado e ações (start, pause, resume, stop, dismiss, reset, onExerciseMarked)
├── app/
│   ├── _layout.tsx                 # (001) + monta o RestTimerProvider
│   ├── (tabs)/settings.tsx         # (005) + seção "DESCANSO": cronômetro (switch) e tempo de descanso
│   └── workout/index.tsx           # (007) + ⏱ no cabeçalho, RestTimerBar acima do FinishBar, início ao marcar
└── components/
    ├── RestTimerProvider.tsx       # ticker (~250 ms), AppState e vibração no nível do app (layout raiz)
    ├── common/                     # HeaderIconButton? (⏱ 44 dp), Switch (design §3/§8)
    ├── settings/
    │   ├── SettingsSwitchRow.tsx   # linha 56 dp com switch (extensão da SettingsRow da 005)
    │   └── RestDurationSheet.tsx   # sheet com DurationInput mm:ss, erro "Informe um tempo entre 00:05 e 60:00"
    └── workout/
        ├── RestTimerBar.tsx        # barra: mm:ss, Pausar/Retomar, Encerrar; Iniciar quando parado; "Descanso terminado"
        └── RestTimerToggle.tsx     # ⏱ do cabeçalho (ativa/desativa a configuração persistida)
tests/
├── unit/domain/restTimer/          # restTimerMachine, duration
├── unit/store/                     # restTimerStore
├── unit/hooks/                     # useRestTimer (relógio e AppState simulados)
├── integration/application/        # restTimerSettings (persistência, validação, nenhum outro campo alterado)
└── ui/restTimer/                   # restTimerBar, restTimerToggle, restTimerSettings, workoutIntegration (RNTL)
```

**Structure Decision**: mesma raiz Expo; o motor em `domain/restTimer` recebe o relógio por parâmetro (sem `Date.now`), o
estado em memória fica no store e a UI só reflete. A tela de treino (007) apenas chama o hook nos eventos de marcação e finalização.

## Direção visual (continuidade)

Direção existente: **"Placar de academia"** (`docs/design-telas.md` §1–3, §5.3, §8). Esta spec reutiliza os tokens de
`src/constants/theme.ts`, `SettingsRow`/`Sheet`/`ConfirmDialog`/`Button` (005) e o estilo `numeric` (Barlow Condensed 600, 40/44)
para o tempo (`01:30`).

- **Componentes do design criados aqui**: `RestTimerBar` (§5.3: tempo em `numeric`, **Pausar** e **Encerrar**, "Ignorável, não
  bloqueia nada") e o `Switch` de §8 (linha "Cronômetro de descanso"). O ícone ⏱ do cabeçalho está em §5.
- **Extensões deliberadas e visíveis**: `SettingsSwitchRow` (linha com switch, variante da `SettingsRow` da 005),
  `RestDurationSheet` (entrada mm:ss), `RestTimerToggle` e o botão **Iniciar** dentro da barra. Adicioná-los a §3.
- **Estados cobertos**: parado (botão **Iniciar**), contando (mm:ss + Pausar + Encerrar), pausado (mm:ss + Retomar + Encerrar),
  terminado ("Descanso terminado" com ícone e texto, sem depender só de cor), desativado (nenhum controle de contagem; só o ⏱),
  duração inválida (mensagem inline "Informe um tempo entre 00:05 e 60:00").
- **Acessibilidade**: a barra é ignorável; anuncia só início e fim (`accessibilityLiveRegion="polite"`), não a cada segundo; alvos
  ≥ 48 dp.
- **Auditoria de consistência**: tarefa final compara as telas com tokens e componentes.

## Divergências de documentação a corrigir no mesmo trabalho

`docs/design-telas.md` §5.3 (início ao marcar e botão **Iniciar**; fim com vibração e "Descanso terminado"; em segundo plano sem
alerta; estado só em memória), §8 (linha do cronômetro e do tempo de descanso, limites 00:05–60:00) e `docs/telas.md`. A
seção "Configurações" da spec 005 excluía o cronômetro; passa a incluí-lo. Tarefa dedicada em `tasks.md`.

## Complexity Tracking

Sem violações.
