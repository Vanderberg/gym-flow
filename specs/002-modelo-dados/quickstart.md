# Quickstart: Modelo de Dados e Repositórios

Pré-requisito: spec 001 implementada (`npm run check` passando; helper de teste com `better-sqlite3`).

## Rodar

```bash
npm test -- tests/integration/data   # esquema e repositórios
npm test -- tests/unit               # utilitários (datas e normalizeName)
npm run check                        # tudo
```

## Validação por história

1. **US1 (conteúdo)**: teste grava programa com 2 treinos e exercícios ⇒ recupera na ordem; exercício em 2 treinos é 1 linha em `exercise`; repetir no mesmo treino é rejeitado; "supino INCLINADO" duplicando "Supino inclinado" e "TRÍCEPS TESTA" duplicando "Tríceps testa" são rejeitados.
2. **US2 (agenda/sequência)**: dois programas com posições diferentes independentes; `getEntry` num dia com `workoutId = null` devolve "sem treino"; `weekday` 0 ou 8 é rejeitado.
3. **US3 (sessões)**: `startSession` de treino com N exercícios ⇒ N linhas desmarcadas; segunda sessão em andamento ⇒ `ConflictError`; peso −1 rejeitado, `null` e `0` aceitos; erro forçado no meio de `startSession` ⇒ nada gravado; `discardSession` apaga sessão e linhas; excluir (SQL direto) exercício usado em sessão é rejeitado pelo banco; `getLastWeight` só considera sessão finalizada do mesmo programa.
4. **Datas**: relógio falso 23:30 −03:00 ⇒ `localDateOf` devolve o mesmo dia.
5. **Desempenho (SC-002)**: teste de integração cria, marca com peso, finaliza e relê sessão de 15 exercícios em < 1 s (no aparelho, validar na spec 007).
6. **Consistência**: iniciar sessão com treino de outro programa e agenda com treino de outro programa são rejeitados.
