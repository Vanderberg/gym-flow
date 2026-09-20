# PRD --- App Pessoal de Controle de Treinos

**Versão:** 1.1\
**Status:** Definido para início do desenvolvimento\
**Plataformas:** Android e iOS\
**Framework:** React Native + TypeScript + Expo\
**Persistência:** SQLite local\
**Uso:** Pessoal / sem comercialização

------------------------------------------------------------------------

## 1. Visão do produto

Aplicativo mobile pessoal para registrar treinos de academia, controlar
diferentes programas de treinamento e acompanhar frequência/cadência.

O conceito central é separar:

1.  **Tipo de treino** --- qual programa está ativo.
2.  **Tipo de sequência** --- como o aplicativo determina o próximo
    treino.

Essa separação permite utilizar diferentes programas com diferentes
formas de progressão.

Exemplos iniciais:

-   **Treino Padrão** + **Sequência contínua**
-   **Treino Monstro** + **Dias da semana**

O aplicativo não atua como personal trainer e não faz recomendações de
carga ou treinamento.

------------------------------------------------------------------------

# 2. Objetivos

-   Saber rapidamente qual é o próximo treino.
-   Registrar quais exercícios foram realizados.
-   Registrar o peso utilizado.
-   Consultar a última carga utilizada.
-   Permitir executar exercícios em qualquer ordem.
-   Finalizar um treino mesmo incompleto.
-   Editar registros anteriores.
-   Alternar entre programas de treino.
-   Alternar entre tipos de sequência.
-   Reiniciar uma sequência sem apagar histórico.
-   Acompanhar frequência e cadência.

------------------------------------------------------------------------

# 3. Conceitos

## 3.1 Programa de treino

Um programa agrupa uma série de treinos.

Exemplos:

### Treino Padrão

-   Dia 1 --- Peito e Tríceps
-   Dia 2 --- Costas e Bíceps
-   Dia 3 --- Perna Completo
-   Dia 4 --- Ombro Isolado
-   Dia 5 --- Bíceps e Tríceps

### Treino Monstro

-   A --- Ombros completos
-   B --- Costas e Bíceps
-   C --- Pernas completas
-   D --- Peito e Tríceps

Programas futuros poderão ser adicionados sem alteração da arquitetura.

------------------------------------------------------------------------

# 4. Tipo de treino

Nas configurações, o usuário seleciona o programa ativo.

``` text
Tipo de treino

● Treino Padrão
○ Treino Monstro
```

A alteração do programa não apaga histórico.

Cada sessão registrada deve guardar o programa utilizado.

------------------------------------------------------------------------

# 5. Tipo de sequência

O usuário também seleciona como o aplicativo determina o próximo treino.

## 5.1 Sequência contínua

O próximo treino depende do último treino finalizado.

Exemplo:

``` text
1 → 2 → 3 → 4 → 5 → 1
```

O calendário não interfere.

Se o usuário fizer:

``` text
01/09 — Dia 1
15/09 — Dia 2
```

o próximo continua sendo Dia 2 após o primeiro registro.

### Reiniciar sequência

O usuário pode reiniciar manualmente para o primeiro treino do programa.

O histórico permanece intacto.

------------------------------------------------------------------------

## 5.2 Dias da semana

O próximo treino é definido por uma programação semanal.

Exemplo do Treino Monstro:

``` text
Segunda → A
Terça   → B
Quarta  → Descanso
Quinta  → C
Sexta   → D
Sábado  → Opcional
Domingo → Opcional
```

O programa deve possuir sua própria configuração de agenda.

O aplicativo não deve registrar automaticamente um treino apenas porque
existe um treino programado naquele dia. O usuário precisa iniciar e
finalizar a sessão.

------------------------------------------------------------------------

# 6. Independência entre programa e sequência

As configurações são independentes.

``` text
Tipo de treino
      +
Tipo de sequência
      =
Regra para encontrar o próximo treino
```

Exemplos válidos:

  Programa          Sequência
  ----------------- --------------------
  Treino Padrão     Sequência contínua
  Treino Monstro    Dias da semana
  Programa futuro   Sequência contínua
  Programa futuro   Dias da semana

O sistema não deve codificar regras específicas como "Treino Monstro
sempre usa dias da semana".

