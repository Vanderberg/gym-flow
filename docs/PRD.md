# PRD --- App Pessoal de Controle de Treinos

**Versão:** 1.0\
**Status:** Definido para início do desenvolvimento\
**Plataformas:** Android e iOS\
**Framework:** React Native + TypeScript + Expo\
**Uso:** Pessoal / sem comercialização

------------------------------------------------------------------------

## 1. Visão do produto

Aplicativo mobile pessoal para registrar treinos de academia, controlar
uma sequência fixa de cinco treinos e acompanhar a frequência/cadência
de treinamento ao longo do tempo.

O aplicativo não tem como objetivo atuar como personal trainer. Ele deve
registrar o que foi feito de maneira rápida, simples e confiável durante
o treino.

O usuário possui cinco treinos:

1.  Peito e Tríceps
2.  Costas e Bíceps
3.  Perna Completo
4.  Ombro Isolado
5.  Bíceps e Tríceps

A sequência é contínua:

**Dia 1 → Dia 2 → Dia 3 → Dia 4 → Dia 5 → Dia 1 → ...**

A sequência não depende dos dias da semana.

------------------------------------------------------------------------

## 2. Objetivos

### Objetivos principais

-   Saber rapidamente qual é o próximo treino.
-   Registrar quais exercícios foram realizados.
-   Registrar o peso utilizado em cada exercício.
-   Consultar a última carga utilizada em um exercício.
-   Finalizar um treino mesmo que nem todos os exercícios tenham sido
    realizados.
-   Permitir executar os exercícios em qualquer ordem.
-   Manter histórico dos treinos.
-   Permitir corrigir registros anteriores.
-   Reiniciar manualmente a sequência sem apagar o histórico.
-   Acompanhar frequência e cadência de treinamento.

### Não é objetivo

-   Recomendar cargas.
-   Recomendar exercícios.
-   Prescrever treinos.
-   Fazer análise médica ou esportiva.
-   Controlar dieta ou peso corporal.
-   Criar rede social.
-   Comercializar o aplicativo.

------------------------------------------------------------------------

## 3. Público-alvo

Inicialmente existe um único usuário: o proprietário do aplicativo.

O produto deve, entretanto, ser tecnicamente compartilhável com outras
pessoas no futuro, incluindo usuários Android e iOS.

Não haverá sistema de contas no MVP.

------------------------------------------------------------------------

## 4. Princípios de UX

1.  O usuário deve conseguir começar o treino rapidamente.
2.  Registrar um exercício deve exigir poucos toques.
3.  Não obrigar o usuário a executar exercícios na ordem apresentada.
4.  Não exigir registro de repetições.
5.  Não exigir conclusão de todos os exercícios para finalizar o treino.
6.  Não fazer recomendações de carga.
7.  O histórico nunca deve ser apagado ao reiniciar a sequência.
8.  O aplicativo deve funcionar offline.

------------------------------------------------------------------------

# 5. Sequência de treinos

## 5.1 Regra

Existe um `currentDay` entre 1 e 5.

Após finalizar um treino:

-   Dia 1 → próximo Dia 2
-   Dia 2 → próximo Dia 3
-   Dia 3 → próximo Dia 4
-   Dia 4 → próximo Dia 5
-   Dia 5 → próximo Dia 1

A passagem de um dia para outro acontece somente quando o usuário
finaliza o treino.

## 5.2 Intervalos sem treinar

O intervalo entre os treinos não altera a sequência.

Exemplo:

-   01/09 --- Dia 1
-   15/09 --- Dia 2

Mesmo com 14 dias de intervalo, o próximo treino continua sendo o Dia 2.

## 5.3 Reiniciar sequência

O usuário pode selecionar **Reiniciar sequência**.

Isso altera o próximo treino para Dia 1.

O histórico anterior permanece intacto.

Exemplo:

``` text
Histórico:
01/09 — Dia 1
05/09 — Dia 2
08/09 — Dia 3

Usuário reinicia sequência.

Próximo treino:
Dia 1
```

------------------------------------------------------------------------

# 6. Treinos iniciais

## Dia 1 --- Peito e Tríceps

  Ordem   Exercício            Séries   Repetições
  ------- ------------------ -------- ------------
  1       Supino                    3       10--12
  2       Supino inclinado          3       10--12
  3       Fly                       3       10--12
  4       Tríceps corda             3       10--12
  5       Tríceps francês           3       10--12
  6       Tríceps testa             3       10--12

