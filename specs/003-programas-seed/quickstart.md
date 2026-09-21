# Quickstart: Programas Iniciais (Seed)

Pré-requisitos: specs 001 e 002 implementadas (`npm run check` verde; repositórios e `createRepositories` disponíveis).

## Rodar

```bash
npm test -- tests/unit/seed          # dados puros e conferência com as fichas
npm test -- tests/integration/seed   # execução real do seed em SQLite
npm run check                        # tudo
```

## Validação por história

1. **US1 (Padrão)**: instalação limpa ⇒ Treino Padrão com 5 treinos (6, 6, 6, 4, 6 itens), todos "3 × 10–12", nota de aquecimento em cada treino.
2. **US2 (Monstro)**: A = 11, B = 10, C = 10, D = 12 (43); 6 pares de bi-set em posições vizinhas com técnica `BI-SET` e notas citando o parceiro; agenda seg A, ter B, qua descanso (sem texto), qui C, sex D, sáb e dom opcionais com "Abdominais supra/infra e oblíquos"; `home_suggestion` do cardio. Tabelas de `docs/fichas-treino.md` e PRD §7 conferem por teste.
3. **US3 (idempotência e completude)**:
   - duas execuções seguidas ⇒ contagens idênticas (2 programas, 9 treinos, 59 exercícios, 71 itens, 7 agenda, 2 estados, 1 config);
   - alterar programa ativo/config, posição de sequência e criar uma sessão ⇒ rodar de novo não muda nada disso;
   - dataset alterado (prescrição diferente, item removido) ⇒ conteúdo atualizado, item removido some do treino, treino/exercício removidos ficam `active = 0`;
   - erro forçado no meio ⇒ rollback total;
   - todo exercício tem músculo principal, secundários e descrição.
4. **App**: abrir o app numa instalação limpa (Moto G84): Home aparece sem atraso perceptível (seed ≤ 500 ms em teste); reabrir não duplica dados.
5. **Revisão de conteúdo (manual)**: ler as descrições dos 59 exercícios (pt-BR, sem recomendação) e o texto do cardio.
