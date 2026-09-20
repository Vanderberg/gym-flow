# CLAUDE.md

App pessoal de controle de treinos (Android + iOS). Registra treinos de academia, controla uma sequência fixa de 5 dias e acompanha frequência/cadência. Uso pessoal, sem comercialização.

**Estado atual:** o repositório contém apenas documentação em `docs/` (nenhum código ainda). A documentação é a fonte de verdade; consulte antes de implementar:

- `docs/PRD.md` — produto, regras de negócio, requisitos (RF-01..23), critérios de aceite
- `docs/arquitetura.md` — stack, camadas, estrutura de diretórios, regras técnicas
- `docs/modelo-dados.md` — entidades, schema SQL, regras de integridade
- `docs/telas.md` — telas, fluxos, estados de UI
- `docs/design-telas.md` — direção visual ("Placar de academia", tema escuro), tokens, componentes e definição detalhada de cada tela
- `docs/backlog.md` — épicos BL-xxx com prioridade P0/P1/P2 e roadmap por sprint

Ao implementar um item, referencie o ID do backlog (ex.: BL-021). Se o código divergir da documentação, atualize a documentação junto.

## Stack

React Native + TypeScript (strict) + Expo, Expo Router, SQLite, Zustand, Jest + React Native Testing Library, ESLint, Prettier. Priorizar dependências pequenas e maduras.

## Arquitetura

Camadas (dependência de cima para baixo): `UI → Hooks/Application → Services (domain) → Repositories → SQLite`.

```text
src/
├── app/          # rotas Expo Router: index, workout, history, statistics, settings
├── components/   # ExerciseCard, WorkoutCard, Timer, StatCard, common
├── domain/       # regras puras (workout, exercise, sequence, statistics)
├── application/  # casos de uso (iniciar, marcar, finalizar, reiniciar, editar)
├── data/         # database (migrations), repositories, mappers, seed
├── store/        # Zustand: workoutStore, sequenceStore, settingsStore
├── hooks/        # useWorkout, useSequence, useHistory, useStatistics
├── utils/        # date, format, calculations
└── constants/
```

Regras de camada:

- **Domain é puro**: sem React, sem SQLite, sem API. Sequência, finalização, frequência e cadência vivem aqui, nunca em componentes.
- **Presentation** não contém regra de negócio complexa.
- **Zustand** guarda apenas estado de UI/sessão em andamento/cronômetro. **SQLite é a fonte de verdade** e a persistência principal.
- O domínio não deve depender de SQLite, para permitir um repositório remoto no futuro.

## Regras de negócio essenciais

- **Sequência**: `currentDay` de 1 a 5; Dia 1→2→3→4→5→1. Avança **somente ao finalizar** treino. Independe de dias da semana e de intervalos sem treinar.
  - Treinos: 1 Peito e Tríceps · 2 Costas e Bíceps · 3 Perna Completo · 4 Ombro Isolado · 5 Bíceps e Tríceps.
- **Reiniciar sequência** volta para Dia 1 e **nunca apaga histórico**.
- **Ordem livre**: exercícios têm `display_order` só visual; nenhuma dependência entre eles.
- **Finalizar treino incompleto** é permitido (0 ou mais exercícios feitos); a sessão vira `completed = 1` e a sequência avança.
- **Descartar sessão em andamento** não altera a sequência e não conta em estatísticas.
- **Sessão em andamento é persistida** localmente; ao reabrir, oferecer Continuar / Descartar.
- **Carga**: por exercício/sessão, `weight` nulo ou >= 0. Sem repetições registradas por série. A "última carga" é derivada (último peso não nulo em sessões finalizadas) — **não** criar coluna `last_weight`.
- **Nunca recomendar** cargas, exercícios ou treinos; sem IA, dieta, peso corporal.
- **Histórico editável**: marcar/desmarcar e alterar peso; não permite mudar o dia da sequência do treino.
- **Estatísticas** (semana/mês/trimestre/semestre/ano): só frequência e cadência (qtd de treinos, média/semana, intervalo médio); apenas sessões finalizadas; calculadas a partir de `workout_session`, centralizadas em um serviço de estatísticas.

## Persistência

- Migrations versionadas; seed idempotente na primeira execução (5 treinos, exercícios, relacionamentos, `sequence_state` com Dia 1).
- Exercício repetido entre dias (ex.: Tríceps corda) é **uma única entidade** `exercise` referenciada por vários `workout_plan_exercise`. Nota: o backlog BL-012 cita "28 exercícios" contando repetições; deduplicados são 22 únicos — confirmar a contagem ao implementar o seed.
- Finalizar sessão deve ser **transacional**: persistir exercícios → marcar `completed` → calcular próximo dia → atualizar `sequence_state` → limpar sessão em andamento.
- `sequence_state` e `settings` têm exatamente um registro (`id = 1`).
- **Datas**: usar data local do usuário para estatísticas de calendário; evitar conversões UTC que desloquem o treino de dia.

## Requisitos não funcionais

- Offline-first, sem backend, sem login, sem sincronização no MVP; nenhum dado sai do aparelho e nenhuma permissão desnecessária.
- Código compartilhado entre Android e iOS; TypeScript strict; inicialização rápida.
- Fora do escopo do MVP: login, backend, nuvem, multiusuário, pagamentos, rede social, wearables, integrações de saúde.

## Testes

Prioridade: unitários (sequência, reinício, média, intervalo médio, filtros de período) → integração (criar/finalizar/recuperar sessão, persistência) → UI (iniciar, marcar, peso, finalizar, editar histórico). Validar em Android e iOS.

## Convenções

- Documentação e textos de UI em **português (pt-BR)**.
- Prioridades do backlog: P0 obrigatório para o MVP, P1 depois do fluxo principal, P2 futuro. Cronômetro de descanso é P1.
- Comandos de build/test/lint: definir aqui assim que o projeto Expo for criado (BL-001..003).

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->
