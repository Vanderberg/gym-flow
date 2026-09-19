# Backlog --- App de Controle de Treinos

## 1. Estratégia

O backlog está organizado para entregar primeiro um aplicativo funcional
e utilizável no celular.

Prioridade:

-   **P0:** obrigatório para MVP.
-   **P1:** importante, mas pode entrar após o fluxo principal.
-   **P2:** melhoria futura.

------------------------------------------------------------------------

# 2. Épico --- Fundação

## BL-001 --- Criar projeto React Native

**Prioridade:** P0

Criar projeto com:

-   React Native;
-   TypeScript;
-   Expo.

### Critérios de aceite

-   projeto executa no Android;
-   projeto executa no iOS;
-   TypeScript configurado.

------------------------------------------------------------------------

## BL-002 --- Configurar Expo Router

**Prioridade:** P0

Criar estrutura inicial de navegação.

------------------------------------------------------------------------

## BL-003 --- Configurar qualidade de código

**Prioridade:** P0

Configurar:

-   ESLint;
-   Prettier;
-   TypeScript strict;
-   scripts de desenvolvimento.

------------------------------------------------------------------------

# 3. Épico --- Banco local

## BL-010 --- Configurar SQLite

**Prioridade:** P0

Criar banco local.

------------------------------------------------------------------------

## BL-011 --- Criar migrations

**Prioridade:** P0

Criar tabelas definidas no modelo de dados.

------------------------------------------------------------------------

## BL-012 --- Criar seed inicial

**Prioridade:** P0

Inserir:

-   5 treinos;
-   28 exercícios no total considerando as repetições entre dias;
-   relacionamentos.

Observação: exercícios repetidos, como tríceps corda, devem ser uma
única entidade quando representarem o mesmo exercício.

------------------------------------------------------------------------

## BL-013 --- Criar repositories

**Prioridade:** P0

Implementar repositories para:

-   WorkoutPlan;
-   Exercise;
-   WorkoutSession;
-   WorkoutSessionExercise;
-   SequenceState;
-   Settings.

------------------------------------------------------------------------

# 4. Épico --- Sequência

## BL-020 --- Implementar sequência atual

**Prioridade:** P0

Manter o próximo dia entre 1 e 5.

------------------------------------------------------------------------

## BL-021 --- Avançar sequência

**Prioridade:** P0

Ao finalizar:

``` text
1 → 2
2 → 3
3 → 4
4 → 5
5 → 1
```

------------------------------------------------------------------------

## BL-022 --- Reiniciar sequência

**Prioridade:** P0

Permitir reiniciar para Dia 1 sem apagar histórico.

------------------------------------------------------------------------

## BL-023 --- Testar sequência

**Prioridade:** P0

Testar todos os ciclos e reinício.

------------------------------------------------------------------------

# 5. Épico --- Home

## BL-030 --- Criar Home

**Prioridade:** P0

Mostrar próximo treino.

------------------------------------------------------------------------

## BL-031 --- Botão começar treino

**Prioridade:** P0

Criar sessão em andamento.

------------------------------------------------------------------------

## BL-032 --- Detectar sessão em andamento

**Prioridade:** P0

Ao abrir o app, detectar sessão aberta.

------------------------------------------------------------------------

# 6. Épico --- Execução

## BL-040 --- Criar tela de treino

**Prioridade:** P0

Exibir exercícios do treino atual.

------------------------------------------------------------------------

## BL-041 --- Marcar exercício como feito

**Prioridade:** P0

Permitir marcar e desmarcar.

------------------------------------------------------------------------

## BL-042 --- Permitir ordem livre

**Prioridade:** P0

Nenhuma dependência entre exercícios.

------------------------------------------------------------------------

## BL-043 --- Registrar peso

**Prioridade:** P0

Permitir informar carga.

------------------------------------------------------------------------

## BL-044 --- Mostrar última carga

**Prioridade:** P0

Buscar último peso registrado para o exercício.

------------------------------------------------------------------------

## BL-045 --- Finalizar treino incompleto

**Prioridade:** P0

Permitir finalizar mesmo com exercícios pendentes.

------------------------------------------------------------------------

## BL-046 --- Recuperar treino em andamento

**Prioridade:** P0

Fechar/reabrir app sem perder a sessão.

------------------------------------------------------------------------

# 7. Épico --- Cronômetro

## BL-050 --- Configuração do cronômetro

**Prioridade:** P1

Permitir ativar/desativar.

------------------------------------------------------------------------

## BL-051 --- Configurar tempo

**Prioridade:** P1

Permitir alterar tempo padrão.

------------------------------------------------------------------------

## BL-052 --- Cronômetro durante treino

**Prioridade:** P1

Iniciar, pausar e encerrar.

------------------------------------------------------------------------

# 8. Épico --- Histórico

## BL-060 --- Lista de histórico

**Prioridade:** P0

Mostrar sessões finalizadas.

------------------------------------------------------------------------

## BL-061 --- Detalhes do treino

**Prioridade:** P0

Mostrar exercícios, status e pesos.

------------------------------------------------------------------------

