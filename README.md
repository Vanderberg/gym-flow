# Gym Flow

App pessoal de controle de treinos de academia para **Android e iOS**, feito com React Native e Expo. Registra os treinos realizados, permite alternar entre **programas de treino** e entre **tipos de sequência**, e acompanha frequência e cadência.

> Projeto de uso pessoal, sem fins comerciais. Funciona 100% offline: sem backend, sem login, sem sincronização. Nenhum dado sai do aparelho.

---

## Sumário

- [Visão geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Conceito central: programa + sequência](#conceito-central-programa--sequência)
- [Stack](#stack)
- [Como instalar e rodar](#como-instalar-e-rodar)
- [Gerar um APK para instalar direto no aparelho](#gerar-um-apk-para-instalar-direto-no-aparelho)
- [Scripts disponíveis](#scripts-disponíveis)
- [Testes](#testes)
- [Arquitetura](#arquitetura)
- [Modelo de dados](#modelo-de-dados)
- [Estrutura de diretórios](#estrutura-de-diretórios)
- [Como o projeto foi feito](#como-o-projeto-foi-feito)
- [Documentação](#documentação)
- [Estado atual e pendências](#estado-atual-e-pendências)
- [Problemas conhecidos e solução de problemas](#problemas-conhecidos-e-solução-de-problemas)
- [Fora do escopo](#fora-do-escopo)
- [Licença](#licença)

---

## Visão geral

O Gym Flow responde a uma pergunta simples: **"qual é o meu próximo treino?"**. Duas configurações independentes determinam a resposta:

- o **programa ativo** (o conjunto de treinos que você está seguindo, como o _Treino Padrão_ ou o _Treino Monstro_);
- o **tipo de sequência** (como o app escolhe o próximo treino: em ordem contínua ou por dia da semana).

Na tela inicial o app mostra o treino da vez. Ao iniciar, você marca os exercícios que fez, anota a carga de cada um e finaliza. Tudo fica salvo em um banco SQLite local, e o histórico e as estatísticas são calculados a partir dele.

A interface segue a direção visual "Placar de academia", com tema escuro e textos em português (pt-BR).

## Funcionalidades

### Programas e sequências

- **Dois programas iniciais**, carregados como dados (seed), não como regra de código:
  - **Treino Padrão:** 5 dias (Peito e Tríceps · Costas e Bíceps · Perna Completo · Ombro Isolado · Bíceps e Tríceps).
  - **Treino Monstro:** 4 treinos (A Ombros completos · B Costas e Bíceps · C Pernas completas · D Peito e Tríceps), com agenda semanal.
- **Sequência contínua:** avança somente ao finalizar um treino (1 → 2 → … → N → 1) e independe do calendário. Pode ser reiniciada, e reiniciar nunca apaga o histórico.
- **Sequência semanal:** cada programa tem sua agenda por dia da semana. Dia sem treino aparece como descanso, e o app **não cria sessão automaticamente**.
- **Troca livre** de programa e de sequência: nada do histórico é alterado, e ao voltar a um programa ele retoma o próprio estado.

### Execução do treino

- Marcar exercícios como feitos, em **qualquer ordem**, e registrar a **carga** de cada um.
- **Última carga** exibida por exercício, derivada da última sessão finalizada do mesmo programa.
- Finalizar treino incompleto (com zero ou mais exercícios feitos) é permitido.
- **Sessão em andamento persistida:** ao reabrir o app, você escolhe entre continuar ou descartar. Descartar não altera sequência nem estatísticas.
- Finalização **transacional**: exercícios, status da sessão, avanço da sequência e limpeza da sessão em andamento acontecem juntos ou não acontecem.
- **Bi-set** como técnica: cada exercício do par é um item próprio, marcável e com carga própria.
- Prescrição (séries, repetições, técnica, observações) exibida como texto da ficha. O app exibe, não interpreta.

### Ajuda contextual (sob demanda)

- **`?`** abre a legenda de técnicas (bi-set, drop-set, pirâmides, falha, excêntrica, concêntrica, progressão de carga).
- **`ⓘ`** abre músculo principal, secundários e descrição de cada exercício.
- Abrir e fechar a ajuda **não** altera exercício, peso, sequência, cronômetro nem sessão.

### Histórico

- Lista de sessões finalizadas agrupada por mês, com filtro por programa.
- **Edição do histórico:** marcar ou desmarcar exercícios e alterar pesos, salvando tudo numa transação. A edição nunca muda o programa ou o treino da sessão.

### Estatísticas

- Períodos: semana, mês, trimestre, semestre e ano.
- Apenas **frequência e cadência**: quantidade de treinos, média por semana e intervalo médio.
- Filtro por programa (Todos ou cada programa). Só entram sessões finalizadas.

### Cronômetro de descanso

- Cronômetro opcional entre exercícios, com duração configurável e ativação nas configurações.

### Configurações

- Escolha do programa ativo, do tipo de sequência e visualização da agenda semanal do programa.

## Conceito central: programa + sequência

```text
Programa ativo (tipo de treino)  +  Tipo de sequência  =  regra para o próximo treino
```

| Tipo de sequência | Como escolhe o próximo treino                                                   |
| ----------------- | ------------------------------------------------------------------------------- |
| `CONTINUOUS`      | Avança a posição ao finalizar um treino; depois do último volta ao primeiro.    |
| `WEEKLY`          | Usa a agenda do programa para o dia da semana atual; dia sem treino é `null`.   |

A regra **nunca** é codificada por nome de programa. Qualquer programa pode usar qualquer sequência. A escolha é feita por estratégias (`ContinuousSequenceStrategy` e `WeeklyScheduleSequenceStrategy`) selecionadas por um `NextWorkoutResolver`, sem `if/else` de estratégia espalhado pelo código.

## Stack

| Área              | Tecnologia                                                        |
| ----------------- | ----------------------------------------------------------------- |
| Framework         | React Native + Expo (SDK 57)                                      |
| Linguagem         | TypeScript em modo `strict`                                       |
| Navegação         | Expo Router (rotas por arquivo, `typedRoutes` ativado)            |
| Banco de dados    | SQLite via `expo-sqlite`                                          |
| Estado de UI      | Zustand                                                           |
| Testes            | Jest (`jest-expo`) + React Native Testing Library                 |
| Testes de dados   | `better-sqlite3` (SQLite em Node, só para testes de integração)   |
| Qualidade         | ESLint (`eslint-config-expo`) + Prettier                          |

A regra do projeto é priorizar dependências pequenas e maduras.

## Como instalar e rodar

### Pré-requisitos

- **Node.js** em versão LTS recente (o desenvolvimento foi feito com Node 24) e **npm**.
- **Git**.
- Para rodar no aparelho: o app **Expo Go** ou um _development build_; para emuladores: **Android Studio** (Android) e/ou **Xcode** (iOS, somente macOS).

### Passo a passo

```bash
# 1. Clonar o repositório
git clone https://github.com/Vanderberg/gym-flow.git
cd gym-flow

# 2. Instalar as dependências
npm install

# 3. Iniciar o servidor de desenvolvimento
npm start
```

Com o servidor rodando, escolha como abrir o app:

- **Aparelho físico:** escaneie o QR code exibido no terminal com o Expo Go (Android) ou com a câmera (iOS).
- **Emulador Android:** `npm run android` (ou pressione `a` no terminal do Expo).
- **Simulador iOS (macOS):** `npm run ios` (ou pressione `i` no terminal do Expo).

Na primeira abertura, o app cria o banco SQLite local, aplica as migrations e carrega o seed (programas, treinos, exercícios, agenda e configurações). Nenhuma configuração adicional, chave de API ou variável de ambiente é necessária.

> **Nota:** o app usa o módulo nativo `expo-sqlite`. Se o Expo Go não abrir o app no seu aparelho ou versão do SDK, gere um _development build_ (`npx expo run:android` ou `npx expo run:ios`).

### Rodar no celular com o Expo Go (testado)

Este é o caminho mais simples para testar em um aparelho real, sem instalar Android Studio nem Xcode.

1. Instale o app **Expo Go** no celular (Android ou iOS).
2. Deixe o celular na **mesma rede Wi-Fi** do computador.
3. Na raiz do projeto, rode:

   ```bash
   npm start
   ```

   Isso inicia o Metro Bundler e imprime um **QR code** no terminal, além do endereço no formato `exp://<ip-da-sua-máquina>:8081`.

4. Escaneie o QR code (câmera do iPhone, ou a opção de escanear dentro do Expo Go no Android). Se preferir digitar o endereço manualmente, abra o Expo Go, toque em "Enter URL manually" e informe o `exp://<ip>:8081` mostrado no terminal.

Se o app não abrir pelo endereço `exp://`:

- Confira se o endereço realmente existe primeiro pelo navegador do celular, acessando `http://<ip>:8081/status` (deve responder `packager-status:running`). Se isso já falhar, o problema é de rede, não do Expo.
- Confirme que o celular está na mesma rede Wi-Fi do computador (não em dados móveis, nem em uma rede de convidados com isolamento de clientes).
- No Windows, confira se o firewall libera o Node.js nas redes privada e pública (`Get-NetFirewallRule -DisplayName '*Node.js*'` no PowerShell).
- Se a rede local não permitir a conexão direta, use um túnel, que não depende da rede local:

  ```bash
  npx expo start --tunnel
  ```

  Na primeira vez, o Expo pede para instalar a dependência `@expo/ngrok`; aceite. O QR code passa a apontar para um endereço externo, e o celular não precisa estar na mesma rede.

Se quiser rodar o servidor em segundo plano sem o modo interativo (sem QR code na tela, útil para automação), use:

```bash
CI=1 npx expo start --port 8081
```

Nesse modo o Metro roda sem recarga automática (mostra "Metro is running in CI mode, reloads are disabled") e sem imprimir QR code; use o endereço `exp://<ip-da-sua-máquina>:8081` manualmente no Expo Go, como descrito acima. Para o uso normal do dia a dia, prefira `npm start`.

### Gerar um APK para instalar direto no aparelho

Para gerar um `.apk` (fora da Play Store, para instalar direto num aparelho ou compartilhar com alguém), o projeto usa o [EAS Build](https://docs.expo.dev/build/introduction/), que compila na nuvem da Expo — não precisa de Android Studio local.

```bash
npm install -g eas-cli   # uma vez só
eas login                # ou EXPO_TOKEN, se a conta usa login social (Google etc.)
eas build --platform android --profile preview
```

O profile `preview` (definido em [eas.json](eas.json)) gera um `.apk` de instalação direta (`distribution: internal`). Ao final do build, a CLI mostra um link de download — baixe o `.apk` e instale no aparelho (o Android pede para liberar "fontes desconhecidas", já que não vem da Play Store).

Para versionar os APKs gerados sem inchar o repositório com binários, publique-os como [GitHub Releases](https://github.com/Vanderberg/gym-flow/releases) em vez de commitá-los no git.

## Scripts disponíveis

| Comando                | O que faz                                                          |
| ---------------------- | ------------------------------------------------------------------ |
| `npm start`            | Inicia o servidor de desenvolvimento do Expo.                      |
| `npm run android`      | Inicia o Expo abrindo no Android.                                  |
| `npm run ios`          | Inicia o Expo abrindo no iOS.                                      |
| `npm test`             | Roda toda a suíte Jest.                                            |
| `npm run typecheck`    | Verificação de tipos (`tsc --noEmit`).                             |
| `npm run lint`         | Análise estática com ESLint.                                       |
| `npm run format`       | Formata o código com Prettier.                                     |
| `npm run format:check` | Verifica a formatação sem alterar arquivos.                        |
| `npm run check`        | Roda tipos, lint, formatação e testes em sequência.                |

## Testes

A suíte é organizada por camada, em `tests/`:

```text
tests/
├── unit/          # domínio puro: sequências, estatísticas, datas, ajuda, pureza de camadas
├── integration/   # casos de uso, repositórios, migrations e seed sobre SQLite real (better-sqlite3)
└── ui/            # telas e componentes com React Native Testing Library
```

O que é coberto, entre outros pontos:

- sequência contínua (primeiro, meio, último → primeiro, reinício) e semanal (dia com treino, descanso, mudança de semana);
- troca de programa e de estratégia sem perda de estado;
- médias, intervalo médio, filtros de período e datas locais;
- criar, finalizar, recuperar e editar sessão, com persistência;
- o seed inteiro: todo exercício de todo programa precisa ter músculo principal, secundários e descrição;
- fluxos de UI: iniciar treino, marcar, informar peso, finalizar, editar histórico e abrir a ajuda sem alterar a sessão;
- testes de pureza que impedem o domínio de importar React, SQLite ou módulos de UI.

Para rodar:

```bash
npm test                    # tudo
npx jest tests/unit         # só unitários
npx jest tests/ui/history   # só uma pasta
```

## Arquitetura

O projeto é organizado em camadas com dependência sempre no sentido de cima para baixo:

```text
UI → Hooks/Application → Domain → Repositories → SQLite
```

- **Domain** (`src/domain`): regras puras, sem React, sem SQLite e sem APIs externas. Resolução do próximo treino, estratégias de sequência, finalização de sessão e estatísticas vivem aqui.
- **Application** (`src/application`): casos de uso, como `StartWorkout`, `FinishWorkout`, `SelectProgram`, `SelectSequenceStrategy`, `ResetSequence`, `GetStatistics` e `SaveSessionEdits`.
- **Data** (`src/data`): conexão com o banco, repositórios SQLite, migrations versionadas e seed idempotente.
- **Store** (`src/store`): estado com Zustand, restrito a estado de UI, sessão atual, cronômetro e configurações carregadas. **O SQLite é a fonte de verdade.**
- **UI** (`src/app`, `src/components`, `src/hooks`): telas do Expo Router e componentes, sem regra de negócio complexa.

### Decisões de projeto que valem conhecer

- **Prescrição é dado.** `prescription`, `technique` e `notes` são texto em `workout_exercise`. O app exibe e não interpreta; não há mínimo ou máximo de repetições, nem repetições realizadas.
- **"Última carga" é derivada.** É calculada a partir da última sessão finalizada do mesmo programa e exercício, então não existe coluna `last_weight`.
- **Bi-set não é entidade.** São dois exercícios distintos, cada um com `technique = BI-SET` e uma nota que indica o parceiro.
- **Aquecimento é uma nota livre** (`workout.warmup_note`), não um exercício, e não entra em contagens.
- **Datas locais.** Usa-se a data e o dia da semana locais do usuário, evitando UTC que deslocaria um treino de dia.
- **Exercício é uma entidade única** reaproveitada por vários treinos (`UNIQUE(workout_id, exercise_id)`).

## Modelo de dados

Tabelas principais (detalhes e schema SQL em [docs/modelo-dados.md](docs/modelo-dados.md)):

| Tabela                     | Papel                                                                          |
| -------------------------- | ------------------------------------------------------------------------------ |
| `training_program`         | Programas de treino (inclui a sugestão de cardio exibida na Home).             |
| `workout`                  | Treinos de um programa (inclui a nota de aquecimento).                         |
| `exercise`                 | Exercícios, com músculo principal, secundários e descrição.                    |
| `workout_exercise`         | Exercício dentro de um treino: prescrição, técnica, observações e ordem.       |
| `weekly_schedule`          | Agenda por dia da semana de cada programa (com nota para dia opcional).        |
| `program_sequence_state`   | Posição atual da sequência contínua, por programa.                             |
| `workout_session`          | Sessões de treino, com `program_id` e `workout_id`.                            |
| `workout_session_exercise` | Exercícios realizados na sessão: marcação e carga.                             |
| `app_settings`             | Registro único com programa ativo, tipo de sequência e cronômetro.             |

O banco usa **migrations versionadas** (`src/data/migrations`) e um **seed idempotente** (`src/data/seed`), que pode rodar várias vezes sem duplicar dados nem apagar configurações, estado de sequência ou sessões.

## Estrutura de diretórios

```text
gym-flow/
├── src/
│   ├── app/            # rotas do Expo Router: abas (Home, Histórico, Estatísticas, Config), treino, detalhe do histórico, configurações
│   ├── domain/         # regras puras: program, workout, exercise, sequence, session, statistics, help, history, restTimer...
│   ├── application/    # casos de uso
│   ├── data/           # database, repositories, migrations, seed, bootstrap
│   ├── store/          # stores Zustand
│   ├── hooks/          # ligação entre UI, stores e casos de uso
│   ├── components/     # componentes de UI por área (common, home, workout, history, statistics, help, settings)
│   ├── constants/      # tema (tokens visuais), legenda de técnicas
│   └── utils/          # datas, durações, formatação
├── tests/              # unit, integration e ui
├── docs/               # PRD, arquitetura, modelo de dados, telas, design, fichas de treino, backlog
├── specs/              # uma pasta por feature (spec, plano, pesquisa, modelo de dados, tarefas)
├── assets/             # ícones e imagens do app
└── .specify/           # configuração do spec-kit e constituição do projeto
```

## Como o projeto foi feito

O Gym Flow foi construído com **desenvolvimento orientado a especificação** (_spec-driven development_), usando o [spec-kit](https://github.com/github/spec-kit) junto com o **Claude Code**. A ordem foi documentar primeiro e implementar depois.

### 1. Documentação como fonte de verdade

Antes de qualquer código, o produto foi descrito em `docs/`:

- [PRD](docs/PRD.md): produto, programas, sequências, requisitos funcionais e critérios de aceite;
- [Arquitetura](docs/arquitetura.md): stack, estratégias de sequência, camadas e estrutura de diretórios;
- [Modelo de dados](docs/modelo-dados.md): entidades, schema SQL e regras de integridade;
- [Telas](docs/telas.md) e [design das telas](docs/design-telas.md), com um [protótipo navegável](docs/prototipo-telas.html) em HTML;
- [Fichas de treino](docs/fichas-treino.md): transcrição das fichas reais (as imagens originais estão em `docs/treino monstro/` e `docs/treino padrao/`), que servem de base do seed;
- [Backlog](docs/backlog.md): épicos e itens `BL-xxx` com prioridade P0, P1 e P2.

### 2. Constituição do projeto

Os princípios inegociáveis ficam em [.specify/memory/constitution.md](.specify/memory/constitution.md). Entre eles: offline-first, domínio puro, TypeScript estrito, registro livre e finalização flexível, histórico preservado, programa e sequência independentes, prescrição como dado, ausência de recomendações e integridade transacional. Quando o código diverge da documentação, a documentação é atualizada junto.

### 3. Uma spec por feature

O backlog foi dividido em 11 specs, em `specs/`, cada uma com o ciclo do spec-kit:

```text
/speckit-specify → /speckit-clarify → /speckit-plan → /speckit-tasks → /speckit-analyze → /speckit-implement
```

Cada pasta traz `spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md` e `tasks.md`.

| Spec | Conteúdo                                                        |
| ---- | --------------------------------------------------------------- |
| 001  | Fundação: projeto Expo, navegação em abas, migrations SQLite     |
| 002  | Modelo de dados: schema, tipos de domínio e repositórios         |
| 003  | Programas e seed: Treino Padrão e Treino Monstro                 |
| 004  | Estratégias de sequência (contínua e semanal) e resolvedor       |
| 005  | Configurações de programa e de sequência, agenda semanal         |
| 006  | Home: próximo treino                                             |
| 007  | Execução do treino: marcar, pesar, finalizar, sessão em andamento |
| 008  | Ajuda contextual (`?` e `ⓘ`)                                     |
| 009  | Histórico de sessões, filtro e edição                            |
| 010  | Estatísticas de frequência e cadência                            |
| 011  | Cronômetro de descanso                                           |

### 4. Implementação em paralelo por agentes

A implementação foi orquestrada por um agente definido em `.claude/agents/builder-specs.md`. Um índice em `specs/INDEX.md` guarda o status de cada spec (`planejando` → `aprovada` → `desenvolvendo` → `concluída`) e as dependências entre elas. Em cada rodada, o agente pega as specs `aprovada` cujas dependências já estão `concluída` e dispara um sub-agente por spec, cada um em seu próprio **git worktree** e branch (`spec/<nome>`). Depois de cada rodada, os branches são mergeados na `main`.

As specs independentes (008 a 011) rodaram em paralelo, e os conflitos de merge nos arquivos compartilhados foram resolvidos manualmente, seguido de uma nova execução de tipos, lint e testes.

### 5. Verificação

Cada spec tem tarefas de teste por camada, e a `main` passa em `tsc --noEmit`, ESLint e Jest. A validação manual em aparelhos Android e iOS ainda está pendente (veja abaixo).

## Documentação

| Documento                                        | Conteúdo                                                  |
| ------------------------------------------------ | --------------------------------------------------------- |
| [docs/PRD.md](docs/PRD.md)                       | Produto, requisitos e critérios de aceite                 |
| [docs/arquitetura.md](docs/arquitetura.md)       | Stack, camadas e estratégias de sequência                 |
| [docs/modelo-dados.md](docs/modelo-dados.md)     | Entidades, schema SQL e integridade                       |
| [docs/telas.md](docs/telas.md)                   | Telas, fluxos e estados de UI                             |
| [docs/design-telas.md](docs/design-telas.md)     | Direção visual e definição detalhada das telas            |
| [docs/fichas-treino.md](docs/fichas-treino.md)   | Fichas de treino transcritas (base do seed)               |
| [docs/backlog.md](docs/backlog.md)               | Épicos, prioridades e roadmap                             |
| [specs/](specs/)                                 | Especificação, plano e tarefas de cada feature            |

## Estado atual e pendências

As 11 specs estão **implementadas e integradas na `main`**. O app já rodou com sucesso via Expo Go em um aparelho Android real (ver [Rodar no celular com o Expo Go](#rodar-no-celular-com-o-expo-go-testado)). O que ainda falta:

- **Validação formal dos roteiros de `quickstart.md`:** o app funciona em aparelho real, mas os roteiros de teste manual de cada spec ainda não foram executados e marcados um a um (`tasks.md` de cada spec). Inclui confirmar o comportamento de chaves estrangeiras (`PRAGMA foreign_keys`) dentro de transações no `expo-sqlite` em iOS, verificado até aqui só com `better-sqlite3` nos testes e em Android real.
- **Revisão de conteúdo do seed:** os textos de exercícios, cardio e aquecimento aguardam aprovação do dono do app (`specs/003-programas-seed/content-review.md`).
- **Formatação:** `npm run format:check` ainda acusa arquivos por diferença de fim de linha (CRLF/LF) em ambiente Windows; veja a seção abaixo.
- **Pontos em aberto na documentação:** variações de exercício assumidas (por exemplo, "tríceps testa unilateral no cross" tratado como exercício distinto do "Tríceps testa"), comportamento ao escolher a sequência semanal num programa sem agenda e a troca de programa com sessão em andamento.

## Problemas conhecidos e solução de problemas

- **`npm run check` falha em `format:check`.** Há arquivos com fim de linha divergente (CRLF/LF), principalmente arquivos de configuração e outros anteriores às specs. Não afeta o app. Uma alternativa é normalizar com `npm run format`, ou configurar `.gitattributes`/`core.autocrlf` para o seu ambiente.
- **`npm install` falha ao compilar `better-sqlite3`.** É uma dependência de desenvolvimento, usada só pelos testes de integração, e é um módulo nativo. Em alguns ambientes Windows, a compilação depende das ferramentas de build do C++. Instale as ferramentas de build do seu sistema, ou use uma versão de Node com binário pré-compilado disponível.
- **O Expo Go não abre o app.** Use um _development build_: `npx expo run:android` ou `npx expo run:ios`.
- **Jest encontra testes duplicados.** Se você usa worktrees em `.worktrees/`, rode `npx jest --testPathIgnorePatterns '\.worktrees'` na raiz do repositório.

## Fora do escopo

O app **não** faz, e não pretende fazer:

- recomendar cargas, exercícios ou treinos; sem IA nem personal virtual;
- dieta, calorias ou peso corporal;
- rede social, login, pagamentos ou assinaturas;
- nuvem, backend ou sincronização;
- integração com wearables;
- registro de cardio (a Home mostra apenas o texto de sugestão do programa).

Os textos de prescrição, técnicas, aquecimento e cardio são conteúdo do programa, transcrito das fichas do usuário, e não recomendação gerada pelo app.

## Licença

Distribuído sob a licença [MIT](LICENSE).
