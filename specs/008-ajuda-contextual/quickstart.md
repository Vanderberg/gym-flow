# Quickstart: Ajuda Contextual

Pré-requisito: specs 001–007 implementadas.

1. Unitários: `npm test -- tests/unit/domain/help tests/unit/constants/techniqueLegend` (correspondência exata, prescrição ignorada, músculos separados por vírgula, "Não informado" só como rede de segurança, títulos únicos, textos sem recomendação).
2. Integração: `npm test -- tests/integration/application/getExerciseInfo tests/integration/seed/helpContent` — todo exercício do seed (Padrão e Monstro) tem músculo principal, secundários e descrição; todo `technique` do seed tem entrada na legenda (SC-003, SC-004).
3. UI (RNTL, BL-116): `npm test -- tests/ui/help` — abrir e fechar `?` e `ⓘ` não chama nenhum caso de uso de escrita, não altera marcações, pesos nem cartões expandidos; rascunho de peso preservado e foco devolvido ao fechar; `?` do chip só com entrada na legenda e rola até o termo; exercício sem técnica sem `?` próprio.
4. Manual (Android e iOS): na tela de treino, abrir `?` e `ⓘ` em exercícios dos dois programas; digitar um peso sem sair do campo, abrir `ⓘ`, fechar e conferir que o valor continua no campo e não foi gravado (repetir com o teclado aberto, tocando no `?` e no `ⓘ`, em Android e iOS; pressionar e arrastar para fora do botão não deixa o salvamento suspenso); voltar do Android fecha a folha; conferir o texto da legenda com o dono do app.
5. Lint e tipos sem erros.
