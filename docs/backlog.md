# Backlog --- App de Controle de Treinos

## 1. Estratégia

O aplicativo será construído em torno de três conceitos:

1.  Programa de treino.
2.  Tipo de sequência.
3.  Sessão realizada.

Prioridades:

-   P0 --- obrigatório para MVP.
-   P1 --- importante.
-   P2 --- futuro.

------------------------------------------------------------------------

# 2. Épico --- Fundação

## BL-001 --- Criar projeto React Native

P0

-   React Native
-   TypeScript
-   Expo

## BL-002 --- Configurar Expo Router

P0

## BL-003 --- Configurar ESLint, Prettier e TypeScript strict

P0

------------------------------------------------------------------------

# 3. Épico --- Banco

## BL-010 --- Configurar SQLite

P0

## BL-011 --- Criar migrations

P0

## BL-012 --- Criar entidades de programas

P0

-   TrainingProgram
-   Workout
-   Exercise
-   WorkoutExercise

## BL-013 --- Criar agenda semanal

P0

## BL-014 --- Criar estado de sequência por programa

P0

## BL-015 --- Criar sessões

P0

------------------------------------------------------------------------

# 4. Épico --- Programas

## BL-020 --- Criar programa Treino Padrão

P0

Cadastrar os cinco treinos.

## BL-021 --- Criar programa Treino Monstro

P0

Cadastrar:

-   A --- Ombros completos
-   B --- Costas e bíceps
-   C --- Pernas completas
-   D --- Peito e tríceps

## BL-022 --- Cadastrar prescrições detalhadas

P0

Suportar:

-   séries;
-   repetições;
-   bi-set;
-   drop-set;
-   pirâmide;
-   falha;
-   progressão;
-   observações.

## BL-023 --- Criar seed idempotente

P0

------------------------------------------------------------------------

# 5. Épico --- Tipo de sequência

## BL-030 --- Criar interface SequenceStrategy

P0

## BL-031 --- Implementar sequência contínua

P0

## BL-032 --- Implementar sequência semanal

P0

## BL-033 --- Criar configuração de agenda

P0

## BL-034 --- Reiniciar sequência

P0

## BL-035 --- Manter estado por programa

P0

------------------------------------------------------------------------

# 6. Épico --- Configurações

## BL-040 --- Selecionar programa ativo

P0

## BL-041 --- Selecionar tipo de sequência

P0

## BL-042 --- Configurar agenda semanal

P0

## BL-043 --- Configurar cronômetro

P1

------------------------------------------------------------------------

# 7. Épico --- Home

## BL-050 --- Exibir programa atual

P0

## BL-051 --- Resolver próximo treino

P0

## BL-052 --- Iniciar treino

P0

## BL-053 --- Detectar treino em andamento

P0

------------------------------------------------------------------------

# 8. Épico --- Execução

## BL-060 --- Tela de treino

P0

## BL-061 --- Marcar exercício

P0

## BL-062 --- Permitir ordem livre

P0

## BL-063 --- Registrar peso

P0

## BL-064 --- Exibir última carga

P0

## BL-065 --- Exibir prescrição

P0

## BL-066 --- Finalizar treino incompleto

P0

## BL-067 --- Recuperar sessão

P0

------------------------------------------------------------------------

# 9. Épico --- Histórico

## BL-070 --- Lista de sessões

P0

## BL-071 --- Detalhes da sessão

P0

## BL-072 --- Identificar programa e treino

P0

## BL-073 --- Filtrar por programa

P1

## BL-074 --- Editar sessão

P0

------------------------------------------------------------------------

# 10. Épico --- Estatísticas

## BL-080 --- Estatística semanal

P0

## BL-081 --- Estatística mensal

P0

## BL-082 --- Estatística trimestral

P0

## BL-083 --- Estatística semestral

P0

## BL-084 --- Estatística anual

P0

## BL-085 --- Média de treinos por semana

P0

## BL-086 --- Intervalo médio entre treinos

P0

## BL-087 --- Filtro por programa

P1

------------------------------------------------------------------------

# 11. Épico --- Cronômetro

## BL-090 --- Ativar/desativar

P1

## BL-091 --- Configurar duração

P1

## BL-092 --- Iniciar/pausar/encerrar

P1

------------------------------------------------------------------------

# 12. Épico --- Testes

## BL-100 --- Testar sequência contínua

