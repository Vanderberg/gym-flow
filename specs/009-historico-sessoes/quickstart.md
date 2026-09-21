# Quickstart: Histórico de Sessões

Pré-requisito: specs 001–008 implementadas.

1. Unitários: `npm test -- tests/unit/domain/history` (agrupamento por mês local, ordem, mudanças de edição só de `completed` e `weight`, `hasChanges`).
2. Integração: `npm test -- tests/integration/data/sessionHistoryQueries tests/integration/application` — lista só de finalizadas e mais recentes primeiro, com "N / M"; filtro por programa; detalhe com prescrição só de exercícios ainda no treino (e exercício que saiu da ficha continua listado); `SaveSessionEdits` em uma transação (falha desfaz tudo), sem alterar programa, treino, datas, posições nem configurações; 500 sessões em menos de 300 ms; persistência em nova conexão ao mesmo banco.
3. UI (RNTL): `npm test -- tests/ui/history` — lista e estados (vazio, vazio com filtro, erro, carregando), filtro e volta a "Todos" ao remontar, detalhe, EDITAR → Salvar/Cancelar com confirmação, peso inválido bloqueia Salvar.
4. Manual (Android e iOS): com sessões dos dois programas, abrir o Histórico, filtrar, abrir uma sessão, editar marcação e peso, salvar, fechar o app à força e reabrir; com 500 sessões geradas por script de seed, rolar a lista em Android e iOS e conferir que não trava; sair da edição com alterações pendentes (voltar, gesto, troca de aba) e conferir a confirmação; conferir que a sequência na Home não mudou e a "última carga" na tela de treino reflete o peso editado.
5. Lint e tipos sem erros.