## BL-062 --- Editar histórico

**Prioridade:** P0

Permitir corrigir exercícios e pesos.

------------------------------------------------------------------------

## BL-063 --- Testar edição

**Prioridade:** P0

Garantir que alterações persistam.

------------------------------------------------------------------------

# 9. Épico --- Estatísticas

## BL-070 --- Estatística semanal

**Prioridade:** P0

Quantidade de treinos.

------------------------------------------------------------------------

## BL-071 --- Estatística mensal

**Prioridade:** P0

Quantidade, média semanal e intervalo médio.

------------------------------------------------------------------------

## BL-072 --- Estatística trimestral

**Prioridade:** P0

Mesmas métricas.

------------------------------------------------------------------------

## BL-073 --- Estatística semestral

**Prioridade:** P0

Mesmas métricas.

------------------------------------------------------------------------

## BL-074 --- Estatística anual

**Prioridade:** P0

Mesmas métricas.

------------------------------------------------------------------------

## BL-075 --- Calendário de frequência

**Prioridade:** P1

Visualizar dias com treino.

------------------------------------------------------------------------

# 10. Épico --- Configurações

## BL-080 --- Tela de configurações

**Prioridade:** P1

------------------------------------------------------------------------

## BL-081 --- Configurar cronômetro

**Prioridade:** P1

------------------------------------------------------------------------

## BL-082 --- Reiniciar sequência

**Prioridade:** P0

------------------------------------------------------------------------

# 11. Épico --- Qualidade

## BL-090 --- Testes unitários

**Prioridade:** P0

Cobrir:

-   sequência;
-   estatísticas;
-   datas;
-   médias.

------------------------------------------------------------------------

## BL-091 --- Testes de persistência

**Prioridade:** P0

Garantir gravação e recuperação SQLite.

------------------------------------------------------------------------

## BL-092 --- Testes do fluxo de treino

**Prioridade:** P0

Fluxo:

``` text
Home
→ começar
→ marcar exercícios
→ registrar peso
→ finalizar
→ avançar sequência
```

------------------------------------------------------------------------

## BL-093 --- Teste em Android

**Prioridade:** P0

Validar fluxo completo em aparelho Android.

------------------------------------------------------------------------

## BL-094 --- Teste em iOS

**Prioridade:** P0

Validar fluxo completo em dispositivo/simulador iOS.

------------------------------------------------------------------------

# 12. Épico --- UX

## BL-100 --- Loading states

**Prioridade:** P1

------------------------------------------------------------------------

## BL-101 --- Empty states

**Prioridade:** P1

------------------------------------------------------------------------

## BL-102 --- Tratamento de erros

**Prioridade:** P0

Erros de banco e operações críticas devem ser tratados.

------------------------------------------------------------------------

## BL-103 --- Acessibilidade básica

**Prioridade:** P1

-   tamanhos adequados;
-   contraste;
-   labels;
-   áreas de toque.

------------------------------------------------------------------------

# 13. Roadmap sugerido

## Sprint 1 --- Fundação

-   BL-001
-   BL-002
-   BL-003
-   BL-010
-   BL-011
-   BL-012
-   BL-013

## Sprint 2 --- Sequência + Home

-   BL-020
-   BL-021
-   BL-022
-   BL-023
-   BL-030
-   BL-031
-   BL-032

## Sprint 3 --- Treino

-   BL-040
-   BL-041
-   BL-042
-   BL-043
-   BL-044
-   BL-045
-   BL-046

## Sprint 4 --- Histórico

-   BL-060
-   BL-061
-   BL-062
-   BL-063

## Sprint 5 --- Estatísticas

-   BL-070
-   BL-071
-   BL-072
-   BL-073
-   BL-074
-   BL-075

## Sprint 6 --- Cronômetro + Configurações

-   BL-050
-   BL-051
-   BL-052
-   BL-080
-   BL-081

## Sprint 7 --- Qualidade

-   BL-090
-   BL-091
-   BL-092
-   BL-093
-   BL-094
-   BL-102

------------------------------------------------------------------------

# 14. MVP Release

O MVP deve conter:

-   Home;
-   sequência 1--5;
-   reinício da sequência;
-   cinco treinos;
-   exercícios;
-   ordem livre;
-   marcar exercício;
-   peso;
-   última carga;
-   finalização incompleta;
-   recuperação de sessão;
-   histórico;
-   edição;
-   estatísticas semana/mês/trimestre/semestre/ano;
-   funcionamento offline;
-   Android;
-   iOS.

O cronômetro pode ser entregue no mesmo MVP se não aumentar
significativamente a complexidade; caso contrário, entra imediatamente
após o fluxo principal.

------------------------------------------------------------------------

# 15. Backlog futuro

Após o MVP, possíveis funcionalidades:

-   backup manual;
-   exportação JSON/CSV;
-   importação;
-   sincronização entre dispositivos;
-   tema escuro/claro;
-   widgets;
-   notificações;
-   gráficos adicionais;
-   gerenciamento avançado de treinos.

Nenhuma dessas funcionalidades deve bloquear o MVP.