P0

Casos:

-   primeiro treino;
-   meio da sequência;
-   último → primeiro;
-   reinício.

## BL-101 --- Testar sequência semanal

P0

Casos:

-   dia com treino;
-   dia de descanso;
-   sábado opcional;
-   domingo;
-   mudança de semana.

## BL-102 --- Testar troca de programa

P0

Garantir preservação do histórico.

## BL-103 --- Testar troca de sequência

P0

## BL-104 --- Testar persistência

P0

## BL-105 --- Testar estatísticas

P0

------------------------------------------------------------------------

# 13. Roadmap

## Sprint 1 --- Fundação

-   BL-001
-   BL-002
-   BL-003
-   BL-010
-   BL-011

## Sprint 2 --- Modelo e programas

-   BL-012
-   BL-013
-   BL-014
-   BL-015
-   BL-020
-   BL-021
-   BL-022
-   BL-023

## Sprint 3 --- Sequências e configurações

-   BL-030
-   BL-031
-   BL-032
-   BL-033
-   BL-034
-   BL-035
-   BL-040
-   BL-041
-   BL-042

## Sprint 4 --- Execução

-   BL-050
-   BL-051
-   BL-052
-   BL-053
-   BL-060
-   BL-061
-   BL-062
-   BL-063
-   BL-064
-   BL-065
-   BL-066
-   BL-067

## Sprint 5 --- Histórico

-   BL-070
-   BL-071
-   BL-072
-   BL-073
-   BL-074

## Sprint 6 --- Estatísticas

-   BL-080
-   BL-081
-   BL-082
-   BL-083
-   BL-084
-   BL-085
-   BL-086
-   BL-087

## Sprint 7 --- Cronômetro e qualidade

-   BL-090
-   BL-091
-   BL-092
-   BL-100
-   BL-101
-   BL-102
-   BL-103
-   BL-104
-   BL-105

------------------------------------------------------------------------

# 14. MVP

O MVP deve entregar:

-   Android;
-   iOS;
-   React Native;
-   SQLite;
-   Treino Padrão;
-   Treino Monstro;
-   seleção de programa;
-   seleção de sequência;
-   sequência contínua;
-   agenda semanal;
-   reinício;
-   exercícios em qualquer ordem;
-   marcação de exercício;
-   registro de peso;
-   prescrição detalhada;
-   finalização incompleta;
-   recuperação de sessão;
-   histórico;
-   edição;
-   estatísticas;
-   funcionamento offline.

O cronômetro entra como P1 caso não seja necessário para validar o fluxo
principal.

# 15. Épico — Ajuda contextual

## BL-110 — Cadastro de músculos — P0

Adicionar músculo principal, músculos secundários e descrição aos exercícios.

## BL-111 — Componente de legenda — P0

Criar explicações para bi-set, drop-set, pirâmides, falha, excêntrica, concêntrica e progressão de carga.

## BL-112 — Ícone de ajuda no treino — P0

Abrir legenda sem sair da sessão.

## BL-113 — Ícone de informações no exercício — P0

Abrir detalhes do exercício.

## BL-114 — Bottom sheet de músculos — P0

Exibir músculos e descrição sob demanda.

## BL-115 — Ajuda contextual por técnica — P1

Adicionar `?` ao lado de uma técnica especial para abrir diretamente sua explicação.

## BL-116 — Testar ajuda sem alterar sessão — P0

Garantir que abrir/fechar ajuda não altere status, peso, sequência, cronômetro ou sessão.


# 16. Épico — Conteúdo da ficha

## BL-120 — Seed do Treino Monstro conforme a ficha — P0

Cadastrar os 43 exercícios (A = 11, B = 10, C = 10, D = 12) de `docs/fichas-treino.md`, com prescrição, técnica e observações. Bi-sets como exercícios distintos.

## BL-121 — Nota de aquecimento livre — P0

Exibir `workout.warmup_note` no treino, sem contar como exercício.

## BL-122 — Texto do dia opcional — P0

Exibir `weekly_schedule.note` na Home nos dias opcionais, sem criar sessão.

## BL-123 — Sugestão do programa na Home — P1

Exibir `training_program.home_suggestion` (cardio do Treino Monstro).

## BL-124 — Testar seed completo — P0

Garantir que todo exercício do seed tenha músculos e descrição (BL-110) e que os bi-sets estejam separados.
