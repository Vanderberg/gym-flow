# Telas --- App de Controle de Treinos

## 1. Mapa de navegação

``` text
                 ┌─────────┐
                 │  Home   │
                 └────┬────┘
                      │
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
     Treino        Histórico     Estatísticas
        │
        ↓
   Finalizar
        │
        ↓
      Home

                 Configurações
```

------------------------------------------------------------------------

# 2. Home

## Objetivo

Mostrar imediatamente o próximo treino e permitir começar.

Elementos:

-   Dia atual;
-   nome do treino;
-   quantidade de exercícios;
-   botão começar;
-   último treino;
-   quantidade de treinos no período atual;
-   ação de reiniciar sequência.

Exemplo:

``` text
MEU TREINO

DIA 3
PERNA COMPLETO

6 exercícios

[ COMEÇAR TREINO ]

Último treino
Dia 2 • 16/09

Treinos este mês
8

[ REINICIAR SEQUÊNCIA ]
```

------------------------------------------------------------------------

# 3. Tela de treino

## Objetivo

Registrar rapidamente o que foi realizado.

Cabeçalho:

``` text
DIA 3
PERNA COMPLETO

4 / 6 realizados
```

Cada exercício:

``` text
┌─────────────────────────────┐
│ AGACHAMENTO HACK            │
│ 3 × 10–12                   │
│                             │
│ Última carga: 100 kg        │
│                             │
│ Carga                       │
│ [ 100 ] kg                  │
│                             │
│             [ ✓ FEITO ]     │
└─────────────────────────────┘
```

O exercício pode ser marcado em qualquer ordem.

------------------------------------------------------------------------

# 4. Estado realizado

Quando concluído:

``` text
✓ AGACHAMENTO HACK

3 × 10–12
100 kg
```

Permitir tocar novamente para editar/desmarcar.

------------------------------------------------------------------------

# 5. Cronômetro

O cronômetro deve aparecer apenas quando habilitado.

Exemplo:

``` text
DESCANSO

01:30

[ PAUSAR ]
[ ENCERRAR ]
```

A tela não deve obrigar o usuário a usar o cronômetro.

------------------------------------------------------------------------

# 6. Finalização

Botão:

``` text
[ FINALIZAR TREINO ]
```

Ao tocar:

``` text
Finalizar treino?

4 de 6 exercícios realizados.

[ CANCELAR ]
[ FINALIZAR ]
```

Após confirmar:

``` text
TREINO FINALIZADO

DIA 3 — PERNA COMPLETO

4 de 6 exercícios realizados.

Próximo:
DIA 4 — OMBRO ISOLADO
```

------------------------------------------------------------------------

# 7. Histórico

Lista cronológica:

``` text
HISTÓRICO

19 SET
Dia 1
Peito e Tríceps
5/6 exercícios

16 SET
Dia 5
Bíceps e Tríceps
6/6 exercícios

14 SET
Dia 4
Ombro Isolado
4/4 exercícios
```

------------------------------------------------------------------------

# 8. Detalhes do histórico

Ao tocar:

``` text
DIA 1 — PEITO E TRÍCEPS

19/09/2026

✓ Supino
80 kg

✓ Supino inclinado
70 kg

○ Fly

✓ Tríceps corda
40 kg

✓ Tríceps francês
30 kg

✓ Tríceps testa
25 kg

[ EDITAR ]
```

------------------------------------------------------------------------

# 9. Edição de histórico

Permitir:

-   marcar exercício;
-   desmarcar exercício;
-   alterar peso;
-   salvar alterações.

Não permitir alterar o treino para outro dia da sequência no MVP.

------------------------------------------------------------------------

# 10. Estatísticas

## Navegação

``` text
ESTATÍSTICAS

[ SEMANA ]
[ MÊS ]
[ TRIMESTRE ]
[ SEMESTRE ]
[ ANO ]
```

## Conteúdo

``` text
SETEMBRO

17
TREINOS

3,4
TREINOS / SEMANA

2,0
DIAS ENTRE TREINOS
```

Também pode apresentar um calendário simples com os dias em que houve
treino.

------------------------------------------------------------------------

# 11. Estatística semanal

Exemplo:

``` text
ESTA SEMANA

3 treinos

SEG  TER  QUA  QUI  SEX  SÁB  DOM
 ●         ●         ●
```

------------------------------------------------------------------------

# 12. Configurações

Itens:

``` text
CONFIGURAÇÕES

Cronômetro de descanso
[ OFF ]

Tempo de descanso
01:30

────────────────

Treinos

Gerenciar treinos

Exercícios

Gerenciar exercícios

────────────────

Sequência

Reiniciar sequência
```

------------------------------------------------------------------------

# 13. Gerenciamento de treinos

Mesmo que inicialmente os cinco treinos sejam fixos, a tela pode
permitir futuramente:

-   alterar nome;
-   ativar/desativar;
-   alterar exercícios.

Não é prioridade do MVP.

------------------------------------------------------------------------

# 14. Gerenciamento de exercícios

Futuramente:

-   adicionar;
-   editar;
-   desativar;
-   alterar séries;
-   alterar faixa de repetições.

Também não é necessário para a primeira entrega se o seed inicial for
suficiente.

------------------------------------------------------------------------

# 15. Navegação inferior

Sugestão:

``` text
┌─────────────────────────────────┐
│                                 │
│           CONTEÚDO              │
│                                 │
├─────────────────────────────────┤
│ 🏋 Treino │ 📋 Histórico │ 📊 Stats │
│                         ⚙ Config │
└─────────────────────────────────┘
```

A navegação deve priorizar:

1.  Treino;
2.  Histórico;
3.  Estatísticas;
4.  Configurações.

------------------------------------------------------------------------

# 16. Estados importantes

A UI deve tratar:

### Sem treino em andamento

Mostrar botão "Começar treino".

### Treino em andamento

Mostrar "Continuar treino".

### Nenhum histórico

Mostrar mensagem amigável:

> Ainda não existem treinos registrados.

### Sem dados estatísticos

Mostrar:

> Complete seu primeiro treino para começar a acompanhar sua frequência.

### Treino incompleto

Não bloquear finalização.

### Sessão recuperada

Mostrar opção de continuar.
