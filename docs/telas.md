# Telas --- App de Controle de Treinos

## 1. Navegação

``` text
Home
├── Treino
├── Histórico
├── Estatísticas
└── Configurações
```

------------------------------------------------------------------------

# 2. Home

A Home deve mostrar o contexto atual:

``` text
PROGRAMA
Treino Monstro

PRÓXIMO TREINO
C — Pernas completas

QUINTA-FEIRA

[ COMEÇAR TREINO ]
```

Para sequência contínua:

``` text
PROGRAMA
Treino Padrão

PRÓXIMO
Dia 3 — Perna Completo

[ COMEÇAR TREINO ]
```

Estados do cartão principal: descanso ("QUARTA-FEIRA · DESCANSO"), dia opcional (texto
da agenda), sem agenda ("Voltar para sequência contínua"), "Concluído hoje" (semanal) e
treino em andamento (Continuar / Descartar). A Home não mostra ÚLTIMO / ESTE MÊS nem
"Reiniciar sequência" (Configurações).

------------------------------------------------------------------------

# 3. Configurações

``` text
CONFIGURAÇÕES

Programa de treino
Treino Padrão                         ›

Tipo de sequência
Sequência contínua                   ›

Cronômetro
Desativado                           ›
```

------------------------------------------------------------------------

# 4. Seleção de programa

``` text
TIPO DE TREINO

● Treino Padrão
  5 treinos em sequência

○ Treino Monstro
  A/B/C/D
  Programação semanal
```

A descrição é informativa. A estratégia de sequência é uma configuração
independente.

------------------------------------------------------------------------

# 5. Seleção de sequência

``` text
TIPO DE SEQUÊNCIA

● Sequência contínua

  O próximo treino é definido pelo
  último treino finalizado.

○ Dias da semana

  O próximo treino é definido pela
  agenda do programa.
```

------------------------------------------------------------------------

# 6. Agenda semanal

Somente leitura (spec 005); visível em qualquer tipo de sequência. Programa sem
agenda mostra estado vazio.

``` text
AGENDA

Segunda
Treino A                         ›

Terça
Treino B                         ›

Quarta
Descanso

Quinta
Treino C                         ›

Sexta
Treino D                         ›

Sábado
Opcional                         ›

Domingo
Opcional                         ›
```

A configuração deve ser por programa.

------------------------------------------------------------------------

# 7. Reiniciar sequência

Disponível para programas que utilizam sequência contínua.

``` text
REINICIAR SEQUÊNCIA

O próximo treino será:

Dia 1 — Peito e Tríceps

O histórico não será apagado.

[ CANCELAR ] [ REINICIAR ]
```

Para um programa com letras:

``` text
Próximo:
A — Ombros completos
```

------------------------------------------------------------------------

# 8. Tela de treino

Cabeçalho:

``` text
TREINO C
PERNAS COMPLETAS

0 / 9 realizados
```

Cada exercício:

``` text
┌─────────────────────────────┐
│ AGACHAMENTO LIVRE / SMITH   │
│                             │
│ 3 × 12/10/8                 │
│ Progressão de carga         │
│                             │
│ Carga                       │
│ [ 100 ] kg                  │
│                             │
│ ○ NÃO FEITO                 │
└─────────────────────────────┘
```

Outro exemplo:

``` text
┌─────────────────────────────┐
│ CADEIRA EXTENSORA           │
│                             │
│ 3 × 10/10/10                │
│ DROP-SET                    │
│ Pirâmide crescente          │
│                             │
│ Carga [ 60 ] kg             │
│                             │
│ ✓ FEITO                     │
└─────────────────────────────┘
```

------------------------------------------------------------------------

# 9. Ordem dos exercícios

Não bloquear a ordem.

O usuário pode marcar:

``` text
✓ Exercício 5
✓ Exercício 2
✓ Exercício 8
✓ Exercício 1
```

O contador deve refletir apenas quantidade realizada.

------------------------------------------------------------------------

# 10. Finalização

``` text
FINALIZAR TREINO?

7 de 9 exercícios realizados.

[ CANCELAR ]
[ FINALIZAR ]
```

Depois:

``` text
TREINO FINALIZADO

Treino C
Pernas completas

7/9 exercícios

Próximo:
Treino D
```

------------------------------------------------------------------------

# 11. Histórico

Mostrar programa e treino:

``` text
HISTÓRICO

19 SET
Treino Monstro
D — Peito e tríceps
8/10 exercícios

17 SET
Treino Monstro
C — Pernas completas
7/9 exercícios

12 SET
Treino Padrão
Dia 2 — Costas e Bíceps
6/6 exercícios
```

------------------------------------------------------------------------

# 12. Filtro de histórico

``` text
[ Todos ▼ ]

Todos
Treino Padrão
Treino Monstro
```

------------------------------------------------------------------------

# 13. Detalhes do histórico

``` text
TREINO D
PEITO E TRÍCEPS

19/09/2026

✓ Supino reto
80 kg
4 × 8

✓ Crucifixo reto
20 kg
3 × 12

○ Voador
—
3 × até a falha

[ EDITAR ]
```

------------------------------------------------------------------------

# 14. Estatísticas

``` text
ESTATÍSTICAS

[ Semana ]
[ Mês ]
[ Trimestre ]
[ Semestre ]
[ Ano ]

SETEMBRO

17
TREINOS

3,4
TREINOS / SEMANA

2,0
DIAS ENTRE TREINOS

[ Todos ▼ ]
```

Filtro:

``` text
Todos
Treino Padrão
Treino Monstro
```

------------------------------------------------------------------------

# 15. Sessão em andamento

Ao abrir o app:

``` text
TREINO EM ANDAMENTO

Treino C — Pernas completas

Você possui um treino em andamento.

[ CONTINUAR ]
[ DESCARTAR ]
```

Descartar não altera sequência.

------------------------------------------------------------------------

# 16. Cronômetro

Se habilitado:

``` text
DESCANSO

01:30

[ PAUSAR ]
[ ENCERRAR ]
```

Pode ser ignorado.

# 17. Ajuda e informações contextuais

A tela de execução deve permanecer limpa.

```text
TREINO C — PERNAS COMPLETAS
0 / 9 realizados                         [?]
```

O `?` abre a legenda.

## Card

```text
┌─────────────────────────────┐
│ AGACHAMENTO LIVRE / SMITH ⓘ│
│ 3 × 12/10/8                 │
│ Progressão de carga         │
│ Carga [ 100 ] kg            │
│ ○ NÃO FEITO                 │
└─────────────────────────────┘
```

O `ⓘ` abre um bottom sheet com:

- músculo principal;
- músculos secundários;
- descrição curta.

## Legenda

O `?` abre um bottom sheet com:

- BI-SET;
- DROP-SET;
- PIRÂMIDE CRESCENTE;
- PIRÂMIDE DECRESCENTE;
- FALHA;
- EXCÊNTRICA;
- CONCÊNTRICA;
- outros termos usados pelo programa.

No MVP, a legenda global é suficiente. Como evolução P1, uma técnica individual poderá ter seu próprio `?` para abrir diretamente sua explicação.

## Regra de UI

Informação essencial fica visível. Informação complementar fica escondida até ser solicitada.

Nota (spec 007): na tela de treino não há descartar (fica na Home) e o resumo final não mostra "Próximo".
