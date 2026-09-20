<!--
Sync Impact Report
- Version change: 2.1.0 → 2.2.0 (MINOR: VII define bi-set como exercícios distintos; VIII esclarece
  que textos da ficha do programa — aquecimento, dia opcional, sugestão de cardio — são conteúdo do
  programa, não recomendação do app)
- Histórico: 2.0.0 → 2.1.0 (MINOR: VIII exige informações do exercício preenchidas para todo
  exercício de todo programa; `ⓘ` funciona em qualquer tipo de treino)
- Histórico: 1.0.0 → 2.0.0 (MAJOR: o modelo deixou de ser uma sequência fixa 1–5 e passou a
  ter programas de treino e estratégias de sequência independentes; princípios redefinidos)
- Princípios modificados:
  - V. "Histórico Preservado" → redefinido: preserva também troca de programa/estratégia; sessão
    guarda programa e treino; "última carga" passa a ser por programa
  - IV. "Registro Livre e Finalização Flexível" → removida a referência à sequência 1–5
  - VII. "Estatísticas de Frequência e Cadência" → agora com filtro por programa
  - VIII. "Integridade Transacional e Datas Locais" → inclui dia da semana local e estado por programa
  - IX. "Testes por Camada" → inclui estratégias, troca de programa e troca de estratégia
- Princípios adicionados: VI. Programa e Sequência Independentes; VII. Prescrição como Dado
  (renumeração: demais princípios deslocados)
- Princípios fundidos: "Sem Recomendações" agora inclui conteúdo educativo sob demanda
- Seções adicionadas: nenhuma nova; Restrições Técnicas e Fluxo de Desenvolvimento atualizadas
- Seções removidas: nenhuma
- Templates:
  ✅ .specify/templates/plan-template.md (Constitution Check lê os gates deste arquivo)
  ✅ .specify/templates/spec-template.md (sem mudança necessária)
  ✅ .specify/templates/tasks-template.md (nota sobre testes obrigatórios permanece válida)
  ✅ docs/design-telas.md e docs/prototipo-telas.html (atualizados para programas e sequências)
- TODOs adiados: nenhum
-->
# Gym Flow Constitution

## Core Principles

### I. Offline-First e Local-First (NON-NEGOTIABLE)
Toda funcionalidade essencial MUST funcionar sem internet. O banco SQLite local é a
fonte de verdade; Zustand guarda apenas estado de UI, sessão em andamento, cronômetro e
configurações carregadas, e MUST NOT substituir o banco como persistência. Não há backend,
login nem sincronização no MVP. Migrations MUST ser versionadas e o seed MUST ser
idempotente.
Rationale: uso pessoal, dentro da academia, muitas vezes sem sinal.

### II. Domínio Puro e Camadas
A dependência segue `UI → Hooks/Application → Domain → Repositories → SQLite`. Regras de
sequência, resolução do próximo treino, finalização, frequência, cadência e estatísticas
MUST viver em `domain/` como código puro, sem importar React, SQLite ou APIs. Componentes
MUST NOT conter regra de negócio complexa. O domínio depende de interfaces de repositório,
nunca de SQLite diretamente. Casos de uso ficam em `application/`.
Rationale: testabilidade e evolução futura (backup, sincronização) sem reescrever regras.

### III. TypeScript Estrito
O projeto MUST usar TypeScript com `strict` habilitado, ESLint e Prettier sem erros.
`any` implícito é proibido; `any` explícito exige justificativa em comentário.
O código MUST ser compartilhado entre Android e iOS; código específico de plataforma
é exceção justificada.

### IV. Registro Livre e Finalização Flexível
Exercícios MUST poder ser executados, marcados e desmarcados em qualquer ordem;
`display_order` é apenas visual. O usuário MUST poder finalizar um treino com qualquer
quantidade de exercícios realizados, inclusive zero. Repetições realizadas MUST NOT ser
registradas; apenas realizado/não realizado e carga (nula ou >= 0). Uma sessão em andamento
MUST ser persistida e recuperável após fechar o app; descartá-la MUST NOT alterar a
sequência nem entrar em estatísticas.

### V. Histórico Preservado
Sessões finalizadas MUST NOT ser apagadas nem reescritas por nenhuma operação do app:
trocar programa, trocar tipo de sequência e reiniciar sequência apenas afetam os próximos
treinos. Cada sessão MUST registrar o programa e o treino executados. Sessões finalizadas
MUST poder ser corrigidas (marcação e carga) sem alterar programa, treino nem a ordem
histórica. A "última carga" MUST ser derivada do histórico (última sessão finalizada do
mesmo programa e exercício com peso preenchido), nunca armazenada em coluna própria.

### VI. Programa e Sequência Independentes
Tipo de treino (programa) e tipo de sequência (`CONTINUOUS`, `WEEKLY`) são configurações
independentes; combinadas, resolvem o próximo treino. A resolução MUST passar pela
abstração `SequenceStrategy` / `NextWorkoutResolver`, com estratégias
`ContinuousSequenceStrategy` e `WeeklyScheduleSequenceStrategy`. É proibido codificar regras
por nome de programa (ex.: "Treino Monstro sempre usa dias da semana") ou espalhar
`if/else` de estratégia pela aplicação. O estado da sequência contínua MUST ser mantido
por programa, e a agenda semanal pertence ao programa. A sequência contínua avança somente
ao finalizar um treino e independe do calendário. Na agenda semanal, um dia sem treino
retorna `null` e o app MUST NOT criar ou registrar sessão automaticamente: o usuário inicia
e finaliza a sessão. Novos programas MUST poder ser adicionados sem mudar a arquitetura.