------------------------------------------------------------------------

# 7. Treino Padrão

## Dia 1 --- Peito e Tríceps

  Exercício            Séries   Repetições
  ------------------ -------- ------------
  Supino                    3       10--12
  Supino inclinado          3       10--12
  Fly                       3       10--12
  Tríceps corda             3       10--12
  Tríceps francês           3       10--12
  Tríceps testa             3       10--12

## Dia 2 --- Costas e Bíceps

  Exercício          Séries   Repetições
  ---------------- -------- ------------
  Remada curvada          3       10--12
  Remada aberta           3       10--12
  Puxada aberta           3       10--12
  Rosca Scott             3       10--12
  Rosca martelo           3       10--12
  Rosca direta            3       10--12

## Dia 3 --- Perna Completo

  Exercício             Séries   Repetições
  ------------------- -------- ------------
  Agachamento Hack           3       10--12
  Cadeira extensora          3       10--12
  Adutora                    3       10--12
  Mesa flexora               3       10--12
  Cadeira flexora            3       10--12
  Leg Press                  3       10--12

## Dia 4 --- Ombro Isolado

  Exercício             Séries   Repetições
  ------------------- -------- ------------
  Crucifixo inverso          3       10--12
  Elevação frontal           3       10--12
  Elevação lateral           3       10--12
  Desenvolvimento            3       10--12

## Dia 5 --- Bíceps e Tríceps

  Exercício           Séries   Repetições
  ----------------- -------- ------------
  Tríceps corda            3       10--12
  Tríceps francês          3       10--12
  Tríceps testa            3       10--12
  Rosca direta             3       10--12
  Rosca martelo            3       10--12
  Rosca Scott              3       10--12

------------------------------------------------------------------------

# 8. Treino Monstro

O Treino Monstro será cadastrado como um programa independente.

## Agenda

``` text
Segunda — Treino A
Terça — Treino B
Quarta — Descanso
Quinta — Treino C
Sexta — Treino D
Sábado — Opcional
Domingo — Opcional
```

## Treino A --- Ombros completos

O programa deve preservar as instruções da ficha original, incluindo:

-   bi-set;
-   aquecimento;
-   execução unilateral;
-   drop-set;
-   pirâmide;
-   execução concêntrica lenta;
-   trabalho de trapézio;
-   crucifixo invertido;
-   voador invertido.

## Treino B --- Costas e bíceps

Deve preservar as prescrições da ficha, incluindo:

-   serrote unilateral;
-   bi-set de remada;
-   puxadas;
-   remada articulada;
-   remada unilateral;
-   bi-set de puxada;
-   rosca martelo.

## Treino C --- Pernas completas

Deve preservar:

-   avanço unilateral;
-   passada unilateral;
-   agachamento livre/Smith;
-   progressão de carga;
-   leg press;
-   drop-set;
-   pirâmide crescente/decrescente;
-   afundo unilateral;
-   adutora;
-   bi-set de panturrilha.

## Treino D --- Peito e tríceps

Deve preservar:

-   aquecimento;
-   bi-sets;
-   progressão de carga;
-   controle excêntrico;
-   pausa/tempo de execução;
-   exercícios no cross;
-   voador;
-   tríceps unilateral;
-   bi-set de tríceps;
-   tríceps coice.

As prescrições do Treino Monstro devem ser armazenadas como dados do
exercício, sem obrigar o aplicativo a interpretar fisiologicamente a
técnica.

------------------------------------------------------------------------

# 9. Prescrição de exercícios

O modelo não deve limitar exercícios a `min_reps` e `max_reps`.

Um exercício pode possuir:

-   séries;
-   repetições;
-   texto da prescrição;
-   técnica;
-   instruções;
-   observações.

Exemplos:

``` text
Supino reto
4 × 8
Progressão de carga
Aumentar carga a cada série
```

``` text
Elevação lateral
3 × 6/8/10
Drop-set
Pirâmide decrescente
```

``` text
Voador
3 × até a falha
```

O aplicativo deve exibir a prescrição, mas não precisa interpretá-la.

------------------------------------------------------------------------

# 10. Execução

Os exercícios podem ser realizados em qualquer ordem.

Cada exercício possui:

