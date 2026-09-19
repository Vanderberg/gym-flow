<!--
Sync Impact Report
- Version change: (template não preenchido) → 1.0.0
- Princípios adicionados: I. Offline-First e Local-First; II. Domínio Puro e Camadas;
  III. TypeScript Estrito; IV. Registro Livre e Finalização Flexível;
  V. Histórico Preservado; VI. Sem Recomendações; VII. Estatísticas de Frequência e Cadência;
  VIII. Integridade Transacional e Datas Locais; IX. Testes por Camada;
  X. Simplicidade e Privacidade
- Seções adicionadas: Restrições Técnicas e de Escopo; Fluxo de Desenvolvimento; Governança
- Seções removidas: nenhuma
- Templates:
  ✅ .specify/templates/plan-template.md (Constitution Check já lê os gates deste arquivo)
  ✅ .specify/templates/spec-template.md (sem mudança necessária)
  ✅ .specify/templates/tasks-template.md (nota sobre testes obrigatórios ajustada)
- TODOs adiados: nenhum
-->
# Gym Flow Constitution

## Core Principles

### I. Offline-First e Local-First (NON-NEGOTIABLE)
Toda funcionalidade essencial MUST funcionar sem internet. O banco SQLite local é a
fonte de verdade; Zustand guarda apenas estado de UI, sessão em andamento e cronômetro,
e MUST NOT substituir o banco como persistência. Não há backend, login nem sincronização
no MVP. Migrations MUST ser versionadas e o seed MUST ser idempotente.
Rationale: uso pessoal, dentro da academia, muitas vezes sem sinal.

### II. Domínio Puro e Camadas
A dependência segue `UI → Hooks/Application → Domain/Services → Repositories → SQLite`.
Regras de sequência, finalização, frequência, cadência e estatísticas MUST viver em
`domain/` como funções puras, sem importar React, SQLite ou APIs. Componentes MUST NOT
conter regra de negócio complexa. O domínio depende de interfaces de repositório, nunca
de SQLite diretamente.
Rationale: testabilidade e evolução futura (backup, sincronização) sem reescrever regras.

### III. TypeScript Estrito
O projeto MUST usar TypeScript com `strict` habilitado, ESLint e Prettier sem erros.
`any` implícito é proibido; `any` explícito exige justificativa em comentário.
O código MUST ser compartilhado entre Android e iOS; código específico de plataforma
é exceção justificada.

### IV. Registro Livre e Finalização Flexível
Exercícios MUST poder ser executados, marcados e desmarcados em qualquer ordem;
`display_order` é apenas visual. O usuário MUST poder finalizar um treino com zero ou
mais exercícios realizados. Repetições por série MUST NOT ser registradas. Uma sessão em
andamento MUST ser persistida e recuperável após fechar o app; descartá-la MUST NOT
alterar a sequência.

### V. Histórico Preservado
Sessões finalizadas MUST NOT ser apagadas por nenhuma operação do app. Reiniciar a
sequência apenas define o próximo treino como Dia 1. A sequência (Dia 1→…→5→1) avança
somente ao finalizar um treino, independe de dias da semana e de intervalos sem treinar.
Sessões finalizadas MUST poder ser corrigidas (marcação e carga) sem alterar a ordem
histórica nem o dia da sequência já realizado. A "última carga" MUST ser derivada do
histórico (último peso não nulo), nunca armazenada em coluna própria.

### VI. Sem Recomendações
O app registra o que foi feito; MUST NOT sugerir cargas, exercícios ou treinos, nem
incluir IA, análise médica/esportiva, dieta, peso corporal ou calorias.

### VII. Estatísticas de Frequência e Cadência
Estatísticas (semana, mês, trimestre, semestre, ano) MUST cobrir somente frequência e
cadência: quantidade de treinos, média por semana e intervalo médio. MUST considerar
apenas sessões finalizadas e ser calculadas por um serviço centralizado a partir de
`workout_session`, sem tabelas próprias no MVP.

### VIII. Integridade Transacional e Datas Locais
Finalizar uma sessão (persistir exercícios, marcar `completed`, calcular próximo dia,
atualizar `sequence_state`, limpar sessão em andamento) MUST ser transacional.
As regras de integridade do modelo de dados (unicidades, `current_day` entre 1 e 5,
peso nulo ou >= 0, registro único em `sequence_state` e `settings`) MUST ser garantidas
no schema. Cálculos de calendário MUST usar a data local do usuário, evitando
deslocamento de dia por conversão UTC.

### IX. Testes por Camada
Regras de domínio (sequência, reinício, médias, intervalo médio, filtros de período,
datas) MUST ter testes unitários. Persistência e fluxos de sessão (criar, finalizar,
recuperar) MUST ter testes de integração. Fluxos de UI críticos (iniciar, marcar,
registrar peso, finalizar, editar histórico) MUST ter testes com React Native Testing
Library. Bugs corrigidos MUST ganhar teste de regressão. Ferramentas: Jest + RNTL.

### X. Simplicidade e Privacidade
Dependências MUST ser poucas, maduras e justificadas. Nenhum dado sai do aparelho e o
app MUST NOT solicitar permissões desnecessárias. Funcionalidades fora do MVP (login,
backend, nuvem, multiusuário, pagamentos, rede social, wearables, integrações de saúde)
MUST NOT ser implementadas sem emenda a esta constituição. Aplica-se YAGNI.

## Restrições Técnicas e de Escopo

- Stack: React Native, TypeScript, Expo, Expo Router, SQLite, Zustand, Jest, React Native
  Testing Library, ESLint, Prettier.
- Plataformas: Android e iOS, ambos validados antes de considerar o MVP pronto.
- Idioma: documentação e textos de UI em português (pt-BR).
- Prioridades do backlog: P0 obrigatório no MVP; P1 após o fluxo principal (inclui o
  cronômetro de descanso); P2 futuro.
- Requisitos de referência: `docs/PRD.md`, `docs/arquitetura.md`, `docs/modelo-dados.md`,
  `docs/telas.md`, `docs/backlog.md`.

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

**Version**: 1.0.0 | **Ratified**: 2026-09-19 | **Last Amended**: 2026-09-19