### VII. Prescrição como Dado
A prescrição de um exercício (`prescription`, `technique`, `notes`) é texto armazenado em
`workout_exercise`; o app a exibe e MUST NOT interpretá-la nem limitá-la a `min_reps` e
`max_reps`. Bi-set, drop-set, pirâmides, falha e afins são apenas dados exibidos. Um bi-set são dois
exercícios distintos: cada um MUST ser um item próprio, marcável e com carga própria. O
exercício (`exercise`) descreve movimento e músculos; a prescrição descreve como o
programa o usa; a sessão registra o que foi feito. Essas três responsabilidades MUST
permanecer separadas.

### VIII. Sem Recomendações
O app registra o que foi feito; MUST NOT sugerir cargas, exercícios ou treinos, nem incluir
IA, personal trainer virtual, análise médica/esportiva, dieta, peso corporal ou calorias.
Textos que fazem parte da ficha do programa (prescrição, técnica, observações, nota de
aquecimento livre, texto do dia opcional e sugestão de cardio na Home) são conteúdo do
programa exibido como está; o app MUST NOT gerar, adaptar nem registrar essas sugestões.
Conteúdo educativo (legenda de técnicas e músculos/descrição do exercício) é informativo,
MUST ser exibido sob demanda (`?` e `ⓘ` em bottom sheet) e MUST NOT alterar exercício,
peso, sequência, cronômetro ou sessão ao ser aberto ou fechado. As informações do
exercício (`primary_muscle`, `secondary_muscles`, `description`) MUST estar preenchidas
para todo exercício de todo programa cadastrado por seed, e o `ⓘ` MUST funcionar em
qualquer tipo de treino.

### IX. Estatísticas de Frequência e Cadência
Estatísticas (semana, mês, trimestre, semestre, ano) MUST cobrir somente frequência e
cadência: quantidade de treinos, média por semana e intervalo médio, com filtro por
programa (Todos ou um programa). MUST considerar apenas sessões finalizadas e ser calculadas
por um serviço centralizado a partir de `workout_session`, sem tabelas próprias no MVP.

### X. Integridade Transacional e Datas Locais
Finalizar uma sessão (persistir exercícios, marcar `completed`, atualizar o estado da
sequência quando aplicável, limpar a sessão em andamento) MUST ser transacional. Trocar de
programa MUST respeitar sessão em andamento incompatível e MUST NOT modificar sessões
antigas. As regras de integridade do modelo de dados (unicidades, chaves estrangeiras,
`app_settings` com registro único, um estado de sequência por programa, peso nulo ou >= 0)
MUST ser garantidas no schema. Cálculos de calendário e dia da semana MUST usar a data
local do usuário, evitando deslocamento de dia por conversão UTC.

### XI. Testes por Camada
Regras de domínio (sequência contínua, sequência semanal, reinício, troca de programa,
troca de estratégia, médias, intervalo médio, filtros de período, datas) MUST ter testes
unitários. Persistência e fluxos de sessão (criar, finalizar, recuperar, editar) MUST ter
testes de integração. Fluxos de UI críticos (iniciar, marcar, registrar peso, finalizar,
editar histórico, abrir ajuda sem alterar sessão) MUST ter testes com React Native Testing
Library. Bugs corrigidos MUST ganhar teste de regressão. Ferramentas: Jest + RNTL.

### XII. Simplicidade e Privacidade
Dependências MUST ser poucas, maduras e justificadas. Nenhum dado sai do aparelho e o
app MUST NOT solicitar permissões desnecessárias. Funcionalidades fora do MVP (login,
backend, nuvem, multiusuário, pagamentos, assinaturas, rede social, wearables, integrações
de saúde) MUST NOT ser implementadas sem emenda a esta constituição. Aplica-se YAGNI.

## Restrições Técnicas e de Escopo

- Stack: React Native, TypeScript, Expo, Expo Router, SQLite, Zustand, Jest, React Native
  Testing Library, ESLint, Prettier.
- Plataformas: Android e iOS, ambos validados antes de considerar o MVP pronto.
- Programas iniciais: Treino Padrão (5 treinos, sequência contínua) e Treino Monstro
  (A/B/C/D, agenda semanal), cadastrados por seed como dados, não como código.
- Idioma: documentação e textos de UI em português (pt-BR).
- Prioridades do backlog: P0 obrigatório no MVP; P1 após o fluxo principal (inclui o
  cronômetro de descanso, filtros de histórico e ajuda por técnica); P2 futuro.
- Requisitos de referência: `docs/PRD.md`, `docs/arquitetura.md`, `docs/modelo-dados.md`,
  `docs/telas.md`, `docs/backlog.md`, `docs/design-telas.md`.

## Fluxo de Desenvolvimento

- Cada spec e cada tarefa MUST referenciar IDs do backlog (BL-xxx) e requisitos (RF-xx).
- O plano MUST passar pelo Constitution Check antes da pesquisa e ser reavaliado após o
  design; violações exigem justificativa em Complexity Tracking.
- Mudanças que divergem de `docs/` MUST atualizar a documentação no mesmo trabalho.
- Um item só está concluído com lint, checagem de tipos e testes passando.

## Governance

Esta constituição prevalece sobre outras práticas do projeto. Emendas exigem registro da
mudança, atualização do Sync Impact Report e propagação para templates dependentes.
Versionamento semântico: MAJOR para remoção/redefinição incompatível de princípios,
MINOR para novo princípio ou expansão material, PATCH para esclarecimentos. Toda revisão
de spec, plano e código MUST verificar conformidade. Orientação de uso diário em
`CLAUDE.md`.

**Version**: 2.2.0 | **Ratified**: 2026-09-19 | **Last Amended**: 2026-09-19
