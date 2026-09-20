# CLAUDE.md

App pessoal de controle de treinos (Android + iOS). Registra treinos de academia, permite alternar entre **programas de treino** (Treino Padrão, Treino Monstro) e entre **tipos de sequência** (contínua ou dias da semana), e acompanha frequência/cadência. Uso pessoal, sem comercialização.

**Estado atual:** o repositório contém apenas documentação em `docs/` e a configuração do spec-kit (nenhum código ainda). A documentação é a fonte de verdade; consulte antes de implementar:

- `docs/PRD.md` (v1.1) — produto, programas, sequências, requisitos (RF-01..26), critérios de aceite
- `docs/arquitetura.md` — stack, estratégias de sequência, camadas, estrutura de diretórios
- `docs/modelo-dados.md` — entidades, schema SQL, regras de integridade
- `docs/telas.md` — telas, fluxos, estados de UI
- `docs/fichas-treino.md` — transcrição das fichas (imagens em `docs/treino monstro/` e `docs/treino padrao/`): exercícios, prescrições, técnicas e agenda do Treino Monstro. Base do seed
- `docs/backlog.md` — épicos BL-xxx com prioridade P0/P1/P2 e roadmap por sprint
- `docs/design-telas.md` e `docs/prototipo-telas.html` — direção visual "Placar de academia" (tema escuro), definição detalhada das telas e protótipo navegável. Cobrem programas, tipo de sequência, agenda semanal, filtros, `?` e `ⓘ`. A seção 12 do design lista propostas de UI para as lacunas abaixo (a confirmar).

A constituição do projeto está em `.specify/memory/constitution.md` (v2.1.0) e prevalece sobre este arquivo. Ao implementar um item, referencie o ID do backlog (ex.: BL-031). Se o código divergir da documentação, atualize a documentação junto.

## Stack

React Native + TypeScript (strict) + Expo, Expo Router, SQLite, Zustand, Jest + React Native Testing Library, ESLint, Prettier. Priorizar dependências pequenas e maduras.

## Conceito central

Duas configurações **independentes** determinam o próximo treino:

```text
Programa ativo (tipo de treino)  +  Tipo de sequência  =  regra para o próximo treino
```

- Programas iniciais (seed, como dados): **Treino Padrão** (Dia 1–5: Peito e Tríceps · Costas e Bíceps · Perna Completo · Ombro Isolado · Bíceps e Tríceps) e **Treino Monstro** (A Ombros completos · B Costas e Bíceps · C Pernas completas · D Peito e Tríceps).
- Sequências: `CONTINUOUS` (avança ao finalizar; 1→…→N→1) e `WEEKLY` (agenda por dia da semana do programa; dia sem treino = `null`).
- **Nunca** codificar regra por nome de programa (ex.: "Monstro usa semana"). Qualquer programa pode usar qualquer sequência.

## Arquitetura

Camadas: `UI → Hooks/Application → Domain → Repositories → SQLite`.

```text
src/
├── app/          # rotas Expo Router: index, workout, history, statistics, settings
├── domain/       # regras puras: program, workout, exercise, sequence/{strategies,services}, session, statistics
├── application/  # casos de uso: SelectProgram, SelectSequenceStrategy, StartWorkout, CompleteExercise,
│                 #   FinishWorkout, ResetSequence, EditWorkoutSession, GetStatistics
├── data/         # database, repositories, migrations, seed
├── store/        # Zustand: workoutStore, settingsStore, sessionStore
├── components/  hooks/  utils/  constants/
```

Regras de camada:

- **Domain é puro**: sem React, sem SQLite, sem API. Resolução do próximo treino, sequências, finalização e estatísticas vivem aqui.
- **Estratégias**: `SequenceStrategy.getNextWorkout(context)` com `ContinuousSequenceStrategy` e `WeeklyScheduleSequenceStrategy`, escolhidas via `NextWorkoutResolver`. Sem `if/else` de estratégia espalhado.
- **Presentation** sem regra de negócio complexa. **Zustand** só guarda estado de UI/sessão atual/cronômetro/configurações carregadas; **SQLite é a fonte de verdade**.

## Regras de negócio essenciais