## Dia 2 --- Costas e Bíceps

  Ordem   Exercício          Séries   Repetições
  ------- ---------------- -------- ------------
  1       Remada curvada          3       10--12
  2       Remada aberta           3       10--12
  3       Puxada aberta           3       10--12
  4       Rosca Scott             3       10--12
  5       Rosca martelo           3       10--12
  6       Rosca direta            3       10--12

## Dia 3 --- Perna Completo

  Ordem   Exercício             Séries   Repetições
  ------- ------------------- -------- ------------
  1       Agachamento Hack           3       10--12
  2       Cadeira extensora          3       10--12
  3       Adutora                    3       10--12
  4       Mesa flexora               3       10--12
  5       Cadeira flexora            3       10--12
  6       Leg Press                  3       10--12

## Dia 4 --- Ombro Isolado

  Ordem   Exercício             Séries   Repetições
  ------- ------------------- -------- ------------
  1       Crucifixo inverso          3       10--12
  2       Elevação frontal           3       10--12
  3       Elevação lateral           3       10--12
  4       Desenvolvimento            3       10--12

## Dia 5 --- Bíceps e Tríceps

  Ordem   Exercício           Séries   Repetições
  ------- ----------------- -------- ------------
  1       Tríceps corda            3       10--12
  2       Tríceps francês          3       10--12
  3       Tríceps testa            3       10--12
  4       Rosca direta             3       10--12
  5       Rosca martelo            3       10--12
  6       Rosca Scott              3       10--12

------------------------------------------------------------------------

# 7. Execução do treino

## 7.1 Ordem livre

Os exercícios são apresentados em uma ordem padrão, mas essa ordem não é
obrigatória.

O usuário pode executar:

-   exercício 1;
-   exercício 4;
-   exercício 3;
-   exercício 6;
-   exercício 2;
-   exercício 5.

O sistema registra apenas o estado de cada exercício.

## 7.2 Marcação

Cada exercício possui:

-   Não realizado
-   Realizado

O usuário pode marcar e desmarcar.

## 7.3 Peso

Cada exercício permite registrar a carga utilizada.

Exemplo:

``` text
Supino
3 × 10–12
Carga: 80 kg
```

O valor da carga é associado àquela execução do exercício.

Na próxima execução, o aplicativo deve mostrar a última carga registrada
como referência histórica.

O aplicativo não deve sugerir aumento ou redução de carga.

## 7.4 Repetições

As repetições não são registradas por série.

A prescrição do exercício já contém a faixa:

**3 × 10--12**

------------------------------------------------------------------------

# 8. Finalização do treino

O usuário pode finalizar o treino independentemente da quantidade de
exercícios realizados.

Exemplo:

``` text
6 exercícios
4 realizados
2 não realizados
```

Ao selecionar **Finalizar treino**:

1.  A sessão é marcada como concluída.
2.  O histórico recebe a sessão.
3.  O sistema avança para o próximo dia.
4.  Os exercícios não realizados permanecem registrados como não
    realizados naquela sessão.

Não existe exigência de 100% de conclusão.

------------------------------------------------------------------------

# 9. Treino em andamento

Uma sessão iniciada deve ser persistida localmente.

Se o aplicativo for fechado, o sistema deve permitir continuar o treino
posteriormente.

Ao reabrir:

> "Existe um treino em andamento. Deseja continuar?"

Opções:

-   Continuar
-   Descartar sessão

O descarte de uma sessão em andamento não deve alterar a sequência.

------------------------------------------------------------------------

# 10. Correção de histórico

Sessões finalizadas podem ser editadas.

O usuário poderá:

-   marcar/desmarcar exercício;
-   alterar a carga;
-   corrigir informações do registro.

A edição não deve alterar a ordem histórica da sequência já realizada.

------------------------------------------------------------------------

# 11. Cronômetro

O aplicativo terá cronômetro de descanso opcional.

Configurações:

-   ativado/desativado;
-   tempo padrão configurável.

Durante o treino, o usuário pode:

-   iniciar;
-   pausar;
-   reiniciar;
-   ignorar o cronômetro.

O cronômetro não interfere na conclusão do exercício ou do treino.

------------------------------------------------------------------------

# 12. Histórico

O histórico apresenta as sessões finalizadas em ordem cronológica
inversa.

Cada item deve mostrar:

