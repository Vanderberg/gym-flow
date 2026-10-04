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

Nota: na spec 005 só a exibição (somente leitura); a edição da agenda é item futuro.

P0

## BL-043 --- Configurar cronômetro

P1

Nota: o teste "abrir a ajuda com o cronômetro ativo não o pausa nem reinicia" pertence à spec 011 (a ajuda da spec 008 é coberta por teste de pureza: não importa cronômetro).

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

Nota (spec 010): entregue só o período em curso; navegação entre períodos e calendário de dias com treino ficam como itens futuros.

------------------------------------------------------------------------

# 11. Épico --- Cronômetro

## BL-090 --- Ativar/desativar

P1

## BL-091 --- Configurar duração

P1

## BL-092 --- Iniciar/pausar/encerrar

> Spec 011 entrega também o teste "abrir a ajuda com o cronômetro ativo não o pausa nem reinicia" (a contagem é independente da ajuda).

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

# 17. Épico — Imagens de exercício

## BL-130 — Exibir imagem do exercício na execução — P1

Na tela de execução do treino, mostrar uma imagem ilustrativa de cada exercício, resolvida por convenção a partir do `name_key`, sem exigir mudança de schema no banco.

## BL-131 — Placeholder para exercício sem imagem — P1

Quando não houver imagem cadastrada para o exercício, exibir um placeholder genérico, mantendo o layout consistente com os demais itens.

## BL-132 — Testar cobertura parcial de imagens — P1

Garantir que a tela de execução funcione corretamente com cobertura zero, parcial e total de imagens, e que bi-sets exibam a imagem de cada exercício do par de forma independente.

# 18. Débito técnico

## DT-001 — Completar imagens dos pares de bi-set sem foto própria — P2

**Origem**: spec 013 (BL-130/131). Do pacote de imagens fornecido (`docs/pacote-imagens-treinos/`),
4 dos 59 exercícios do seed ficaram sem imagem porque o pacote só trouxe foto de um dos dois lados
do bi-set. Hoje mostram o placeholder genérico (comportamento correto e esperado, FR-003 da spec
013 — não é um bug).

Pendentes:
- Remada cavalinho pegada neutra (Treino Monstro B — Costas e bíceps)
- Puxada alta pegada supinada (Treino Monstro B — Costas e bíceps)
- Crucifixo com halter pegada neutra (Treino Monstro D — Peito e tríceps)
- Tríceps no cross com barra reta invertida (Treino Monstro D — Peito e tríceps)

**Resolução**: ao obter cada foto, copiar o arquivo para `src/assets/exercises/` e adicionar a
linha correspondente (já comentada como referência) em `EXERCISE_IMAGES`
(`src/assets/exercises/index.ts`). Sem mudança de código além disso.

# 18. Épico — Backup e restauração do histórico

**Origem**: spec 014 (RF-31). Exportar e importar o histórico por arquivo, sem nuvem nem backup automático.

## BL-140 — Exportar dados — P1

Na aba Configurações, "Exportar dados" gera um arquivo JSON versionado (sessões finalizadas, estado de sequência por programa e configurações; sem o seed) e o entrega pela folha de compartilhamento do sistema, com nome `gymflow-backup-AAAA-MM-DD.json`.

## BL-141 — Importar dados com validação e confirmação — P1

"Importar dados" valida o arquivo por completo antes de alterar qualquer dado, mostra resumo (quantidade de sessões e período) e exige confirmação explícita de que o histórico atual será substituído. Bloqueado com sessão em andamento.

## BL-142 — Restauração atômica — P1

A substituição de sessões, estado de sequência e configurações acontece em uma única transação, com rollback em qualquer falha; arquivo inválido, de versão futura ou com referência desconhecida não altera nada.

## BL-143 — Testar ida e volta do backup — P1

Garantir que exportar, apagar e importar devolve histórico, estatísticas, posição na sequência, configurações e "última carga" idênticos, e que arquivos inválidos e falhas deixam os dados intactos.