- **Sequência contínua**: estado por programa (`program_sequence_state.current_position`); avança **somente ao finalizar**; independe de calendário. Reiniciar volta ao primeiro treino do programa e **nunca apaga histórico**. Reiniciar só existe para sequência contínua.
- **Agenda semanal**: pertence ao programa (`weekly_schedule`). Dia sem treino → `null`. **Não criar sessão automaticamente**; o usuário inicia e finaliza.
- **Trocar programa ou tipo de sequência** não apaga nem altera sessões antigas; respeitar sessão em andamento incompatível; ao voltar a um programa, ele retoma seu próprio estado.
- **Sessão** guarda `program_id` e `workout_id`. Finalizar é **transacional** (persistir exercícios → `completed` → atualizar sequência quando aplicável → limpar sessão em andamento).
- **Ordem livre**: `display_order` é só visual. Finalizar treino incompleto (0 ou mais exercícios) é permitido.
- **Sessão em andamento** é persistida; ao reabrir, Continuar / Descartar. Descartar não altera sequência nem estatísticas.
- **Prescrição é dado**: `prescription`, `technique`, `notes` em `workout_exercise` (texto). O app exibe, **não interpreta**; não há `min_reps`/`max_reps`. Sem repetições realizadas.
- **Carga**: `weight` nulo ou >= 0. A "última carga" é derivada (última sessão finalizada do **mesmo programa** e exercício com peso) — **não** criar coluna `last_weight`.
- **Ajuda contextual** (sob demanda, bottom sheet): `?` abre a legenda de técnicas (bi-set, drop-set, pirâmides, falha, excêntrica, concêntrica, progressão de carga — conteúdo estático); `ⓘ` abre músculo principal, secundários e descrição (`exercise.primary_muscle/secondary_muscles/description`) e **deve estar preenchido para todo exercício de todo programa**: o seed não pode deixar nenhum exercício sem essas informações (teste de seed cobre isso). Abrir/fechar **não** altera exercício, peso, sequência, cronômetro ou sessão. Nunca exibir permanentemente.
- **Nunca recomendar** cargas, exercícios ou treinos; sem IA, dieta, peso corporal.
- **Histórico editável**: marcar/desmarcar e alterar peso; nunca muda programa/treino da sessão.
- **Estatísticas** (semana/mês/trimestre/semestre/ano): só frequência e cadência (qtd, média/semana, intervalo médio), filtro por programa (Todos / cada programa); apenas sessões finalizadas; serviço centralizado sobre `workout_session`.

## Persistência

- Tabelas: `training_program`, `workout`, `exercise`, `workout_exercise`, `weekly_schedule`, `program_sequence_state`, `workout_session`, `workout_session_exercise`, `app_settings` (registro único, `id = 1`: `active_program_id`, `sequence_type`, cronômetro).
- Migrations versionadas; seed idempotente (programas, treinos, exercícios, prescrições, agenda do Monstro, estado de sequência por programa, settings).
- Exercício reutilizado entre treinos é **uma entidade** `exercise` referenciada por vários `workout_exercise` (`UNIQUE(workout_id, exercise_id)`).
- **Datas**: usar data/dia da semana **local** do usuário; evitar UTC que desloque o treino de dia.

## Pontos em aberto na documentação (confirmar antes de implementar)

- **Bi-set = um item ou dois?** A ficha do Monstro escreve cada bi-set em uma linha (ex.: "bi-set de panturrilha sentado e em pé"). Hoje ele é modelado como **um** item marcável com `technique = BI-SET` e **uma** carga; se você quiser carga separada por exercício do bi-set, ele precisa virar dois itens.
- **Variações de exercício**: exercícios com variação na ficha (ex.: "tríceps testa unilateral no cross" vs "Tríceps testa" do Padrão) foram tratados como exercícios distintos; só há reuso quando o nome é o mesmo (ex.: Supino inclinado, Elevação lateral). Confirmar.
- **"Aquecimento" na ficha do Monstro**: cada treino traz o rótulo "Aquecimento:" antes da lista; foi entendido como marcando só o primeiro item. Não há campo próprio para aquecimento (fica em `notes`).
- **Sábado/quarta "Opcional"**: a ficha define como **abdominais supra/infra e oblíquos**, não um treino A–D. `weekly_schedule.optional` com `workout_id` nulo não guarda esse texto: falta decidir onde ele mora (ex.: campo de nota na agenda) e se o app registra o abdominal como sessão.
- **Cardio da ficha**: "360 horas semanais de caminhada" provavelmente é 360 **minutos**; o app não registra cardio (fora do escopo). Confirmar e ignorar.
- **`sequence_type` global**: fica em `app_settings` (único), mas o estado contínuo é por programa. Definir o que acontece ao escolher `WEEKLY` num programa sem agenda (ex.: Treino Padrão) e o que a Home exibe.
- **Troca de programa com sessão em andamento**: a arquitetura diz "finalizar/impedir"; escolher um comportamento.
- **Agenda semanal editável**: BL-042 a configura, mas não está definido se o usuário pode alterar a agenda ou só escolher entre treinos existentes.

## Requisitos não funcionais

- Offline-first, sem backend, sem login, sem sincronização no MVP; nenhum dado sai do aparelho e nenhuma permissão desnecessária.
- Código compartilhado entre Android e iOS; TypeScript strict; inicialização rápida.
- Fora do escopo: recomendações, IA, personal virtual, dieta, calorias, peso corporal, rede social, login, pagamentos, assinaturas, nuvem, wearables.

## Testes

Unitários (domínio): sequência contínua (primeiro, meio, último→primeiro, reinício), sequência semanal (dia com treino, descanso, sábado opcional, domingo, mudança de semana), troca de programa e de estratégia, médias, intervalo médio, filtros de período, datas. Integração: criar/finalizar/recuperar/editar sessão e persistência. UI: iniciar, marcar, peso, finalizar, editar histórico, abrir ajuda sem alterar a sessão. Validar em Android e iOS.

## Convenções

- Documentação e textos de UI em **português (pt-BR)**.
- Prioridades: P0 obrigatório no MVP; P1 depois do fluxo principal (cronômetro, filtro de histórico/estatísticas por programa, ajuda por técnica); P2 futuro.
- Comandos de build/test/lint: definir aqui assim que o projeto Expo for criado (BL-001..003).

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
<!-- SPECKIT END -->