-   Não realizado;
-   Realizado.

O usuário pode marcar/desmarcar.

------------------------------------------------------------------------

# 11. Peso

Cada exercício pode receber uma carga.

Exemplo:

``` text
Supino reto
4 × 8

Peso:
80 kg
```

Na próxima execução do mesmo exercício dentro do mesmo programa, mostrar
a última carga registrada como referência histórica.

Não fazer recomendações.

------------------------------------------------------------------------

# 12. Repetições

As repetições realizadas não são registradas individualmente.

A prescrição do exercício é apenas exibida.

------------------------------------------------------------------------

# 13. Finalização

O usuário pode finalizar um treino com qualquer quantidade de exercícios
realizados.

Ao finalizar:

1.  salvar sessão;
2.  marcar sessão como concluída;
3.  atualizar a sequência quando aplicável;
4.  disponibilizar o treino no histórico.

------------------------------------------------------------------------

# 14. Histórico

Cada sessão deve registrar:

-   programa;
-   treino;
-   data;
-   início;
-   término;
-   exercícios realizados;
-   pesos;
-   status.

O histórico não deve ser apagado ao:

-   trocar programa;
-   trocar tipo de sequência;
-   reiniciar sequência.

------------------------------------------------------------------------

# 15. Estatísticas

O foco é frequência/cadência.

Mostrar:

-   quantidade de treinos;
-   média de treinos por semana;
-   intervalo médio entre treinos.

Períodos:

-   semana;
-   mês;
-   trimestre;
-   semestre;
-   ano.

Filtros:

``` text
Todos
Treino Padrão
Treino Monstro
```

------------------------------------------------------------------------

# 16. Cronômetro

Opcional.

Configurações:

-   ativado/desativado;
-   tempo padrão.

O usuário pode ativar/desativar durante o treino.

------------------------------------------------------------------------

# 17. Requisitos funcionais

  ID      Requisito
  ------- -------------------------------------
  RF-01   Exibir próximo treino
  RF-02   Selecionar programa
  RF-03   Selecionar tipo de sequência
  RF-04   Iniciar treino
  RF-05   Exibir exercícios
  RF-06   Permitir ordem livre
  RF-07   Marcar exercício
  RF-08   Registrar peso
  RF-09   Exibir última carga
  RF-10   Finalizar treino incompleto
  RF-11   Avançar sequência contínua
  RF-12   Determinar treino por dia da semana
  RF-13   Reiniciar sequência
  RF-14   Preservar histórico
  RF-15   Editar histórico
  RF-16   Exibir histórico
  RF-17   Estatísticas por período
  RF-18   Filtrar estatísticas por programa
  RF-19   Cronômetro opcional
  RF-20   Funcionar offline

------------------------------------------------------------------------

# 18. Requisitos não funcionais

-   Android e iOS.
-   React Native + TypeScript + Expo.
-   SQLite local.
-   Offline-first.
-   Sem backend no MVP.
-   Código compartilhado entre plataformas.
-   Dados persistentes.
-   TypeScript strict.
-   Arquitetura modular.

------------------------------------------------------------------------

# 19. Fora do escopo

-   recomendações de carga;
-   IA;
-   personal trainer virtual;
-   dieta;
-   calorias;
-   peso corporal;
-   rede social;
-   login;
-   pagamentos;
-   assinatura;
-   sincronização em nuvem;
-   wearables.

------------------------------------------------------------------------

# 20. Critérios de aceite

### Programa

Trocar o programa não apaga histórico.

### Sequência contínua

Finalizar o treino atual seleciona o próximo treino do programa.

### Dias da semana

O próximo treino é determinado pela agenda configurada.

### Reinício

Reiniciar sequência não apaga sessões anteriores.

### Ordem

Exercícios podem ser marcados em qualquer ordem.

### Treino incompleto

Sessão pode ser finalizada mesmo com exercícios pendentes.

### Histórico

Cada sessão identifica programa e treino.

### Estatísticas

Somente sessões finalizadas são contabilizadas.

# 21. Legenda e ajuda contextual

Como o Treino Monstro possui prescrições mais detalhadas, o aplicativo deve possuir uma legenda para explicar termos e técnicas. A legenda não fica visível permanentemente.