-   data;
-   treino;
-   quantidade de exercícios realizados;
-   duração, se disponível.

Ao abrir uma sessão:

-   exercícios;
-   status realizado/não realizado;
-   carga registrada.

------------------------------------------------------------------------

# 13. Estatísticas

O foco das estatísticas é exclusivamente frequência e cadência.

## 13.1 Semana

Mostrar:

-   quantidade de treinos;
-   distribuição dos treinos pelos dias da semana.

## 13.2 Mês

Mostrar:

-   quantidade de treinos;
-   média de treinos por semana;
-   intervalo médio entre treinos.

## 13.3 Trimestre

Mostrar as mesmas métricas agregadas.

## 13.4 Semestre

Mostrar as mesmas métricas agregadas.

## 13.5 Ano

Mostrar as mesmas métricas agregadas.

### Exemplo

``` text
Setembro

17 treinos

Média:
3,4 treinos/semana

Intervalo médio:
2,0 dias
```

A média deve considerar o período selecionado e ser apresentada de
maneira consistente.

------------------------------------------------------------------------

# 14. Requisitos funcionais

  ID      Requisito
  ------- ------------------------------------------------
  RF-01   Exibir próximo treino
  RF-02   Iniciar treino
  RF-03   Exibir exercícios do treino
  RF-04   Permitir executar exercícios em qualquer ordem
  RF-05   Marcar exercício como realizado
  RF-06   Desmarcar exercício
  RF-07   Registrar peso
  RF-08   Exibir última carga registrada
  RF-09   Finalizar treino incompleto
  RF-10   Avançar sequência após finalização
  RF-11   Reiniciar sequência para Dia 1
  RF-12   Preservar histórico ao reiniciar
  RF-13   Persistir treino em andamento
  RF-14   Editar treino finalizado
  RF-15   Exibir histórico
  RF-16   Exibir estatísticas semanais
  RF-17   Exibir estatísticas mensais
  RF-18   Exibir estatísticas trimestrais
  RF-19   Exibir estatísticas semestrais
  RF-20   Exibir estatísticas anuais
  RF-21   Ativar/desativar cronômetro
  RF-22   Configurar descanso
  RF-23   Funcionar sem internet

------------------------------------------------------------------------

# 15. Requisitos não funcionais

-   Aplicativo para Android e iOS.
-   Interface responsiva.
-   Persistência local.
-   Operação offline.
-   Dados não devem depender de servidor.
-   Inicialização rápida.
-   Dados devem permanecer após fechamento do aplicativo.
-   Código compartilhado entre Android e iOS sempre que possível.
-   TypeScript com tipagem estrita.
-   Arquitetura preparada para evolução.

------------------------------------------------------------------------

# 16. Fora do escopo

-   Login.
-   Backend.
-   Sincronização em nuvem.
-   Multiusuário.
-   Pagamentos.
-   Assinaturas.
-   Rede social.
-   Recomendações.
-   IA.
-   Dieta.
-   Peso corporal.
-   Calorias.
-   Integrações com wearables.
-   Integrações com plataformas de saúde.

------------------------------------------------------------------------

# 17. Critérios de aceite principais

### Sequência

Dado que o usuário está no Dia 1 e finaliza o treino, o próximo deve ser
Dia 2.

Dado que está no Dia 5 e finaliza o treino, o próximo deve ser Dia 1.

### Reinício

Ao reiniciar a sequência, o próximo treino deve ser Dia 1 e o histórico
deve permanecer intacto.

### Ordem

O usuário deve conseguir marcar qualquer exercício independentemente da
ordem.

### Treino incompleto

O usuário deve conseguir finalizar um treino com zero ou mais exercícios
realizados.

### Peso

O peso registrado em uma sessão deve aparecer no histórico e como última
carga na próxima execução do exercício.

### Estatísticas

As estatísticas devem considerar apenas sessões finalizadas.

------------------------------------------------------------------------

# 18. Definição de pronto do MVP

O MVP está pronto quando o usuário consegue:

1.  abrir o app;
2.  ver o próximo treino;
3.  iniciar;
4.  marcar exercícios em qualquer ordem;
5.  registrar peso;
6.  finalizar o treino;
7.  avançar automaticamente na sequência;
8.  reiniciar a sequência;
9.  consultar histórico;
10. corrigir histórico;
11. consultar frequência e cadência;
12. usar tudo isso sem internet.