## Acesso

Na tela de treino haverá um ícone de ajuda (`?`). Ao tocar, abre uma modal/bottom sheet com termos como:

- BI-SET — dois exercícios realizados em sequência.
- DROP-SET — redução da carga após uma série para continuar o exercício.
- PIRÂMIDE CRESCENTE — aumento progressivo da carga.
- PIRÂMIDE DECRESCENTE — redução progressiva da carga.
- FALHA — execução até não conseguir realizar outra repetição com boa técnica.
- EXCÊNTRICA — fase de retorno/alongamento do movimento.
- CONCÊNTRICA — fase de contração/levantamento da carga.

## Descrição dos músculos

Cada exercício poderá possuir informações educativas acessíveis por um ícone `ⓘ`, sem ocupar espaço permanentemente no card.

Exemplo:

```text
SUPINO RETO                    ⓘ
3 × 10–12

Músculo principal
Peitoral maior

Músculos secundários
Tríceps
Deltoide anterior

Descrição
Exercício de empurrar que enfatiza a musculatura
do peito, com participação do tríceps e da parte
anterior dos ombros.
```

O conteúdo é informativo e não fornece recomendações de carga ou treino.

## Princípio de UI

```text
Tela de treino
  ├── conteúdo essencial: sempre visível
  ├── ? → legenda das técnicas
  └── ⓘ → músculos e descrição do exercício
```

### Requisitos adicionais

- RF-21: exibir ícone de legenda.
- RF-22: abrir legenda em modal/bottom sheet.
- RF-23: exibir ícone de informações no exercício.
- RF-24: exibir músculos sob demanda.
- RF-25: exibir descrição sob demanda.
- RF-26: não exibir informações educativas permanentemente.

### Critérios de aceite

- A legenda não aparece automaticamente.
- A descrição muscular não aparece permanentemente.
- O recurso funciona no Treino Padrão e no Treino Monstro.
- Abrir ajuda não altera exercício, peso, sequência ou cronômetro.


# 22. Decisões sobre a ficha do Treino Monstro

Base: transcrição em `docs/fichas-treino.md` (imagens em `docs/treino monstro/`).

## 22.1 Bi-set são dois exercícios distintos

Bi-set é uma técnica em que dois exercícios diferentes são feitos em sequência,
sem descanso entre eles. Cada exercício do par é um item próprio do treino:
marcável, com carga própria e com `technique = BI-SET`. O par fica em posições
vizinhas e a observação indica o parceiro ("Bi-set com ...").

Exemplo (Treino C): "Panturrilha sentado" e "Panturrilha em pé", ambos 3 × 15.

Contagem resultante: Treino A = 11, B = 10, C = 10, D = 12.

## 22.2 Aquecimento é livre

O rótulo "Aquecimento:" da ficha não é um exercício registrado. O treino pode
exibir uma nota de aquecimento livre; todos os treinos, dos dois programas, levam
a mesma nota: "Aquecimento de manguito rotador + aquecimento livre". Nada é marcado nem contabilizado.

## 22.3 Dia opcional

Sábado e domingo "Opcional" significam abdominais supra/infra e oblíquos; a quarta é
descanso puro, sem texto. Não é um
treino A–D: a Home mostra esse texto e nenhuma sessão é criada.

## 22.4 Sugestão de cardio na Home

A Home do Treino Monstro exibe a sugestão da ficha: caminhada ligeira, sem correr,
dividida à vontade (30 min de manhã e 30 min à noite, ou 1 h), longe do treino
resistido. É conteúdo do programa exibido como texto; o app não registra cardio
e não gera recomendações próprias.

### Requisitos adicionais

- RF-27: tratar cada exercício de um bi-set como item distinto.
- RF-28: exibir nota de aquecimento livre do treino, sem registrá-lo.
- RF-29: exibir o texto do dia opcional sem criar sessão.
- RF-30: exibir sugestão do programa (cardio) na Home.

### Critérios de aceite

- Cada exercício de um bi-set pode ser marcado e ter carga independentemente.
- O aquecimento livre não aparece nas contagens "X / Y realizados".
- O dia opcional não cria sessão nem entra nas estatísticas.
- A sugestão de cardio só aparece em programas que a definem.
